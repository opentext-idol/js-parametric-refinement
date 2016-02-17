define([
    'underscore',
    'fieldtext/js/field-text-parser',
    './to-fields-and-values'
], function(_, parser, toFieldsAndValues) {

    function escapeFieldTextValue(value) {
        return _.reduce([',','}','{'], function(token) {
            return value.replace(token, encodeURIComponent(token))
        }, value);
    }

    /**
     * Create a field text node from an array of parametric values. Returns null if the array is empty.
     * @return {parser.ExpressionNode}
     */
    return function(parametricValuesArray) {
        var fieldsAndValues = toFieldsAndValues(parametricValuesArray);

        var fieldNodes = _.map(fieldsAndValues, function(data, field) {
            var operator = data.numeric ? 'EQUAL' : 'MATCH';

            return new parser.ExpressionNode(operator, [field], _.map(data.values, escapeFieldTextValue));
        });

        if (fieldNodes.length) {
            return _.reduce(fieldNodes, parser.AND);
        } else {
            return null;
        }
    }
});