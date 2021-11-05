const path = require('path');
const inquirer = require('inquirer');
const { log } = require('../utils/log');

/**
 * @description: 收集仓库信息
 * @param {*} args              直接在命令行输入的参数
 * @param {*} options           直接在命令行输入的选项
 * @param {*} clientRepoConfigs 本地已有的仓库配置信息，用于校验
 * @return {*}  参数及选项
 */
async function promptRepoConfig(args, options, clientRepoConfigs) {

    const { repoName, repository } = args;
    const repoNameWhen = (repoName === undefined) || clientRepoConfigs[repoName];
    const repoNameMessage = (repoName === undefined) ? "设置仓库名称" :
        clientRepoConfigs[repoName] ? `${repoName} 仓库名称已存在，请尝试其它名称` : "";

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'repoName',
            message: repoNameMessage,
            default: () => (path.basename(repository, '.git')),
            when: () => (repoNameWhen),
            validate: async (input) => {
                if (clientRepoConfigs[input]) {
                    return `${input} 仓库名称已存在,请尝试其它名称`
                }
                return true;
            }
        },
        {
            type: 'confirm',
            name: 'template',
            message: "此仓库是否直接作为模板，是则跳过读取远程仓库中的配置文件",
            default: () => (false),
            when: () => (options.template === undefined)
        }
    ]);
    args.repoName = answers.repoName;
    options.template = answers.template;

    return { args, options };
}

/**
 * @description: 手动添加模板信息
 * @param {*} clientTempConfigs 本地已有的模板配置信息
 * @param {*} repoConfig        当前仓库配置信息
 * @return { tempConfigs }  模板配置列表
 */
async function promptAddTempConfig(clientTempConfigs, repoConfig) {
    const { name: repoName } = repoConfig;
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
 * @description: 遍历检查模板配置是否有本地已存在的模板名
 * 
 * @param {*} tempConfigs       待检查的模板配置列表
 * @param {*} clientTempConfigs 本地已有的模板配置信息
 * @param {*} repoConfig        当前的仓库配置信息
 * 
 * @return { tempConfigs }  模板配置列表
 */
async function promptMapNameTempConfigs(tempConfigs, clientTempConfigs, repoConfig) {
    const { name: repoName } = repoConfig;
    for (const temp of tempConfigs) {
        const { name } = temp;
        if (clientTempConfigs[name]) {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: `检测到 ${name} 模板名称在本地已存在，请重命名此模板名称`,
                    default: () => (`${repoName}:${name}`),
                    validate: async (input) => {
                        if (clientTempConfigs[input] || tempConfigs.findIndex(v => v.name == input) != -1) {
                            return `${input} 名称已存在，请尝试其它名称`
                        }
                        return true;
                    }
                }
            ]);
            temp.name = answers.name;
        }
        temp['repoName'] = repoName;
    }
    return tempConfigs;
}

module.exports = {
    promptRepoConfig,
    promptAddTempConfig,
    promptMapNameTempConfigs
}