import { writable } from "svelte/store";
import type { Character, BattleData } from "../types/boardTypes";

const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0]
]

export const gameDataStore = writable({
  id: 0,
  name: "",
  activeSlot: 0,
  commander: "",
  phase: 'INIT',
  characters: [],
  gameBoard: {
    height: 8,
    width: 8,
    layout: {},
  },
  activeTiles: []
});


const getActiveCharacter = (
  activeSlot: number,
  characters: Character[],
): Character | undefined => {
  return characters.find((character) => character.slot === activeSlot);
}