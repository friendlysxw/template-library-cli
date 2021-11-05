const ora = require('ora');
const inquirer = require('inquirer');
const { normalize } = require('path');
const { exec } = require('child_process');
const { readFileSync, accessSync } = require('fs');
const { mkdirSync } = require('./utils/fs');
const { CLIENT_REPOS_DIR, CONFIG_FILE_REMOTE, CLIENT_CONFIGS_PATH_REPO, CLIENT_CONFIGS_PATH_TEMP } = require('./const');
const { isObject, isArray } = require('./utils/validate');
const {
    log, succeedText, infoText, errorText, underlineText, succeedLog
} = require('./utils/log');
const {
    promptRepoConfig, promptAddTempConfig, promptMapNameTempConfigs
} = require('./prompt/clone');
const { getClientConfigRepo, getClientConfigTemp, addRepoConfigToClient, addTempConfigListToClient } = require('./utils/config')

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
        const spinner = ora(`正在克隆仓库 ${repoUrlStyle}`).start();

        const commandStr = `git clone ${repository} ${repoName}`;
        exec(commandStr, {
            cwd: CLIENT_REPOS_DIR
        }, (e) => {
            if (e) {
                const msg = errorText(`仓库 ${repoUrlStyle} 拉取失败`);
                spinner.fail(msg);
                reject(e.message);
            } else {
                const msg = succeedText(`成功拉取仓库 ${repoUrlStyle} 本地仓库名为 ${repoNameStyle}`);
                spinner.succeed(msg);
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
    const spinner = ora(`检测到 ${remoteConfigFileStyle} 文件，正在读取内容`).start();
    try {
        const config = JSON.parse(data);
        const msg = succeedText(`${remoteConfigFileStyle} 文件读取成功`);
        spinner.succeed(msg);
        return config;
    } catch (error) {
        const msg = `远程仓库中 ${remoteConfigFileStyle} 文件内容不符合 ${infoText('json')} 数据格式，请检查更新后再进行操作`;
        spinner.fail(msg);
        throw new Error(msg);
    }
}

// 创建客户端(仓库&模板)配置文件
async function createClientConfigFile(args, options, clientRepoConfigs, clientTempConfigs) {
    const { repository, repoName } = args;
    const { template } = options;
    let repoConfig = { name: repoName, repository };
    let tempConfigs = [];
    if (template) {
        // 如果此仓库直接作为模板
        repoConfig['type'] = "temp";
        tempConfigs = [{
            name: repoName,
            desc: repoName,
            path: "/",
            repoName
        }]
        tempConfigs = await promptMapNameTempConfigs(tempConfigs, clientTempConfigs, repoConfig);
    } else {
        // 否则作为存储仓库（模板集合）
        repoConfig['type'] = "repo";
        const remoteConfig = readRemoteRepoConfig(repoName);
        if (!isObject(remoteConfig) || !isArray(remoteConfig.templates) || remoteConfig.templates.length == 0) {
            // 如果远程仓库中不存在模板配置信息，就让用户交互式创建本地模板配置信息
            const { isAdd } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'isAdd',
                    message: "未检测到远程仓库中的模板配置信息，是否手动添加模板配置",
                    default: () => (true)
                }
            ])
            if (isAdd) {
                tempConfigs = await promptAddTempConfig(clientTempConfigs, repoConfig);
            }
        } else {
            // 否则检查远程仓库模板配置是否与本地模板配置存在重复，有则提示用户重写重复的模板配置
            tempConfigs = await promptMapNameTempConfigs(remoteConfig.templates, clientTempConfigs, repoConfig);
        }
    }

    try {
        const spinner = ora(`正在添加 ${repoName} 仓库配置信息`).start();
        addRepoConfigToClient(repoConfig, clientRepoConfigs);
        const msg = succeedText(`${repoName} 仓库配置添加完毕 , 配置文件路径 ${CLIENT_CONFIGS_PATH_REPO}`);
        spinner.succeed(msg);
    } catch (error) {
        throw new Error('仓库配置信息存储失败，失败信息: ', error);
    }

    if (tempConfigs.length === 0) return;

    try {
        const spinner = ora(`正在添加模板配置信息`).start();
        addTempConfigListToClient(tempConfigs, clientTempConfigs);
        const msg = succeedText(`模板配置添加完毕 , 配置文件路径 ${CLIENT_CONFIGS_PATH_TEMP}`);
        spinner.succeed(msg);
    } catch (error) {
        throw new Error('模板配置信息存储失败，失败信息:', error);
    }

}


module.exports = async (repository, repoName, options) => {

    const clientRepoConfigs = getClientConfigRepo();
    const clientTempConfigs = getClientConfigTemp();
    const args = {
        repository,
        repoName
    }

    await promptRepoConfig(args, options, clientRepoConfigs);

    try {
        await clone(args.repository, args.repoName);
        await createClientConfigFile(args, options, clientRepoConfigs, clientTempConfigs);

        succeedLog('恭喜！配置已完美结束！可以使用啦！');
    } catch (error) {
        log('catch error', error);
        return;
    }

}