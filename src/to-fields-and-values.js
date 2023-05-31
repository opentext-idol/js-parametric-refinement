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

define([
    'underscore'
], function(_) {
    'use strict';

    /**
     * Returns a map of field name to list of field values.
     * @return {Object.<string, string[]>}
     */
    return function(parametricValuesArray) {
        // expects [{field: , value: }, ...]
        return _.chain(parametricValuesArray)
            .filter(function(entry) {
                return entry.value || entry.range;
            })
            // group the objects by field
            .groupBy('field')
            .mapObject(function(selectedModels) {
                // pick all the values from the resulting array
                return selectedModels[0].range
                    ? {
                        displayName: selectedModels[0].displayName,
                        type: selectedModels[0].type,
                        range: selectedModels[0].range
                    }
                    : {
                        displayName: selectedModels[0].displayName,
                        type: selectedModels[0].type,
                        values: _.pluck(selectedModels, 'value'),
                        displayValues: _.pluck(selectedModels, 'displayValue')
                    }
            })
            .value();
    }
});
