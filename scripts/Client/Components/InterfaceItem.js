"use strict";

import { Point2D } from "../Modules/Measures.js";
import { Entity } from "./Entity.js";
import { canvas, display, progenitor } from "./Node.js";

//#region Interface item
class InterfaceItem extends Entity {
	/**
	 * @param {String} name 
	 */
	constructor(name = ``) {
		super(name);
	}
	/** @type {Point2D} */ #anchor = Point2D.ZERO;
	get anchor() {
		return Object.freeze(this.#anchor["*"](Point2D.CONSTANT_TWO));
	}
	set anchor(value) {
		if (-1 > this.#anchor.x || this.#anchor.x > 1) throw new RangeError(`Anchor ${this.anchor} is out of range [(-1, -1) - (1, 1)]`);
		if (-1 > this.#anchor.y || this.#anchor.y > 1) throw new RangeError(`Anchor ${this.anchor} is out of range [(-1, -1) - (1, 1)]`);
		const result = value["/"](Point2D.CONSTANT_TWO);
		this.#anchor = result;
	}
	get globalPosition() {
		let result = super.globalPosition.clone();
		try {
			if (this.parent instanceof Entity) {
				result = result["+"](this.parent.size["*"](this.#anchor));
				result = result["-"](this.size["*"](this.#anchor));
			}
		} finally {
			return Object.freeze(result);
		}
	}
	set globalPosition(value) {
		let result = value;
		try {
			if (this.parent instanceof Entity) {
				result = result["-"](this.parent.size["*"](this.#anchor));
				result = result["+"](this.size["*"](this.#anchor));
			}
		} finally {
			super.globalPosition = result;
		}
	}
}
//#endregion

const userInterface = new InterfaceItem(`User interface`);
userInterface.size = new Point2D(canvas.width, canvas.height);
display.addEventListener(`resize`, (event) => {
	userInterface.size = new Point2D(canvas.width, canvas.height);
});
progenitor.children.add(userInterface);

export { InterfaceItem, userInterface };