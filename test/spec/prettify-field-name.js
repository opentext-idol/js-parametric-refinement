define([
    'src/prettify-field-name'
], function(prettifyFieldName) {

    describe('Prettify field name', function() {
        it('replaces underscores with a space', function() {
            expect(prettifyFieldName('My_Field')).toBe('My Field');
        });

        it('capitalises the first letter of each word and lower cases the rest', function() {
            expect(prettifyFieldName('mY_FIELD')).toBe('My Field');
        });

        it('handles field names which begin with _', function() {
            expect(prettifyFieldName('_jedi_knight')).toBe('Jedi Knight');
        });

        it('handles field names which contain consecutive _s', function() {
            expect(prettifyFieldName('jedi___knight')).toBe('Jedi Knight');
        });

        it('handles one letter field names', function() {
            expect(prettifyFieldName('a')).toBe('A');
        });

        it('Strips the first part of the field away leaving only text after the last forward slash', function() {
            expect(prettifyFieldName('/DOCUMENT/Revan')).toBe('Revan');
        })
    });

});
