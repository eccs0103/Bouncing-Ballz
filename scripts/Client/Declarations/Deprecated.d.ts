/**
 * @param {Entity} other 
 * @returns [0 - 3]
 */
function getSectorIndex(other) {
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