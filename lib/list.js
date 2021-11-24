const Table = require('easy-table');
const { getClientConfigRepo, getClientConfigTemp } = require('./utils/config');
const { REPO_KEYS_DESC, TEMP_KEYS_DESC } = require('./const/config')
const {
    log, infoText
} = require('./utils/log');

// 展示仓库信息
function showRepos() {
    const clientRepoConfigs = getClientConfigRepo();
    const repoConfigs = Object.values(clientRepoConfigs);
    if (!repoConfigs.length) {
        log('暂无仓库数据');
        return;
    }
    const t=new Table();
    for (const repo of repoConfigs) {
        for (const key in REPO_KEYS_DESC) {
            const label = REPO_KEYS_DESC[key];
            const value = repo[key];
            t.cell(label, value);
        }
        t.newRow();
    }
    log(infoText('\n仓库信息列表: \n\n')+t.toString());
}

// 展示模板信息
function showTemps() {
    const clientTempConfigs = getClientConfigTemp();
    const tempConfigs = Object.values(clientTempConfigs);
    if (!tempConfigs.length) {
        log('暂无模板数据');
        return;
    }
    const t=new Table();
    for (const repo of tempConfigs) {
        for (const key in TEMP_KEYS_DESC) {
            const label = TEMP_KEYS_DESC[key];
            const value = repo[key];
            t.cell(label, value);
        }
        t.newRow()
    }
    log(infoText('\n模板信息列表: \n\n')+t.toString());
}
module.exports = (options) => {
    const { repository:r, template:t } = options;
    if ((!r && !t) || (r && t)) {
        showRepos();
        showTemps();
    } else if (r) {
        showRepos();
    } else {
        showTemps();
    }
}