/*
 * Copyright 2015-2017 Hewlett Packard Enterprise Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'underscore',
    'fieldtext/js/field-text-parser',
    './to-fields-and-values',
    'moment'
], function(_, parser, toFieldsAndValues, moment) {
    'use strict';

    function escapeFieldTextValue(value) {
        return _.reduce([',', '}', '{'], function(token) {
            return value.replace(token, encodeURIComponent(token))
        }, value);
    }

    function epochMillisToIsoDate(epochMillisArray) {
        return _.map(epochMillisArray, function(epochMillis) {
            return moment(epochMillis).milliseconds(0).utc().format();
        });
    }

    /**
     * Create a field text node from an array of parametric values. Returns null if the array is empty.
     * @return {parser.ExpressionNode}
     */
    return function(parametricValuesArray) {
        var fieldsAndValues = toFieldsAndValues(parametricValuesArray);

        var fieldNodes = [];
        _.each(fieldsAndValues, function(data, field) {
            if(data.values && data.values.length > 0) {
                var operator = data.type === 'Numeric'
                    ? 'EQUAL'
                    : 'MATCH';
                fieldNodes.push(new parser.ExpressionNode(operator, [field], _.map(data.values, escapeFieldTextValue)));
            }
        });

        parametricValuesArray.forEach(function(data) {
            if(data.range) {
                if(data.type === 'Numeric') {
                    fieldNodes.push(new parser.ExpressionNode('NRANGE', [data.field], data.range));
                } else {
                    fieldNodes.push(new parser.ExpressionNode('RANGE', [data.field], epochMillisToIsoDate(data.range)));
                }
            }
        });

        return fieldNodes.length
            ? _.reduce(fieldNodes, parser.AND)
            : null;
    }
});
