const SPOTIFY_ACCOUNT_URL = "https://accounts.spotify.com";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const CLIENT_ID = "a3ba0a26be90461d91b1bbea24f7a88c";
const REDIRECT_URI = "http://127.0.0.1:5173/callback";

// ============================================================
// PKCE
// ============================================================

function generateRandomString(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }

    return result;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

// ============================================================
// LOGIN
// ============================================================

async function loginWithSpotify() {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        scope:
            "user-read-private playlist-read-private playlist-modify-private playlist-modify-public",
    });

    window.location.href = `${SPOTIFY_ACCOUNT_URL}/authorize?${params.toString()}`;
}

// ============================================================
// ACCESS TOKEN
// ============================================================

async function getAccessToken(code) {
    const codeVerifier = localStorage.getItem("spotify_code_verifier");

    if (!codeVerifier) {
        throw new Error("Code verifier não encontrado");
    }

    const response = await fetch(
        `${SPOTIFY_ACCOUNT_URL}/api/token`,
        {
            method: "POST",
            headers: {
                "Content-Type":"application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Erro ao obter access token");
    }

    const data = await response.json();

    localStorage.setItem("spotify_access_token", data.access_token);
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
    localStorage.setItem("spotify_token_expires_at", Date.now() + data.expires_in * 1000);

    return data.access_token;
}

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("spotify_refresh_token");

    if (!refreshToken) {
        throw new Error("Refresh token não encontrado");
    }

    const response = await fetch(
        `${SPOTIFY_ACCOUNT_URL}/api/token`,
        {
            method: "POST",
            headers: {
                "Content-Type":"application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        if (data.error === "invalid_grant") {
            localStorage.removeItem("spotify_access_token");
            localStorage.removeItem("spotify_refresh_token");
            localStorage.removeItem("spotify_token_expires_at");

            throw new Error("Sessão do Spotify expirou. Faça login novamente.")
        }

        throw new Error("Erro ao renovar token do Spotify");
    }

    localStorage.setItem("spotify_access_token", data.access_token);
    localStorage.setItem("spotify_token_expires_at", Date.now() + data.expires_in * 1000);

    if (data.refresh_token) {
        localStorage.setItem("spotify_refresh_token", data.refresh_token);
    }

    return data.access_token;
}

async function getValidAccessToken() {
    const accessToken = localStorage.getItem("spotify_access_token");
    const expiresAt = localStorage.getItem("spotify_token_expires_at");

    if (!accessToken || !expiresAt) {
        return null
    }

    const isExpired =Date.now() >= Number(expiresAt) - 60 * 1000;

    if (isExpired) {
        return await refreshAccessToken();
    }

    return accessToken;
}

// ============================================================
// USUÁRIO
// ============================================================

async function getCurrentUserProfile(accessToken) {
    const response = await fetch(
        `${SPOTIFY_API_URL}/me`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Erro ao buscar perfil do Spotify");
    }

    const data = await response.json();

    return {
        name: data.display_name,
        image: data.images?.[0]?.url || null,
    }
}


// ============================================================
// PLAYLIST ID
// ============================================================

function extractPlaylistId(url) {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname !== "open.spotify.com" || !parsedUrl.pathname.startsWith("/playlist/")) {
            return null;
        }

        const playlistId = parsedUrl.pathname
            .split("/playlist/")[1]
            ?.split("/")[0]
            ?.split("?")[0];

        return playlistId || null;
    } catch {
        return null;
    }
}

// ============================================================
// MÚSICAS DA PLAYLIST
// ============================================================

async function getPlaylistTracks(accessToken, playlistId) {
    let tracks = [];
    let offset = 0;

    // Spotify: máximo de 50 itens por página
    const limit = 50;

    while (true) {
        const response = await fetch(
            `${SPOTIFY_API_URL}/playlists/${playlistId}/items?limit=${limit}&offset=${offset}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        if (!response.ok) {
            throw new Error("Erro ao buscar músicas da playlist");
        }

        const data = await response.json();

        const pageTracks = data.items
            .filter((item) => item.item?.type === "track")
            .map((item, index) => ({
                uri: item.item.uri,
                name: item.item.name,
                artist: item.item.artists.map((artist) => artist.name).join(", "),
                albumImage: item.item.album?.images?.[0]?.url || null,
                originalIndex: offset + index,
            }));

        tracks = [
            ...tracks,
            ...pageTracks,
        ]

        if (!data.next) {
            break;
        }

        offset += limit;
    }

    return tracks;
}

// ============================================================
// INFORMAÇÕES DA PLAYLIST
// ============================================================

async function getPlaylist(accessToken, playlistId) {
    const response = await fetch(
        `${SPOTIFY_API_URL}/playlists/${playlistId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error("Erro ao buscar informações da playlist");
    }

    const data = await response.json();

    return {
        id: data.id,
        name: data.name,
        image: data.images?.[0]?.url || null,
        description: data.description || "",
        snapshotId: data.snapshot_id,
    }
}

// ============================================================
// ATUALIZAR ORDEM DA PLAYLIST
// ============================================================

async function updatePlaylistOrder(accessToken, playlistId, originalTracks, orderedTracks, snapshotId) {
    const currentUris = originalTracks.map((track) => track.uri);
    const desiredUris = orderedTracks.map((track) => track.uri);
    let currentSnapshot = snapshotId;
    let targetIndex = 0;

    while (targetIndex < desiredUris.length) {
        //Já está correto?
        if (currentUris[targetIndex] === desiredUris[targetIndex]) {
            targetIndex++;
            continue;
        }

        //Procura onde começa o bloco desejado
        const sourceIndex = currentUris.indexOf(desiredUris[targetIndex], targetIndex);

        if (sourceIndex === -1) {
            throw new Error("Não foi possível encontrar uma música para reorganizar.");
        }

        //Descobre quantas músicas consecutivas
        //Já estão na sequência desejada.
        let rangeLength = 1;

        while (sourceIndex + rangeLength < currentUris.length &&
            targetIndex + rangeLength < desiredUris.length && 
            currentUris[sourceIndex + rangeLength] === desiredUris[targetIndex + rangeLength]) 
        {
            rangeLength++;
        }

        const response = await fetch(
            `${SPOTIFY_API_URL}/playlists/${playlistId}/items`,
            {
                method: "PUT",
                headers: {
                    Authorization:`Bearer ${accessToken}`,
                    "Content-Type":"application/json",
                },
                body: JSON.stringify({
                    range_start: sourceIndex,
                    insert_before: targetIndex,
                    range_length: rangeLength,
                    snapshot_id: currentSnapshot,
                }),
            }
        );

        // Rate limit
        if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After");

            throw new Error(`Spotify pediu para aguardar ${retryAfter || "alguns"} segundos antes de continuar.`);
        }

        if (!response.ok) {
            throw new Error(`Erro ao atualizar a ordem da playlist no Spotify (${response.status})`);
        }

        const data = await response.json();
        currentSnapshot = data.snapshot_id;

        // Remove o bloco da posição antiga
        const movedTracks = currentUris.splice(sourceIndex, rangeLength);
        // Insere o bloco na posição correta
        currentUris.splice(targetIndex, 0, ...movedTracks);

        targetIndex += rangeLength;
    }

    return currentSnapshot;
}

// ============================================================
// EXPORTS
// ============================================================

export {
    loginWithSpotify,
    getAccessToken,
    getValidAccessToken,
    getPlaylistTracks,
    getCurrentUserProfile,
    getPlaylist,
    extractPlaylistId,
    updatePlaylistOrder
}