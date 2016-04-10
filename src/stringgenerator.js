// @flow
'use strict';

import { RNG } from './rng';

/**
 * @class (Markov process)-based string generator.
 * Copied from a <a
 *   href="http://www.roguebasin.roguelikedevelopment.org/index.php?title=Names_from_a_high_order_Markov_Process_and_a_simplified_Katz_back-off_scheme">RogueBasin
 *   article</a>. Offers configurable order and prior.
 * @param {object} [options]
 * @param {boolean} [options.words=false] Use word mode?
 * @param {int} [options.order=3]
 * @param {float} [options.prior=0.001]
 */
export class StringGenerator {
  options:{ words:boolean, order:number, prior: number };
  boundary: string;
  suffix: string;
  prefix: string[];
  priorValues:any;
  data:any;

  constructor(options: { words:boolean, order:number, prior: number }) {

    this.options = {
      words: false,
      order: 3,
      prior: 0.001
    };

    for (let p in options) {
      this.options[p] = options[p];
    }

    this.boundary = String.fromCharCode(0);
    this.suffix = this.boundary;
    this.prefix = [];
    for (let i = 0; i < this.options.order; i++) {
      this.prefix.push(this.boundary);
    }

    this.priorValues = {};
    this.priorValues[this.boundary] = this.options.prior;

    this.data = {};
  }

  /**
   * Remove all learning data
   */
  clear() {
    this.data = {};
    this.priorValues = {};
  }

  /**
   * @returns {string} Generated string
   */
  generate():string {
    const result = [this._sample(this.prefix)];
    while (result[result.length - 1] != this.boundary) {
      result.push(this._sample(result));
    }
    return this._join(result.slice(0, -1));
  }

  /**
   * Observe (learn) a string from a training set
   */
  observe(string:string) {
    let tokens = this._split(string);

    for (let i = 0; i < tokens.length; i++) {
      this.priorValues[tokens[i]] = this.options.prior;
    }

    tokens = this.prefix.concat(tokens).concat(this.suffix);
    /* add boundary symbols */

    for (let i = this.options.order; i < tokens.length; i++) {
      const context = tokens.slice(i - this.options.order, i);
      const event = tokens[i];
      for (let j = 0; j < context.length; j++) {
        const subcontext = context.slice(j);
        this._observeEvent(subcontext, event);
      }
    }
  }

  getStats():string {
    const parts = [];

    let priorCount = 0;
    for (let p in this.priorValues) {
      priorCount++;
    }
    priorCount--;
    /* boundary */
    parts.push("distinct samples: " + priorCount);

    let dataCount = 0;
    let eventCount = 0;
    for (let p in this.data) {
      dataCount++;
      for (let key in this.data[p]) {
        eventCount++;
      }
    }
    parts.push("dictionary size (contexts): " + dataCount);
    parts.push("dictionary size (events): " + eventCount);

    return parts.join(", ");
  }

  /**
   * @param {string}
   * @returns {string[]}
   */
  _split(str:string):string[] {
    return str.split(this.options.words ? /\s+/ : "");
  }

  /**
   * @param {string[]}
   * @returns {string}
   */
  _join(arr:string[]):string {
    return arr.join(this.options.words ? " " : "");
  }

  /**
   * @param {string[]} context
   * @param {string} event
   */
  _observeEvent(context:string[], event:string) {
    const key = this._join(context);
    if (!(key in this.data)) {
      this.data[key] = {};
    }
    const data = this.data[key];

    if (!(event in data)) {
      data[event] = 0;
    }
    data[event]++;
  }

  /**
   * @param {string[]}
   * @returns {string}
   */
  _sample(context:string[]):string {
    context = this._backoff(context);
    const key = this._join(context);
    const data = this.data[key];

    let available = {};

    if (this.options.prior) {
      for (const event in this.priorValues) {
        available[event] = this.priorValues[event];
      }
      for (const event in data) {
        available[event] += data[event];
      }
    }
    else {
      available = data;
    }

    return RNG.getWeightedValue(available);
  }

  /**
   * @param {string[]}
   * @returns {string[]}
   */
  _backoff(context:string[]):string[] {
    if (context.length > this.options.order) {
      context = context.slice(-this.options.order);
    }
    else if (context.length < this.options.order) {
      context = this.prefix.slice(0, this.options.order - context.length).concat(context);
    }

    while (!(this._join(context) in this.data) && context.length > 0) {
      context = context.slice(1);
    }

    return context;
  }
}
