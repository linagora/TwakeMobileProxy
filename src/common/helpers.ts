import emojiData from './emoji.json';

/**
 * @param {array} arr
 * @param {string} keyField
 * @return {object}
 */
export function arrayToObject(arr: any[], keyField: string) {
    return Object.assign({}, ...arr.map((item) => ({[item[keyField]]: item})))
}

export function emojiGetCode(emojiString: string) {
    return (emojiData as any)[emojiString] || '25A1'
}
