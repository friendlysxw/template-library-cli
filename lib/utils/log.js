const chalk = require('chalk');
const ora = require('ora');

// 成功文字
function succeedText(text) {
    return chalk.greenBright.bold(text);
}
// 错误文字
function errorText(text) {
    return chalk.redBright.bold(text);
}
// 警告文字
function warnText(text) {
    return chalk.yellowBright.bold(text);
}
// 提示文字
function infoText(text) {
    return chalk.blueBright.bold(text);
}
// 下划线文字
function underlineText(msg) {
    return chalk.underline.bold(msg);
}

module.exports = {
    succeedText,
    errorText,
    warnText,
    infoText,
    underlineText,

    // 打印基础日志
    log: (msg) => {
        console.log(msg);
    },
    // 打印成功日志
    succeedLog: (msg) => {
        ora().succeed(succeedText(msg));
    },
    // 打印错误日志
    errorLog: (msg) => {
        ora().fail(errorText(msg));
    },
    // 打印警告日志
    warnLog: (msg) => {
        ora().warn(warnText(msg));
    },
    // 打印提示日志
    infoLog: (msg) => {
        ora().info(infoText(msg));
    },
}