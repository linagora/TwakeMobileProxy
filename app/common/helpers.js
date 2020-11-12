/**
 * @param {array} arr
 * @param {string} keyField
 * @return {object}
 */
export function arrayToObject(arr, keyField) {
  return Object.assign({}, ...arr.map((item) => ({[item[keyField]]: item})))
}
