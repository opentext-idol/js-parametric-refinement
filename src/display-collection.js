/*
 * Copyright 2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

/**
 * @module display-collection
 */
define([
    'backbone',
    'underscore',
    './prettify-field-name'
], function(Backbone, _, prettifyFieldName) {

    // When we don't know the count for a value (because it is in the selected values collection but not the parametric
    // collection) use null instead
    var UNKNOWN_COUNT = null;

    // Transforms an array of selected values into an array of values collection model attributes
    function attributesForUnknownCountValues(values) {
        return _.map(values, function(value) {
            return {id: value, count: UNKNOWN_COUNT, selected: true};
        });
    }

    // True if the text is matched by the search
    function searchMatches(text, search) {
        return text.toLowerCase().indexOf(search.toLowerCase()) > -1;
    }

    /**
     * The attributes set on each model in a [ValuesCollection]{@link module:display-collection~ValuesCollection}.
     * @typedef module:display-collection~ValuesCollection.ValueModelAttributes
     * @property {string} id The value name
     * @property {number} count The number of documents with the current search or null if we don't have that information
     */
    /**
     * Collection for storing the parametric values associated with a single parametric field.
     * @constructor
     * @name module:display-collection~ValuesCollection
     * @extends {Backbone.Collection}
     */
    var ValuesCollection = Backbone.Collection.extend({
        comparator: function(model) {
            // If count is null this evaluates to -0
            return -model.get('count');
        }
    });

    /**
     * The attributes set on each [DisplayModel]{@link module:display-collection~DisplayModel}.
     * @typedef module:display-collection~DisplayModel.DisplayModelAttributes
     * @property {string} id The field name
     * @property {string} displayName A "prettified" friendly name for the field
     * @property {boolean} selected Whether the user has selected the value
     */
    /**
     * The model for the [DisplayCollection]{@link module:display-collection}, representing a parametric field. The values
     * for the field are stored in the fieldValues property.
     * @constructor
     * @name module:display-collection~DisplayModel
     * @property {module:display-collection~ValuesCollection} fieldValues
     * @extends {Backbone.Model}
     */
    var DisplayModel = Backbone.Model.extend({
        initialize: function(attributes, options) {
            this.fieldValues = new ValuesCollection(options.initialValues);
            this.set('displayName', attributes.displayName || prettifyFieldName(this.id));
        }
    });

    /**
     * The attributes expected on models in the parametricCollection.
     * @typedef module:display-collection~ParametricCollectionAttributes
     * @property {string} name The field name
     * @property {Array.<{value: string, count: number}>} values The values and associated document counts for the field
     */
    /**
     * @typedef module:display-collection~DisplayCollection.DisplayCollectionOptions
     * @property {Backbone.Collection} parametricCollection The collection which fetches the parametric fields and values
     * which match the current search
     * @property {module:selected-values-collection~SelectedValuesCollection} selectedParametricValues The collection which tracks which parametric
     * values have been selected by the user
     */
    /**
     * Combines the parametric values selected by the user with the fields and values returned by the server in order
     * to back a view of parametric values relevant to a search. Once a parametric value has been selected (and added to the
     * selected parametric values collection), it should not be removed until the user deselects it, even if they search for
     * something else.
     * <p>This is designed to be a read only view on the underlying collections and should not be modified externally.
     * @name module:display-collection~DisplayCollection
     * @param {Array} models Must be the empty array due to restrictions in Backbone Collection
     * @param {module:display-collection~DisplayCollectionOptions} options
     * @constructor
     * @extends Backbone.View
     */
    return Backbone.Collection.extend(/** @lends module:display-collection~DisplayCollection.prototype */{
        comparator: 'displayName',
        model: DisplayModel,

        initialize: function(models, options) {
            this.parametricCollection = options.parametricCollection;
            this.restrictedParametricCollection = options.restrictedParametricCollection;
            this.selectedParametricValues = options.selectedParametricValues;
            this.filterModel = options.filterModel;

            if(this.filterModel) {
                this.createModels = _.compose(this.filterModels, this.getResolvedDisplayModels);
            } else {
                this.createModels = this.getResolvedDisplayModels;
            }

            this.listenTo(this.selectedParametricValues, 'add', this.onSelectedValueAdd);
            this.listenTo(this.selectedParametricValues, 'remove', this.onSelectedValueRemove);
            this.listenTo(this.selectedParametricValues, 'reset', this.onReset);
            this.listenTo(this.parametricCollection, 'reset', this.onReset);
            this.listenTo(this.restrictedParametricCollection, 'reset', this.onReset);
            this.listenTo(this.filterModel, 'change:text', this.onReset);

            Array.prototype.push.apply(models, this.createModels());
        },

        onSelectedValueAdd: function(selectedModel) {
            var field = selectedModel.get('field');
            var value = selectedModel.get('value');
            if (value) {
                var valueModelAttributes = {id: value, count: UNKNOWN_COUNT, selected: true};
                var fieldModel = this.get(field);

                if (fieldModel) {
                    var valueModel = fieldModel.fieldValues.get(value);

                    if (valueModel) {
                        valueModel.set('selected', true);
                    } else {
                        fieldModel.fieldValues.add(valueModelAttributes);
                    }
                } else {
                    this.add(new DisplayModel({id: field}, {initialValues: [valueModelAttributes]}));
                }
            }
        },

        onSelectedValueRemove: function(selectedModel) {
            var field = selectedModel.get('field');
            var value = selectedModel.get('value');
            if (value) {
                var parametricModel = this.parametricCollection.get(field);

                var inParametricCollection = parametricModel && _.any(parametricModel.get('values'), function (item) {
                        return value === item.value;
                    });

                var model = this.get(field);

                if (inParametricCollection) {
                    model.fieldValues.get(value).set('selected', false);
                } else {
                    // Only remove the value model if the value is not in the parametric collection
                    if (model.fieldValues.length <= 1) {
                        this.remove(model);
                    } else {
                        model.fieldValues.remove(value);
                    }
                }
            }
        },

        onReset: function() {
            this.reset(this.createModels());
        },

        /**
         * Returns an array of display models based on the current state of the parametric and selected values collections.
         * @private
         * @return {module:display-collection~DisplayModel[]}
         */
        getResolvedDisplayModels: function() {
            var selectedFields = this.selectedParametricValues.toFieldsAndValues();

            var newModels = this.parametricCollection.map(function(parametricModel) {
                var field = parametricModel.get('id');

                // Track the selected values for this field so we don't consider them twice
                var selectedField = selectedFields[field];
                var selectedValues = selectedField ? selectedField.values : [];

                var getInitialValues = function(collection) {
                    return _.map(collection.get(parametricModel).get('values'), function(item) {
                        var value = item.value;
                        var oldSelectedValuesLength = selectedValues.length;
                        selectedValues = _.without(selectedValues, value);
                        // If the length has changed after calling _.without, the value must have been selected
                        var isSelected = oldSelectedValuesLength !== selectedValues.length;

                        return {id: item.value, count: item.count, selected: isSelected, displayName: item.displayName};
                    });
                };

                var initialValues;
                if (this.restrictedParametricCollection){
                    if (this.restrictedParametricCollection.get(parametricModel)){
                        initialValues = getInitialValues(this.restrictedParametricCollection)
                    } else {
                        initialValues = [];
                    }
                } else {
                    initialValues = getInitialValues(this.parametricCollection)
                }

                // Handle any selected values which are not in the parametric collection
                initialValues = initialValues.concat(attributesForUnknownCountValues(selectedValues));

                // Delete the selected field from the map so we don't consider it twice
                delete selectedFields[field];

                var attributes = {
                    id: parametricModel.get('id'),
                    numeric: parametricModel.get('numeric')
                };

                var displayName = parametricModel.get('displayName');
                if (displayName) {
                    attributes.displayName = displayName;
                }

                return new DisplayModel(attributes, {initialValues: initialValues});
            }, this);

            // Handle any selected fields which were not present in the parametric collection
            newModels = newModels.concat(_.chain(selectedFields)
                .map(function (data, field) {
                    return data.range ? null : new DisplayModel({id: field, numeric: data.numeric}, {
                        initialValues: attributesForUnknownCountValues(data.values)
                    })
                })
                .compact()
                .value()
            );

            return newModels;
        },

        filterModels: function(models) {
            var searchText = this.filterModel.get('text');

            if (searchText) {
                return _.chain(models)
                    .map(function(model) {
                        var valueModelAttributes;

                        if (searchMatches(model.get('displayName'), searchText)) {
                            // Keep all value models
                            valueModelAttributes = model.fieldValues.models
                        } else {
                            // Filter value models
                            valueModelAttributes = _.filter(model.fieldValues.models, function(model) {
                                var displayName = model.get('displayName');
                                return searchMatches(displayName || model.id, searchText);
                            });
                        }

                        return new DisplayModel({id: model.id}, {initialValues: valueModelAttributes});
                    }, this)
                    .filter(function(model) {
                        return model.fieldValues.length > 0;
                    })
                    .value();
            } else {
                return models;
            }
        }
    });

});
