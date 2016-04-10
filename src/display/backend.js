// @flwo
'use strict';

/**
 * @class Abstract display backend module
 * @private
 */
export class Backend {
  constructor(context)
  {
    this._context = context;
  }

  compute(options)
  {
  }

  draw(data, clearBefore:boolean)
  {
  }

  computeSize(availWidth:number, availHeight:number):number[]
  {
  }

  computeFontSize(availWidth:number, availHeight:number):number
  {
  }

  eventToPosition(x:number, y:number):number[]
  {
  }
}
