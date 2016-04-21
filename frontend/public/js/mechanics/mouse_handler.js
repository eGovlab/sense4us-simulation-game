'use strict';

var arithmetics = require('../canvas/arithmetics.js');

module.exports = function(canvas, loadedModel, inputs) {
    var active = false;

    var startPos = {x: 0, y: 0},
        endPos   = {x: 0, y: 0},
        lastPos  = {x: 0, y: 0};

    var deltaPos = {x: 0, y: 0};

    var stopContextMenu = function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    };

    canvas.addEventListener('contextmenu', stopContextMenu);
    var mouseDown = function(event) {
        var button = event.button;
        active     = true;

        startPos   = arithmetics.mouseToCanvas({x: event.pageX, y: event.pageY}, canvas);
        lastPos    = {x: startPos.x, y: startPos.y};

        loadedModel.didDrag = false;

        /**
         * @description Mouse pressed down on canvas.
         * @event mouseDown
         * @memberof module:model/statusEvents
         *
         * @param {element} canvas - Canvas element
         * @param {integer} button - Mouse button
         *
         * @param {object} startPos - Start position
         * @param {object} startPos.x - X
         * @param {object} startPos.y - Y

         * @param {object} lastPos - Previous position
         * @param {object} lastPos.x - X
         * @param {object} lastPos.y - Y
         *
         * @param {function} mouseMove - Callback for mouse movement
         * @param {function} mouseUp - Callback for mouse up
         * @example tool.addListener('mouseDown', function(canvas, button, startPos, lastPos, mouseMove, mouseUp) {
         *     console.log('Mouse button', button, 'pressed down.');
         * });
         */
        loadedModel.emit([canvas, button, startPos, lastPos, mouseMove, mouseUp], 'mouseDown');
    };

    canvas.addEventListener('mousedown', mouseDown);

    var mouseMove = function(event) {
        var button = event.button;

        active = true;

        endPos = arithmetics.mouseToCanvas({x: event.pageX, y: event.pageY}, canvas);

        deltaPos.x = lastPos.x - endPos.x;
        deltaPos.y = lastPos.y - endPos.y;

        /*startPos.x = endPos.x;
        startPos.y = endPos.y;*/

        loadedModel.didDrag = true;

        lastPos = {x: endPos.x, y: endPos.y};

        /**
         * @description While mouse button pressed down on and move on canvas.
         * @event mouseMove
         * @memberof module:model/statusEvents
         *
         * @param {element} canvas - Canvas element
         * @param {integer} button - Mouse button
         *
         * @param {object} startPos - Start position
         * @param {object} startPos.x - X
         * @param {object} startPos.y - Y

         * @param {object} lastPos - Previous position
         * @param {object} lastPos.x - X
         * @param {object} lastPos.y - Y
         
         * @param {object} endPos - Current position
         * @param {object} endPos.x - X
         * @param {object} endPos.y - Y

         * @param {object} delta - Delta
         * @param {object} delta.x - X
         * @param {object} delta.y - Y
         
         * @example tool.addListener('mouseMove', function(canvas, button, startPos, lastPos, endPos, delta) {
         *     console.log('Mouse moved', delta.x, delta.y, '.');
         * });
         */
        loadedModel.emit([canvas, button, startPos, lastPos, endPos, deltaPos], 'mouseMove');
    };

    var mouseUp = function(event) {
        var button = event.button;

        active = false;

        endPos = arithmetics.mouseToCanvas({x: event.pageX, y: event.pageY}, canvas);

        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('mouseup',   mouseUp);

        /**
         * @description Mouse released.
         * @event mouseUp
         * @memberof module:model/statusEvents
         *
         * @param {element} canvas - Canvas element
         * @param {integer} button - Mouse button
         
         * @param {object} endPos - Current position
         * @param {object} endPos.x - X
         * @param {object} endPos.y - Y
         
         * @example tool.addListener('mouseUp', function(canvas, button, endPos) {
         *     console.log('Mouse released at', endPos.x, endPos.y);
         * });
         */
        loadedModel.emit([canvas, button, endPos], 'mouseUp');
    };
};
