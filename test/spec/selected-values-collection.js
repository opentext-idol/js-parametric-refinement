/*
 * Copyright 2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'src/selected-values-collection',
    'underscore'
], function(SelectedParametricValuesCollection, _) {

    describe('Selected values collection', function() {
        beforeEach(function() {
            this.collection = new SelectedParametricValuesCollection([
                {field: 'NAME', value: 'penny'},
                {field: 'NAME', value: 'bob'},
                {field: 'FRIEND', value: 'penny'},
                {field: 'AGE', value: '25'}
            ]);
        });

        it('uses both the field and value attributes to identify models', function() {
            var attributes = {field: 'NAME', value: 'penny'};
            expect(this.collection.get(attributes)).toBe(this.collection.findWhere(attributes));
        });

        it('returns a map of field name to array of values from toFieldsAndValues', function() {
            var fieldsAndValues = this.collection.toFieldsAndValues();

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

        describe('toFieldTextNode', function() {
            it('returns a field text node representing the collection', function() {
                var node = this.collection.toFieldTextNode();
                var fieldText = node.toString();
                expect(fieldText).toContain('MATCH{25}:AGE');
                expect(fieldText).toContain('MATCH{penny}:FRIEND');
            });

            it('returns null for an empty collection', function() {
                expect((new SelectedParametricValuesCollection()).toFieldTextNode()).toBeNull();
            });
        });
    });

});
