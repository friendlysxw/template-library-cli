const process = require('process');
const { removeSync } = require('fs-extra');
const { normalize } = require('path');
const { CLIENT_REPOS_DIR } = require('../const');

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

/**
 * @description 删除指定仓库目录
 * @param {String} repoName 仓库名称
 */
function delRepoDir(repoName) {
    const repoDir = normalize(CLIENT_REPOS_DIR + '/' + repoName);
    removeSync(repoDir);
}

module.exports = {
    exit,
    delRepoDir
}