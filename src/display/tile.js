'use strict';

import { Backend } from './backend';

/**
 * @class Tile backend
 * @private
 */
export class TileBackend extends Backend {
  constructor(context)
  {
    super(context);

    this._options = {};
    this._colorCanvas = document.createElement("canvas");
  }

  compute(options)
  {
    this._options = options;
    this._context.canvas.width = options.width * options.tileWidth;
    this._context.canvas.height = options.height * options.tileHeight;
    this._colorCanvas.width = options.tileWidth;
    this._colorCanvas.height = options.tileHeight;
  }

  draw(data, clearBefore)
  {
    let x = data[0];
    let y = data[1];
    let ch = data[2];
    let fg = data[3];
    let bg = data[4];

    let tileWidth = this._options.tileWidth;
    let tileHeight = this._options.tileHeight;

    if (clearBefore)
    {
      if (this._options.tileColorize)
      {
        this._context.clearRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
      }
      else
      {
        this._context.fillStyle = bg;
        this._context.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
      }
    }

    if (!ch)
    {
      return;
    }

    let chars = [].concat(ch);
    for (let i = 0; i < chars.length; i++)
    {
      let tile = this._options.tileMap[chars[i]];
      if (!tile)
      {
        throw new Error("Char '" + chars[i] + "' not found in tileMap");
      }

      if (this._options.tileColorize)
      { /* apply colorization */
        let canvas = this._colorCanvas;
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, tileWidth, tileHeight);

        context.drawImage(
          this._options.tileSet,
          tile[0], tile[1], tileWidth, tileHeight,
          0, 0, tileWidth, tileHeight
        );

        if (fg != "transparent")
        {
          context.fillStyle = fg;
          context.globalCompositeOperation = "source-atop";
          context.fillRect(0, 0, tileWidth, tileHeight);
        }

        if (bg != "transparent")
        {
          context.fillStyle = bg;
          context.globalCompositeOperation = "destination-over";
          context.fillRect(0, 0, tileWidth, tileHeight);
        }

        this._context.drawImage(canvas, x * tileWidth, y * tileHeight, tileWidth, tileHeight);

      }
      else
      { /* no colorizing, easy */
        this._context.drawImage(
          this._options.tileSet,
          tile[0], tile[1], tileWidth, tileHeight,
          x * tileWidth, y * tileHeight, tileWidth, tileHeight
        );
      }
    }
  }

  computeSize(availWidth:number, availHeight:number):number[]
  {
    let width = Math.floor(availWidth / this._options.tileWidth);
    let height = Math.floor(availHeight / this._options.tileHeight);
    return [width, height];
  }

  computeFontSize(availWidth:number, availHeight:number):number
  {
    let width = Math.floor(availWidth / this._options.width);
    let height = Math.floor(availHeight / this._options.height);
    return [width, height];
  }

  eventToPosition(x:number, y:number):number[]
  {
    return [Math.floor(x / this._options.tileWidth), Math.floor(y / this._options.tileHeight)];
  }
}
