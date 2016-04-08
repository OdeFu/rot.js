'use strict';

import { EventQueue } from '../eventqueue';

/**
 * @class Abstract scheduler
 */
export class Scheduler {
  constructor()
  {
    this._queue = new EventQueue();
    this._repeat = [];
    this._current = null;
  }

  /**
   * @see ROT.EventQueue#getTime
   */
  getTime():number
  {
    return this._queue.getTime();
  }

  /**
   * @param {?} item
   * @param {boolean} repeat
   */
  add(item:any, repeat:boolean):Scheduler
  {
    if (repeat)
    {
      this._repeat.push(item);
    }
    return this;
  }

  /**
   * Clear all items
   */
  clear():Scheduler
  {
    this._queue.clear();
    this._repeat = [];
    this._current = null;
    return this;
  }

  /**
   * Remove a previously added item
   * @param {?} item
   * @returns {boolean} successful?
   */
  remove(item:any):boolean
  {
    let result = this._queue.remove(item);

    let index = this._repeat.indexOf(item);
    if (index != -1)
    {
      this._repeat.splice(index, 1);
    }

    if (this._current == item)
    {
      this._current = null;
    }

    return result;
  }

  /**
   * Schedule next item
   * @returns {?}
   */
  next():any
  {
    this._current = this._queue.get();
    return this._current;
  }
}
