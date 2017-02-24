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
                return entry.value || entry.range;
            })
            // group the objects by field
            .groupBy('field')
            .mapObject(function(selectedModels) {
                // pick all the values from the resulting array
                return selectedModels[0].range ? {
                    displayName: selectedModels[0].displayName,
                    numeric: selectedModels[0].numeric,
                    range: selectedModels[0].range
                } : {
                    displayName: selectedModels[0].displayName,
                    numeric: selectedModels[0].numeric,
                    values: _.pluck(selectedModels, 'value'),
                    displayValues: _.pluck(selectedModels, 'displayValue')
                }
            })
            .value();
    }
});