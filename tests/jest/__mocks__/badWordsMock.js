class Filter {
  constructor() {
    this.words = [ 'fuck', 'shit', 'cunt', 'bitch', 'bastard', 'asshole' ];
  }

  removeWords( ...words ) {
    this.words = this.words.filter( ( word ) => ! words.includes( word ) );
  }

  isProfane( value ) {
    const normalizedValue = String( value || '' ).toLowerCase();
    return this.words.some( ( word ) =>
      new RegExp( `\\b${ word }\\b`, 'i' ).test( normalizedValue )
    );
  }
}

module.exports = { Filter };
