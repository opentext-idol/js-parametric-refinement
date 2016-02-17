/*
 * Copyright 2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'backbone',
    'src/to-fields-and-values',
    'underscore'
], function(Backbone, toFieldsAndValues, _) {

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

            expect(fieldsAndValues.NAME.length).toBe(2);
            expect(fieldsAndValues.NAME).toContain('penny');
            expect(fieldsAndValues.NAME).toContain('bob');

            expect(fieldsAndValues.FRIEND.length).toBe(1);
            expect(fieldsAndValues.FRIEND).toContain('penny');

            expect(fieldsAndValues.AGE.length).toBe(1);
            expect(fieldsAndValues.AGE).toContain('25');
        });
    });

});
