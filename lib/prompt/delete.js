const inquirer = require('inquirer');
const { infoText } = require('../utils/log');
inquirer.registerPrompt('search-list', require('inquirer-search-list'));
/**
 * @description: 验证收集仓库名称
 * @param {*} repoName          直接在命令行输入的仓库名称
 * @param {*} clientRepoConfigs 本地已有的仓库配置信息
 * @return {*}  返回要删除的仓库名称
 */
async function promptRepoName(repoName, clientRepoConfigs) {
    const repoConfigs = Object.values(clientRepoConfigs);
    const repoList = repoConfigs.map(v => ({ value: v.name, name: `${v.name} (${v.desc || v.name})` }));
    const prompts = [];
    if (repoName === undefined) {
        prompts.push({
            type: 'search-list',
            name: 'repoName',
            message: '请选择要删除的仓库',
            choices: repoList
        });
    } else if (!clientRepoConfigs[repoName]) {
        prompts.push({
            type: 'search-list',
            name: 'repoName',
            message: `本地暂无 ${infoText(repoName)} 仓库，请选择其它仓库`,
            choices: repoList
        });
    }
    const answers = await inquirer.prompt(prompts);
    return answers.repoName;
}

/**
 * @description: 验证是否删除仓库
 * @param {*} repoName          仓库名称
 * @return {*}  返回要删除的仓库名称
 */
async function promptDelRepoOk(repoName){
    const { ok } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'ok',
            message: `与此仓库相关的模板也会删除，确认删除 ${infoText(repoName)} 仓库吗？`,
            default: true
        }
    ]);
    return ok;
}

/**
 * @description: 验证收集模板名称
 * @param {*} tempName          直接在命令行输入的模板名称
 * @param {*} clientTempConfigs 本地已有的模板配置信息
 * @return {*}  返回要删除的模板名称
 */
 async function promptTempName(tempName, clientTempConfigs) {
    const tempConfigs = Object.values(clientTempConfigs);
    const tempList = tempConfigs.map(v => ({ value: v.name, name: `${v.name} (${v.desc || v.name})` }));
    const prompts = [];
    if (tempName === undefined) {
        prompts.push({
            type: 'search-list',
            name: 'tempName',
            message: '请选择要删除的模板',
            choices: tempList
        });
    } else if (!clientTempConfigs[tempName]) {
        prompts.push({
            type: 'search-list',
            name: 'tempName',
            message: `本地暂无 ${infoText(tempName)} 模板，请选择其它模板`,
            choices: tempList
        });
    }
    const answers = await inquirer.prompt(prompts);
    return answers.tempName;
}

/**
 * @description: 验证是否删除模板
 * @param {*} tempName          模板名称
 * @return {*}  返回要删除的模板名称
 */
async function promptDelTempOk(tempName){
    const { ok } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'ok',
            message: `确认删除 ${infoText(tempName)} 模板吗？`,
            default: true
        }
    ]);
    return ok;
}
module.exports = {
    promptRepoName,
    promptDelRepoOk,
    promptTempName,
    promptDelTempOk
}