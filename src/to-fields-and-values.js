define([
    'underscore'
], function(_) {
    "use strict";

    /**
     * Returns a map of field name to list of field values.
     * @return {Object.<string, string[]>}
     */
    return function(parametricValuesArray) {
        // expects [{field: , value: }, ...]
        return _.chain(parametricValuesArray)
            .filter(function (entry) {
                return entry.value;
            })
            // group the objects by field
            .groupBy('field')
            .mapObject(function(selectedModels) {
                // pick all the values from the resulting array
                return {
                    numeric: selectedModels[0].numeric,
                    values: _.pluck(selectedModels, 'value')
                }
            })
            .value();
    }
});