const inquirer = require('inquirer');
inquirer.registerPrompt('search-list', require('inquirer-search-list'));

/**
 * @description: 收集仓库名称
 * @param {*} repoName          仓库名称
 * @param {*} clientRepoConfigs 本地已有的仓库配置信息
 * @return {*}  repoName
 */
async function promptRepoName(repoName, clientRepoConfigs) {
    if (repoName) return repoName;
    const repoList = Object.values(clientRepoConfigs).map(v => ({ value: v.name, name: `${v.name} (${v.desc || v.name})` }));
    const answers = await inquirer.prompt([
        {
            type: 'search-list',
            name: 'repoName',
            message: '请选择要拉取更新的仓库',
            choices: repoList
        }
    ]);
    return answers.repoName;
}

module.exports = {
    promptRepoName
}