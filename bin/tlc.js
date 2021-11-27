#!/usr/bin/env node
const process = require('process');
const { program } = require('commander');
program
    .version(`template-library-cli ${require('../package').version}`)
    .usage('<command> [options]');

program
    .command('clone')
    .alias('c')
    .description('克隆远程仓库到本地作为一个模板库')
    .argument('<repository>', '远程仓库地址')
    .argument('[repo-name]', '克隆到本地后的仓库名称，默认为原始仓库名')
    .option('-t, --template', '此仓库是否直接作为模板')
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((repository, repoName, options) => {
        require('../lib/clone')(repository, repoName, options)
    });

program
    .command('pull')
    .alias('p')
    .description('拉取仓库的最新内容')
    .argument('[repo-name]', '本地仓库名称')
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((repoName) => {
        require('../lib/pull')(repoName)
    });

program
    .command('delete')
    .alias('d')
    .description('删除本地的一个 (仓库|模板)')
    .argument('[name]', '本地 (仓库|模板) 名称')
    .option('-r, --repository', '删除仓库 (不加此选项表示删除模板)', false)
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((name, options) => {
        require('../lib/delete')(name, options)
    });

program
    .command('generate')
    .alias('g')
    .description('根据模板创建(文件夹|文件)')
    .argument('[temp-name]', '模板名称')
    .argument('[new-name]', '生成的新名称')
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((tempName, newName) => {
        require('../lib/generate')(tempName, newName)
    });


program
    .command('list')
    .alias('l')
    .description('查看所有模板')
    .option('-r, --repository', '以仓库分组查看')
    .option('-t, --template', '以模板分组查看')
    .showHelpAfterError('(添加 --help 以获得更多信息)')
    .action((options) => {
        require('../lib/list')(options)
    });

program.command('help', { hidden: true });
program.addHelpText('after', `
运行 tlc <command> ——help 查看指定命令的详细用法
`);
program.parse(process.argv);