const process = require('process');

/**
 * @description 退出程序
 * @param {Number} code 退出码
 */
function exit(code) {
    if (code === undefined) {
        code = 1;
    }
    process.exit(code);
}

function isObject(value) {
    const type = typeof value;
    return value != null && (type === 'object' || type === 'function');
}

function isArray(value) {
    return Array.isArray(value);
}

module.exports = {
    exit,
    isObject,
    isArray
}