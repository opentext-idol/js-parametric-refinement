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
                id: '/DOCUMENT/AGE',
                name: 'AGE',
                displayName: 'JUST A NUMBER',
                values: [
                    {displayName: 'RUDE TO ASK', value: '4', count: 2}
                ]
            }], {
                model: Backbone.Model.extend({
                    idAttribute: 'id'
                })
            });

            this.filterModel = new Backbone.Model();

            this.collection = new ParametricDisplayCollection([], {
                parametricCollection: this.parametricCollection,
                selectedParametricValues: this.selectedParametricValues,
                filterModel: this.filterModel
            });
        });

        it('has length three', function() {
            expect(this.collection.length).toBe(3);
        });

        it('creates models with a fieldValues collection property', function() {
            this.collection.each(function(model) {
                expect(model.fieldValues).toEqual(jasmine.any(Backbone.Collection));
            });
        });

        it('creates a model for each field in the parametric collection', function() {
            expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
            expect(this.collection.get('/DOCUMENT/AGE')).toBeDefined();
        });

        it('creates a model for each field in the selected parametric values collection', function() {
            expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
            expect(this.collection.get('/DOCUMENT/VEHICLE')).toBeDefined();
        });

        it('creates the correct field values models for a field which only exists in the parametric collection', function() {
            var ageValues = this.collection.get('/DOCUMENT/AGE').fieldValues;
            expect(ageValues.length).toBe(1);
            expect(ageValues.get('4')).toBeDefined();
            expect(ageValues.get('4').get('count')).toBe(2);
        });

        it('creates the correct field values models for a field which only exists in the selected parametric values collection', function() {
            var vehicleValues = this.collection.get('/DOCUMENT/VEHICLE').fieldValues;
            expect(vehicleValues.length).toBe(1);
            expect(vehicleValues.get('van')).toBeDefined();
        });

        it('sets the field value model count attribute to null if the field is not present in the parametric collection', function() {
            expect(this.collection.get('/DOCUMENT/VEHICLE').fieldValues.get('van').get('count')).toBeNull();
        });

        it('creates the correct field values models for a field which exists in both parent collections', function() {
            var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
            expect(nameValues.length).toBe(3);
            expect(nameValues.get('penny')).toBeDefined();
            expect(nameValues.get('penny').get('count')).toBe(3);
            expect(nameValues.get('bobby')).toBeDefined();
            expect(nameValues.get('bobby').get('count')).toBe(2);
            expect(nameValues.get('jenny')).toBeDefined();
        });

        it('sets the field value model count attribute to null if the field value is not present in the parametric collection', function() {
            expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('jenny').get('count')).toBeNull();
        });

        it('sets the displayName attribute on all of the models', function() {
            _.each({
                '/DOCUMENT/NAME': 'Name',
                '/DOCUMENT/AGE': 'JUST A NUMBER',
                '/DOCUMENT/VEHICLE': 'Vehicle'
            }, function(displayName, field) {
                expect(this.collection.get(field).get('displayName')).toBe(displayName);
            }, this);
        });

        it('sets the displayName attribute on all of the values', function() {
            expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('displayName')).toBe('RUDE TO ASK');
        });

        it('sets the field value model selected attribute to false if the value is not selected', function() {
            expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('bobby').get('selected')).toBe(false);
            expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('selected')).toBe(false);
        });

        it('sets the field value model selected attribute to true if the value is selected', function() {
            expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('penny').get('selected')).toBe(true);
            expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('jenny').get('selected')).toBe(true);
            expect(this.collection.get('/DOCUMENT/VEHICLE').fieldValues.get('van').get('selected')).toBe(true);
        });

        it('prettifies the displayName attributes', function() {
            this.selectedParametricValues.add([
                {field: 'jedi_knight', value: 'Yoda'},
                {field: 'date_of_birth', value: '06/07/08'}
            ]);

            expect(this.collection.get('jedi_knight').get('displayName')).toBe('Jedi Knight');
            expect(this.collection.get('date_of_birth').get('displayName')).toBe('Date Of Birth');
        });

        describe('after a field value from the parametric collection is selected', function() {
            beforeEach(function() {
                this.selectedParametricValues.add({field: '/DOCUMENT/AGE', value: '4'});
            });

            it('does not change length', function() {
                expect(this.collection.length).toBe(3);
            });

            it('does not alter the associated field value collection', function() {
                var ageValues = this.collection.get('/DOCUMENT/AGE').fieldValues;
                expect(ageValues.length).toBe(1);
                expect(ageValues.get('4')).toBeDefined();
            });

            it('does not alter the value model count', function() {
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('count')).toBe(2);
            });

            it('sets the value model selected attribute to true', function() {
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('selected')).toBe(true);
            });
        });

        describe('after a new value from a field in the parametric collection is selected', function() {
            beforeEach(function() {
                this.selectedParametricValues.add({field: '/DOCUMENT/NAME', value: 'george'});
            });

            it('does not change length', function() {
                expect(this.collection.length).toBe(3);
            });

            it('adds the new value into the field value collection', function() {
                var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
                expect(nameValues.length).toBe(4);
                expect(nameValues.get('george')).toBeDefined();
            });

            it('sets the new value count to null', function() {
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('george').get('count')).toBeNull();
            });

            it('sets the new value selected attribute to true', function() {
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('george').get('selected')).toBe(true);
            });
        });

        describe('after a value from a new field which is not in the parametric collection is selected', function() {
            beforeEach(function() {
                this.selectedParametricValues.add({field: '/DOCUMENT/FOOD', value: 'apple'});
            });

            it('creates a new model for the field', function() {
                expect(this.collection.length).toBe(4);
                expect(this.collection.get('/DOCUMENT/FOOD')).toBeDefined();
            });

            it('adds the value to the new model field values', function() {
                var foodValues = this.collection.get('/DOCUMENT/FOOD').fieldValues;
                expect(foodValues.length).toBe(1);
                expect(foodValues.get('apple')).toBeDefined();
            });

            it('sets the new field count to null', function() {
                expect(this.collection.get('/DOCUMENT/FOOD').fieldValues.get('apple').get('count')).toBeNull();
            });

            it('sets the new value selected attribute to true', function() {
                expect(this.collection.get('/DOCUMENT/FOOD').fieldValues.get('apple').get('selected')).toBe(true);
            });
        });

        describe('after a field value from the parametric collection is deselected', function() {
            beforeEach(function() {
                this.selectedParametricValues.remove(this.selectedParametricValues.findWhere({
                    field: '/DOCUMENT/NAME',
                    value: 'penny'
                }));
            });

            it('does not change length', function() {
                expect(this.collection.length).toBe(3);
            });

            it('does not alter the associated field value collection', function() {
                var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
                expect(nameValues.length).toBe(3);
                expect(nameValues.get('penny')).toBeDefined();
            });

            it('does not alter the value model count attribute', function() {
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('penny').get('count')).toBe(3);
            });

            it('sets the value model selected attribute to false', function() {
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('penny').get('selected')).toBe(false);
            });
        });

        describe('after a field value which is not in the parametric collection is deselected', function() {
            beforeEach(function() {
                this.selectedParametricValues.remove(this.selectedParametricValues.findWhere({
                    field: '/DOCUMENT/NAME',
                    value: 'jenny'
                }));
            });

            it('does not change length', function() {
                expect(this.collection.length).toBe(3);
            });

            it('removes the value from the associated model field values', function() {
                var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
                expect(nameValues.length).toBe(2);
                expect(nameValues.get('jenny')).toBeUndefined();
            });
        });

        describe('after the last field value from a field which is not in the parametric collection is deselected', function() {
            beforeEach(function() {
                this.selectedParametricValues.remove(this.selectedParametricValues.findWhere({
                    field: '/DOCUMENT/VEHICLE',
                    value: 'van'
                }));
            });

            it('removes the field model', function() {
                expect(this.collection.length).toBe(2);
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

            it('has one model for each field in the union of the parametric collection and the selected indexes collection', function() {
                expect(this.collection.length).toBe(3);
                expect(this.collection.get('/DOCUMENT/AGE')).toBeDefined();
                expect(this.collection.get('/DOCUMENT/ANIMAL')).toBeDefined();
                expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
            });

            it('has the correct field value models for each field', function() {
                var ageValues = this.collection.get('/DOCUMENT/AGE').fieldValues;
                expect(ageValues.length).toBe(2);
                expect(ageValues.get('4')).toBeDefined();
                expect(ageValues.get('5')).toBeDefined();

                var animalValues = this.collection.get('/DOCUMENT/ANIMAL').fieldValues;
                expect(animalValues.length).toBe(1);
                expect(animalValues.get('cat')).toBeDefined();

                var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
                expect(nameValues.length).toBe(2);
                expect(nameValues.get('penny')).toBeDefined();
                expect(nameValues.get('bobby')).toBeDefined();
            });

            it('uses the counts from the parametric collection', function() {
                var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
                expect(nameValues.get('penny').get('count')).toBe(3);
                expect(nameValues.get('bobby').get('count')).toBe(2);

                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('count')).toBe(2);
            });

            it('sets the counts for values not in the parametric collection to null', function() {
                expect(this.collection.get('/DOCUMENT/ANIMAL').fieldValues.get('cat').get('count')).toBeNull();
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('5').get('count')).toBeNull();
            });

            it('sets the selected attribute for selected values to true', function() {
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('4').get('selected')).toBe(true);
                expect(this.collection.get('/DOCUMENT/AGE').fieldValues.get('5').get('selected')).toBe(true);
                expect(this.collection.get('/DOCUMENT/ANIMAL').fieldValues.get('cat').get('selected')).toBe(true);
            });

            it('sets the selected attribute for values which are not selected to false', function() {
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('penny').get('selected')).toBe(false);
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('bobby').get('selected')).toBe(false);
            });
        });

        describe('after the parametric collection is reset to empty', function() {
            beforeEach(function() {
                this.parametricCollection.reset();
            });

            it('removes all models who do not have a value selected', function() {
                expect(this.collection.length).toBe(2);
                expect(this.collection.get('/DOCUMENT/AGE')).toBeUndefined();
            });

            it('does not modify models whose field was not previously in the parametric collection', function() {
                var vehicleModel = this.collection.get('/DOCUMENT/VEHICLE');
                expect(vehicleModel).toBeDefined();
                expect(vehicleModel.fieldValues.length).toBe(1);

                var vanModel = vehicleModel.fieldValues.get('van');
                expect(vanModel).toBeDefined();
                expect(vanModel.get('count')).toBeNull();
            });

            it('removes all values which are not selected from a model whose field was previously in the parametric collection', function() {
                var nameModel = this.collection.get('/DOCUMENT/NAME');
                expect(nameModel).toBeDefined();
                expect(nameModel.fieldValues.length).toBe(2);
                expect(nameModel.fieldValues.get('penny')).toBeDefined();
                expect(nameModel.fieldValues.get('jenny')).toBeDefined();
            });

            it('sets all field value counts to null', function() {
                this.collection.get('/DOCUMENT/NAME').fieldValues.each(function(model) {
                    expect(model.get('count')).toBeNull();
                });
            });

            it('sets all selected attributes true', function() {
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('penny').get('selected')).toBe(true);
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('jenny').get('selected')).toBe(true);
                expect(this.collection.get('/DOCUMENT/VEHICLE').fieldValues.get('van').get('selected')).toBe(true);
            });
        });

        describe('after the parametric collection is reset to contain new models', function() {
            beforeEach(function() {
                this.parametricCollection.reset([{
                    id: '/DOCUMENT/VEHICLE',
                    name: '/DOCUMENT/VEHICLE',
                    values: [
                        {value: 'van', count: 5},
                        {value: 'car', count: 3}
                    ]
                }, {
                    id: '/DOCUMENT/MILES',
                    name: '/DOCUMENT/MILES',
                    values: [
                        {value: '50000', count: 2}
                    ]
                }]);
            });

            it('has one model for each field in the union of the parametric collection and the selected indexes collection', function() {
                expect(this.collection.length).toBe(3);
                expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
                expect(this.collection.get('/DOCUMENT/VEHICLE')).toBeDefined();
                expect(this.collection.get('/DOCUMENT/MILES')).toBeDefined();
            });

            it('has the correct field value models for each field', function() {
                var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
                expect(nameValues.length).toBe(2);
                expect(nameValues.get('penny')).toBeDefined();
                expect(nameValues.get('jenny')).toBeDefined();

                var vehicleValues = this.collection.get('/DOCUMENT/VEHICLE').fieldValues;
                expect(vehicleValues.length).toBe(2);
                expect(vehicleValues.get('van')).toBeDefined();
                expect(vehicleValues.get('car')).toBeDefined();

                var milesValues = this.collection.get('/DOCUMENT/MILES').fieldValues;
                expect(milesValues.length).toBe(1);
                expect(milesValues.get('50000')).toBeDefined();
            });

            it('uses the counts from the parametric collection', function() {
                var vehicleValues = this.collection.get('/DOCUMENT/VEHICLE').fieldValues;
                expect(vehicleValues.get('van').get('count')).toBe(5);
                expect(vehicleValues.get('car').get('count')).toBe(3);

                expect(this.collection.get('/DOCUMENT/MILES').fieldValues.get('50000').get('count')).toBe(2);
            });

            it('sets the counts for values not in the parametric collection to null', function() {
                var nameValues = this.collection.get('/DOCUMENT/NAME').fieldValues;
                expect(nameValues.get('penny').get('count')).toBeNull();
                expect(nameValues.get('jenny').get('count')).toBeNull();
            });

            it('sets the selected attribute for selected values to true', function() {
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('penny').get('selected')).toBe(true);
                expect(this.collection.get('/DOCUMENT/NAME').fieldValues.get('jenny').get('selected')).toBe(true);
                expect(this.collection.get('/DOCUMENT/VEHICLE').fieldValues.get('van').get('selected')).toBe(true);
            });

            it('sets the selected attribute for values which are not selected to false', function() {
                expect(this.collection.get('/DOCUMENT/VEHICLE').fieldValues.get('car').get('selected')).toBe(false);
                expect(this.collection.get('/DOCUMENT/MILES').fieldValues.get('50000').get('selected')).toBe(false);
            });
        });

        it('displays only the field values of a field which incompletely matches the filter when it is applied', function() {
            this.filterModel.set('text', 'nam');

            expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
            expect(this.collection.get('/DOCUMENT/VEHICLE')).not.toBeDefined();
        });

        it('displays a filtered category when the filter incompletely matches the value of one of the values of a field', function() {
            this.filterModel.set('text', 'jen');

            expect(this.collection.get('/DOCUMENT/NAME')).toBeDefined();
            expect(this.collection.get('/DOCUMENT/NAME').fieldValues.length).toBe(1);
            expect(this.collection.get('/DOCUMENT/NAME').fieldValues.models[0].id).toBe('jenny');
            expect(this.collection.get('/DOCUMENT/VEHICLE')).not.toBeDefined();
        })
    });

});
