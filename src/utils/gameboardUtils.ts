export const isInTiles = (tile: [number, number], tilesList: number[][]) => {
  const [x, y] = tile;
  return tilesList.some((location) => location[0] === x && location[1] === y);
}

export const isPlayerTurn = (commander, characters, activeSlot) => {
  console.log(commander, characters, activeSlot)
  const activeCharacter = characters.find((character) => character.slot === activeSlot);
  return commander === activeCharacter.commander;
}