'use strict';

if (!Object.create) {
	/**
	 * ES5 Object.create
	 */
	Object.create = function(o) {
		let tmp = function() {};
		tmp.prototype = o;
		return new tmp();
	};
}
