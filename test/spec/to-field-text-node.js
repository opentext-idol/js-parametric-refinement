/*
 * Copyright 2015-2017 Hewlett Packard Enterprise Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'backbone',
    'src/to-field-text-node'
], function(Backbone, toFieldTextNode) {
    'use strict';

    describe('toFieldTextNode', function() {
        beforeEach(function() {
            this.parametricValues = [
                {field: 'NAME', value: 'penny'},
                {field: 'NAME', value: 'bob'},
                {field: 'FRIEND', value: 'penny'},
                {field: 'AGE', value: '25'},
                {field: 'YEAR', range: [1307, 1327], type: 'Numeric'}
            ];
        });

        it('returns a field text node representing the collection', function() {
            this.parametricValues.push({field: 'DATE', range: [123456789, 123456790]});

            var fieldText = toFieldTextNode(this.parametricValues).toString();
            expect(fieldText).toContain('MATCH{25}:AGE');
            expect(fieldText).toContain('MATCH{penny}:FRIEND');
            expect(fieldText).toContain('NRANGE{1307,1327}:YEAR');
            expect(fieldText).toContain('RANGE{1973-11-29T21:33:09Z,1973-11-29T21:33:10Z}:DATE');
        });

        it('treats 1 BC as year 0', function() {
            this.parametricValues.push({
                field: 'DATE',
                range: [
                    -1971 * 365 * 24 * 3600,
                    -1941 * 365 * 24 * 3600
                ]
            });

            var fieldText = toFieldTextNode(this.parametricValues).toString();
            expect(fieldText).toContain('MATCH{25}:AGE');
            expect(fieldText).toContain('MATCH{penny}:FRIEND');
            expect(fieldText).toContain('NRANGE{1307,1327}:YEAR');
            expect(fieldText).toContain('0000');
        });

        it('returns null for an empty collection', function() {
            expect(toFieldTextNode([])).toBeNull();
        });
    });
});
