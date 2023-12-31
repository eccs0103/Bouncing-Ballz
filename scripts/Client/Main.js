"use strict";

import { Entity } from "./Components/Entity.js";
import { userInterface } from "./Components/InterfaceItem.js";
import { canvas, context, display, progenitor } from "./Components/Node.js";
import { Renderer, Walker } from "./Components/Utilities.js";
import { Color } from "./Modules/Colors.js";
import { Point2D } from "./Modules/Measures.js";
import { Ball, Pointer, Wall } from "./Structure.js";

try {
	const wallTop = new Wall();
	wallTop.addEventListener(`rebuild`, (event) => {
		wallTop.size = new Point2D(canvas.width, Math.min(canvas.width, canvas.height) / 16);
		wallTop.position = new Point2D(0, -canvas.height / 2 + wallTop.size.y / 2);
	});
	progenitor.children.add(wallTop);
	const wallLeft = new Wall();
	wallLeft.addEventListener(`rebuild`, (event) => {
		wallLeft.size = new Point2D(Math.min(canvas.width, canvas.height) / 16, canvas.height);
		wallLeft.position = new Point2D(-canvas.width / 2 + wallLeft.size.x / 2, 0);
	});
	progenitor.children.add(wallLeft);
	{ }
	const wallBottom = new Wall();
	wallBottom.addEventListener(`rebuild`, (event) => {
		wallBottom.size = new Point2D(canvas.width, Math.min(canvas.width, canvas.height) / 16);
		wallBottom.position = new Point2D(0, canvas.height / 2 - wallBottom.size.y / 2);
	});
	progenitor.children.add(wallBottom);
	{ }
	const wallRight = new Wall();
	wallRight.addEventListener(`rebuild`, (event) => {
		wallRight.size = new Point2D(Math.min(canvas.width, canvas.height) / 16, canvas.height);
		wallRight.position = new Point2D(canvas.width / 2 - wallRight.size.x / 2, 0);
	});
	progenitor.children.add(wallRight);
	{ }

	canvas.addEventListener(`mousedown`, (event) => {
		if (event.button !== 0) return;
		const pointer = new Pointer(new Point2D(event.clientX - canvas.width / 2, event.clientY - canvas.height / 2));
		progenitor.children.add(pointer);
		const pathController = new AbortController();
		window.addEventListener(`mousemove`, (event2) => {
			pointer.end = new Point2D(event2.clientX - canvas.width / 2, event2.clientY - canvas.height / 2);
		}, { signal: pathController.signal });
		window.addEventListener(`mouseup`, (event2) => {
			if (event2.button !== 0) return;
			progenitor.children.remove(pointer);
			const end = new Point2D(event2.clientX - canvas.width / 2, event2.clientY - canvas.height / 2);
			const ball = new Ball();
			ball.addEventListener(`rebuild`, (event) => {
				ball.size = Point2D.repeat(Math.min(canvas.width, canvas.height) / 16);
				ball.position = end;
			});
			progenitor.children.add(ball);
			const push = end["-"](pointer.begin);
			let frames = 0;
			const pushController = new AbortController();
			display.addEventListener(`update`, (event3) => {
				if (frames < 3) {
					frames++;
				} else {
					ball.forces.delete(push);
					pushController.abort();
				}
			}, { signal: pushController.signal });
			ball.forces.add(push);
			pathController.abort();
		}, { once: true });
	});
} catch (error) {
	await window.prevent(document.analysis(error));
}
