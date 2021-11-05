const {
    writeFileSync: fs_writeFileSync,
    mkdirSync: fs_mkdirSync
} = require('fs');

const { dirname } = require('path');

// 创建目录
function mkdirSync(dir) {
    fs_mkdirSync(dir, { recursive: true });
}

// 写入数据到文件中
function writeFileSync(path, data) {
    try {
        fs_writeFileSync(path, data);
    } catch (error) {
        if (error.code == 'ENOENT') {
            const dir = dirname(path);
            mkdirSync(dir);
            fs_writeFileSync(path, data);
            return;
        }
        throw error;
    }
}

module.exports = {
    mkdirSync,
    writeFileSync
}