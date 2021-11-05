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
}