const { extname, normalize } = require('path');
const { infoText, warnText } = require('../utils/log');
const inquirer = require('inquirer');
const { NOT_SCAN_PATHS } = require('../const');
const { readTargetAppConfig } = require('../utils/config');
const { isObject, isArray } = require('../utils/util');
inquirer.registerPrompt('search-list', require('inquirer-search-list'));
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));


/**
 * @description: 收集模板配置信息
 * @param {*} searchType        检索的模板类型
 * @param {*} tempName          直接在命令行输入的模板名称
 * @param {*} clientTempConfigs 本地已有的模板配置信息
 * @return {*}  返回当前模板配置信息
 */
async function promptTempConfig(searchType, tempName, clientTempConfigs) {

	const tempList = Object.values(clientTempConfigs).map(v => ({ ...v, value: v.name, name: `${v.name} [${infoText(v.type)}] [${v.desc || v.name}] ` }));
	const appList = tempList.filter((v) => v.type === 'app');
	const fileList = tempList.filter((v) => v.type === 'file');
	let showList = [];
	const { app, file } = searchType;
	if ((!app && !file) || (app && file)) {
		showList = appList.concat(fileList);
	} else if (app) {
		showList = appList;
	}else{
		showList = fileList;
	}
	const tempNameWhen = (tempName === undefined) || !clientTempConfigs[tempName];
	const tempNameMessage = (tempName === undefined) ? "请选择使用的模板" :
		!clientTempConfigs[tempName] ? `${warnText(tempName)} 模板不存在，请选择其它模板` : "";
	const answers = await inquirer.prompt([
		{
			type: 'search-list',
			name: 'tempName',
			message: tempNameMessage,
			when: tempNameWhen,
			choices: showList
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
 * @description 根据目标应用配置信息获取符合 Fuzzypath 插件的配置参数
 * @param {*} appConfig	目标应用配置信息
 * @return {*}	符合 Fuzzypath 插件的配置参数
 * 		   {String}	 [rootPath]:		开始扫描的根路径
 * 		   {Function}[excludePath]: 	不扫描的路径处理函数
 * 		   {Function}[excludeFilter]: 	扫描后不显示的路径处理函数
 */
function getGenFileFuzzypathFromAppConfig(appConfig) {
	const config = {
		excludePath: (nodePath) => NOT_SCAN_PATHS.some(v => normalize(nodePath).startsWith(normalize(v))),
		excludeFilter: () => (false),
		rootPath: './',
	}
	let genPaths = [];
	if (isObject(appConfig)) {
		// 处理根路径
		if (appConfig['rootPath']) {
			config.rootPath = appConfig['rootPath'];
		}
		// 处理可选的生成路径
		if (isArray(appConfig['genPaths'])) {
			genPaths = appConfig['genPaths'];
		}
	}
	if (genPaths.length) {
		config.excludeFilter = (nodePath) => !genPaths.some(v => normalize(nodePath).startsWith(normalize(v)));
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
	const { name, path: tempPath } = tempConfig;
	const config = {
		targetName: '',
		targetDir: ''
	}
	const ext = extname(tempPath);
	const prompts = [];
	if (newName === undefined) {
		prompts.push({
			type: 'input',
			name: 'targetName',
			message: `请输入生成的目标名称`,
			default: name,
			suffix: ext ? ` [自动追加扩展名 ${ext}] ` : '',
			filter: (input) => (input + ext)
		});
	}
	// 获取目标应用中的配置信息；
	const appConfig = readTargetAppConfig();
	const fpConfig = getGenFileFuzzypathFromAppConfig(appConfig);
	prompts.push({
		type: 'fuzzypath',
		name: 'targetDir',
		itemType: 'directory',
		message: '指定目标生成所在的目录',
		suggestOnly: false,
		...fpConfig
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