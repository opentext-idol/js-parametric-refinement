/*
 * Copyright 2014-2016 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

/**
 * @module prettify-field-name
 */
define([
    'underscore'
], function(_) {

    /**
     * Prettify the given field name for display. Replaces underscores with spaces and capitalises the first letter of
     * each word.
     * @alias module:prettify-field-name
     * @function
     * @param {String} name The input field name
     * @returns {String} The display name
     */
    function prettifyFieldName(name) {
        // Compact to deal with field names which begin with underscore or contain consecutive underscores
        return _.chain(name.split('_')).compact().map(function(word) {
            return word[0].toUpperCase() + word.slice(1).toLowerCase();
        }).value().join(' ');
    }

    return prettifyFieldName;

});
