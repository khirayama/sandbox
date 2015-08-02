class Util {
  sum( a, b ) {
    if ( !( typeof a === 'number' && typeof b === 'number' ) ) {
      throw new Error( 'Invalid argument type of not Number.' );
    }
    return ( a + b );
  }
}
// Singleton
export default new Util();
