const ora = require('ora');
const { exec } = require('child_process');
const { accessSync } = require('fs');
const { mkdirSync } = require('./utils/fs');
const { CLIENT_REPOS_DIR, CONFIG_FILE_REMOTE, CLIENT_CONFIGS_PATH_REPO, CLIENT_CONFIGS_PATH_TEMP } = require('./const');
const { log, infoText, underlineText, succeedLog, errorLog, infoLog, warnLog } = require('./utils/log');
const { promptRepoConfig, promptMapCheckTempConfigs } = require('./prompt/clone');
const { getClientConfigRepo, getClientConfigTemp, addRepoConfigToClient, addTempConfigListToClient, readRemoteConfig, validateRemoteConfigTempExist } = require('./utils/config');
const { delRepoDir } = require('./utils/fs');

// 克隆远程仓库到本地
function clone(repository, repoName) {
    try {
        accessSync(CLIENT_REPOS_DIR);
    } catch (error) {
        mkdirSync(CLIENT_REPOS_DIR)
    }
    return new Promise((resolve, reject) => {
        const repoUrlStyle = underlineText(infoText(repository));
        const repoNameStyle = infoText(repoName);
        const commandStr = `git clone ${repository} ${repoName}`;
        const spinner = ora(`正在将仓库 ${repoUrlStyle} 克隆到本地`).start();
        exec(commandStr, {
            cwd: CLIENT_REPOS_DIR
        }, (e) => {
            spinner.stop();
            if (e) {
                reject('仓库克隆失败,失败信息：\n' + e.message);
            } else {
                succeedLog(`仓库克隆成功,本地名为 ${repoNameStyle}`);
                resolve();
            }
        })
    });
}

// 添加仓库配置
async function addRepoConfig(repoConfig, clientRepoConfigs) {
    const { name } = repoConfig;
    const nameStyle = infoText(name);
    const spinner = ora(`正在添加 ${nameStyle} 仓库配置信息`).start();
    try {
        addRepoConfigToClient(repoConfig, clientRepoConfigs);
        spinner.stop();
        succeedLog(`仓库配置添加完成`);
    } catch (error) {
        spinner.stop();
        delRepoDir(name);
        throw '仓库配置添加失败，失败信息：\n' + error;
    }
}

// 添加模板配置
async function addTempConfig(tempConfigs, clientTempConfigs) {
    // 检查配置内容
    tempConfigs = await promptMapCheckTempConfigs(tempConfigs, clientTempConfigs);
    const spinner = ora(`正在添加模板配置信息`).start();
    try {
        addTempConfigListToClient(tempConfigs, clientTempConfigs);
        spinner.stop();
        succeedLog('模板配置添加完成');
    } catch (error) {
        spinner.stop();
        throw '模板配置添加失败, 失败信息：\n' + error;
    }
}

module.exports = async (repository, name, desc, type) => {

    try {
        const clientRepoConfigs = getClientConfigRepo();
        const clientTempConfigs = getClientConfigTemp();
        let repoConfig = { repository, name, desc, type };
        repoConfig = await promptRepoConfig(repoConfig, clientRepoConfigs);
        const { repository: repoUrl, name: repoName, type: repoType, desc: repoDesc } = repoConfig;
        await clone(repoUrl, repoName);
        let remoteConfig;
        let tempConfigs = [];
        if (repoType === 'file') {
            remoteConfig = readRemoteConfig(repoName);
            if (!validateRemoteConfigTempExist(remoteConfig)) {
                warnLog(`仓库中未检测到模板配置信息`);
                delRepoDir(repoName);
                infoLog(`由于无法添加配置，克隆的 ${repoName} 仓库已清除`);
                throw `失败提示！请在仓库的 ${CONFIG_FILE_REMOTE} 文件中添加模板信息后再进行操作`;
            } else {
                tempConfigs = remoteConfig.templates.map((v) => ({ ...v, repoName, type: 'file' }));
            }
        } else {
            tempConfigs = [{
                name: repoName,
                desc: repoDesc,
                path: "/",
                repoName,
                type: "app"
            }];
        }
        await addRepoConfig(repoConfig, clientRepoConfigs);
        await addTempConfig(tempConfigs, clientTempConfigs);
        succeedLog(`^_^ 恭喜您！模板库添加结束！配置文件路径如下：`);
        log('   仓库配置：' + underlineText(infoText(`${CLIENT_CONFIGS_PATH_REPO}`)));
        log('   模板配置：' + underlineText(infoText(`${CLIENT_CONFIGS_PATH_TEMP}`)));
    } catch (error) {
        errorLog(error);
    }

}