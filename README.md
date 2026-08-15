# Smart Copy - 下载路径复制扩展

一个 Chrome 扩展插件，用于快速复制下载文件的完整路径或文件名。

## 功能特点

- 📋 查看最近下载的文件列表
- 📁 一键复制文件完整路径
- 📄 一键复制文件名
- ⚙️ 可配置显示数量（5/10/20/50/100）
- 🎨 现代深色主题界面

## 安装步骤

### 1. 生成图标

双击打开 `generate-icons.html` 文件，点击"下载所有图标"按钮，将下载的 `icon16.png`、`icon48.png`、`icon128.png` 移动到 `icons` 文件夹。

> 仓库内 `icons/` 目录已包含生成好的图标，首次安装可跳过此步骤。

### 2. 加载扩展到 Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目文件夹

## 使用方法

1. 点击浏览器工具栏中的扩展图标
2. 查看最近下载的文件列表
3. 点击"复制路径"复制文件完整路径
4. 点击"复制文件名"仅复制文件名
5. 使用顶部下拉菜单调整显示数量

## 文件结构

```
smartCopy/
├── manifest.json          # 扩展配置文件
├── popup.html             # 弹窗界面
├── popup.js               # 核心逻辑
├── popup.css              # 样式文件
├── generate-icons.html    # 图标生成器（浏览器）
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 权限说明

- `downloads`: 读取下载历史记录
- `storage`: 存储用户设置
- `clipboardWrite`: 写入剪贴板

## 许可证

MIT License
