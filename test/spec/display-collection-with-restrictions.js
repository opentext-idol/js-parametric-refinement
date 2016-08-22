/*
 * Copyright 2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'backbone',
    'underscore',
    'src/display-collection',
    'src/selected-values-collection'
], function(Backbone, _, ParametricDisplayCollection, SelectedParametricValuesCollection) {

    describe('Display collection initialised with three selected parametric values and two fields from the server', function() {
        beforeEach(function() {
            this.selectedParametricValues = new SelectedParametricValuesCollection([
                {field: '/DOCUMENT/NAME', value: 'penny'},
                {field: '/DOCUMENT/NAME', value: 'jenny'},
                {field: '/DOCUMENT/VEHICLE', value: 'van'}
            ]);

            this.parametricCollection = new Backbone.Collection([{
                id: '/DOCUMENT/NAME',
                name: 'NAME',
                values: [
                    {value: 'penny', count: 3},
                    {value: 'bobby', count: 2}
                ]
            }, {
                id: '/DOCUMENT/CATEGORY',
                name: 'CATEGORY',
                values: [
                    {value: 'General', count: 5},
                    {value: 'Business', count: 4}
                ]
            }, {
                id: '/DOCUMENT/AGE',
                name: 'AGE',
                displayName: 'JUST A NUMBER',
                values: [
                    {displayName: 'RUDE TO ASK', value: '4', count: 2}
                ]
            }]);

            this.restrictedParametricCollection = new Backbone.Collection([{
                id: '/DOCUMENT/NAME',
                name: 'NAME',
                values: [
                    {value: 'penny', count: 2},
                    {value: 'bobby', count: 1}
                ]
            }, {
                id: '/DOCUMENT/AGE',
                name: 'AGE',
                displayName: 'JUST A NUMBER',
                values: [
                    {displayName: 'RUDE TO ASK', value: '4', count: 2}
                ]
            }]);

            this.filterModel = new Backbone.Model();

            this.collection = new ParametricDisplayCollection([], {
                parametricCollection: this.parametricCollection,
                restrictedParametricCollection: this.restrictedParametricCollection,
                selectedParametricValues: this.selectedParametricValues,
                filterModel: this.filterModel
            });
        });

        it('should have length four', function() {
            expect(this.collection.length).toBe(4);
        });

        it('should create models with a fieldValues collection property', function() {
            this.collection.each(function(model) {
                expect(model.fieldValues).toEqual(jasmine.any(Backbone.Collection));
            });
        });

        it('should create a model for each field in the parametric collection, regardless of whether it is in restricted parametric collection', function() {
            expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
            expect(this.collection.get('/DOCUMENT/AGE')).toBeDefined();
            expect(this.collection.get('/DOCUMENT/CATEGORY')).toBeDefined();
        });

        it('should create a model for each field in the selected parametric values collection', function() {
            expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
            expect(this.collection.get('/DOCUMENT/VEHICLE')).toBeDefined();
        });

        it('should create the correct field values models for a field which exists in the restricted parametric collection', function() {
            var ageValues = this.collection.get('/DOCUMENT/AGE').fieldValues;
            expect(ageValues.length).toBe(1);
            expect(ageValues.get('4')).toBeDefined();
            expect(ageValues.get('4').get('count')).toBe(2);
        });

        it('should create no field values models for a field which only exists in the parametric values collection, not restricted parametric collection', function() {
            var categoryValues = this.collection.get('/DOCUMENT/CATEGORY').fieldValues;
            expect(categoryValues.length).toBe(0);
            expect(categoryValues.get('General')).toBeUndefined();
        });

        it('should create the correct field values models for a field which exists in both parent collections, and take counts from restricted parametric', function() {
            var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
            expect(nameValues.length).toBe(3);
            expect(nameValues.get('penny')).toBeDefined();
            expect(nameValues.get('penny').get('count')).toBe(2);
            expect(nameValues.get('bobby')).toBeDefined();
            expect(nameValues.get('bobby').get('count')).toBe(1);
            expect(nameValues.get('jenny')).toBeDefined();
        });

        it('should set the field value model count attribute to null if the field value is not present in the parametric collection', function() {
            expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('jenny').get('count')).toBeNull();
        });

        it('should set the displayName attribute on all of the models', function() {
            _.each({
                '/DOCUMENT/NAME': 'Name',
                '/DOCUMENT/AGE': 'JUST A NUMBER',
                '/DOCUMENT/CATEGORY': 'Category',
                '/DOCUMENT/VEHICLE': 'Vehicle'
            }, function(displayName, field) {
                expect(this.collection.get(field).get('displayName')).toBe(displayName);
            }, this);
        });

        describe('after a field value from the parametric collection is selected', function() {
            beforeEach(function() {
                this.selectedParametricValues.add({field: '/DOCUMENT/AGE', value: '4'});
            });

            it('should not change length', function() {
                expect(this.collection.length).toBe(4);
            });

            it('should not alter the associated field value collection', function() {
                var ageValues = this.collection.get('/DOCUMENT/AGE').fieldValues;
                expect(ageValues.length).toBe(1);
                expect(ageValues.get('4')).toBeDefined();
            });

            it('should not alter the value model count', function() {
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('count')).toBe(2);
            });

            it('should set the value model selected attribute to true', function() {
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('selected')).toBe(true);
            });
        });

        describe('after a new value from a field in the parametric collection is selected', function() {
            beforeEach(function() {
                this.selectedParametricValues.add({field: '/DOCUMENT/CATEGORY', value: 'Business'});
            });

            it('should not change length', function() {
                expect(this.collection.length).toBe(4);
            });

            it('should add the new value into the field value collection', function() {
                var categoryValues = this.collection.get('/DOCUMENT/CATEGORY').fieldValues;
                expect(categoryValues.length).toBe(1);
                expect(categoryValues.get('Business')).toBeDefined();
            });

            it('should set the new value count to null', function() {
                expect(this.collection.get('/DOCUMENT/CATEGORY').fieldValues.get('Business').get('count')).toBeNull();
            });

            it('should set the new value selected attribute to true', function() {
                expect(this.collection.get('/DOCUMENT/CATEGORY').fieldValues.get('Business').get('selected')).toBe(true);
            });
        });

        describe('after the selected parametric values collection is reset', function() {
            beforeEach(function() {
                this.selectedParametricValues.reset([
                    {field: '/DOCUMENT/AGE', value: '4'},
                    {field: '/DOCUMENT/AGE', value: '5'},
                    {field: '/DOCUMENT/ANIMAL', value: 'cat'}
                ]);
            });

            it('should have one model for each field in the union of the parametric collection and the selected indexes collection', function() {
                expect(this.collection.length).toBe(4);
                expect(this.collection.get('/DOCUMENT/AGE')).toBeDefined();
                expect(this.collection.get('/DOCUMENT/ANIMAL')).toBeDefined();
                expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
                expect(this.collection.get('/DOCUMENT/CATEGORY')).toBeDefined();
            });

            it('should have the correct field value models for each field', function() {
                var ageValues = this.collection.get('/DOCUMENT/AGE').fieldValues;
                expect(ageValues.length).toBe(2);
                expect(ageValues.get('4')).toBeDefined();
                expect(ageValues.get('5')).toBeDefined();

                var categoryValues = this.collection.get('/DOCUMENT/CATEGORY').fieldValues;
                expect(categoryValues.length).toBe(0);
                expect(categoryValues.get('General')).toBeUndefined();
                expect(categoryValues.get('Business')).toBeUndefined();

                var animalValues = this.collection.get('/DOCUMENT/ANIMAL').fieldValues;
                expect(animalValues.length).toBe(1);
                expect(animalValues.get('cat')).toBeDefined();

                var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
                expect(nameValues.length).toBe(2);
                expect(nameValues.get('penny')).toBeDefined();
                expect(nameValues.get('bobby')).toBeDefined();
            });

            it('should use the counts from the restricted parametric collection', function() {
                var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
                expect(nameValues.get('penny').get('count')).toBe(2);
                expect(nameValues.get('bobby').get('count')).toBe(1);

                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('count')).toBe(2);
            });

            it('should set the counts for values not in the restricted parametric collection to null', function() {
                expect(this.collection.get('/DOCUMENT/ANIMAL').fieldValues.get('cat').get('count')).toBeNull();
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('5').get('count')).toBeNull();
            });

            it('should set the selected attribute for selected values to true', function() {
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('selected')).toBe(true);
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('5').get('selected')).toBe(true);
                expect(this.collection.get('/DOCUMENT/ANIMAL').fieldValues.get('cat').get('selected')).toBe(true);
            });

            it('should set the selected attribute for values which are not selected to false', function() {
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('penny').get('selected')).toBe(false);
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('bobby').get('selected')).toBe(false);
            });
        });

        it('should display only the field values of a field which incompletely matches the filter when it is applied', function() {
            this.filterModel.set('text', 'nam');

            expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
            expect(this.collection.get('/DOCUMENT/VEHICLE')).not.toBeDefined();
        });

        it('should display a filtered category when the filter incompletely matches the value of one of the values of a field', function() {
            this.filterModel.set('text', 'jen');

            expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
            expect(this.collection.get('/DOCUMENT/NAME').fieldValues.length).toBe(1);
            expect(this.collection.get('/DOCUMENT/NAME').fieldValues.models[0].id).toBe('jenny');
            expect(this.collection.get('/DOCUMENT/VEHICLE')).not.toBeDefined();
        })
    });

});
