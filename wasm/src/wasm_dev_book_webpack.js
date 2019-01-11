/* tslint:disable */
import * as wasm from './wasm_dev_book_webpack_bg';
import { date_now } from './index';

/**
* @param {number} arg0
* @param {number} arg1
* @returns {number}
*/
export function add(arg0, arg1) {
    return wasm.add(arg0, arg1);
}

export function __wbg_datenow_9894909d241c8c9c() {
    return date_now();
}
/**
* @returns {number}
*/
export function get_timestamp() {
    return wasm.get_timestamp();
}

