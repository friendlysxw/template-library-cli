const { readFileSync } = require('fs');
const { writeFileSync } = require('./fs');
const { normalize } = require('path');
const { CLIENT_CONFIGS_PATH_REPO, CLIENT_CONFIGS_PATH_TEMP, CLIENT_REPOS_DIR, CONFIG_FILE_REMOTE, CONFIG_FILE_APP, WORKING_DIR } = require('../const');
const { isObject, isArray } = require('./util');

/**
 * @description 读取远程仓库中的配置信息
 * @param {String} repoName 仓库名称
 */
function readRemoteConfig(repoName) {
    const remoteConfigPath = normalize(`${CLIENT_REPOS_DIR}/${repoName}/${CONFIG_FILE_REMOTE}`);
    let config;
    try {
        config = readFileSync(remoteConfigPath, 'utf-8');
    } catch (error) {
        return config;
    }
    try {
        config = JSON.parse(config);
        return config;
    } catch (error) {
        throw `${CONFIG_FILE_REMOTE} 文件内容解析失败，失败信息：\n` + error;
    }
}

/**
 * @description 验证远程配置中是否存在模板配置
 * @return {Boolean}
 */
function validateRemoteConfigTempExist(remoteConfig) {
    return isObject(remoteConfig) && isArray(remoteConfig.templates) && remoteConfig.templates.length;
}

/**
 * @description 读取目标应用中的配置信息
 */
function readTargetAppConfig() {
    const targetAppConfigPath = normalize(`${WORKING_DIR}/${CONFIG_FILE_APP}`);

    let config;
    try {
        config = readFileSync(targetAppConfigPath, 'utf-8');
    } catch (error) {
        return config;
    }
    try {
        config = JSON.parse(config);
        return config;
    } catch (error) {
        throw `${CONFIG_FILE_APP} 文件内容解析失败，失败信息：\n` + error;
    }
}

// 获取客户端仓库配置信息
function getClientConfigRepo() {
    let data = "{}";
    try {
        data = readFileSync(CLIENT_CONFIGS_PATH_REPO, 'utf-8');
    } catch (error) {
        // path is not exist
    }
    return JSON.parse(data);
}

// 获取客户端模板配置信息
function getClientConfigTemp() {
    let data = "{}";
    try {
        data = readFileSync(CLIENT_CONFIGS_PATH_TEMP, 'utf-8');
    } catch (error) {
        // path is not exist
    }
    return JSON.parse(data);
}

/**
 * @description: 添加单个仓库配置信息到本地
 * @param {*} repoConfig        仓库配置信息
 * @param {*} clientRepoConfigs 本地已有的仓库配置信息
 * @return {*}
 */
function addRepoConfigToClient(repoConfig, clientRepoConfigs) {
    const { name } = repoConfig;
    clientRepoConfigs[name] = repoConfig;
    const data = JSON.stringify(clientRepoConfigs, null, '\t');
    writeFileSync(CLIENT_CONFIGS_PATH_REPO, data);
}

/**
 * @description: 添加模板配置列表信息到本地
 * @param {*} tempConfigList        模板配置列表
 * @param {*} clientTempConfigs     本地已有的模板配置信息
 * @return {*}
 */
function addTempConfigListToClient(tempConfigList, clientTempConfigs) {
    for (const temp of tempConfigList) {
        clientTempConfigs[temp.name] = temp;
    }
    const data = JSON.stringify(clientTempConfigs, null, '\t');
    writeFileSync(CLIENT_CONFIGS_PATH_TEMP, data);
}

/**
 * @description: 删除指定仓库配置信息
 * @param {String} repoName 仓库名称
 * @param {Object} clientRepoConfigs 本地已有的仓库配置信息
 */
function delRepoConfig(repoName, clientRepoConfigs) {
    delete clientRepoConfigs[repoName];
    const data = JSON.stringify(clientRepoConfigs, null, '\t');
    writeFileSync(CLIENT_CONFIGS_PATH_REPO, data);
}

/**
 * @description 删除指定模板配置信息
 * @param {String} tempName 模板名称
 * @param {String} clientTempConfigs 本地已有的模板配置信息
 * 
 */
function delTempConfig(tempName, clientTempConfigs) {
    delete clientTempConfigs[tempName];
    const data = JSON.stringify(clientTempConfigs, null, '\t');
    writeFileSync(CLIENT_CONFIGS_PATH_TEMP, data);
}

/**
 * @description 根据指定仓库删除仓库下的所有模板配置信息
 * @param {String} repoName 模板名称
 * @param {String} clientTempConfigs 本地已有的模板配置信息
 */
function delTempConfigsOnRepo(repoName, clientTempConfigs) {
    for (const tempName in clientTempConfigs) {
        const temp = clientTempConfigs[tempName];
        if (temp.repoName === repoName) {
            delete clientTempConfigs[tempName];
        }
    }
    const data = JSON.stringify(clientTempConfigs, null, '\t');
    writeFileSync(CLIENT_CONFIGS_PATH_TEMP, data);
}

module.exports = {
    readRemoteConfig,
    validateRemoteConfigTempExist,
    readTargetAppConfig,
    getClientConfigRepo,
    getClientConfigTemp,
    addRepoConfigToClient,
    addTempConfigListToClient,
    delRepoConfig,
    delTempConfig,
    delTempConfigsOnRepo
}
