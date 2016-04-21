'use strict';

var objectHelper = require('./object-helper.js');

var lineToRect = function(line) {
	if (line.x1 > line.x2) {
		line = objectHelper.merge.call(line, {x1: line.x2, x2: line.x1});
	}

	if (line.y1 > line.y2) {
		line = objectHelper.merge.call(line, {y1: line.y2, y2: line.y1});
	}

	return {
		x: line.x1 - line.width / 2,
		y: line.y1 - line.width / 2,
		width: line.x2 - line.x1 + line.width / 2,
		height: line.y2 - line.y1 + line.width / 2
	};
};

var collisions = {
	pointCircle: function(point, circle) {
		var distance = Math.sqrt(Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2));
		return distance <= circle.radius;
	},
	pointRect: function(point, rect) {
		return	point.x >= rect.x && point.x <= rect.x + rect.width &&
				point.y >= rect.y && point.y <= rect.y + rect.height;
	},
	circleCircle: function(circleA, circleB) {
		var distance = Math.sqrt(Math.pow(circleA.x - circleB.x, 2) + Math.pow(circleA.y - circleB.y, 2));
		return distance <= circleA.radius + circleB.radius;
	},
	pointLine: function(point, line) {
		if (!collisions.pointRect(point, lineToRect(line))) {
			return false;
		}

		var line2 = {x1: point.x, y1: point.y, x2: line.x2, y2: line.y2};

		var line1Angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
		var line2Angle = Math.atan2(line2.y2 - line2.y1, line2.x2 - line2.x1);

		var angleBetweenLines = line1Angle - line2Angle;

		var line2length = Math.sqrt(Math.pow(line2.x1 - line2.x2, 2) + Math.pow(line2.y1 - line2.y2, 2));

		var distance = line2length * Math.sin(angleBetweenLines);

		var result = distance <= line.width / 2 && distance >= -line.width / 2;

		return result;
	},
	hitTest: function(obj1, obj2) {
		var data = {};
		data.circles = [];
		data.lines = [];
		data.points = [];

		if (obj1.radius) {
			data.circles.push(obj1);
		} else if (obj1.x1 && obj1.x2 && obj1.y1 && obj1.y2) {
			data.lines.push(obj1);
		} else {
			data.points.push(obj1);
		}

		if (obj2.radius) {
			data.circles.push(obj2);
		} else if (obj2.x1 && obj2.x2 && obj2.y1 && obj2.y2) {
			data.lines.push(obj2);
		} else {
			data.points.push(obj2);
		}

		if (data.circles.length === 2) {
			return collisions.circleCircle(data.circles[0], data.circles[1]);
		} else if (data.points.length === 1 && data.lines.length === 1) {
			return collisions.pointLine(data.points[0], data.lines[0]);
		} else if (data.circles.length === 1 && data.points.length === 1) {
			return collisions.pointCircle(data.points[0], data.circles[0]);
		}
		
		console.error('UNDEFINED');
		console.error(obj1);
	}
};

module.exports = collisions;