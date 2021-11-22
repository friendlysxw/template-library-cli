const process = require('process');
function exit(code) {
    if (code === undefined) {
        code = 1;
    }
    process.exit(code);
}
module.exports = {
    exit
}