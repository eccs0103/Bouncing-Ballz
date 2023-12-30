"use strict";

import { Color } from "../Modules/Colors.js";
import { Point2D } from "../Modules/Measures.js";
import { Entity } from "./Entity.js";
import { Node, context, progenitor } from "./Node.js";

//#region Animator
class Animator extends EventTarget {
	/**
	 * @param {Number} duration 
	 */
	constructor(duration) {
		super();
		this.#duration = duration;
		const frameController = new AbortController();
		this.#frame = 0;
		progenitor.addEventListener(`update`, (event) => {
			if (this.#frame < this.#duration) {
				this.dispatchEvent(new Event(`update`));
				this.#frame++;
			} else {
				frameController.abort();
			}
		}, { signal: frameController.signal });
	}
	/** @type {Number} */ #duration;
	/** @readonly */ get duration() {
		return this.#duration;
	}
	/** @type {Number} */ #frame;
	/** @readonly */ get frame() {
		return this.#frame;
	}
}
//#endregion
//#region Walker
class Walker {
	/**
	 * @param {Node} node
	 * @param {(node: Node) => any} action 
	 */
	static downTraverse(node, action) {
		action(node);
		for (const child of node.children) {
			Walker.downTraverse(child, action);
		}
	}
	/**
	 * @param {Node} node
	 * @param {(node: Node) => any} action 
	 */
	static upTraverse(node, action) {
		action(node);
		try {
			Walker.upTraverse(node.parent, action);
		} catch (error) { }
	}
	/**
	 * @template T
	 * @param {Node} root
	 * @param {(previous: T, current: Node) => T} action 
	 * @param {T} initial 
	 * @returns {T}
	 */
	static downReduce(root, action, initial) {
		let result = initial;
		Walker.downTraverse(root, (node) => {
			result = action(result, node);
		});
		return result;
	}
	/**
	 * @template T
	 * @param {Node} root
	 * @param {(previous: T, current: Node) => T} action 
	 * @param {T} initial 
	 * @returns {T}
	 */
	static upReduce(root, action, initial) {
		let result = initial;
		Walker.upTraverse(root, (node) => {
			result = action(result, node);
		});
		return result;
	}
	/**
	 * @param {Node} root 
	 */
	constructor(root) {
		this.#root = root;
	}
	/** @type {Node} */ #root;
	/**
	 * @param {(node: Node) => any} action 
	 */
	downTraverse(action) {
		Walker.downTraverse(this.#root, action);
	}
	/**
	 * @param {(node: Node) => any} action 
	 */
	upTraverse(action) {
		Walker.upTraverse(this.#root, action);
	}
	/**
	 * @template T
	 * @param {(previous: T, current: Node) => T} action 
	 * @param {T} initial 
	 * @returns {T}
	 */
	downReduce(action, initial) {
		return Walker.downReduce(this.#root, action, initial);
	}
	/**
	 * @template T
	 * @param {(previous: T, current: Node) => T} action 
	 * @param {T} initial 
	 * @returns {T}
	 */
	upReduce(action, initial) {
		return Walker.upReduce(this.#root, action, initial);
	}
}
//#endregion
//#region Renderer
class Renderer {
	static colorHighlight = Color.viaHSL(308, 100, 50);
	/**
	 * @param {Entity} entity 
	 */
	static drawArea(entity) {
		const fillStyle = context.fillStyle;
		const strokeStyle = context.strokeStyle;
		context.fillStyle = Renderer.colorHighlight.pass(0.1).toString(true);
		context.strokeStyle = Renderer.colorHighlight.toString(true);
		const begin = entity.globalPosition["-"](entity.size["/"](Point2D.CONSTANT_TWO));
		context.fillRect(begin.x, begin.y, entity.size.x, entity.size.y);
		context.strokeRect(begin.x, begin.y, entity.size.x, entity.size.y);
		context.strokeStyle = fillStyle;
		context.strokeStyle = strokeStyle;
	}
	/**
	 * @param {Entity} entity 
	 */
	static eraseArea(entity) {
		const begin = entity.globalPosition["-"](entity.size["/"](Point2D.CONSTANT_TWO));
		context.clearRect(begin.x, begin.y, entity.size.x, entity.size.y);
	}
}
//#endregion

export { Animator, Walker, Renderer };