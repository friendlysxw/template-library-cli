const ora = require('ora');
const { normalize } = require('path');
const { exec } = require('child_process');
const { CLIENT_REPOS_DIR } = require('./const');
const { isObject, isArray } = require('./utils/validate');
const { log, infoText, warnText, succeedLog, errorLog } = require('./utils/log');
const { promptRepoName } = require('./prompt/pull');
const { promptMapCheckTempConfigs } = require('./prompt/clone');
const { getClientConfigRepo, getClientConfigTemp, readRemoteRepoConfig, addTempConfigListToClient } = require('./utils/config');

// 拉取更新操作
function pull(repoName) {
    return new Promise((resolve, reject) => {
        const repoNameStyle = infoText(repoName);
        const commandStr = `git pull`;
        const cwd = normalize(CLIENT_REPOS_DIR + '/' + repoName);
        log(cwd);
        const spinner = ora(`正在拉取更新仓库 ${repoNameStyle}`).start();
        exec(commandStr, {
            cwd
        }, (e) => {
            spinner.stop();
            if (e) {
                reject('拉取更新失败,失败信息：\n' + e.message);
            } else {
                succeedLog(`成功拉取更新仓库 ${repoNameStyle}`);
                resolve();
            }
        })
    });
}

/**
 * 
 * @description 更新模板配置
 */
async function updateTempConfig(repoConfig, clientTempConfigs) {

    const { repoName } = repoConfig;
    let tempConfigs = [];
    const remoteConfig = readRemoteRepoConfig(repoName);
    if (!isObject(remoteConfig) || !isArray(remoteConfig.templates) || !remoteConfig.templates.length) {
        // 如果远程仓库的模板配置信息不存在了，暂不操作
    } else {
        // 获取新的模板
        const clientTempsOnRepo = (Object.values(clientTempConfigs) || []).filter(v => v.repoName == repoName);
        let newTemps = remoteConfig.templates.filter(r => !clientTempsOnRepo.every(c => c.name != r.name && c.path != r.path));
        newTemps = await promptMapCheckTempConfigs(newTemps, clientTempConfigs, repoConfig);
        if (!tempConfigs.length) return;
        const spinner = ora(`检测到新模板配置，正在添加模板配置信息`).start();
        try {
            addTempConfigListToClient(newTemps, clientTempConfigs);
            spinner.stop();
            succeedLog('新模板配置添加完成');
        } catch (error) {
            spinner.stop();
            throw new Error('新模板配置添加失败');
        }
        // TODO 其它更新情况待分析
    }

}

module.exports = async (repoName) => {
    try {
        const clientRepoConfigs = getClientConfigRepo();
        if (!Object.keys(clientRepoConfigs).length) {
            log(warnText(`本地暂无仓库`))
            return;
        }
        repoName = await promptRepoName(repoName, clientRepoConfigs);
        const repoConfig = clientRepoConfigs[repoName];
        await pull(repoName);
        // 如果这个仓库为模板集合仓库
        if (repoConfig.type === 'repo') {
            const clientTempConfigs = getClientConfigTemp();
            await updateTempConfig(repoConfig, clientTempConfigs);
        }
    } catch (error) {
        errorLog(error);
    }
}