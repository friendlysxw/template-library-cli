const { writeFileSync: fs_writeFileSync, mkdirSync: fs_mkdirSync } = require('fs');
const { removeSync } = require('fs-extra');
const { dirname, normalize } = require('path');
const { CLIENT_REPOS_DIR } = require('../const');

/**
 * @description 创建目录 (递归创建)
 * @param {String} dir 目录路径
 */
function mkdirSync(dir) {
    fs_mkdirSync(dir, { recursive: true });
}

/**
 * @description 写入数据到文件中
 * @param {String} path  文件路径
 * @param {*} data  文件数据
 */
function writeFileSync(path, data) {
    try {
        fs_writeFileSync(path, data);
    } catch (error) {
        if (error.code == 'ENOENT') {
            const dir = dirname(path);
            mkdirSync(dir);
            fs_writeFileSync(path, data);
            return;
        }
        throw error;
    }
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
    mkdirSync,
    writeFileSync,
    delRepoDir
}