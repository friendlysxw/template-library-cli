const path = require('path');
const { WORKING_DIR } = require('../const');
const { infoText } = require('../utils/log');
const inquirer = require('inquirer');
inquirer.registerPrompt('search-list', require('inquirer-search-list'));
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));


/**
 * @description: 收集模板配置信息
 * @param {*} tempName          直接在命令行输入的模板名称
 * @param {*} clientTempConfigs 本地已有的模板配置信息
 * @return {*}  返回当前模板配置信息
 */
async function promptTempConfig(tempName, clientTempConfigs) {

    const tempNameWhen = (tempName === undefined) || !clientTempConfigs[tempName];
    const tempNameMessage = (tempName === undefined) ? "请选择使用的模板" :
        !clientTempConfigs[tempName] ? `${infoText(tempName)} 模板不存在，请选择其它模板` : "";
    const tempList = Object.values(clientTempConfigs).map(v => ({ value: v.name, name: `${v.name} (${v.desc})` }));
    const answers = await inquirer.prompt([
        {
            type: 'search-list',
            name: 'tempName',
            message: tempNameMessage,
            when: tempNameWhen,
            choices: tempList
        }
    ]);
    return clientTempConfigs[answers.tempName];

}

/**
 * @description: 收集目标路径
 * @param {*} targetPath    直接在命令行输入的路径
 * @param {*} tempConfig    选择的模板配置信息
 * @return {*}
 */
async function promptCreatePath(targetPath, tempConfig) {
    if(targetPath===undefined){
        const { name } = tempConfig;
        targetPath = '/' + name;
        const excludePaths=['node_modules'];
        const answers = await inquirer.prompt([
            {
                type: 'fuzzypath',
                name: 'targetPath',
                excludePath: nodePath => excludePaths.some(v=>nodePath.startsWith(v)),
                  // excludePath :: (String) -> Bool
                  // excludePath to exclude some paths from the file-system scan
                excludeFilter: nodePath => nodePath == '.',
                  // excludeFilter :: (String) -> Bool
                  // excludeFilter to exclude some paths from the final list, e.g. '.'
                itemType: 'any',
                  // itemType :: 'any' | 'directory' | 'file'
                  // specify the type of nodes to display
                  // default value: 'any'
                  // example: itemType: 'file' - hides directories from the item list
                // rootPath: 'app',
                  // rootPath :: String
                  // Root search directory
                message: '请输入目标生成路径',
                default: targetPath,
                suggestOnly: false,
                  // suggestOnly :: Bool
                  // Restrict prompt answer to available choices or use them as suggestions
                depthLimit: 5,
                  // depthLimit :: integer >= 0
                  // Limit the depth of sub-folders to scan
                  // Defaults to infinite depth if undefined
            }
        ]);
        targetPath = answers.targetPath;
    }
    const appRootPath="/";
    const createPath = path.normalize(WORKING_DIR + '/' + appRootPath + '/' + targetPath);
    return createPath;
}

module.exports = {
    promptTempConfig,
    promptCreatePath
}