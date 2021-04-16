import emojiData from './emoji.json';
import assert from "assert";

/**
 * @param {array} arr
 * @param {string} keyField
 * @return {object}
 */
export function arrayToObject(arr: any[], keyField: string) {
    try {
        return Object.assign({}, ...arr.map((item) => ({[item[keyField]]: item})))
    } catch (e) {
        console.log(arr)
        throw(e)
    }
}

export function emojiGetCode(emojiString: string) {
    return (emojiData as any)[emojiString] || '25A1'
}

export function required(val: any, tpe: string) {
    assert(val, 'expected not null value')
    optional(val, tpe)
}

export function optional(val: any, tpe: string) {
    assert(typeof val === tpe, 'expected ' + tpe)
}

