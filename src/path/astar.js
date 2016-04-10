// @flwo
'use strict';

import { Path } from './path';
/**
 * @class Simplified A* algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
export class AStar extends Path {
  constructor(toX, toY, passableCallback, options)
  {
    super(toX, toY, passableCallback, options);

    this._todo = [];
    this._done = {};
    this._fromX = null;
    this._fromY = null;
  }

  /**
   * Compute a path from a given point
   * @see ROT.Path#compute
   */
  compute(fromX:number, fromY:number, callback:(x:number, y:number) => void):void
  {
    this._todo = [];
    this._done = {};
    this._fromX = fromX;
    this._fromY = fromY;
    this._add(this._toX, this._toY, null);

    while (this._todo.length)
    {
      let item = this._todo.shift();
      if (item.x == fromX && item.y == fromY)
      {
        break;
      }
      let neighbors = this._getNeighbors(item.x, item.y);

      for (let i = 0; i < neighbors.length; i++)
      {
        let neighbor = neighbors[i];
        let x = neighbor[0];
        let y = neighbor[1];
        let id = x + "," + y;
        if (id in this._done)
        {
          continue;
        }
        this._add(x, y, item);
      }
    }

    let item = this._done[fromX + "," + fromY];
    if (!item)
    {
      return;
    }

    while (item)
    {
      callback(item.x, item.y);
      item = item.prev;
    }
  }

  _add(x:number, y:number, prev:number):void
  {
    let h = this._distance(x, y);
    let obj = {
      x: x,
      y: y,
      prev: prev,
      g: (prev ? prev.g + 1 : 0),
      h: h
    }
    this._done[x + "," + y] = obj;

    /* insert into priority queue */

    let f = obj.g + obj.h;
    for (let i = 0; i < this._todo.length; i++)
    {
      let item = this._todo[i];
      let itemF = item.g + item.h;
      if (f < itemF || (f == itemF && h < item.h))
      {
        this._todo.splice(i, 0, obj);
        return;
      }
    }

    this._todo.push(obj);
  }

  _distance(x:number, y:number):number
  {
    switch (this._options.topology)
    {
      case 4:
        return (Math.abs(x - this._fromX) + Math.abs(y - this._fromY));
        break;

      case 6:
        let dx = Math.abs(x - this._fromX);
        let dy = Math.abs(y - this._fromY);
        return dy + Math.max(0, (dx - dy) / 2);
        break;

      case 8:
        return Math.max(Math.abs(x - this._fromX), Math.abs(y - this._fromY));
        break;
    }

    throw new Error("Illegal topology");
  }
}
