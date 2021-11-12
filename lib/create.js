const { promptTempConfig, promptCreatePath } = require('./prompt/create');
const { getClientConfigTemp } = require('./utils/config')
const {
    log,  warnText
} = require('./utils/log');

function create(tempConfig, createPath) {
    console.log('tempConfig', tempConfig);
    console.log('createPath', createPath);
}

module.exports = async (tempName, targetPath) => {

    const clientTempConfigs = getClientConfigTemp();
    if (Object.values(clientTempConfigs).length === 0) {
        log(warnText(`本地暂无任何模板，请先配置模板`))
        return;
    }
    // 获取模板配置信息
    const tempConfig = await promptTempConfig(tempName, clientTempConfigs);
    // 获取要生成的绝对路径
    const createPath = await promptCreatePath(targetPath, tempConfig);
    
    try {
        create(tempConfig, createPath);
    } catch (error) {
        console.log('error ', error);
    }

}