// ==================== utils.js ====================

/**
 * Create a new array of given length, filled with a specific value
 * @param {number} length - array length
 * @param {any} value - value to fill
 * @returns {Array}
 */
export function createFilledArray(length, value) {
    return new Array(length).fill(value);
}

/**
 * Clamp a number between min and max
 * @param {number} value - number to clamp
 * @param {number} min - minimum allowed value
 * @param {number} max - maximum allowed value
 * @returns {number}
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Deep copy of a simple object with array values
 * @param {Object} obj
 * @returns {Object}
 */
export function deepCopyState(obj) {
    const copy = {};
    for (const key in obj) {
        copy[key] = Array.isArray(obj[key]) ? [...obj[key]] : obj[key];
    }
    return copy;
}

/**
 * Reverse an array (for ascending limb display)
 * @param {Array} arr
 * @returns {Array} new reversed array
 */
export function reversedArray(arr) {
    return [...arr].reverse();
}

/**
 * Sum all elements of an array
 * @param {Array<number>} arr
 * @returns {number}
 */
export function sumArray(arr) {
    return arr.reduce((acc, val) => acc + val, 0);
}
