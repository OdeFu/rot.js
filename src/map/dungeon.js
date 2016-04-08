'use strict';

import { Map } from './map';
import { Room, Corridor } from './features';

/**
 * @class Dungeon map: has rooms and corridors
 * @augments ROT.Map
 */
export class Dungeon extends Map {
  constructor(width:number, height:number)
  {
    super(width, height);
    this._rooms = [];
    /* list of all rooms */
    this._corridors = [];
  }

  /**
   * Get all generated rooms
   * @returns {Room[]}
   */
  getRooms():Room[]
  {
    return this._rooms;
  }

  /**
   * Get all generated corridors
   * @returns {Corridor[]}
   */
  getCorridors():Corridor[]
  {
    return this._corridors;
  }
}
