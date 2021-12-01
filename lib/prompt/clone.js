const path = require('path');
const inquirer = require('inquirer');
const { log } = require('../utils/log');
/**
 * @description: 收集仓库信息
 * @param {*} repoConfig        已知仓库配置信息(直接命令行输入的)
 * @param {*} clientRepoConfigs 本地已有的仓库配置信息，用于校验
 * @return {*}  repoConfig 新的仓库配置信息
 */
async function promptRepoConfig(repoConfig, clientRepoConfigs) {
    const { repository, name, desc, type } = repoConfig;
    const prompts = [];
    if ((name === undefined) || clientRepoConfigs[name]) {
        const nameMessage = (name === undefined) ? "本地仓库名称" :
            clientRepoConfigs[name] ? `${name} 仓库名称已存在，请尝试其它名称` : "";
        const nameDefault = path.basename(repository, '.git');
        prompts.push({
            type: 'input',
            name: 'name',
            message: nameMessage,
            default: nameDefault,
            validate: async (input) => {
                if (clientRepoConfigs[input]) {
                    return `${input} 仓库名称已存在,请尝试其它名称`;
                }
                return true;
            }
        });
    }
    if (desc === undefined) {
        prompts.push({
            type: 'input',
            name: 'desc',
            message: '仓库描述',
        });
    }
    const typeChoices = [
        { value: 'file', name: '业务文件' },
        { value: 'app', name: '应用项目' },
    ]
    if (type === undefined || !typeChoices.some((v) => v.value == type)) {
        prompts.push({
            type: 'list',
            name: 'type',
            message: "此仓库的仓库类型",
            choices: typeChoices
        });
    }
    const answers = await inquirer.prompt(prompts);
    Object.assign(repoConfig, {
        name: answers.name || name,
        desc: answers.desc || desc,
        type: answers.type || type
    })
    return repoConfig;
}

/**
 * @description: 手动添加模板信息
 * @param {*} clientTempConfigs 本地已有的模板配置信息
 * @param {*} repoConfig        当前仓库配置信息
 * @return { tempConfigs }  模板配置列表
 */
async function promptTempConfig(clientTempConfigs, repoConfig) {
    const { name: repoName, type: repoType } = repoConfig;
    const list = [];
    const prompt = async () => {
        const answers = await inquirer.prompt([
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
        list.push({ ...answers, type: repoType, repoName });
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
 * 
 * @return { tempConfigs }  模板配置列表
 */
async function promptMapCheckTempConfigs(tempConfigs, clientTempConfigs) {
    tempConfigs = tempConfigs.filter(v => v.name);
    for (const temp of tempConfigs) {
        const { name,repoName } = temp;
        const prompts = [];
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
        const answers = await inquirer.prompt(prompts);
        temp['name'] = answers.name || name;
    }
    return tempConfigs;
}

module.exports = {
    promptRepoConfig,
    promptTempConfig,
    promptMapCheckTempConfigs
}