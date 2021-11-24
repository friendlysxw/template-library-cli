const ora = require('ora');
const inquirer = require('inquirer');
const { normalize } = require('path');
const { exec } = require('child_process');
const { readFileSync, accessSync } = require('fs');
const { mkdirSync } = require('./utils/fs');
const { CLIENT_REPOS_DIR, CONFIG_FILE_REMOTE, CLIENT_CONFIGS_PATH_REPO, CLIENT_CONFIGS_PATH_TEMP } = require('./const');
const { isObject, isArray } = require('./utils/validate');
const {
    log, infoText, underlineText, succeedLog, errorLog
} = require('./utils/log');
const {
    promptRepoConfig, promptTempConfig, promptMapCheckTempConfigs
} = require('./prompt/clone');
const { getClientConfigRepo, getClientConfigTemp, addRepoConfigToClient, addTempConfigListToClient } = require('./utils/config');
const { delRepoDir } = require('./utils/util');

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
        throw `检测到 ${remoteConfigFileStyle} 文件，但内容不符合 ${infoText('json')} 格式，请检查后重试`;
    }
}

// 创建客户端(仓库&模板)配置文件
async function createClientConfigFile(repoConfig, clientRepoConfigs, clientTempConfigs) {
    const { name: repoName, type: repoType, desc: repoDesc } = repoConfig;
    const repoNameStyle = infoText(repoName);
    let tempConfigs = [];
    if (repoType === 'temp') {
        // 如果此仓库直接作为模板
        tempConfigs = [{
            name: repoName,
            desc: repoDesc,
            path: "/",
            repoName
        }]
        tempConfigs = await promptMapCheckTempConfigs(tempConfigs, clientTempConfigs, repoConfig);
    } else {
        // 否则作为存储仓库（模板集合）, 进行模板配置收集
        const remoteConfig = readRemoteRepoConfig(repoName);
        if (!isObject(remoteConfig) || !isArray(remoteConfig.templates) || !remoteConfig.templates.length) {
            // 如果远程仓库不存在模板配置信息，就让用户交互式创建本地模板配置信息
            const { isAdd } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'isAdd',
                    message: "未检测到模板配置信息，是否现在手动添加模板配置",
                    default: () => (true)
                }
            ])
            if (isAdd) {
                tempConfigs = await promptTempConfig(clientTempConfigs, repoConfig);
            }
        } else {
            // 有目标配置信息则检查配置内容是否有效
            tempConfigs = await promptMapCheckTempConfigs(remoteConfig.templates, clientTempConfigs, repoConfig);
        }
    }

    let spinner = ora(`正在添加 ${repoNameStyle} 仓库配置信息`).start();
    try {
        addRepoConfigToClient(repoConfig, clientRepoConfigs);
        spinner.stop();
        succeedLog(`仓库配置添加完成`);
    } catch (error) {
        spinner.stop();
        delRepoDir(repoName);
        throw '仓库配置添加失败';
    }

    if (!tempConfigs.length) return;

    spinner = ora(`正在添加模板配置信息`).start();
    try {
        addTempConfigListToClient(tempConfigs, clientTempConfigs);
        spinner.stop();
        succeedLog('模板配置添加完成');
    } catch (error) {
        spinner.stop();
        throw '模板配置添加失败';
    }

}

module.exports = async (repository, repoName, options) => {

    try {
        const clientRepoConfigs = getClientConfigRepo();
        const clientTempConfigs = getClientConfigTemp();
        const { template } = options;
        const repoConfig = await promptRepoConfig(repoName, repository, template, clientRepoConfigs);
        await clone(repoConfig.repository, repoConfig.name);
        await createClientConfigFile(repoConfig, clientRepoConfigs, clientTempConfigs);
        succeedLog(`恭喜您！配置添加结束！配置文件路径如下：`);
        log('   仓库配置：' + underlineText(infoText(`${CLIENT_CONFIGS_PATH_REPO}`)));
        log('   模板配置：' + underlineText(infoText(`${CLIENT_CONFIGS_PATH_TEMP}`)));
    } catch (error) {
        errorLog(error);
    }

}