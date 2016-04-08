'use strict';

import { RNG } from '../rng';

if (!Array.prototype.random)
{
  /**
   * @returns {any} Randomly picked item, null when length=0
   */
  Array.prototype.random = function ()
  {
    if (!this.length)
    {
      return null;
    }
    return this[Math.floor(RNG.getUniform() * this.length)];
  }
}

if (!Array.prototype.randomize)
{
  /**
   * @returns {array} New array with randomized items
   * FIXME destroys this!
   */
  Array.prototype.randomize = function ()
  {
    let result = [];
    const copy = [].prototype.slice.call(this);
    while (copy.length)
    {
      let index = copy.indexOf(copy.random());
      result.push(copy.splice(index, 1)[0]);
    }
    return result;
  }
}
