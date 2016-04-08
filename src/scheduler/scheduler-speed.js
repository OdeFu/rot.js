'use strict';

import { Scheduler } from './scheduler';

/**
 * @class Speed-based scheduler
 * @augments ROT.Scheduler
 */
export class SpeedScheduler {
  /**
   * @param {object} item anything with "getSpeed" method
   * @param {boolean} repeat
   * @see Scheduler#add
   */
  add(item:any, repeat:boolean):Scheduler
  {
    this._queue.add(item, 1 / item.getSpeed());
    return super.add(item, repeat);
  }

  /**
   * @see Scheduler#next
   */
  next():Scheduler
  {
    if (this._current && this._repeat.indexOf(this._current) != -1)
    {
      this._queue.add(this._current, 1 / this._current.getSpeed());
    }
    return super.next();
  }
}
