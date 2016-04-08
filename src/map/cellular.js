'use strict';

import { Map } from './map';
import { ROT } from '../rot';
import { RNG } from '../rng';

/**
 * @class Cellular automaton map generator
 * @augments ROT.Map
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 * @param {object} [options] Options
 * @param {int[]} [options.born] List of neighbor counts for a new cell to be born in empty space
 * @param {int[]} [options.survive] List of neighbor counts for an existing  cell to survive
 * @param {int} [options.topology] Topology 4 or 6 or 8
 */
export class CellularMap extends Map {
  constructor(width:number, height:number, options)
  {
    super(width, height);

    this._options = {
      born: [5, 6, 7, 8],
      survive: [4, 5, 6, 7, 8],
      topology: 8
    };
    this.setOptions(options);

    this._dirs = ROT.DIRS[this._options.topology];
    this._map = this._fillMap(0);
  }

  /**
   * Fill the map with random values
   * @param {float} probability Probability for a cell to become alive; 0 = all empty, 1 = all full
   */
  randomize(probability:number):CellularMap
  {
    for (let i = 0; i < this._width; i++)
    {
      for (let j = 0; j < this._height; j++)
      {
        this._map[i][j] = (RNG.getUniform() < probability ? 1 : 0);
      }
    }
    return this;
  }

  /**
   * Change options.
   * @see ROT.Map.Cellular
   */
  setOptions(options)
  {
    for (let p in options)
    {
      this._options[p] = options[p];
    }
  }

  set(x:number, y:number, value:number):void
  {
    this._map[x][y] = value;
  }

  create(callback:(x:number, y:number, value:number) => void):void
  {
    let newMap = this._fillMap(0);
    let born = this._options.born;
    let survive = this._options.survive;

    for (let j = 0; j < this._height; j++)
    {
      let widthStep = 1;
      let widthStart = 0;
      if (this._options.topology == 6)
      {
        widthStep = 2;
        widthStart = j % 2;
      }

      for (let i = widthStart; i < this._width; i += widthStep)
      {

        let cur = this._map[i][j];
        let ncount = this._getNeighbors(i, j);

        if (cur && survive.indexOf(ncount) != -1)
        { /* survive */
          newMap[i][j] = 1;
        }
        else if (!cur && born.indexOf(ncount) != -1)
        { /* born */
          newMap[i][j] = 1;
        }
      }
    }

    this._map = newMap;

    this.serviceCallback(callback);
  }

  serviceCallback(callback:(x:number, y:number, value:number) => void):void
  {
    if (!callback)
    {
      return;
    }

    for (let j = 0; j < this._height; j++)
    {
      let widthStep = 1;
      let widthStart = 0;
      if (this._options.topology == 6)
      {
        widthStep = 2;
        widthStart = j % 2;
      }
      for (let i = widthStart; i < this._width; i += widthStep)
      {
        callback(i, j, this._map[i][j]);
      }
    }
  }

  /**
   * Get neighbor count at [i,j] in this._map
   */
  _getNeighbors(cx:number, cy:number):number
  {
    let result = 0;
    for (let i = 0; i < this._dirs.length; i++)
    {
      let dir = this._dirs[i];
      let x = cx + dir[0];
      let y = cy + dir[1];

      if (x < 0 || x >= this._width || x < 0 || y >= this._width)
      {
        continue;
      }
      result += (this._map[x][y] == 1 ? 1 : 0);
    }

    return result;
  }

  /**
   * Make sure every non-wall space is accessible.
   * @param {function} callback to call to display map when do
   * @param {int} value to consider empty space - defaults to 0
   * @param {function} callback to call when a new connection is made
   */
  connect(callback:(x:number, y:number, value:number) => void, value:number, connectionCallback)
  {
    if (!value) value = 0;

    let allFreeSpace = [];
    let notConnected = {};
    // find all free space
    for (let x = 0; x < this._width; x++)
    {
      for (let y = 0; y < this._height; y++)
      {
        if (this._freeSpace(x, y, value))
        {
          let p = [x, y];
          notConnected[this._pointKey(p)] = p;
          allFreeSpace.push([x, y]);
        }
      }
    }
    let start = allFreeSpace[ROT.RNG.getUniformInt(0, allFreeSpace.length - 1)];

    let key = this._pointKey(start);
    let connected = {};
    connected[key] = start;
    delete notConnected[key]

    // find what's connected to the starting point
    this._findConnected(connected, notConnected, [start], false, value);

    while (Object.keys(notConnected).length > 0)
    {

      // find two points from notConnected to connected
      let p = this._getFromTo(connected, notConnected);
      let from = p[0]; // notConnected
      let to = p[1]; // connected

      // find everything connected to the starting point
      let local = {};
      local[this._pointKey(from)] = from;
      this._findConnected(local, notConnected, [from], true, value);

      // connect to a connected square
      this._tunnelToConnected(to, from, connected, notConnected, value, connectionCallback);

      // now all of local is connected
      for (let k in local)
      {
        let pp = local[k];
        this._map[pp[0]][pp[1]] = value;
        connected[k] = pp;
        delete notConnected[k];
      }
    }

    this.serviceCallback(callback);
  }

