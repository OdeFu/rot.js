// @flwo
'use strict';

import { Map } from './map';

/**
 * @class Simple empty rectangular room
 * @augments ROT.Map
 */
export class ArenaMap extends Map {
  constructor(width:number, height:number)
  {
    super(width, height);
  }

  create(callback:(x:number, y:number, value:number) => void):ArenaMap
  {
    let w = this._width - 1;
    let h = this._height - 1;
    for (let i = 0; i <= w; i++)
    {
      for (let j = 0; j <= h; j++)
      {
        let empty = (i && j && i < w && j < h);
        callback(i, j, empty ? 0 : 1);
      }
    }
    return this;
  }
}
