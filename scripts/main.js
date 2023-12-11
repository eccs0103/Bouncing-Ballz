"use strict";

import {
	Color
} from "./modules/colors.js";
import {
	Point2D,
	Segment
} from "./modules/measures.js";
import {
	Corporeal,
	CollisionDetail,
	PI,
	canvas,
	display,
	context,
	toSizeFactor,
	hypot,
	progenitor,
	Motion,
} from "./structure.js";

void async function () {
	try {
		//#region Wall
		class Wall extends Corporeal {
			constructor() {
				super();
				this.color = colorBackground.invert();
				this.mass = 10;
				progenitor.add(this);

				this.addEventListener(`update`, (event) => {
					context.fillStyle = this.color.toString();
					context.beginPath();
					context.rect((this.position.x - this.size.x / 2), (this.position.y - this.size.y / 2), this.size.x, this.size.y);
					context.closePath();
					context.fill();
				});
			}
		}
		//#endregion
		//#region Ball
		class Ball extends Corporeal {
			constructor() {
				super();
				this.color = Color.viaHSL(0, 100, 50);
				this.forces.add(gravity);
				progenitor.add(this);

				this.addEventListener(`update`, (event) => {
					this.color = this.color.rotate(hypot(this.velocity.x, this.velocity.y) / 360);
				});

				this.addEventListener(`update`, (event) => {
					context.fillStyle = this.color.toString();
					context.beginPath();
					context.arc(this.position.x, this.position.y, this.size.x / 2, 0, 2 * PI);
					context.closePath();
					context.fill();
				});

				this.addEventListener(`collisionbegin`, (event) => {
					if (event instanceof CustomEvent && event.detail instanceof CollisionDetail) {
						const { other } = event.detail;

						if (other instanceof Corporeal) {
							const V = hypot(this.velocity.x, this.velocity.y);

							if (other instanceof Ball) {
								this.color = this.color.rotate(V / 60);

								const motionImpulse = new Motion(display.FPS / 8);
								motionImpulse.addEventListener(`update`, (event2) => {
									context.fillStyle = colorBackground.invert(0.75).toString();
									context.beginPath();
									context.arc(this.position.x, this.position.y, this.size.x * (V / 360) * (motionImpulse.frame / motionImpulse.length), 0, 2 * PI);
									context.closePath();
									context.fill();
								});
							}

							const index = other.getSectorIndex(this);
							const force = (() => {
								switch (index) {
									case 0:
									case 2: {
										this.velocity.y *= -flexibility;
										return new Point2D(0, -this.equivalent.y);
									}
									case 1:
									case 3: {
										this.velocity.x *= -flexibility;
										return new Point2D(-this.equivalent.x, 0);
									}
									default: throw new RangeError(`Sector index ${index} is out of range [0 - 3]`);
								}
							})();
							this.forces.add(force);
							const controller = new AbortController();
							this.addEventListener(`collisionend`, (event2) => {
								if (event2 instanceof CustomEvent && event2.detail instanceof CollisionDetail && event2.detail.other == other) {
									this.forces.delete(force);
									controller.abort();
								}
							}, { signal: controller.signal });
						}

					}
				});
			}
		}
		//#endregion

		//#region Initializing
		const colorBackground = Color.parse(getComputedStyle(document.documentElement).getPropertyValue(`--color-background`));
		const flexibility = 0.8;

		const size = toSizeFactor;
		const mousePosition = new Point2D(0, 0);
		window.addEventListener(`mousemove`, (event) => {
			mousePosition.x = event.clientX;
			mousePosition.y = event.clientY;
		});

		{
			const wallRight = new Wall();
			wallRight.size = new Point2D(size, canvas.height);
			wallRight.position = new Point2D(canvas.width / 2 - wallRight.size.x / 2, 0);
			{ }
			const wallBottom = new Wall();
			wallBottom.size = new Point2D(canvas.width, size);
			wallBottom.position = new Point2D(0, -canvas.height / 2 + wallBottom.size.y / 2);
			{ }
			const wallLeft = new Wall();
			wallLeft.size = new Point2D(size, canvas.height);
			wallLeft.position = new Point2D(-canvas.width / 2 + wallLeft.size.x / 2, 0);
			{ }
		}

		const gravity = new Point2D(0, -9.8);
		//#endregion
		//#region Rendering
		display.addEventListener(`resize`, (event) => {
			const transform = context.getTransform();
			transform.d = -1;
			transform.e = canvas.width / 2;
			transform.f = canvas.height / 2;
			context.setTransform(transform);
		});
		display.addEventListener(`update`, (event) => {
			context.fillStyle = colorBackground.pass(0.25).toString(true);
			context.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
		});
		//
		context.lineWidth = size / 4;
		context.strokeStyle = Color.BLUE.toString();
		canvas.addEventListener(`mousedown`, (event) => {
			if (event.button === 0) {
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
				canvas.addEventListener(`mouseup`, (event2) => {
					if (event2.button == 0) {
						const end = new Point2D(event2.clientX - canvas.width / 2, -(event2.clientY - canvas.height / 2));
						//
						const ball = new Ball();
						ball.size = new Point2D(size, size);
						ball.position = new Point2D(event2.clientX - canvas.width / 2, -(event2.clientY - canvas.height / 2));
						const push = new Segment(begin, end).toBasePoint();
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
					}
				}, { once: true });
			}
		});
		//
		// display.addEventListener(`update`, (event) => {
		// 	progenitor.dispatchEvent(new Event(`update`, { bubbles: true }));
		// });
		//
		display.dispatchEvent(new UIEvent(`resize`));
		display.launched = true;
		//#endregion
	} catch (error) {
		document.prevent(document.analysis(error));
	}
}();