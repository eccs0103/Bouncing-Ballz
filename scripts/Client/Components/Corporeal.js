"use strict";

import { Point2D } from "../Modules/Measures.js";
import { progenitor, display } from "./Node.js";
import { Entity } from "./Entity.js";

/** @type {Corporeal[]} */ const corporeals = [];

//#region Collision event
/**
 * @typedef VirtualCollisionEvent
 * @property {Corporeal} other
 * 
 * @typedef {EventInit & VirtualCollisionEvent} CollisionEventInit
 */

class CollisionEvent extends Event {
	/**
	 * @param {String} type 
	 * @param {CollisionEventInit} dict 
	 */
	constructor(type, dict) {
		super(type, dict);
	}
	/** @type {Corporeal?} */ #other = null;
	/** @readonly */ get other() {
		return this.#other ?? (() => {
			throw new ReferenceError(`Other property is missing`);
		})();
	}
}
//#endregion
//#region Corporeal
class Corporeal extends Entity {
	static {
		progenitor.addEventListener(`update`, (event) => {
			for (let index = 0; index < corporeals.length; index++) {
				const target = corporeals[index];
				for (let index2 = index + 1; index2 < corporeals.length; index2++) {
					const other = corporeals[index2];

					const isCollisionBefore = target.#collisions.has(other);
					const isCollisionNow = Corporeal.isCollide(target, other);

					if (isCollisionNow) {
						if (!isCollisionBefore) {
							target.#collisions.add(other);
							target.dispatchEvent(new CollisionEvent(`collisionbegin`, { other: other }));
							other.dispatchEvent(new CollisionEvent(`collisionbegin`, { other: target }));
						}
						target.dispatchEvent(new CollisionEvent(`collision`, { other: other }));
						other.dispatchEvent(new CollisionEvent(`collision`, { other: target }));
					} else if (isCollisionBefore) {
						target.#collisions.delete(other);
						target.dispatchEvent(new CollisionEvent(`collisionend`, { other: other }));
						other.dispatchEvent(new CollisionEvent(`collisionend`, { other: target }));
					}
				}
			}
		});
	}
	/**
	 * @param {Corporeal} corporeal 
	 * @returns {[Point2D, Point2D]}
	 */
	static #getCollider(corporeal) {
		return [
			corporeal.position["-"](corporeal.size["/"](Point2D.CONSTANT_TWO)),
			corporeal.position["+"](corporeal.size["/"](Point2D.CONSTANT_TWO)),
		];
	}
	/**
	 * @param {Corporeal} first 
	 * @param {Corporeal} second 
	 */
	static isCollide(first, second) {
		const [begin1, end1] = Corporeal.#getCollider(first);
		const [begin2, end2] = Corporeal.#getCollider(second);
		return (
			begin1.x <= end2.x &&
			begin2.x <= end1.x &&
			begin1.y <= end2.y &&
			begin2.y <= end1.y
		);
	}
	/**
	 * @param {String} name 
	 */
	constructor(name = ``) {
		super(name);

		this.addEventListener(`connect`, (event) => {
			corporeals.push(this);
		});

		this.addEventListener(`disconnect`, (event) => {
			const index = corporeals.indexOf(this);
			if (index > 0) {
				corporeals.splice(index, 1);
			}
		});

		this.addEventListener(`update`, (event) => {
			this.velocity = this.velocity["+"](this.acceleration);
			this.position = this.position["+"](this.#velocity["*"](Point2D.repeat(display.delta)));
		});
	}
	/** @type {Set<Corporeal>} */ #collisions = new Set();
	/** @type {Set<Point2D>} */ #forces = new Set();
	/** @readonly */ get forces() {
		return this.#forces;
	}
	/** @type {Number} */ #mass = 1;
	get mass() {
		return this.#mass;
	}
	set mass(value) {
		if (value > 0) {
			this.#mass = value;
		} else throw new RangeError(`Mass ${value} is out of range (0 - +∞)`);
	}
	/** @readonly */ get acceleration() {
		let equivalent = Point2D.ZERO;
		for (const force of this.forces) {
			equivalent = equivalent["+"](force);
		}
		return equivalent["/"](Point2D.repeat(this.mass));
	}
	/** @type {Point2D} */ #velocity = Point2D.ZERO;
	get velocity() {
		return this.#velocity;
	}
	set velocity(value) {
		this.#velocity = value;
	}
}
//#endregion

export { Corporeal };