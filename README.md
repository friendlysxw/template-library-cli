# template-library-cli
[![npm](https://badge.fury.io/js/template-library-cli.svg)](http://badge.fury.io/js/template-library-cli)
![GitHub](https://img.shields.io/github/license/friendlysxw/template-library-cli)

> 当我们具备了一些开发或业务经验时，也许我(们)该为自己准备一些项目或文件模板，在下一次开发类似功能时以供拷贝使用，然而即使准备了些模板，它们所在的文件夹时常让我(们)感觉相距甚远，居然还需要切换界面去寻找它们，此时如果我(们)能通过在当前界面的命令行一个命令便能将指定模板放到指定的位置，那岂不快哉!  so~,  这正是此`模板库工具`要做的事情。

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
> 为了方便演示，采用以下仓库作为案例仓库 (若访问速度受限，Gitee上有同款仓库)：
> 
> 开源知名仓库[vue-admin-template](https://github.com/PanJiaChen/vue-admin-template.git)：假设此项目为你所在公司的`后台管理系统`基础架构模板
>
> 个人案例仓库[vue-file-template](https://github.com/friendlysxw/vue-file-templates.git)：假设此仓库为你所在公司总结的vue相关通用业务模板

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

完整指令（交互询问更少）
```shell
tlc clone https://github.com/PanJiaChen/vue-admin-template.git vue-admin vue后台管理系统基础架构模板 --app

tlc clone https://github.com/friendlysxw/vue-file-templates.git vue-file-templates vue相关通用业务模板 --file
```
缺参指令（交互询问更多）
```shell
tlc clone https://github.com/PanJiaChen/vue-admin-template.git

tlc clone https://github.com/friendlysxw/vue-file-templates.git 
```

## 列表
```shell
tlc list|l [options]

作用：
    查看本地（仓库|模板）信息, 以表格形式展示

选项：
    -r, --repository    查看仓库列表信息
    -t, --template      查看模板列表信息
    -h, --help      显示此命令的帮助信息
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
完整指令（交互询问更少）
```shell
tlc generate app vue-admin myApp

tlc generate file vue-file-templates:table userList
```
缺参指令（交互询问更多）
```shell
tlc generate app

tlc generate file
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
    拉取模板仓库的最新内容，此操作会同步更新本地配置信息

参数:
    -r, --repository  删除的是否为仓库（是则删除仓库，否则删除模板） (default: false)
选项：
    -h, --help      显示此命令的帮助信息
```

## TODO

- 添加变量解析功能（在模板中定义一些占位符，在生成代码时动态替换占位符的内容）