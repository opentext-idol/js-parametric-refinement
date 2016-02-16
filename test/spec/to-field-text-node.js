/*
 * Copyright 2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'backbone',
    'src/to-field-text-node',
    'underscore'
], function(Backbone, toFieldTextNode, _) {

    describe('toFieldTextNode', function() {
        beforeEach(function() {
            this.parametricValues = [
                {field: 'NAME', value: 'penny'},
                {field: 'NAME', value: 'bob'},
                {field: 'FRIEND', value: 'penny'},
                {field: 'AGE', value: '25'}
            ];
        });

        it('returns a field text node representing the collection', function() {
            var node = toFieldTextNode(this.parametricValues);
            var fieldText = node.toString();
            expect(fieldText).toContain('MATCH{25}:AGE');
            expect(fieldText).toContain('MATCH{penny}:FRIEND');
        });

        it('returns null for an empty collection', function() {
            expect(toFieldTextNode([])).toBeNull();
        });
    });

});
