'use strict';

import { Scheduler } from './scheduler/scheduler';

/**
 * @class Asynchronous main loop
 * @param {Scheduler} scheduler
 */
export class Engine {
  constructor(scheduler:Scheduler)
  {
    this._scheduler = scheduler;
    this._lock = 1;
  }

  /**
   * Start the main loop. When this call returns, the loop is locked.
   */
  start():Engine
  {
    return this.unlock();
  }

  /**
   * Interrupt the engine by an asynchronous action
   */
  lock():Engine
  {
    this._lock++;
    return this;
  }

  /**
   * Resume execution (paused by a previous lock)
   */
  unlock():Engine
  {
    if (!this._lock)
    {
      throw new Error("Cannot unlock unlocked engine");
    }
    this._lock--;

    while (!this._lock)
    {
      let actor = this._scheduler.next();
      if (!actor)
      {
        return this.lock();
      }
      /* no actors */
      let result = actor.act();
      if (result && result.then)
      { /* actor returned a "thenable", looks like a Promise */
        this.lock();
        result.then(this.unlock.bind(this));
      }
    }

    return this;
  }
}
