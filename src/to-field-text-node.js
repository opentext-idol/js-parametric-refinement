/*
 * Copyright 2015-2017 Open Text.
 *
 * Licensed under the MIT License (the "License"); you may not use this file
 * except in compliance with the License.
 *
 * The only warranties for products and services of Open Text and its affiliates
 * and licensors ("Open Text") are as may be set forth in the express warranty
 * statements accompanying such products and services. Nothing herein should be
 * construed as constituting an additional warranty. Open Text shall not be
 * liable for technical or editorial errors or omissions contained herein. The
 * information contained herein is subject to change without notice.
 */

'use strict';

const _ = require('underscore');
const parser = require('hp-autonomy-fieldtext-js/src/js/field-text-parser');
const toFieldsAndValues = require('./to-fields-and-values');
const moment = require('moment');

function escapeFieldTextValue(value) {
    return encodeURIComponent(value);
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
module.exports = function(parametricValuesArray) {
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
};

