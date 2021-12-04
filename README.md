# template-library-cli

[![npm](https://badge.fury.io/js/template-library-cli.svg)](http://badge.fury.io/js/template-library-cli)
![downloads](https://img.shields.io/npm/dm/template-library-cli?logo=npm)
![GitHub](https://img.shields.io/github/license/friendlysxw/template-library-cli)

帮你组织并运用你所积累的模板库。

当我们已经积累了一些开发或业务经验时，也许我们该为自己准备一些项目或文件模板，在下一次开发类似功能时以供拷贝使用，然而即使准备了些模板，居然还需要移动鼠标或切换界面去遥远的地方寻找它们，此时如果我们能通过在当前界面的命令行一个命令便能将指定模板放到指定的位置，那岂不是更好？  

嗯,  这正是此 `模板库工具` 能做的一些事情。



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

> 为了方便演示，案例均采用以下仓库作为我们的远程模板库 (若访问速度受限，Gitee上有同名仓库)：
>
> 个人案例仓库[vue-file-template](https://github.com/friendlysxw/vue-file-templates.git)：作为你所在公司积累的vue相关通用业务模板
> 
> 开源知名仓库[vue-admin-template](https://github.com/PanJiaChen/vue-admin-template.git)：作为你所在公司的`后台管理系统`基础架构模板



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



### 列表
```shell
tlc list|l [options]

作用：
    查看本地（仓库|模板）信息, 以表格形式展示

选项：
    -r, --repository    查看仓库列表信息
    -t, --template      查看模板列表信息
    -h, --help      显示此命令的帮助信息
```



### 更新
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