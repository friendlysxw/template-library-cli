const ora = require('ora');
const { promptRepoName, promptDelRepoOk, promptTempName, promptDelTempOk, promptDelType } = require('./prompt/delete');
const { getClientConfigRepo, getClientConfigTemp, delRepoConfig, delTempConfigsOnRepo, delTempConfig } = require('./utils/config');
const { errorLog, infoText, succeedLog, log } = require('./utils/log');
const { exit } = require('./utils/util');
const { delRepoDir } = require('./utils/fs');
// 删除指定仓库
function delRepo(repoName, clientRepoConfigs, clientTempConfigs) {
    const repoNameStyle = infoText(repoName);
    const spinner = ora(`正在删除 ${repoNameStyle} 仓库`).start();
    try {
        delTempConfigsOnRepo(repoName, clientTempConfigs);
        delRepoConfig(repoName, clientRepoConfigs);
        delRepoDir(repoName);
        spinner.stop();
        succeedLog(`成功删除 ${repoNameStyle} 仓库`);
    } catch (error) {
        spinner.stop();
        throw `${repoNameStyle} 仓库删除失败：${error}`;
    }
}

// 删除指定模板
function delTemp(tempName, clientTempConfigs) {
    const tempNameStyle = infoText(tempName);
    const spinner = ora(`正在删除 ${tempNameStyle} 模板`).start();
    try {
        delTempConfig(tempName, clientTempConfigs);
        spinner.stop();
        succeedLog(`成功删除 ${tempNameStyle} 模板`);
    } catch (error) {
        spinner.stop();
        throw `${tempNameStyle} 模板删除失败：${error}`;
    }
}

module.exports = async (name, type) => {
    try {
        type = type || await promptDelType();
        if (type==='repository') {
            const clientRepoConfigs = getClientConfigRepo();
            const clientTempConfigs = getClientConfigTemp();
            if (!Object.keys(clientRepoConfigs).length) {
                log('本地暂无任何仓库，无法进行删除仓库操作');
                exit();
            }
            const repoName = await promptRepoName(name, clientRepoConfigs);
            const ok = await promptDelRepoOk(repoName, clientRepoConfigs);
            if (!ok) exit();
            delRepo(repoName, clientRepoConfigs, clientTempConfigs);
        } else {
            const clientTempConfigs = getClientConfigTemp();
            if (!Object.keys(clientTempConfigs).length) {
                log('本地暂无任何模板，无法进行删除模板操作');
                exit();
            }
            const tempName = await promptTempName(name, clientTempConfigs);
            const ok = await promptDelTempOk(tempName);
            if (!ok) exit();
            delTemp(tempName, clientTempConfigs);
        }
    } catch (error) {
        errorLog(error);
    }
    exit();
}