// @flwo
'use strict';

import { ROT } from '../rot';
/**
 * @class Base map generator
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 */
export class Map {
  constructor(width:number, height:number)
  {
    this._width = width || ROT.DEFAULT_WIDTH;
    this._height = height || ROT.DEFAULT_HEIGHT;
  }

  create(callback:(x:number, y:number, value:number) => void)
  {
  }

  _fillMap(value)
  {
    let map = [];
    for (let i = 0; i < this._width; i++)
    {
      map.push([]);
      for (let j = 0; j < this._height; j++)
      {
        map[i].push(value);
      }
    }
    return map;
  }
}
