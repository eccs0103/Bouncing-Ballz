"use strict";

import { NotationProgenitor, NotationContainer } from "./Modules/Storage.js";
import { } from "./Modules/Extensions.js";
import { Node, context, display, progenitor } from "./Components/Node.js";
import { Entity } from "./Components/Entity.js";
import { } from "./Components/InterfaceItem.js";
import { CollisionEvent, Corporeal } from "./Components/Corporeal.js";
import { Animator, Renderer } from "./Components/Utilities.js";
import { Point2D } from "./Modules/Measures.js";

const gravity = new Point2D(0, 9.8);

/** @enum {Number} */ const Directions = {
	/** @readonly */ up: 0,
	/** @readonly */ left: 1,
	/** @readonly */ down: 2,
	/** @readonly */ right: 3,
};
Object.freeze(Directions);

const { PI, pow, sqrt, sign } = Math;
/**
 * @param {Entity} other 
 * @param {Entity} target 
 * @returns {Directions} [0 - 3]
 */
function getSectorIndex(other, target) {
	const dotTopRight = target.size["/"](Point2D.repeat(2));
	const alpha = Math.atan2(dotTopRight.x, dotTopRight.y);

	const otherRelativePosition = Point2D["-"](other.position, target.position);
	let angle = Math.atan2(otherRelativePosition.x, otherRelativePosition.y);
	angle += alpha;
	if (angle < 0) {
		angle += 2 * PI;
	}

	const sectors = [2 * alpha, PI - 2 * alpha, 2 * alpha, PI - 2 * alpha];
	for (let begin = 0, index = 0; index < sectors.length; index++) {
		const sector = sectors[index];
		const end = begin + sector;
		if (begin <= angle && angle < end) {
			return index;
		}
		begin = end;
	}
	throw new RangeError(`Can't select sector. Maybe ${angle} out of range [0 - 2π].`);
}

/**
 * @param {Number} m1 
 * @param {Number} m2 
 */
function a(m1, m2) {
	return m2 ** 2 + m1 * m2;
}
/**
 * @param {Number} m1 
 * @param {Number} m2 
 * @param {Number} v1 
 * @param {Number} v2 
 */
function b(m1, m2, v1, v2) {
	return -2 * m2 * (m1 * v1 + m2 * v2);
}
/**
 * @param {Number} m1 
 * @param {Number} m2 
 * @param {Number} v1 
 * @param {Number} v2 
 */
function c(m1, m2, v1, v2) {
	return (m2 * v2) ** 2 + 2 * m1 * m2 * v1 * v2 - m1 * m2 * v2 ** 2;
}
/**
 * @param {Number} a 
 * @param {Number} b 
 * @param {Number} c 
 */
function v2shtrix(a, b, c) {
	return (-b + sqrt(b ** 2 - 4 * a * c)) / (2 * a);
}
/**
 * @param {Number} m1 
 * @param {Number} m2 
 * @param {Number} v1 
 * @param {Number} v2 
 * @param {Number} v2shtrix 
 */
function v1shtrix(m1, m2, v1, v2, v2shtrix) {
	return (m1 * v1 + m2 * v2 - m2 * v2shtrix) / m1;
}
/**
 * @param {Number} m1 
 * @param {Number} m2 
 * @param {Number} v1 
 * @param {Number} v2 
 */
function miHatFunkciaGri(m1, m2, v1, v2) {
	const svax = v2shtrix(a(m1, m2), b(m1, m2, v1, v2), c(m1, m2, v1, v2));
	return [v1shtrix(m1, m2, v1, v2, svax), svax];
}

function elastic(mA, mB, vA1, vB1) {
	const vC1 = vA1 - vB1;
	const vD2 = (2 * vC1) / (mB / mA + 1);
	const vB2 = vD2 + vB1;
	const vC2 = vC1 - (mB * vD2) / mA;
	const vA2 = vC2 + vB1;
	return [vA2, vB2];
}

function elastic2(m1, m2, v1, v2) {
	return [
		(2 * m2 * v2 + v1 * (m2 - m1)) / (m1 + m2),
		(2 * m1 * v1 + v2 * (m2 - m1)) / (m1 + m2),
	];
}


//#region Pointer
class Pointer extends Node {
	/**
	 * @param {Readonly<Point2D>} begin 
	 */
	constructor(begin) {
		super(`Pointer`);
		this.begin = begin;
		this.end = begin;
		this.addEventListener(`render`, (event) => {
			const strokeStyle = context.strokeStyle;
			context.strokeStyle = Renderer.colorHighlight.toString(true);
			context.beginPath();
			context.moveTo(this.begin.x, this.begin.y);
			const lineWidth = context.lineWidth;
			context.lineWidth = 2;
			context.lineTo(this.end.x, this.end.y);
			context.lineWidth = lineWidth;
			context.closePath();
			context.stroke();
			context.strokeStyle = strokeStyle;
		});
	}
	/** @type {Point2D} */ #begin = Point2D.ZERO;
	get begin() {
		return Object.freeze(this.#begin);
	}
	set begin(value) {
		let result = value.clone();
		this.#begin = result;
	}
	/** @type {Point2D} */ #end = Point2D.ZERO;
	get end() {
		return Object.freeze(this.#end);
	}
	set end(value) {
		let result = value.clone();
		this.#end = result;
	}
}
//#endregion
//#region Wall
class Wall extends Corporeal {
	constructor() {
		super(`Wall`);
		this.mass = 100;
		this.addEventListener(`connect`, (event) => {
			this.dispatchEvent(new Event(`rebuild`));
		});
		display.addEventListener(`resize`, (event) => {
			this.dispatchEvent(new Event(`rebuild`));
		});
		this.addEventListener(`render`, (event) => {
			Renderer.drawArea(this);
		});
	}
}
//#endregion
//#region Ball
class Ball extends Corporeal {
	constructor() {
		super(`Ball`);
		this.addEventListener(`connect`, (event) => {
			this.dispatchEvent(new Event(`rebuild`));
		});
		display.addEventListener(`resize`, (event) => {
			this.dispatchEvent(new Event(`rebuild`));
		});
		this.addEventListener(`render`, (event) => {
			Renderer.drawArea(this);
		});

		// this.forces.add(gravity);
		const a = new Animator(3);
		a.addEventListener(`update`, (event) => {

		});
		// this.forces.add(new Point2D(gravity.y, gravity.x));

		this.addEventListener(`collisionbegin`, (event) => {
			if (event instanceof CollisionEvent) {
				const other = event.other;
				const [v1x, v2x] = miHatFunkciaGri(this.mass, other.mass, this.velocity.x, other.velocity.x);
				const [v1y, v2y] = miHatFunkciaGri(this.mass, other.mass, this.velocity.y, other.velocity.y);

				this.velocity = new Point2D(v1x, v1y);
				if (!(other instanceof Wall)) {
					other.velocity = new Point2D(v2x, v2y);
				}

				switch (getSectorIndex(other, this)) {
					case Directions.up:
					case Directions.down: {
						this.velocity = this.velocity["*"](new Point2D(-1, 1));
					} break;
					case Directions.left:
					case Directions.right: {
						this.velocity = this.velocity["*"](new Point2D(1, -1));
					} break;
				}

				document.log(`${this.velocity}`, `${other.velocity}`);
			}
		});
	}
}
//#endregion
//#region Metadata
const developer = document.getElement(HTMLMetaElement, `meta[name="author"]`).content;
const title = document.getElement(HTMLMetaElement, `meta[name="application-name"]`).content;
//#endregion

export { Wall, Pointer, Ball };