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
    'underscore',
    'backbone',
    'src/to-fields-and-values'
], function(_, Backbone, toFieldsAndValues) {
    'use strict';

    describe('toFieldsAndValues', function() {
        beforeEach(function() {
            this.parametricValues = [
                {field: 'NAME', value: 'penny'},
                {field: 'NAME', value: 'bob'},
                {field: 'FRIEND', value: 'penny'},
                {field: 'AGE', value: '25'}
            ];
        });

        it('returns a map of field name to array of values from toFieldsAndValues', function() {
            var fieldsAndValues = toFieldsAndValues(this.parametricValues);

            var fields = _.keys(fieldsAndValues);
            expect(fields.length).toBe(3);

            expect(fieldsAndValues.NAME.values.length).toBe(2);
            expect(fieldsAndValues.NAME.values).toContain('penny');
            expect(fieldsAndValues.NAME.values).toContain('bob');

            expect(fieldsAndValues.FRIEND.values.length).toBe(1);
            expect(fieldsAndValues.FRIEND.values).toContain('penny');

            expect(fieldsAndValues.AGE.values.length).toBe(1);
            expect(fieldsAndValues.AGE.values).toContain('25');
        });
    });
});
