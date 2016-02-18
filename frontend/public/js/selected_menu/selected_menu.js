'use strict';

var Immutable   = null,
    menuBuilder = require('./../menu_builder'),
    settings    = require('./../settings'),
    buttons     = require('./buttons.js');

function generateAvatarDiv(avatar, selected, name) {
    var avatarDiv = menuBuilder.div();
    var img = menuBuilder.img();

    avatarDiv.className = 'avatarPreview';

    if (selected === avatar.src) {
        avatarDiv.className += ' selected';
    }

    img.src = avatar.src;
    avatarDiv.value = avatar.src;
    avatarDiv.name = avatar.header || name;

    avatarDiv.appendChild(img);

    return avatarDiv;
}

function createAvatarButtons(header, value, callback, images) {
    var avatarsDiv   = menuBuilder.div();
    
    avatarsDiv.className = 'avatars';
    
    images.forEach(function(avatar) {
        var avatarDiv = generateAvatarDiv(avatar, value, header);

        menuBuilder.addValueCallback(avatarDiv, callback, 'click');

        avatarsDiv.appendChild(avatarDiv);
    });

    return avatarsDiv;
}

function createAvatarSelector(header, value, callback) {
    var containerDiv = menuBuilder.div();

    containerDiv.appendChild(menuBuilder.label(header));

    settings.avatars.forEach(function(avatarGroup) {
        var avatarsDiv = createAvatarButtons(header, value, 
            function(key, value) {
                var oldAvatar = avatarsDiv.querySelectorAll('.selected')[0];
                if (oldAvatar) {
                    oldAvatar.className = 'avatarPreview';
                }
                
                var newAvatar = avatarsDiv.querySelectorAll('[src="' + value + '"]')[0].parentElement;
                newAvatar.className = 'avatarPreview selected';
                callback(key, value);
            },
            avatarGroup.images
        );
    
        containerDiv.appendChild(menuBuilder.label(avatarGroup.header));
        containerDiv.appendChild(avatarsDiv);
    });

    return containerDiv;
}

function Data(loadedModel, filter, data) {
    this.data = data;
    this.container = menuBuilder.div('menu');
    this.filter = filter;

    console.log("Setting loadedmodel:", loadedModel);
    this.loadedModel = loadedModel;

    this.timetable;
    this.timetableDiv;
    this.rowContainer;
    this.rows = {};

    this.dropdowns  = {};
    this.inputs     = {};
}

Data.prototype = {
    refresh: function() {
        this.inputs.forEach(function(input, key) {
            input.value = this.data[key];
        });
    },

    updateFilter: function(filter) {
        this.filter = filter;
        this.createMenu();
    },

    addTimeRow: function(timeStep, timeValue) {
        if(!this.timetable) {
            this.timetable = {};
        }

        var containerDiv = this.timetableDiv;
        if(!containerDiv) {
            var containerDiv = menuBuilder.div();
                containerDiv.className = "time-table";

            containerDiv.appendChild(menuBuilder.label(key));

            this.timetableDiv = containerDiv;
        }

        var rowContainer = this.rowContainer;
        if(!rowContainer) {
            rowContainer      = menuBuilder.div("row-container");
            this.rowContainer = rowContainer;

            containerDiv.appendChild(rowContainer);
        }

        var that = this;

        var rowDiv = menuBuilder.div("time-row");
        this.rows[timeStep] = rowDiv;

        var timeStepLabel       = menuBuilder.span("T");
        timeStepLabel.className = "label";

        var timeStepInput = menuBuilder.input("time-step", timeStep, function(input, newStep) {
            var storingValue = that.timetable[timeStep];
            if(that.timetable[newStep]) {
                return timeStepInput.value = timeStep;
            }

            console.log(that.rows);

            that.timetable[newStep] = that.timetable[timeStep];
            delete that.timetable[timeStep];
            that.rows[newStep] = that.rows[timeStep];
            delete that.rows[timeStep];

            console.log(that.rows);

            timeStepInput.value = newStep;

            that.refreshTimeTable();

            that.loadedModel.refresh = true;
            that.loadedModel.propagate();
        });

        timeStepInput.className = "time-step";

        var timeValueLabel = menuBuilder.span("T");
        timeValueLabel.className = "label";

        var timeValueInput = menuBuilder.input("time-value", timeValue, function(input, newValue) {
            that.timetable[timeStep] = newValue;
            timeValueInput.value     = newValue;

            that.loadedModel.refresh = true;
            that.loadedModel.propagate();
        });

        timeValueInput.className = "time-value";

        rowDiv.appendChild(timeStepLabel);
        rowDiv.appendChild(timeStepInput);
        rowDiv.appendChild(timeValueLabel);
        rowDiv.appendChild(timeValueInput);

        rowDiv.stepInput  = timeStepInput;
        rowDiv.valueInput = timeValueInput;

        rowContainer.appendChild(rowDiv);
    },

    refreshTimeTable: function() {
        if(!this.rowContainer) {
            return;
        }

        while(this.rowContainer.firstChild) {
            this.rowContainer.removeChild(this.rowContainer.firstChild);
        }

        this.rows.forEach(function(row, key) {
            row.stepInput.deleteEvent();
            row.valueInput.deleteEvent();
        });

        this.rows = {};

        this.timetable.forEach(function(timeValue, timeStep) {
            this.addTimeRow(timeStep, timeValue);
        }, this);
    },

    generateTimeTable: function(key, value) {
        var containerDiv = this.timetableDiv;
        if(!containerDiv) {
            var containerDiv = menuBuilder.div();
                containerDiv.className = "time-table";

            containerDiv.appendChild(menuBuilder.label(key));

            this.timetableDiv = containerDiv;
        } else {
            while(this.timetableDiv.firstChild) {
                this.timetableDiv.removeChild(this.timetableDiv.firstChild);
            }

            this.rows.forEach(function(row, key) {
                row.stepInput.deleteEvent();
                row.valueInput.deleteEvent();
            });

            this.rows = {};

            this.rowContainer = null;
        }

        this.timetable = value;
        this.timetable.forEach(function(timeValue, timeStep) {
            this.addTimeRow(timeStep, timeValue);
        }, this);

        var that = this;
        containerDiv.appendChild(menuBuilder.button('Add row', function addTimeTableRow() {
            if (that.timetable === undefined || that.timetable === null) {
                that.addTimeRow(0, 0);
            } else {
                var highestIndex = 0;
                that.timetable.forEach(function(value, key) {
                    var x;
                    if(!isNaN(x = parseInt(key)) && x > highestIndex) {
                        highestIndex = x;
                    }
                });

                var index = highestIndex + 1;
                var value = 0;
                that.timetable[index] = value;
                that.addTimeRow(index, value);

                that.loadedModel.refresh = true;
                that.loadedModel.propagate();
            }
        }));

        containerDiv.appendChild(menuBuilder.button('Remove row', function removeTimeTableRow() {
            if (that.timetable === undefined || that.timetable === null || that.timetable.size() === 0) {
                return;
            } else {
                that.data[key] = that.timetable.slice(0, -1);
                that.timetable = that.data[key];
            }

            var element = that.rows.last();
            that.rowContainer.removeChild(element);

            delete that.rows[that.rows.lastKey()];

            that.loadedModel.refresh = true;
            that.loadedModel.propagate();
        }));

        return containerDiv;
    },

    generateDropdown: function(key, options, value) {
        var that = this;
        var containerSelect = menuBuilder.select(key, function(evt) {
            that.data[key] = this.value;

            that.loadedModel.refresh = true;
            that.loadedModel.propagate();
        });

        options.forEach(function(option) {
            var optionElement = menuBuilder.option(option, option);
            if(option === value) {
                optionElement.selected = 'selected';
            }
            
            containerSelect.appendChild(optionElement);
        });

        return containerSelect;
    },

    generateInput: function(key, value) {
        var container = menuBuilder.div();

        var that = this;
        container.appendChild(menuBuilder.label(key));

        this.inputs[key] = menuBuilder.input(
            key,
            value,
            function(thatKey, newValue) {
                that.data[thatKey] = newValue;

                that.loadedModel.refresh = true;
                that.loadedModel.resetUI = true;
                that.loadedModel.propagate();
            }
        );

        container.appendChild(this.inputs[key]);

        return container;
    },

    createMenu: function() {
        var element = this.container;
        while(element.firstChild) {
            element.removeChild(element.firstChild);
        }

        this.data.forEach(function(value, key) {
            if(this.filter.indexOf(key) === -1) {
                return;
            }

            if (key === 'timeTable') {
                element.appendChild(this.generateTimeTable(key, value));
            } else if(this.data.coefficient !== undefined && key === 'type') {
                element.appendChild(this.generateDropdown(key, ['fullchannel', 'halfchannel'], value));
            } else {
                element.appendChild(this.generateInput(key, value));
            }
        }, this);

        return element;
    }
};

