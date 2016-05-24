'use strict';

var Input  = require('./input.js'),
    Colors = require('./colors.js'),
    Button = require('./button.js');

function Checkbox() {
    Button.call(this);

    this.checked = false;

    this.uncheck;
    this.check;

    var that = this;
    this.click(function() {
        if(that.checked) {
            that.uncheck();
        } else {
            that.check();
        }

        that.checked = !that.checked;
    });
}

Checkbox.prototype = {
    setBackground: function(background) {
        this.nonHighlightBackground = background;
        Input.prototype.setBackground.call(this, background);
    },

    onUncheck: function(callback) {
        var that = this;
        that.uncheck = function() {
            Input.prototype.setBackground.call(that, that.nonHighlightBackground);
            callback();
        };
    },

    onCheck: function(callback) {
        var that = this;
        that.check = function() {
            Input.prototype.setBackground.call(that, Colors.buttonCheckedBackground);
            callback();
        };
    },

    removeEvents: function() {
        Button.prototype.removeEvents.call(this);
    },
    __proto__: Button.prototype
};

module.exports = Checkbox;