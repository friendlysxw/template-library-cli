module.exports = {
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
    },
}