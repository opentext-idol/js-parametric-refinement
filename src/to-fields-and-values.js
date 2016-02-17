define([
    'underscore'
], function(_) {

    /**
     * Returns a map of field name to list of field values.
     * @return {Object.<string, string[]>}
     */
    return function(parametricValuesArray) {
        // expects [{field: , value: }, ...]
        return _.chain(parametricValuesArray)
            // group the objects by field
            .groupBy('field')
            .mapObject(function(selectedModels) {
                // pick all the values from the resulting array
                return _.pluck(selectedModels, 'value');
            })
            .value();
    }
});