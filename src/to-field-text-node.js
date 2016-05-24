define([
    'underscore',
    'fieldtext/js/field-text-parser',
    './to-fields-and-values'
], function (_, parser, toFieldsAndValues) {
    "use strict";

    function escapeFieldTextValue(value) {
        return _.reduce([',', '}', '{'], function (token) {
            return value.replace(token, encodeURIComponent(token))
        }, value);
    }

    /**
     * Create a field text node from an array of parametric values. Returns null if the array is empty.
     * @return {parser.ExpressionNode}
     */
    return function (parametricValuesArray) {
        var fieldsAndValues = toFieldsAndValues(parametricValuesArray);

        var fieldNodes = [];
        _.each(fieldsAndValues, function (data, field) {
            if (data.values && data.values.length > 0) {
                var operator = data.numeric ? 'EQUAL' : 'MATCH';
                fieldNodes.push(new parser.ExpressionNode(operator, [field], _.map(data.values, escapeFieldTextValue)));
            }
        });
        
        parametricValuesArray.forEach(function (data) {
            if (data.range) {
                fieldNodes.push(new parser.ExpressionNode(data.numeric ? 'NRANGE' : 'RANGE', [data.field], data.range));
            }
        });

        if (fieldNodes.length) {
            return _.reduce(fieldNodes, parser.AND);
        } else {
            return null;
        }
    }
});