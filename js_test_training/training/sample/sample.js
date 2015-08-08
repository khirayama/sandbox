import Util from './util.js';

export default class Sample {
  sum( a, b ) {
    return Util.sum( a, b );
  }
  exists( arr, target ) {
    if ( !( arr && arr.length > 0 && arr.indexOf ) ) return false;

    return ( arr.indexOf( target ) !== -1 );
  }
}

export function Floor( value ) {
  return Math.floor( value );
}
