"use strict";

import {
	NotationProgenitor,
	NotationContainer
} from "./modules/storage.js";
import { } from "./modules/extensions.js";
import {
	Point2D,
	Segment
} from "./modules/measures.js";
import {
	Color
} from "./modules/colors.js";
import {
	Display
} from "./modules/executors.js";

//#region Entity
/** @enum {String} */ const EntityTypes = {
	/** @readonly */ ball: `ball`,
	/** @readonly */ wall: `wall`,
};
Object.freeze(EntityTypes);

class Entity extends EventTarget {
	/**
	 * @param {EntityTypes} type 
	 */
	constructor(type) {
		super();
		this.type = type;
	}
	/** @type {EntityTypes} */ #type;
	get type() {
		return this.#type;
	}
	set type(value) {
		if (Object.values(EntityTypes).includes(value)) {
			this.#type = value;
		} else throw new TypeError(`Invalid ${value} entity type`);
	}
	/** @type {Point2D} */ #position = new Point2D(0, 0);
	get position() {
		return this.#position;
	}
	set position(value) {
		this.#position = value;
	}
	/** @type {Point2D} */ #size = new Point2D(0, 0);
	get size() {
		return this.#size;
	}
	set size(value) {
		this.#size = value;
	}
	/** @type {Color} */ #color = Color.TRANSPARENT;
	get color() {
		return this.#color;
	}
	set color(value) {
		this.#color = value;
	}
	/**
	 * @param {Entity} other 
	 * @returns [0 - 3]
	 */
	getSectorIndex(other) {
		const dotTopRight = new Point2D(this.size.x / 2, this.size.y / 2);
		const alpha = Math.atan2(dotTopRight.x, dotTopRight.y);

		const otherRelativePosition = Point2D.subtract(other.position, this.position);
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
}
//#endregion
//#region Progenitor
class Progenitor extends EventTarget {
	constructor() {
		super();
		this.addEventListener(`update`, (event) => {
			const corporeals = Array.from(this.#corporeals);
			for (let index = 0; index < corporeals.length; index++) {
				const target = corporeals[index];
				for (let index2 = index + 1; index2 < corporeals.length; index2++) {
					const other = corporeals[index2];
					//
					const isCollisionBefore = target.collisions.has(other);
					const isCollisionNow = Corporeal.isCollide(target, other);
					//
					if (isCollisionNow) {
						if (!isCollisionBefore) {
							target.collisions.add(other);
							target.dispatchEvent(new CustomEvent(`collisionbegin`, { detail: new CollisionDetail(other) }));
							other.dispatchEvent(new CustomEvent(`collisionbegin`, { detail: new CollisionDetail(target) }));
						}
						target.dispatchEvent(new CustomEvent(`collision`, { detail: new CollisionDetail(other) }));
						other.dispatchEvent(new CustomEvent(`collision`, { detail: new CollisionDetail(target) }));
					} else if (isCollisionBefore) {
						target.collisions.delete(other);
						target.dispatchEvent(new CustomEvent(`collisionend`, { detail: new CollisionDetail(other) }));
						other.dispatchEvent(new CustomEvent(`collisionend`, { detail: new CollisionDetail(target) }));
					}
				}
			}
		});
	}
	/** @type {Set<Entity>} */ #children = new Set();
	/** @type {Set<Corporeal>} */ #corporeals = new Set();
	/**
	 * @param {Entity} child 
	 */
	add(child) {
		this.#children.add(child);
		if (child instanceof Corporeal) {
			this.#corporeals.add(child);
		}
	}
	/**
	 * @param {Entity} child 
	 */
	delete(child) {
		this.#children.delete(child);
		if (child instanceof Corporeal) {
			this.#corporeals.delete(child);
		}
	}
	/** @readonly */ get children() {
		return Object.freeze(this.#children);
	}
	/** @readonly */ get corporeals() {
		return Object.freeze(this.#corporeals);
	}
	/**
	 * @param {Event} event 
	 */
	dispatchEvent(event) {
		const result = super.dispatchEvent(event);
		if (result && event.bubbles) {
			for (const child of this.#children) {
				child.dispatchEvent(event);
			}
		}
		return result;
	}
}
//#endregion
//#region Corporeal
class CollisionDetail {
	/**
	 * @param {Corporeal} other 
	 */
	constructor(other) {
		this.#other = other;
	}
	/** @type {Corporeal} */ #other;
	/** @readonly */ get other() {
		return this.#other;
	}
}

class Corporeal extends Entity {
	/**
	 * @param {Corporeal} first 
	 * @param {Corporeal} second 
	 */
	static isCollide(first, second) {
		return (
			first.#collider.begin.x <= second.#collider.end.x &&
			second.#collider.begin.x <= first.#collider.end.x &&
			first.#collider.begin.y <= second.#collider.end.y &&
			second.#collider.begin.y <= first.#collider.end.y
		);
	}
	/**
	 * @param {String} name 
	 */
	constructor(name) {
		super(name);
		this.addEventListener(`update`, (event) => {
			this.#velocity.add(/** @type {Point2D} */(this.acceleration));
			this.position.add(Point2D.multiply(this.#velocity, display.delta));
		});
	}
	/** @type {Set<Corporeal>} */ collisions = new Set();
	/** @readonly */ get #collider() {
		return Object.freeze(new Segment(
			Point2D.subtract(this.position, Point2D.divide(this.size, 2)),
			Point2D.add(this.position, Point2D.divide(this.size, 2)),
		));
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
	/** @type {Set<Point2D>} */ #forces = new Set();
	/** @readonly */ get forces() {
		return this.#forces;
	}
	/** @readonly */ get equivalent() {
		let result = new Point2D(0, 0);
		for (const force of this.#forces) {
			result.add(force);
		}
		return Object.freeze(result);
	}
	/** @readonly */ get acceleration() {
		const result = this.equivalent.clone();
		result.divide(this.mass);
		return Object.freeze(result);
	}
	/** @type {Point2D} */ #velocity = new Point2D(0, 0);
	get velocity() {
		return this.#velocity;
	}
	set velocity(value) {
		this.#velocity = value;
	}
}
//#endregion
//#region Metadata
const developer = document.getElement(HTMLMetaElement, `meta[name="author"]`).content;
const title = document.getElement(HTMLMetaElement, `meta[name="application-name"]`).content;

const { PI, min, max } = Math;
const toDegFactor = 180 / PI, toRadFactor = PI / 180;
const canvas = document.getElement(HTMLCanvasElement, `canvas#display`);
const context = canvas.getContext(`2d`) ?? (() => {
	throw new ReferenceError(`Cant reach context`);
})();

const display = new Display(context);
//#endregion

export {
	EntityTypes,
	Entity,
	Progenitor,
	CollisionDetail,
	Corporeal,
	PI,
	min,
	max,
	toDegFactor,
	toRadFactor,
	canvas,
	context,
	display,
};