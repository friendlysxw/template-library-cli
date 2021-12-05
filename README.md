# template-library-cli

[![npm](https://badge.fury.io/js/template-library-cli.svg)](http://badge.fury.io/js/template-library-cli)
![downloads](https://img.shields.io/npm/dm/template-library-cli?logo=npm)
![GitHub](https://img.shields.io/github/license/friendlysxw/template-library-cli)

## 简介
当我们已经积累了一些开发和业务经验时，也许我们会为自己准备一些模板，在下一次开发类似业务时以供拷贝使用。

通常我们会把模板存储到我们的git仓库中，并且把模板分为两种类型：
1. 应用模板：其实就是一个成品项目，或者是具备基础架构的项目，通常一个这种项目模板就直接是一个单独的仓库，我们把这种仓库称之为 **应用模板库** ，代号 **app**
2. 文件模板：就是业务文件，可以是一个单文件，也可以是一整个业务模块的文件夹，通常是将很多个这种类型的模板集合到一个仓库，我们把这种仓库称之为 **业务文件模板库** ，代号 **file**

然而即使准备了些模板，在使用时，却还需要经历 **离开当前的位置** 再 **找到模板的位置** 复制后再 **找到要粘贴的位置** 这种繁琐的操作，此时如果我们能通过在当前界面的命令行，一个命令便能将模板库中指定的模板放到指定的位置，那岂不是更高效?

嗯,  这正是此 **模板库工具** 能做的一些事情，也许不止于此，你可以关注最后的TODO。

## 安装

```shell
npm install -g template-library-cli
```
或
```shell
yarn global add template-library-cli
```
安装之后，你就可以在命令行中访问  `tlc` 命令。你可以通过简单运行 `tlc`，看看是否展示出了一份所有可用命令的帮助信息，来验证它是否安装成功

你还可以用这个命令来检查其版本是否正确：
```shell
tlc --version
```

## 使用

> 为了方便演示，案例均采用以下仓库作为我们的远程模板库 
>
> 业务文件模板仓库[vue-file-template](https://github.com/friendlysxw/vue-file-templates.git)：作为你所在公司积累的vue相关通用业务模板
> 
> 开源知名项目仓库[vue-admin-template](https://github.com/PanJiaChen/vue-admin-template.git)：作为你所在公司的`后台管理系统`基础架构模板



### 克隆

```shell
tlc clone|c [options] <repository> [name] [desc]

作用：
    克隆远程仓库作为本地模板库，并生成相关配置信息

参数：
    repository      远程模板仓库地址
    name            克隆到本地后的仓库名称，默认为原始仓库名
    desc            对本仓库的简短描述
选项：
    -a, --app       此仓库作为应用项目模板仓库
    -f, --file      此仓库作为业务文件模板仓库
    -h, --help      显示此命令的帮助信息
```

**案例 1：克隆一个业务文件模板库到本地**

```shell
tlc clone https://github.com/friendlysxw/vue-file-templates.git 
```
> 值得注意的是：在克隆 `业务文件 [file]` 类型的模板仓库时，此仓库根目录需要有一个 `tlc-config.json` 配置文件，并且其中应该存储当前仓库中的模板信息，格式如下：
```json
{
    "templates":[
        {
            "name":"模板的名称",
            "desc":"模板的简短描述",
            "path":"模板在当前仓库中的路径 ( 文件路径 | 目录路径 )"
        }
    ]
}
```
![clone-file.gif](https://sxw-img.oss-cn-beijing.aliyuncs.com/template-library-cli/clone-file.gif)

**案例 2：克隆一个应用项目模板库到本地**
```shell
tlc clone https://github.com/PanJiaChen/vue-admin-template.git
```
![clone-app.gif](https://sxw-img.oss-cn-beijing.aliyuncs.com/template-library-cli/clone-app.gif)


**或者您可以一次性拼写更完整的指令（相同的效果但交互更少）**
```shell
tlc clone https://github.com/friendlysxw/vue-file-templates.git vue-file-templates vue相关通用业务文件模板 --file

tlc clone https://github.com/PanJiaChen/vue-admin-template.git vue-admin vue后台管理系统基础架构模板 --app
```

### 生成

```shell
tlc generate|g [options] <temp-type> [temp-name] [new-name]

作用：
    根据模板生成（应用项目|业务文件）

参数:
    temp-type       模板类型 (可选: "app", "file")
    temp-name       模板名称
    new-name        生成（应用项目|业务文件）的新名称
选项：
    -h, --help      显示此命令的帮助信息
```

**案例 1：在我们的项目中生成业务文件**

```shell
tlc generate file 或 tlc g file
```
[![generate-file.gif](https://sxw-img.oss-cn-beijing.aliyuncs.com/template-library-cli/tlc-generate-file.gif)](http://img.shixuewen.top/template-library-cli/tlc-generate-file.gif)

**案例 2：初始化生成一个应用项目**

```shell
tlc generate app 或 tlc g app
```
![generate-app.gif](https://sxw-img.oss-cn-beijing.aliyuncs.com/template-library-cli/generate-app.gif)

- 或者您可以一次性拼写更完整的指令（相同的效果但交互更少）
```shell
tlc generate app vue-admin myVueApp
tlc generate file vue-file-templates:table user-list
```



### 查看列表
```shell
tlc list|l [options]

作用：
    查看本地（仓库|模板）信息, 以表格形式展示

选项：
    -r, --repository    查看仓库列表信息
    -t, --template      查看模板列表信息
    -h, --help      显示此命令的帮助信息
```

### 拉取更新
```shell
tlc pull|p [options] [repo-name]

作用：
    拉取模板仓库的最新内容，此操作会同步更新本地配置信息

参数:
    repo-name       本地仓库名称
选项：
    -h, --help      显示此命令的帮助信息
```

### 删除
```shell
tlc delete|d [options] [name]

作用：
    删除本地的一个（仓库|模板）

参数:
    name                本地（仓库|模板）名称
选项：
    -r, --repository    删除的是仓库
    -t, --template      删除的是模板
    -h, --help          显示此命令的帮助信息
```

## TODO

- 添加变量解析功能（在模板中定义一些占位符，在生成代码时动态替换占位符的内容）