const redirect_uri = "http://127.0.0.1:5500/ordenador.html";
const accountUrl = "https://accounts.spotify.com";
const apiUrl = "https://api.spotify.com/v1";
const clientId = "a3ba0a26be90461d91b1bbea24f7a88c";
const clientSecret = "e62864c5a0f8451cb81655b7ae19bddd";
const playlist = "5MES3jaJI81k2Wo27MIqRp"

$(document).ready(function () {
    const paramsString = window.location.search;
    const searchParams = new URLSearchParams(paramsString);

    if(searchParams.has("code")){
        saveData("code", searchParams.get("code"));
        window.location.href.replace(window.location.search, "");
    }

    console.log(getData("code"));
});

/* -----------------------------------------
   LocalStorage Easy Access
------------------------------------------ */

function saveData(name, value) {
    localStorage.setItem(name, value);
}

function getData(name) {
    return localStorage.getItem(name);
}

/* -----------------------------------------
   AUTHENTICATION
------------------------------------------ */

async function getToken() {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", getData("code"));
    params.append("redirect_uri", redirect_uri);

    const url = `${accountUrl}/api/token`;

    try {
        const response = await fetch(url, {
            method: "POST",
            body: params,
            headers: {
                "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao gerar token: ${response.status}`);
        }

        const result = await response.json();
        return result.access_token;

    } catch (error) {
        console.error(error.message);
    }
}

async function getAuth() {
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirect_uri);
    params.append("scope", "playlist-modify-public playlist-modify-private playlist-read-private");

    const url = `${accountUrl}/authorize?${params}`;

    navigation.navigate(url);
}

/* -----------------------------------------
   ORDER PLAYLIST
------------------------------------------ */

async function orderPlaylist() {
    const token = await getToken();
    const url = `${apiUrl}/playlists/${playlist}`;

    const size = await getPlaylistSize(url, token);

    let promises = [];

    for (let i = 0; i < Math.ceil(size / 100); i++) {
        promises.push(getSongsPage(url, i, token));
    }

    // Pega todas as músicas
    const values = await Promise.all(promises);
    const tracks = values.flat(Infinity);

    // Ordena por nome
    const orderedTracks = orderByName(tracks);

    // Reordena na playlist
    return updatePlaylist(tracks, token, url);
}

async function atomBombReorder() {
    const token = await getToken();
    const url = `${apiUrl}/playlists/${playlist}`;

    const { size, snapshot_id } = await getPlaylistData(url, token);

    let promises = [];

    for (let i = 0; i < Math.ceil(size / 100); i++) {
        promises.push(getSongsPage(url, i, token));
    }

    const values = await Promise.all(promises).then(values => {
        return values;
    }).catch(e => console.error(e));

    const tracks = values.flat(Infinity);
    const orderedTracks = orderByName(tracks);

    clearPlaylist(url, token);
    addTracksToPlaylist(url,token, orderedTracks);
    console.log("Nasceu?");
}

/* -----------------------------------------
   GET PLAYLIST SIZE
------------------------------------------ */

async function getPlaylistSize(playlistUrl, token) {
    const response = await fetch(playlistUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Erro ao obter tamanho da playlist');
    }

    const data = await response.json();
    return data.tracks.total;
}

/* -----------------------------------------
   GET SONGS (100 PER PAGE)
------------------------------------------ */

async function getSongsPage(playlistUrl, currentPage, token) {
    const pageSize = 100;
    const offset = currentPage * pageSize;
    let url = `${playlistUrl}/tracks?limit=${pageSize}&offset=${offset}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Erro ao obter músicas da playlist');
    }

    const data = await response.json();

    return data.items.map((m, index) => ({
        uri: m.track.uri,
        name: m.track.name,
        originalIndex: index + offset // POSIÇÃO REAL
    }));
}

async function getPlaylistData(playlistUrl, token) {
    const response = await fetch(playlistUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Erro ao obter as músicas da playlist');
    }

    const data = await response.json();
    return {
        size: data.tracks.total,
        snapshot_id: data.snapshot_id
    };
}

/* -----------------------------------------
   SORT SONGS ALPHABETICALLY
------------------------------------------ */

function orderByName(songs) {
    let orderedSongs = [...songs].sort(compare);

    for (let i = 0; i < orderedSongs.length; i++) {
        orderedSongs[i].newPosition = i;
    }

    return orderedSongs;
}

function compare(a, b) {
    return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
}

/* -----------------------------------------
   UPDATE PLAYLIST
------------------------------------------ */

async function updatePlaylist(tracks, token, playlistUrl) {
    let currentOrder = [...tracks];           // playlist como está
    let targetOrder = orderByName(tracks);    // playlist ordenada

    for (let i = 0; i < targetOrder.length; i++) {

        const trackToPlace = targetOrder[i];

        // achar a posição ATUAL desse item
        let currentIndex = currentOrder.findIndex(t => t.uri === trackToPlace.uri);

        // se já está no lugar, segue
        if (currentIndex === i) continue;

        // chamada para reorder
        const body = {
            range_start: currentIndex,
            insert_before: i
        };

        const resp = await fetch(`${playlistUrl}/tracks`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) {
            console.error("Erro ao reordenar:", await resp.text());
            return false;
        }

        // SIMULAR O MOVIMENTO NO ARRAY LOCAL
        const [moved] = currentOrder.splice(currentIndex, 1);
        currentOrder.splice(i, 0, moved);

        console.log(`Movida para posição ${i}: ${trackToPlace.name}`);
    }

    console.log("Playlist ordenada sem destruir nada!");
    return true;
}

async function addTracksToPlaylist(playListUrl, token, tracks) {
    const tracksFormatted = tracks.map(m => m.uri);

    for(let i = 0; i < Math.ceil(tracksFormatted.length / 100); i ++)
    {
        const pageStart = i * 100;
        const tracksToUpdate = tracksFormatted.slice(pageStart, pageStart + 100);

        var body = {
            position: pageStart,
            uris: tracksToUpdate
        }

        const response = await fetch(`${playListUrl}/tracks?uris=${tracksToUpdate.join(",")}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const responseBody = await response.json();
        if (!response.ok) {
            throw responseBody;
        }
        else{
            console.log("BUSQUEM CONHECIMENTO");
        }
    }

    return true;    
}

async function clearPlaylist(playlistUrl, token) {
    const body = {
        uris: []
    };

    const response = await fetch(`${playlistUrl}/tracks`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const responseBody = await response.json();
    if(!response.ok){
        throw responseBody
    } else {
        console.log("Playlist cleared!");
    }
}