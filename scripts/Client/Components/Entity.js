"use strict";

import { Group, ModificationEvent, Node } from "./Node.js";
import { Point2D } from "../Modules/Measures.js";

//#region Entity
class Entity extends Node {
	/**
	 * @param {String} name 
	 */
	constructor(name = ``) {
		super(name);
		this.addEventListener(`tryadoptchild`, (event) => {
			if (event instanceof ModificationEvent) {
				if (!(event.node instanceof Entity)) {
					event.preventDefault();
					throw new TypeError(`Entity's children also must be inherited from Entity`);
				}
			}
		});
	}
	/** @type {Group<Entity>} */ #children = new Group(this);
	/** @readonly */ get children() {
		return this.#children;
	}
	/** @type {Point2D} */ #position = Point2D.ZERO;
	get position() {
		return Object.freeze(this.#position);
	}
	set position(value) {
		let result = value.clone();
		this.#position = result;
	}
	get globalPosition() {
		let result = this.#position;
		try {
			if (this.parent instanceof Entity) {
				result = result["+"](this.parent.globalPosition);
			}
		} finally {
			return Object.freeze(result);
		}
	}
	set globalPosition(value) {
		let result = value.clone();
		try {
			if (this.parent instanceof Entity) {
				value = result["-"](this.parent.globalPosition);
			}
		} finally {
			this.#position = result;
		}
	}
	/** @type {Point2D} */ #size = Point2D.ZERO;
	get size() {
		return Object.freeze(this.#size);
	}
	set size(value) {
		let result = value.clone();
		this.#size = result;
	}
}
//#endregion

export { Entity };