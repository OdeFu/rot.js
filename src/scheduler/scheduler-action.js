'use strict';

import { Scheduler } from './scheduler';

/**
 * @class Action-based scheduler
 * @augments Scheduler
 */
export class ActionScheduler extends Scheduler {
  constructor()
  {
    super();
    this._defaultDuration = 1;
    /* for newly added */
    this._duration = this._defaultDuration;
    /* for this._current */
  }

  /**
   * @param {object} item
   * @param {boolean} repeat
   * @param {number} [time=1]
   * @see Scheduler#add
   */
  add(item:any, repeat:boolean, time:number):Scheduler
  {
    this._queue.add(item, time || this._defaultDuration);
    return super.add(item, repeat);
  }

  clear():Scheduler
  {
    this._duration = this._defaultDuration;
    return super.clear();
  }

  remove(item:any):boolean
  {
    if (item == this._current)
    {
      this._duration = this._defaultDuration;
    }
    return super.remove(item);
  }

  /**
   * @see ROT.Scheduler#next
   */
  next():Scheduler
  {
    if (this._current && this._repeat.indexOf(this._current) != -1)
    {
      this._queue.add(this._current, this._duration || this._defaultDuration);
      this._duration = this._defaultDuration;
    }
    return super.next();
  }

  /**
   * Set duration for the active item
   */
  setDuration(time:number):ActionScheduler
  {
    if (this._current)
    {
      this._duration = time;
    }
    return this;
  }
}
