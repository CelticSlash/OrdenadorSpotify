function compareByName(a, b) {
  return a.name.localeCompare(
    b.name,
    "pt-BR",
    { sensitivity: "base" }
  )
}

function sortTracksByName(tracks) {
  return [...tracks]
    .sort(compareByName)
    .map((track, index) => ({
      ...track,
      newPosition: index
    }))
}

export {
  compareByName,
  sortTracksByName
}