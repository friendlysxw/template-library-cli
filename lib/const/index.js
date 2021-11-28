const path = require('path');
const process = require('process');
const root_dir = path.resolve(process.argv[1], '../../');
module.exports = {
    // 当前脚本根目录
    ROOT_DIR: root_dir,
    // 当前工作目录
    WORKING_DIR: process.cwd(),
    // 客户端仓库所在目录
    CLIENT_REPOS_DIR: path.normalize(root_dir + "/client_repositorys"),
    // 客户端仓库的配置文件路径
    CLIENT_CONFIGS_PATH_REPO: path.normalize(root_dir + "/client_configs/repo-config.json"),
    // 客户端模板的配置文件路径
    CLIENT_CONFIGS_PATH_TEMP: path.normalize(root_dir + "/client_configs/temp-config.json"),
    // 远程仓库中配置文件的文件名
    CONFIG_FILE_REMOTE: 'tlc-config.json',
    // 当前应用中配置文件的文件名
    CONFIG_FILE_APP: 'tlc-config.json',
    // 仓库配置的key描述
    REPO_KEYS_DESC: {
        name: '仓库名称',
        type: '类型(repo:作为仓库，temp:作为模板)',
        desc: '仓库描述',
        repository: '仓库地址',
    },
    // 模板配置的key描述
    TEMP_KEYS_DESC: {
        name: '模板名称',
        type: '类型(app:应用模板，file:文件模板)',
        desc: '模板描述',
        repoName: '所在仓库',
        path: '在仓库中的路径',
    }
}