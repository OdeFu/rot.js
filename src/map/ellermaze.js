// @flwo
'use strict';

import { Map } from './map';
import { RNG } from '../rng';

/**
 * @class Maze generator - Eller's algorithm
 * See http://homepages.cwi.nl/~tromp/maze.html for explanation
 * @augments ROT.Map
 */
export class EllerMazeMap extends Map {
  constructor(width, height)
  {
    super(width, height);
  }

  create(callback:(x:number, y:number, value:number) => void):EllerMazeMap
  {
    let map = this._fillMap(1);
    let w = Math.ceil((this._width - 2) / 2);

    let rand = 9 / 24;

    let L = [];
    let R = [];

    for (let i = 0; i < w; i++)
    {
      L.push(i);
      R.push(i);
    }
    L.push(w - 1);
    /* fake stop-block at the right side */

    for (let j = 1; j + 3 < this._height; j += 2)
    {
      /* one row */
      for (let i = 0; i < w; i++)
      {
        /* cell coords (will be always empty) */
        let x = 2 * i + 1;
        let y = j;
        map[x][y] = 0;

        /* right connection */
        if (i != L[i + 1] && RNG.getUniform() > rand)
        {
          this._addToList(i, L, R);
          map[x + 1][y] = 0;
        }

        /* bottom connection */
        if (i != L[i] && RNG.getUniform() > rand)
        {
          /* remove connection */
          this._removeFromList(i, L, R);
        }
        else
        {
          /* create connection */
          map[x][y + 1] = 0;
        }
      }
    }

    /* last row */
    for (let i = 0; i < w; i++)
    {
      /* cell coords (will be always empty) */
      let x = 2 * i + 1;
      let y = j;
      map[x][y] = 0;

      /* right connection */
      if (i != L[i + 1] && (i == L[i] || RNG.getUniform() > rand))
      {
        /* dig right also if the cell is separated, so it gets connected to the rest of maze */
        this._addToList(i, L, R);
        map[x + 1][y] = 0;
      }

      this._removeFromList(i, L, R);
    }

    for (let i = 0; i < this._width; i++)
    {
      for (let j = 0; j < this._height; j++)
      {
        callback(i, j, map[i][j]);
      }
    }

    return this;
  }

  /**
   * Remove "i" from its list
   */
  static _removeFromList(i, L, R)
  {
    R[L[i]] = R[i];
    L[R[i]] = L[i];
    R[i] = i;
    L[i] = i;
  }

  /**
   * Join lists with "i" and "i+1"
   */
  static _addToList(i, L, R)
  {
    R[L[i + 1]] = R[i];
    L[R[i]] = L[i + 1];
    R[i] = i + 1;
    L[i + 1] = i;
  }
}
