"use strict";

import {
	Color
} from "./modules/colors.js";
import {
	Display
} from "./modules/executors.js";
import {
	Point2D,
	Segment
} from "./modules/measures.js";
import {
	Progenitor,
	Corporeal,
	CollisionDetail,
	EntityTypes,
	min,
	PI,
	canvas,
	display,
	context,
} from "./structure.js";

void async function () {
	try {
		//#region Definition
		const ratio = 0.05;
		let size = min(canvas.width, canvas.height) * ratio;
		const flexibility = 0.8;
		const mousePosition = new Point2D(0, 0);
		window.addEventListener(`mousemove`, (event) => {
			mousePosition.x = event.clientX;
			mousePosition.y = event.clientY;
		});

		const progenitor = new Progenitor();
		{
			const wallRight = new Corporeal(EntityTypes.wall);
			wallRight.size = new Point2D(size, canvas.height);
			wallRight.position = new Point2D(canvas.width / 2 - wallRight.size.x / 2, 0);
			wallRight.color = Color.WHITE;
			wallRight.mass = 10;
			progenitor.add(wallRight);
			{ }
			const wallBottom = new Corporeal(EntityTypes.wall);
			wallBottom.size = new Point2D(canvas.width, size);
			wallBottom.position = new Point2D(0, -canvas.height / 2 + wallBottom.size.y / 2);
			wallBottom.color = Color.WHITE;
			wallBottom.mass = 10;
			progenitor.add(wallBottom);
			{ }
			const wallLeft = new Corporeal(EntityTypes.wall);
			wallLeft.size = new Point2D(size, canvas.height);
			wallLeft.position = new Point2D(-canvas.width / 2 + wallLeft.size.x / 2, 0);
			wallLeft.color = Color.WHITE;
			wallLeft.mass = 10;
			progenitor.add(wallLeft);
			{ }
		}

		const gravity = new Point2D(0, -9.8);
		//#endregion
		//#region 
		display.addEventListener(`resize`, (event) => {
			const transform = context.getTransform();
			transform.d = -1;
			transform.e = canvas.width / 2;
			transform.f = canvas.height / 2;
			context.setTransform(transform);
		});
		display.addEventListener(`update`, (event) => {
			context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
		});
		//
		context.strokeStyle = Color.BLUE.toString();
		context.lineWidth = size / 2;
		canvas.addEventListener(`pointerdown`, (event) => {
			const begin = new Point2D(event.clientX - canvas.width / 2, -(event.clientY - canvas.height / 2));
			const pathController = new AbortController();
			display.addEventListener(`update`, (event2) => {
				const current = new Point2D(mousePosition.x - canvas.width / 2, -(mousePosition.y - canvas.height / 2));
				context.beginPath();
				context.moveTo(begin.x, begin.y);
				context.lineTo(current.x, current.y);
				context.closePath();
				context.stroke();
			}, { signal: pathController.signal });
			canvas.addEventListener(`pointerup`, (event) => {
				const end = new Point2D(event.clientX - canvas.width / 2, -(event.clientY - canvas.height / 2));
				//
				const ball = new Corporeal(EntityTypes.ball);
				size = min(canvas.width, canvas.height) * ratio;
				ball.size = new Point2D(size, size);
				ball.position = new Point2D(event.clientX - canvas.width / 2, -(event.clientY - canvas.height / 2));
				ball.color = Color.viaHSL(0, 100, 50);
				ball.forces.add(gravity);
				const push = new Segment(begin, end).toBasePoint();
				let frames = 0;
				const pushController = new AbortController();
				display.addEventListener(`update`, (event) => {
					if (frames < 3) {
						frames++;
					} else {
						ball.forces.delete(push);
						pushController.abort();
					}
				}, { signal: pushController.signal });
				ball.forces.add(push);
				pathController.abort();
				ball.addEventListener(`collisionbegin`, (event) => {
					if (event instanceof CustomEvent && event.detail instanceof CollisionDetail) {
						const corporeal = event.detail.other;

						if (corporeal.type == EntityTypes.wall || corporeal.type == EntityTypes.ball) {
							const index = corporeal.getSectorIndex(ball);
							const force = (() => {
								switch (index) {
									case 0:
									case 2: {
										ball.velocity.y *= -flexibility;
										return new Point2D(0, -ball.equivalent.y);
									}
									case 1:
									case 3: {
										ball.velocity.x *= -flexibility;
										return new Point2D(-ball.equivalent.x, 0);
									}
									default: throw new RangeError(`Sector index ${index} is out of range [0 - 3]`);
								}
							})();
							ball.forces.add(force);
							const controller = new AbortController();
							ball.addEventListener(`collisionend`, (event) => {
								if (event instanceof CustomEvent && event.detail instanceof CollisionDetail && event.detail.other == corporeal) {
									ball.forces.delete(force);
									controller.abort();
								}
							}, { signal: controller.signal });
						}
					}
				});
				progenitor.add(ball);
			}, { once: true });
		});
		//
		display.addEventListener(`update`, (event) => {
			progenitor.dispatchEvent(new Event(`update`, { bubbles: true }));
			for (const child of progenitor.children) {
				if (child instanceof Corporeal) {
					context.fillStyle = child.color.toString();
					context.beginPath();
					switch (child.type) {
						case EntityTypes.ball: {
							const ball = child;
							context.arc(ball.position.x, ball.position.y, ball.size.x / 2, 0, 2 * PI);
						} break;
						case EntityTypes.wall: {
							const wall = child;
							context.rect(wall.position.x - wall.size.x / 2, wall.position.y - wall.size.y / 2, wall.size.x, wall.size.y);
						} break;
						default: throw new TypeError(`Unregistered entity type`);
					}
					context.closePath();
					context.fill();
				}
			}
		});
		//
		display.dispatchEvent(new UIEvent(`resize`));
		display.launched = true;
		//#endregion
	} catch (error) {
		document.prevent(document.analysis(error));
	}
}();