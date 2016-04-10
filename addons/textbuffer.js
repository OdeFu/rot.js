var TextBuffer = function() {
	this.data = [];
	this._options = {
		display: null,
		position: new XY(),
		size: new XY()
	}
}

TextBuffer.prototype.configure = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
}

TextBuffer.prototype.clear = function() {
	this.data = [];
}

TextBuffer.prototype.write = function(text) {
	this.data.push(text);
}

TextBuffer.prototype.flush = function() {
	var o = this._options;
	var d = o.display;
	var pos = o.position;
	var size = o.size;

	/* clear */
	for (var i=0;i<size.x;i++) {
		for (var j=0;j<size.y;j++) {
			d.draw(pos.x+i, pos.y+j);
		}
	}

	var text = this.data.join(" ");
	d.drawText(pos.x, pos.y, text, size.x);
}
