'use strict';

var Immutable       = null,
    network         = require('./../network'),
    breakout        = require('./../breakout.js'),
    objectHelper    = require('./../object-helper.js');

var simulate = [
    {
        header: 'Simulate',
        type:   'BUTTON',
        ajax:   true,
        callback: function(loadedModel) {
            var data = {
                timestep: loadedModel.loadedScenario.maxIterations,
                nodes:    breakout.nodes(loadedModel),
                links:    breakout.links(loadedModel),
                scenario: loadedModel.loadedScenario.toJson()
            };

            objectHelper.forEach.call(
                loadedModel.nodeData,
                function(node) {
                    node.simulateChange = [];
                }
            );

            network(loadedModel.CONFIG.url, '/models/' + loadedModel.CONFIG.userFilter + '/' + loadedModel.CONFIG.projectFilter + '/simulate', data, function(response, err) {
                if(err) {
                    console.error(err);
                    console.error(response);
                    loadedModel.emit(response.response.message, 'notification');
                    return;
                }

                console.log(response.response);

                var timeSteps = response.response;
                var nodeData  = loadedModel.nodeData;
                timeSteps.forEach(function(timeStep) {
                    timeStep.forEach(function(node) {
                        var currentNode = nodeData[node.id];
                        currentNode.simulateChange.push(node.relativeChange);
                    });
                });

                //loadedModel.refresh  = true;
                loadedModel.settings = loadedModel.settings;
                //loadedModel.propagate();

                loadedModel.emit(null, 'settings', 'refresh');
            });
        }
    },

    {
        header: 'Linegraph',
        type:   'BUTTON',
        ajax:   true,
        callback: function(loadedModel) {
            var settings       = loadedModel.settings;
            settings.linegraph = !settings.linegraph

            /*loadedModel.refresh = true;
            loadedModel.propagate();*/

            loadedModel.emit('refresh');
        }
    },

    {
        header: 'Show simulate changes',
        type:   'CHECKBOX',

        onCheck: function(loadedModel) {
            loadedModel.static.showSimulate = true;
            loadedModel.emit('refresh');
        },

        onUncheck: function(loadedModel) {
            loadedModel.static.showSimulate = false;
            loadedModel.emit('refresh');
        }
    },

    {
        header: 'Time step T',
        type:   'DROPDOWN',
        values: [
            'Week',
            'Month',
            'Year'
        ],

        defaultValue: function(model, values) {
            return model.loadedScenario.measurement;
        },

        onChange: function(model, value) {
            model.loadedScenario.measurement = value;
        }
    },

    {
        header: 'Time step N',
        type:   'SLIDER',
        id:     'timestep',

        defaultValue: function(model) {
            return model.loadedScenario.timeStepN;
        },

        range: function(model) {
            return [0, model.loadedScenario.maxIterations];
        },

        onSlide: function(model, value) {
            model.loadedScenario.timeStepN = parseInt(value);

            model.emit('refresh');
        },

        onChange: function(model, value) {
            model.loadedScenario.timeStepN = parseInt(value);
        }
    },

    {
        header: 'Max iterations',
        type:   'INPUT',
        id:     'iterations',

        defaultValue: function(model) {
            return model.loadedScenario.maxIterations;
        },

        onChange: function(model, value) {
            model.loadedScenario.maxIterations = parseInt(value);
        }
    }
];

module.exports = simulate;
