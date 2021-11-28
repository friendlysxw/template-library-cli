const ora = require('ora');
const { promptRepoName, promptDelRepoOk, promptTempName, promptDelTempOk } = require('./prompt/delete');
const { getClientConfigRepo, getClientConfigTemp, delRepoConfig, delTempConfigsOnRepo, delTempConfig } = require('./utils/config');
const { errorLog, infoLog, infoText, succeedLog } = require('./utils/log');
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
        errorLog(`${repoNameStyle} 仓库删除失败：${error}`);
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
        errorLog(`${tempNameStyle} 模板删除失败：${error}`);
    }
}

module.exports = async (name, options) => {
    const { repository: r } = options;
    try {
        if (r) {
            const clientRepoConfigs = getClientConfigRepo();
            const clientTempConfigs = getClientConfigTemp();
            if (!Object.keys(clientRepoConfigs).length) {
                infoLog('本地暂无任何仓库，无法进行删除仓库操作');
                return;
            }
            const repoName = await promptRepoName(name, clientRepoConfigs);
            const ok = await promptDelRepoOk(repoName, clientRepoConfigs);
            if (!ok) return;
            delRepo(repoName, clientRepoConfigs, clientTempConfigs);
        } else {
            const clientTempConfigs = getClientConfigTemp();
            if (!Object.keys(clientTempConfigs).length) {
                infoLog('本地暂无任何模板，无法进行删除模板操作');
                return;
            }
            const tempName = await promptTempName(name, clientTempConfigs);
            const ok = await promptDelTempOk(tempName);
            if (!ok) return;
            delTemp(tempName, clientTempConfigs);
        }
    } catch (error) {
        errorLog(error);
    }
    exit();
}