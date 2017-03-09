/*
 * Copyright 2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

/**
 *
 * @module selected-values-collection
 */
define([
    'backbone',
    'underscore',
    'fieldtext/js/field-text-parser',
    './to-fields-and-values',
    './to-field-text-node'
], function(Backbone, _, parser, toFieldsAndValues, toFieldTextNode) {

    /**
     * @typedef module:selected-values-collection~SelectedValuesCollection.FieldData
     * @property {String[]} values The values of the field
     * @property {String} type Parametric/Numeric/NumericDate
     */
    /**
     * The attributes on each model in a [SelectedValuesCollection]{@link module:selected-values-collection}.
     * @typedef module:selected-values-collection~SelectedValuesCollection.SelectedValueAttributes
     * @property {string} field The parametric field name
     * @property {string} value The parametric field value
     * @property {String} type Parametric/Numeric/NumericDate
     */
    /**
     * Collection designed to be the only mutable store for the selected parametric values in an application. Every model
     * should have string "field" and "value" attributes.
     * <p> The Backbone.Collection.modelId method is used to ensure that models with different field and value are considered
     * unique, without having to specify an id on each model explicitly.
     * @name module:selected-values-collection~SelectedValuesCollection
     * @constructor
     * @extends Backbone.View
     */
    return Backbone.Collection.extend(/** @lends module:selected-values-collection~SelectedValuesCollection.prototype */{
        modelId: function(attributes) {
            // Models are the same when they have the same field and value
            // This is sufficient since white space is not allowed in an IDOL (or HOD) field name
            return attributes.field + ' ' + (attributes.value ? attributes.value : attributes.range.join(','));
        },

        /**
         * Returns a map of field name to list of field values.
         * @return {Object.<string, SelectedValuesCollection.FieldData>}
         */
        toFieldsAndValues: function() {
            return toFieldsAndValues(this.toJSON());
        },

        /**
         * Create a field text node from this collection. Returns null if the collection is empty.
         * @return {parser.ExpressionNode}
         */
        toFieldTextNode: function() {
            return toFieldTextNode(this.toJSON())
        }
    });

});