  /**
   * Find random points to connect. Search for the closest point in the larger space.
   * This is to minimize the length of the passage while maintaining good performance.
   */
  _getFromTo(connected, notConnected)
  {
    let from, to, d;
    let connectedKeys = Object.keys(connected);
    let notConnectedKeys = Object.keys(notConnected);
    for (let i = 0; i < 5; i++)
    {
      if (connectedKeys.length < notConnectedKeys.length)
      {
        let keys = connectedKeys;
        to = connected[keys[ROT.RNG.getUniformInt(0, keys.length - 1)]]
        from = this._getClosest(to, notConnected);
      }
      else
      {
        let keys = notConnectedKeys;
        from = notConnected[keys[ROT.RNG.getUniformInt(0, keys.length - 1)]]
        to = this._getClosest(from, connected);
      }
      d = (from[0] - to[0]) * (from[0] - to[0]) + (from[1] - to[1]) * (from[1] - to[1]);
      if (d < 64)
      {
        break;
      }
    }
    // console.log(">>> connected=" + to + " notConnected=" + from + " dist=" + d);
    return [from, to];
  }

  _getClosest(point, space)
  {
    let minPoint = null;
    let minDist = null;
    for (k in space)
    {
      let p = space[k];
      let d = (p[0] - point[0]) * (p[0] - point[0]) + (p[1] - point[1]) * (p[1] - point[1]);
      if (minDist == null || d < minDist)
      {
        minDist = d;
        minPoint = p;
      }
    }
    return minPoint;
  }

  _findConnected(connected, notConnected, stack, keepNotConnected, value)
  {
    while (stack.length > 0)
    {
      let p = stack.splice(0, 1)[0];
      let tests = [
        [p[0] + 1, p[1]],
        [p[0] - 1, p[1]],
        [p[0], p[1] + 1],
        [p[0], p[1] - 1]
      ];
      for (let i = 0; i < tests.length; i++)
      {
        let key = this._pointKey(tests[i]);
        if (connected[key] == null && this._freeSpace(tests[i][0], tests[i][1], value))
        {
          connected[key] = tests[i];
          if (!keepNotConnected)
          {
            delete notConnected[key];
          }
          stack.push(tests[i]);
        }
      }
    }
  }

  _tunnelToConnected(to, from, connected, notConnected, value, connectionCallback)
  {
    let key = this._pointKey(from);
    let a, b;
    if (from[0] < to[0])
    {
      a = from;
      b = to;
    }
    else
    {
      a = to;
      b = from;
    }
    for (let xx = a[0]; xx <= b[0]; xx++)
    {
      this._map[xx][a[1]] = value;
      let p = [xx, a[1]];
      let pkey = this._pointKey(p);
      connected[pkey] = p;
      delete notConnected[pkey];
    }
    if (connectionCallback && a[0] < b[0])
    {
      connectionCallback(a, [b[0], a[1]]);
    }

    // x is now fixed
    let x = b[0];

    if (from[1] < to[1])
    {
      a = from;
      b = to;
    }
    else
    {
      a = to;
      b = from;
    }
    for (let yy = a[1]; yy < b[1]; yy++)
    {
      this._map[x][yy] = value;
      let p = [x, yy];
      let pkey = this._pointKey(p);
      connected[pkey] = p;
      delete notConnected[pkey];
    }
    if (connectionCallback && a[1] < b[1])
    {
      connectionCallback([b[0], a[1]], [b[0], b[1]]);
    }
  }

  _freeSpace(x, y, value)
  {
    return x >= 0 && x < this._width && y >= 0 && y < this._height && this._map[x][y] == value;
  }

  _pointKey(p)
  {
    return p[0] + "." + p[1];
  }
}
