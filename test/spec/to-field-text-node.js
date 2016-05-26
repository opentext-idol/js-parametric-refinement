/*
 * Copyright 2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'backbone',
    'src/to-field-text-node'
], function(Backbone, toFieldTextNode) {

    describe('toFieldTextNode', function() {
        beforeEach(function() {
            this.parametricValues = [
                {field: 'NAME', value: 'penny'},
                {field: 'NAME', value: 'bob'},
                {field: 'FRIEND', value: 'penny'},
                {field: 'AGE', value: '25'},
                {field: 'YEAR', range: [1307, 1327], numeric: true},
                {field: 'DATE', range: [123456789000, 123456790000]}
            ];
        });

        it('returns a field text node representing the collection', function() {
            var node = toFieldTextNode(this.parametricValues);
            var fieldText = node.toString();
            expect(fieldText).toContain('MATCH{25}:AGE');
            expect(fieldText).toContain('MATCH{penny}:FRIEND');
            expect(fieldText).toContain('NRANGE{1307,1327}:YEAR');
            expect(fieldText).toContain('RANGE{123456789e,123456790e}:DATE');
        });

        it('returns null for an empty collection', function() {
            expect(toFieldTextNode([])).toBeNull();
        });
    });

});