function SelectedMenu(loadedModel) {
    this.dataObjects = [];
    this.data        = [];
    this.container   = menuBuilder.div();
    this.inputs      = {};

    this.loadedModel = loadedModel;

    this.buttons = this.generateButtons(buttons);

    this.container.appendChild(this.buttons);
}

SelectedMenu.prototype = {
    show: function() {
        this.container.style.display = "block";
    },

    hide: function() {
        this.container.style.display = "none";
    },

    refresh: function() {
        this.data.forEach(function(obj) {
            obj.refresh();
        });
    },

    updateFilter: function(filter) {
        this.data.forEach(function(obj) {
            obj.updateFilter(filter);
        });
    },

    loopData: function(callback, thisArg) {
        this.data.forEach(function(obj, key) {
            callback.call(this, obj, key);
        }, thisArg);
    },

    addData: function(filter, data) {
        if(this.dataObjects.indexOf(data) !== -1) {
            console.log("Exists");
            console.log(this.dataObjects, data);
            return;
        }

        this.dataObjects.push(data);
        this.data.push(new Data(this.loadedModel, filter, data));

        this.container.appendChild(this.data[this.data.length - 1].createMenu());
    },

    removeData: function(data) {
        var i = 0;
        this.dataObjects = this.dataObjects.filter(function(keptData, index) {
            if(keptData === data) {
                i = index;
                return false;
            }

            return true;
        });

        var element = this.data[i].container;
        this.container.removeChild(element);

        this.data = this.data.slice(0, i).concat(this.data.slice(i+1));

        if(this.data.length === 0 && this.dataObjects.length === 0) {
            this.container.parentElement.removeChild(this.container);
        }
    },

    setDataFilter: function(dataFilter) {
        this.dataFilter = dataFilter;
    },

    generateButtons: function(list) {
        var containerDiv = menuBuilder.div();
        containerDiv.className = 'menu';

        list.forEach(function(button) {
            if(map.maxIterations !== undefined && button.ignoreModelSettings === true) {
                return;
            }

            if(button.replacingObj) {
                containerDiv.appendChild(menuBuilder.button(button.header, function() {
                    updateModelCallback(null, null, button.callback(map));
                }));
            } else {
                /* No buttons are not replacing obj right now. There is one button. */
            }
        });

        return containerDiv;
    }
};

var namespace = {
    SelectedMenu:         SelectedMenu,
    createAvatarSelector: createAvatarSelector,
    createAvatarButtons:  createAvatarButtons
};

module.exports = namespace;
