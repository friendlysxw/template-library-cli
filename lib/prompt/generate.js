const path = require('path');
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
	const tempList = Object.values(clientTempConfigs).map(v => ({ value: v.name, name: `${v.name} (${v.desc || v.name})` }));
	const answers = await inquirer.prompt([
		{
			type: 'search-list',
			name: 'tempName',
			message: tempNameMessage,
			when: tempNameWhen,
			choices: tempList
		}
	]);
	tempName = answers.tempName || tempName;
	return clientTempConfigs[tempName];

}
/**
 * @description: 收集生成应用配置信息
 * @param {*} tempConfig	模板配置信息
 * @param {*} newName	生成的行名称
 * @return {Object}
 * 		   {Boolean}[createDir]: 是否创建应用目录
 * 		   {String}[dirName]: 要创建的应用目录名称
 */
async function promptGenAppConfig(tempConfig, newName) {
	const config = {
		createDir: false,
		dirName: ''
	}
	if (newName === undefined) {
		const { name } = tempConfig;
		const { createDir, dirName } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'createDir',
				message: '是否在当前工作目录下创建应用目录',
				default: true,
			},
			{
				type: 'input',
				name: 'dirName',
				message: '请输入应用目录名称',
				default: name,
				when: (res) => (res.createDir),
			}
		]);
		config.createDir = createDir;
		config.dirName = dirName || '';
	} else {
		config.createDir = true;
		config.dirName = newName;
	}
	return config;
}
/**
 * @description: 收集生成文件配置信息
 * @param {*} tempConfig	模板配置信息
 * @param {*} newName	生成的行名称
 * @return {*}
 */
async function promptGenFileConfig(tempConfig, newName) {
	const { name ,path:tempPath} = tempConfig;
	const config = {
		targetName: '',
		targetDir: ''
	}
	const extname=path.extname(tempPath);
	const prompts=[];
	if (newName === undefined) {
		prompts.push({
			type:'input',
			name:'targetName',
			message:`请输入生成的目标名称`,
			default: name,
			suffix:extname?` [自动追加扩展名 ${extname}] `:'',
			filter:(input)=>(input+extname)
		})
	}
	const excludePaths = ['node_modules', '.git'];
	prompts.push({
		type: 'fuzzypath',
		name: 'targetDir',
		excludePath: nodePath => excludePaths.some(v => nodePath.startsWith(v)),
		excludeFilter: nodePath => nodePath == '.',
		itemType: 'directory',
		rootPath: './',
		message: '指定目标所在的目录',
		suggestOnly: false,
		depthLimit: 5,
	});
	const answers = await inquirer.prompt(prompts);
	config.targetName = answers.targetName || newName;
	config.targetDir = answers.targetDir;
	return config;
}
/**
 * @description: 收集生成配置信息
 * @param {*} tempConfig	模板配置信息
 * @param {*} newName	生成的行名称
 * @return {*}
 */
async function promptGenConfig(tempConfig, newName) {
	const { name, type } = tempConfig;
	let config;
	switch (type) {
		case 'app':
			config = await promptGenAppConfig(tempConfig, newName);
			break;
		case 'file':
			config = await promptGenFileConfig(tempConfig, newName);
			break;
		default:
			throw new Error(`${name} 模板配置异常，type 配置错误`);
	}
	return config;
}


module.exports = {
	promptTempConfig,
	promptGenConfig
}