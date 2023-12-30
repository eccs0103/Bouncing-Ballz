"use strict";

//#region Point
/**
 * @interface
 */
class Point {
	/** @readonly */ get #metrics() {
		return Array.from(this);
	}
	/**
	 * @param {Number} [digits] 
	 */
	toFixed(digits) {
		return `(${this.#metrics.map(metric => metric.toFixed(digits)).join(`, `)})`;
	}
	/**
	 * @param {Number} [digits] 
	 */
	toExponential(digits) {
		return `(${this.#metrics.map(metric => metric.toExponential(digits)).join(`, `)})`;
	}
	/**
	 * @param {Number} [precision] 
	 */
	toPrecision(precision) {
		return `(${this.#metrics.map(metric => metric.toPrecision(precision)).join(`, `)})`;
	}
	/**
	 * @param {Number} [radix] 
	 */
	toString(radix) {
		return `(${this.#metrics.map(metric => metric.toString(radix)).join(`, `)})`;
	}
	/**
	 * @param {String | String[]} [locales] 
	 * @param {Intl.NumberFormatOptions} [options] 
	 */
	toLocaleString(locales, options) {
		return `(${this.#metrics.map(metric => metric.toLocaleString(locales, options)).join(`, `)})`;
	}
	/**
	 * @returns {Generator<Number>}
	 */
	*[Symbol.iterator]() {
		throw new ReferenceError(`Not implemented function`);
	}
}
//#endregion
//#region Point 1D
class Point1D extends Point {
	/**
	 * @param {Readonly<Point1D>} first 
	 * @param {Readonly<Point1D>} second 
	 */
	static [`+`](first, second) {
		return new Point1D(first.x + second.x);
	}
	/**
	 * @param {Readonly<Point1D>} first 
	 * @param {Readonly<Point1D>} second 
	 */
	static [`-`](first, second) {
		return new Point1D(first.x - second.x);
	}
	/**
	 * @param {Readonly<Point1D>} first 
	 * @param {Readonly<Point1D>} second 
	 */
	static [`*`](first, second) {
		return new Point1D(first.x * second.x);
	}
	/**
	 * @param {Readonly<Point1D>} first 
	 * @param {Readonly<Point1D>} second 
	 */
	static [`/`](first, second) {
		return new Point1D(first.x / second.x);
	}
	/**
	 * @param {Readonly<Point1D>} source 
	 * @returns {Point1D}
	 */
	static clone(source) {
		return new Point1D(source.x);
	}
	/**
	 * @param {Number} value 
	 * @returns {Point1D}
	 */
	static repeat(value) {
		return new Point1D(value);
	}
	/** @readonly */ static get ZERO() { return Point1D.repeat(0); }
	/** @type {Point1D} */ static #CONSTANT_ZERO = Point1D.ZERO;
	/** @readonly */ static get CONSTANT_ZERO() {
		return Object.freeze(this.#CONSTANT_ZERO);
	}
	/** @readonly */ static get HALF() { return Point1D.repeat(0.5); }
	/** @type {Point1D} */ static #CONSTANT_HALF = Point1D.HALF;
	/** @readonly */ static get CONSTANT_HALF() {
		return Object.freeze(this.#CONSTANT_HALF);
	}
	/** @readonly */ static get TWO() { return Point1D.repeat(2); }
	/** @type {Point1D} */ static #CONSTANT_TWO = Point1D.TWO;
	/** @readonly */ static get CONSTANT_TWO() {
		return Object.freeze(this.#CONSTANT_TWO);
	}
	/**
	 * @param {Number} x 
	 */
	constructor(x) {
		super();
		this.x = x;
	}
	/** @type {Number} */ #x = 0;
	get x() {
		return this.#x;
	}
	set x(value) {
		this.#x = value;
	}
	/**
	 * @param {Readonly<Point1D>} other 
	 */
	[`+`](other) {
		return Point1D["+"](this, other);
	}
	/**
	 * @param {Readonly<Point1D>} other 
	 */
	[`-`](other) {
		return Point1D["-"](this, other);
	}
	/**
	 * @param {Readonly<Point1D>} other 
	 */
	[`*`](other) {
		return Point1D["*"](this, other);
	}
	/**
	 * @param {Readonly<Point1D>} other 
	 */
	[`/`](other) {
		return Point1D["/"](this, other);
	}
	clone() {
		return Point1D.clone(this);
	}
	*[Symbol.iterator]() {
		yield this.x;
		return;
	}
}
//#endregion
//#region Point 2D
class Point2D extends Point1D {
	/**
	 * @param {Readonly<Point2D>} first 
	 * @param {Readonly<Point2D>} second 
	 */
	static [`+`](first, second) {
		return new Point2D(first.x + second.x, first.y + second.y);
	}
	/**
	 * @param {Readonly<Point2D>} first 
	 * @param {Readonly<Point2D>} second 
	 */
	static [`-`](first, second) {
		return new Point2D(first.x - second.x, first.y - second.y);
	}
	/**
	 * @param {Readonly<Point2D>} first 
	 * @param {Readonly<Point2D>} second 
	 */
	static [`*`](first, second) {
		return new Point2D(first.x * second.x, first.y * second.y);
	}
	/**
	 * @param {Readonly<Point2D>} first 
	 * @param {Readonly<Point2D>} second 
	 */
	static [`/`](first, second) {
		return new Point2D(first.x / second.x, first.y / second.y);
	}
	/**
	 * @param {Readonly<Point2D>} source 
	 * @returns {Point2D}
	 */
	static clone(source) {
		return new Point2D(source.x, source.y);
	}
	/**
	 * @param {Number} value 
	 * @returns {Point2D}
	 */
	static repeat(value) {
		return new Point2D(value, value);
	}
	/** @readonly */ static get ZERO() { return Point2D.repeat(0); }
	/** @type {Point2D} */ static #CONSTANT_ZERO = Point2D.ZERO;
	/** @readonly */ static get CONSTANT_ZERO() {
		return Object.freeze(this.#CONSTANT_ZERO);
	}
	/** @readonly */ static get HALF() { return Point2D.repeat(0.5); }
	/** @type {Point2D} */ static #CONSTANT_HALF = Point2D.HALF;
	/** @readonly */ static get CONSTANT_HALF() {
		return Object.freeze(this.#CONSTANT_HALF);
	}
	/** @readonly */ static get TWO() { return Point2D.repeat(2); }
	/** @type {Point2D} */ static #CONSTANT_TWO = Point2D.TWO;
	/** @readonly */ static get CONSTANT_TWO() {
		return Object.freeze(this.#CONSTANT_TWO);
	}
	/**
	 * @param {Number} x 
	 * @param {Number} y 
	 */
	constructor(x, y) {
		super(x);
		this.y = y;
	}
	/** @type {Number} */ #y = 0;
	get y() {
		return this.#y;
	}
	set y(value) {
		this.#y = value;
	}
	/**
	 * @param {Readonly<Point2D>} other 
	 */
	[`+`](other) {
		return Point2D["+"](this, other);
	}
	/**
	 * @param {Readonly<Point2D>} other 
	 */
	[`-`](other) {
		return Point2D[`-`](this, other);
	}
	/**
	 * @param {Readonly<Point2D>} other 
	 */
	[`*`](other) {
		return Point2D[`*`](this, other);
	}
	/**
	 * @param {Readonly<Point2D>} other 
	 */
	[`/`](other) {
		return Point2D[`/`](this, other);
	}
	clone() {
		return Point2D.clone(this);
	}
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		return;
	}
}
//#endregion
//#region Point 3D
class Point3D extends Point2D {
	/**
	 * @param {Readonly<Point3D>} first 
	 * @param {Readonly<Point3D>} second 
	 */
	static [`+`](first, second) {
		return new Point3D(first.x + second.x, first.y + second.y, first.z + second.z);
	}
	/**
	 * @param {Readonly<Point3D>} first 
	 * @param {Readonly<Point3D>} second 
	 */
	static [`-`](first, second) {
		return new Point3D(first.x - second.x, first.y - second.y, first.z - second.z);
	}
	/**
	 * @param {Readonly<Point3D>} target 
	 * @param {Readonly<Point3D>} second 
	 */
	static [`*`](target, second) {
		return new Point3D(target.x * second.x, target.y * second.y, target.z * second.z);
	}
	/**
	 * @param {Readonly<Point3D>} target 
	 * @param {Readonly<Point3D>} second 
	 */
	static [`/`](target, second) {
		return new Point3D(target.x / second.x, target.y / second.y, target.z / second.z);
	}
	/**
	 * @param {Readonly<Point3D>} source 
	 * @returns {Point3D}
	 */
	static clone(source) {
		return new Point3D(source.x, source.y, source.z);
	}
	/**
	 * @param {Number} value 
	 * @returns {Point3D}
	 */
	static repeat(value) {
		return new Point3D(value, value, value);
	}
	/** @readonly */ static get ZERO() { return Point3D.repeat(0); }
	/** @type {Point3D} */ static #CONSTANT_ZERO = Point3D.ZERO;
	/** @readonly */ static get CONSTANT_ZERO() {
		return Object.freeze(this.#CONSTANT_ZERO);
	}
	/** @readonly */ static get HALF() { return Point3D.repeat(0.5); }
	/** @type {Point3D} */ static #CONSTANT_HALF = Point3D.HALF;
	/** @readonly */ static get CONSTANT_HALF() {
		return Object.freeze(this.#CONSTANT_HALF);
	}
	/** @readonly */ static get TWO() { return Point3D.repeat(2); }
	/** @type {Point3D} */ static #CONSTANT_TWO = Point3D.TWO;
	/** @readonly */ static get CONSTANT_TWO() {
		return Object.freeze(this.#CONSTANT_TWO);
	}
	/**
	 * @param {Number} x 
	 * @param {Number} y 
	 * @param {Number} z 
	 */
	constructor(x, y, z) {
		super(x, y);
		this.z = z;
	}
	/** @type {Number} */ #z = 0;
	get z() {
		return this.#z;
	}
	set z(value) {
		this.#z = value;
	}
	/**
	 * @param {Readonly<Point3D>} other 
	 */
	[`+`](other) {
		return Point3D["+"](this, other);
	}
	/**
	 * @param {Readonly<Point3D>} other 
	 */
	[`-`](other) {
		return Point3D[`-`](this, other);
	}
	/**
	 * @param {Readonly<Point3D>} other 
	 */
	[`*`](other) {
		return Point3D[`*`](this, other);
	}
	/**
	 * @param {Readonly<Point3D>} other 
	 */
	[`/`](other) {
		return Point3D[`/`](this, other);
	}
	clone() {
		return Point3D.clone(this);
	}
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
		return;
	}
}
//#endregion

export { Point, Point1D, Point2D, Point3D };
