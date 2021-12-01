#!/usr/bin/env node
const process = require('process');
const { program } = require('commander');
program
    .version(`template-library-cli ${require('../package').version}`)
    .usage('<command> [options]');

program
    .command('clone')
    .alias('c')
    .usage('[options] -- [type]')
    .description('克隆远程仓库作为本地模板库，并生成相关配置信息')
    .argument('<repository>', '远程模板仓库地址')
    .argument('[name]', '克隆到本地后的仓库名称，默认为原始仓库名')
    .argument('[desc]', '对本仓库的简短描述')
    .option('-a, --app', '此仓库作为应用项目模板仓库')
    .option('-f, --file', '此仓库作为业务文件模板仓库')
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((repository, name, desc, { app, file }) => {
        let type;
        if (Boolean(app) !== Boolean(file)) {
            type = app ? 'app' : 'file';
        }
        require('../lib/clone')(repository, name, desc, type)
    });

program
    .command('list')
    .alias('l')
    .description('查看（仓库|模板）列表信息')
    .option('-r, --repository', '查看仓库列表信息')
    .option('-t, --template', '查看模板列表信息')
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((options) => {
        require('../lib/list')(options)
    });

program
    .command('generate')
    .alias('g')
    .description('根据模板生成（文件夹|文件）')
    .argument('[temp-name]', '模板名称')
    .argument('[new-name]', '生成（文件夹|文件）的新名称')
    .option('-a, --app', '在应用（app）类型的模板列表中检索模板')
    .option('-f, --file', '在文件（file）类型的模板列表中检索模板')
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((tempName, newName, options) => {
        require('../lib/generate')(tempName, newName, options)
    });

program
    .command('pull')
    .alias('p')
    .description('拉取模板仓库的最新内容，此操作会同步更新本地配置信息')
    .argument('[repo-name]', '本地模板仓库名称')
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((repoName) => {
        require('../lib/pull')(repoName)
    });

program
    .command('delete')
    .alias('d')
    .description('删除本地的一个（仓库|模板），默认删除模板')
    .argument('[name]', '本地（仓库|模板）名称')
    .option('-r, --repository', '删除的是否为仓库（是则删除仓库，否则删除模板）', false)
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((name, options) => {
        require('../lib/delete')(name, options)
    });

program.command('help', { hidden: true });
program.addHelpText('after', `
运行 tlc <command> ——help 查看指定命令的详细用法
`);
program.parse(process.argv);