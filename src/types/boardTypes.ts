export interface Character {
  // id: number; This ID will refer to the character class most likely
  name: string;
  commander: string;
  slot: number;
  hp: number;
  x: number;
  y: number;
  // speed: number;
  // facing: [number, number];
  // activeCounter: number;
}

export interface BoardObject {
  height: number;
  width: number;
  layout: {[key:string]: string};
}

export interface BattleData {
  id: number;
  name: string;
  commander: string;
  activeSlot: number;
  phase: string;
  characters: Character[];
  gameBoard: BoardObject;
  activeTiles: [number, number][];
}
