const ora = require('ora');
const inquirer = require('inquirer');
const { normalize } = require('path');
const { exec } = require('child_process');
const { readFileSync, accessSync } = require('fs');
const { mkdirSync } = require('./utils/fs');
const { CLIENT_REPOS_DIR, CONFIG_FILE_REMOTE, CLIENT_CONFIGS_PATH_REPO, CLIENT_CONFIGS_PATH_TEMP } = require('./const');
const { isObject, isArray } = require('./utils/util');
const { log, infoText, underlineText, succeedLog, errorLog, warnLog } = require('./utils/log');
const { promptRepoConfig, promptTempConfig, promptMapCheckTempConfigs } = require('./prompt/clone');
const { getClientConfigRepo, getClientConfigTemp, addRepoConfigToClient, addTempConfigListToClient } = require('./utils/config');
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

// 读取远程仓库中的配置信息
function readRemoteRepoConfig(repoName) {
    const remoteConfigFileStyle = underlineText(infoText(CONFIG_FILE_REMOTE));
    const remoteConfigPath = normalize(`${CLIENT_REPOS_DIR}/${repoName}/${CONFIG_FILE_REMOTE}`);
    let data;
    try {
        data = readFileSync(remoteConfigPath, 'utf-8');
    } catch (error) {
        return data;
    }
    try {
        const config = JSON.parse(data);
        succeedLog(`检测到 ${remoteConfigFileStyle} 文件`);
        return config;
    } catch (error) {
        throw `检测 ${remoteConfigFileStyle} 文件发生异常，异常信息：\n` + error;
    }
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
async function addTempConfig(repoConfig, clientTempConfigs) {
    const { name: repoName, type: repoType, desc: repoDesc } = repoConfig;
    let tempConfigs = [];
    if (repoType === 'app') {
        // 如果此仓库直接作为应用项目模板
        tempConfigs = [{
            name: repoName,
            desc: repoDesc,
            path: "/",
            repoName: repoName,
            type: "app"
        }];
    } else {
        // 否则收集此仓库中的模板信息
        const remoteConfig = readRemoteRepoConfig(repoName);
        if (!isObject(remoteConfig) || !isArray(remoteConfig.templates) || !remoteConfig.templates.length) {
            // 如果远程仓库不存在模板配置信息，询问是否手动添加模板配置信息
            const { isAdd } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'isAdd',
                    message: "未检测到模板配置信息，是否现在手动添加模板配置",
                    default: () => (true)
                }
            ]);
            if (isAdd) {
                tempConfigs = await promptTempConfig(clientTempConfigs, repoConfig);
            }
        } else {
            // 有目标配置信息则检查配置内容是否有效
            tempConfigs = await promptMapCheckTempConfigs(remoteConfig.templates, clientTempConfigs, repoConfig);
        }

        if (!tempConfigs.length) {
            warnLog(`暂未添加任何模板配置
            \n稍后可执行 ${infoText('tlc add ' + repoName)} 为 ${infoText(repoName)} 仓库添加模板配
            \n若放弃此仓库，请手动执行 ${infoText('tlc delete ' + repoName + ' -r')} 删除此仓库`);
            return;
        }
    }

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
        await clone(repoConfig.repository, repoConfig.name);
        await addRepoConfig(repoConfig, clientRepoConfigs);
        await addTempConfig(repoConfig, clientTempConfigs);
        succeedLog(`恭喜您！配置添加结束！配置文件路径如下：`);
        log('   仓库配置：' + underlineText(infoText(`${CLIENT_CONFIGS_PATH_REPO}`)));
        log('   模板配置：' + underlineText(infoText(`${CLIENT_CONFIGS_PATH_TEMP}`)));
    } catch (error) {
        errorLog(error);
    }

}