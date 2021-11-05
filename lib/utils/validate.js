function isObject(value) {
    const type = typeof value;
    return value != null && (type === 'object' || type === 'function');
}

function isArray(value) {
    return Array.isArray(value);
}

module.exports = {
    isObject,
    isArray
}