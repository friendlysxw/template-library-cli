const { copySync } = require('fs-extra');
const mPath = require('path');
const ora = require('ora');
const { promptTempConfig, promptGenConfig } = require('./prompt/generate');
const { getClientConfigTemp } = require('./utils/config')
const {
    log, warnText, infoText
} = require('./utils/log');
const { exit } = require('./utils/util');
const { CLIENT_REPOS_DIR } = require('./const');

/**
 * @description 生成一个新的应用
 * @param {Object} tempConfig   模板配置信息
 * @param {Object} genConfig    生成参数配置
 */
async function genApp(tempConfig, genConfig) {
    const { name, path, repoName } = tempConfig;
    const { createDir, dirName } = genConfig;
    const nameStyle = infoText(name);
    const src = mPath.normalize(CLIENT_REPOS_DIR + '/' + repoName + '/' + path);
    if (createDir) {
        const dest = dirName
        const dirNameStyle = infoText(dirName);
        const spinner = ora(`正在根据模板 ${nameStyle} 生成新应用 ${dirNameStyle}`).start();
        try {

            await copySync(src, dest, { overwrite: false, errorOnExist: true });
            spinner.succeed(`符合模板 ${nameStyle} 的新应用 ${dirNameStyle} 生成成功`);
        } catch (error) {
            spinner.fail('应用生成失败');
            throw error;
        }
    } else {
        const dest = "./";
        const spinner = ora(`正在当前文件夹下根据模板 ${nameStyle} 生成新应用`).start();
        try {
            await copySync(src, dest, { overwrite: false, errorOnExist: true });
            spinner.succeed(`符合模板 ${nameStyle} 的应用内容生成成功`);
        } catch (error) {
            spinner.fail('应用生成失败');
            throw error;
        }
    }
}

/**
 * @description 生成一个文件|文件夹
 * @param {Object} tempConfig   模板配置信息
 * @param {Object} genConfig    生成参数配置
 */
async function genFile(tempConfig, genConfig) {
    const { name, path, repoName } = tempConfig;
    let { targetName, targetDir } = genConfig;

    targetDir = mPath.normalize('./' + targetDir);
    const nameStyle = infoText(name);
    const targetNameStyle = infoText(targetName);
    const targetDirStyle = infoText(targetDir);


    const src = mPath.normalize(CLIENT_REPOS_DIR + '/' + repoName + '/' + path);
    const dest = mPath.normalize(targetDir + '/' + targetName);
    const destStyle = infoText(dest);

    const spinner = ora(`正在根据模板 ${nameStyle} 在 ${targetDirStyle} 目录下 生成 ${targetNameStyle}`).start();
    try {
        await copySync(src, dest, { overwrite: false, errorOnExist: true });
        spinner.succeed(`${destStyle} 生成成功`);
    } catch (error) {
        spinner.fail(`${destStyle} 生成失败`);
        throw error;
    }
}


module.exports = async (tempName, newName) => {

    try {

        const clientTempConfigs = getClientConfigTemp();
        if (Object.values(clientTempConfigs).length === 0) {
            log(warnText(`本地暂无任何模板，请先配置模板`))
            return;
        }
        // 获取模板配置信息
        const tempConfig = await promptTempConfig(tempName, clientTempConfigs);
        // 收集生成配置信息
        const genConfig = await promptGenConfig(tempConfig, newName);

        switch (tempConfig.type) {
            case 'app':
                await genApp(tempConfig, genConfig);
                break;
            case 'file':
                await genFile(tempConfig, genConfig);
        }
        
    } catch (error) {
        log(error);
    }
    exit()

}