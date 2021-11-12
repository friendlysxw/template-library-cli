const path = require('path');
const inquirer = require('inquirer');
const { log } = require('../utils/log');
/**
 * @description: 收集仓库信息
 * @param {*} repoName          仓库名称
 * @param {*} template          此仓库是否直接作为模板
 * @param {*} clientRepoConfigs 本地已有的仓库配置信息，用于校验
 * @return {*}  repoConfig
 */
async function promptRepoConfig(repoName, repository, template, clientRepoConfigs) {
    const prompts = [];
    if ((repoName === undefined) || clientRepoConfigs[repoName]) {
        const repoNameMessage = (repoName === undefined) ? "设置仓库名称" :
            clientRepoConfigs[repoName] ? `${repoName} 仓库名称已存在，请尝试其它名称` : "";
        const repoNameDefault = path.basename(repository, '.git');
        prompts.push({
            type: 'input',
            name: 'repoName',
            message: repoNameMessage,
            default: repoNameDefault,
            validate: async (input) => {
                if (clientRepoConfigs[input]) {
                    return `${input} 仓库名称已存在,请尝试其它名称`
                }
                return true;
            }
        })
    }
    prompts.push({
        type: 'input',
        name: 'desc',
        message: '仓库描述',
    })
    if (template === undefined) {
        prompts.push({
            type: 'confirm',
            name: 'template',
            message: "此仓库是否直接作为模板",
            default: true
        })
    }
    const answers = await inquirer.prompt(prompts);
    const name = answers.repoName  ||  repoName ;
    const type = (answers.template === undefined || answers.template) ? "temp" : "repo";
    const { desc } = answers;
    return { name, type, desc, repository };
}

/**
 * @description: 手动添加模板信息
 * @param {*} clientTempConfigs 本地已有的模板配置信息
 * @param {*} repoConfig        当前仓库配置信息
 * @return { tempConfigs }  模板配置列表
 */
async function promptTempConfig(clientTempConfigs, repoConfig) {
    const { name: repoName } = repoConfig;
    const list = [];
    const typeChoices = [
        { value: 'app', name: 'app: 作为应用程序模板' },
        { value: 'code', name: 'code: 作为应用程序中的代码文件模板' },
    ]
    const prompt = async () => {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: "模板类型",
                choices: typeChoices
            },
            {
                type: 'input',
                name: 'name',
                message: "模板名称",
                validate: async (input) => {
                    if (!input) {
                        return `请输入模板名称`
                    }
                    if (clientTempConfigs[input] || list.findIndex(v => v.name == input) != -1) {
                        return `${input} 名称已存在，请尝试其它名称`
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'desc',
                message: "模板描述",
                default: (answers) => (answers.name)
            },
            {
                type: 'input',
                name: 'path',
                message: "此模板在仓库中的路径",
                validate: async (input) => {
                    if (!input) {
                        return `请输入路径`
                    }
                    return true;
                }
            },
            {
                type: 'confirm',
                name: 'go',
                message: "是否继续设置下一个模板",
                default: () => (true)
            }
        ]);
        const { go } = answers;
        delete answers.go;
        list.push({ ...answers, repoName });
        if (go) {
            log('————————————————————');
            await prompt();
        }
    }
    await prompt();
    return list;
}

/**
 * @description: 遍历检查模板配置
 * 
 * @param {*} tempConfigs       待检查的模板配置列表
 * @param {*} clientTempConfigs 本地已有的模板配置信息
 * @param {*} repoConfig        当前的仓库配置信息
 * 
 * @return { tempConfigs }  模板配置列表
 */
async function promptMapCheckTempConfigs(tempConfigs, clientTempConfigs, repoConfig) {
    const { name: repoName } = repoConfig;
    tempConfigs=tempConfigs.filter(v=>v.name);
    const typeChoices = [
        { value: 'app', name: 'app: 作为应用程序模板' },
        { value: 'code', name: 'code: 作为应用程序中的代码文件模板' },
    ]
    for (const temp of tempConfigs) {
        const { name,type } = temp;
        const prompts=[];
        if (clientTempConfigs[name]) {
            prompts.push({
                type: 'input',
                name: 'name',
                message: `${name} 模板名称在本地已存在，请重命名此模板名称`,
                default: () => (`${repoName}:${name}`),
                validate: async (input) => {
                    if (clientTempConfigs[input] || tempConfigs.findIndex(v => v.name == input) != -1) {
                        return `${input} 名称已存在，请尝试其它名称`
                    }
                    return true;
                }
            });
        }
        if(!type || ['app','code'].includes(type)){
            prompts.push({
                type: 'list',
                name: 'type',
                message: (answers)=>(`${answers.name || repoName} 模板类型未设置，请选择模板类型`),
                choices: typeChoices,
            });
        }
        const answers = await inquirer.prompt(prompts);
        temp['name'] = answers.name || name;
        temp['type'] = answers.type || type;
        temp['repoName'] = repoName;
    }
    return tempConfigs;
}

module.exports = {
    promptRepoConfig,
    promptTempConfig,
    promptMapCheckTempConfigs
}