// @flwo
'use strict';

import { Scheduler } from './scheduler';

/**
 * @class Simple fair scheduler (round-robin style)
 * @augments Scheduler
 */
export class SimpleScheduler {
  /**
   * @see Scheduler#add
   */
  add(item:any, repeat:boolean):Scheduler
  {
    this._queue.add(item, 0);
    return super.add(item, repeat);
  }

  /**
   * @see Scheduler#next
   */
  next():Scheduler
  {
    if (this._current && this._repeat.indexOf(this._current) != -1)
    {
      this._queue.add(this._current, 0);
    }
    return super.next();
  }
}
