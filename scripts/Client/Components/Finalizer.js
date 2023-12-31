"use strict";

import { userInterface } from "./InterfaceItem.js";
import { display, progenitor } from "./Node.js";
import { Renderer } from "./Utilities.js";

progenitor.addEventListener(`update`, (event) => {
	Renderer.eraseArea(userInterface);
	progenitor.dispatchEvent(new Event(`render`, { bubbles: true }));
});
display.launched = true;

export { };