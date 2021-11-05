const { readFileSync } = require('fs');
const { writeFileSync } = require('./fs')
const { CLIENT_CONFIGS_PATH_REPO, CLIENT_CONFIGS_PATH_TEMP } = require('../const');

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
 * @param {*} clientRepoConfigs 本地已有仓库配置信息
 * @return {*}
 */
function addRepoConfigToClient(repoConfig, clientRepoConfigs) {
    const { name } = repoConfig;
    clientRepoConfigs[name] = repoConfig;
    const data = JSON.stringify(clientRepoConfigs, null, '\t');
    writeFileSync(CLIENT_CONFIGS_PATH_REPO,data);
}

/**
 * @description: 添加模板配置列表信息到本地
 * @param {*} repoConfig        
 * @param {*} clientTempConfigs
 * @return {*}
 */
function addTempConfigListToClient(tempConfigList, clientTempConfigs) {
    for (const temp of tempConfigList) {
        clientTempConfigs[temp.name]=temp
    }
    const data = JSON.stringify(clientTempConfigs, null, '\t');
    writeFileSync(CLIENT_CONFIGS_PATH_TEMP,data);
}

// 添加到
module.exports = {
    getClientConfigRepo,
    getClientConfigTemp,
    addRepoConfigToClient,
    addTempConfigListToClient
}
