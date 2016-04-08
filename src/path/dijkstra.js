'use strict';

import { Path } from './path';

/**
 * @class Simplified Dijkstra's algorithm: all edges have a value of 1
 * @augments Path
 * @see Path
 */
export class Dijkstra extends Path {
  constructor(toX, toY, passableCallback, options)
  {
    super(toX, toY, passableCallback, options);

    this._computed = {};
    this._todo = [];
    this._add(toX, toY, null);
  }

  /**
   * Compute a path from a given point
   * @see Path#compute
   */
  compute(fromX:number, fromY:number, callback:(x:number, y:number) => void):void
  {
    let key = fromX + "," + fromY;
    if (!(key in this._computed))
    {
      this._compute(fromX, fromY);
    }
    if (!(key in this._computed))
    {
      return;
    }

    let item = this._computed[key];
    while (item)
    {
      callback(item.x, item.y);
      item = item.prev;
    }
  }

  /**
   * Compute a non-cached value
   */
  _compute(fromX:number, fromY:number):void
  {
    while (this._todo.length)
    {
      let item = this._todo.shift();
      if (item.x == fromX && item.y == fromY)
      {
        return;
      }

      let neighbors = this._getNeighbors(item.x, item.y);

      for (let i = 0; i < neighbors.length; i++)
      {
        let neighbor = neighbors[i];
        let x = neighbor[0];
        let y = neighbor[1];
        let id = x + "," + y;
        if (id in this._computed)
        {
          continue;
        }
        /* already done */
        this._add(x, y, item);
      }
    }
  }

  _add(x:number, y:number, prev:number):void
  {
    let obj = {
      x: x,
      y: y,
      prev: prev
    }
    this._computed[x + "," + y] = obj;
    this._todo.push(obj);
  }
}
