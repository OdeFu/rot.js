'use strict';

if (!Number.prototype.mod)
{
  /**
   * Always positive modulus
   * @param {int} n Modulus
   * @returns {int} this modulo n
   */
  Number.prototype.mod = function (n:number):number
  {
    return ((this % n) + n) % n;
  }
}
