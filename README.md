# GitHub Profile Page

一个基于 React + TypeScript + Tailwind CSS 构建的现代化 GitHub 组织/个人主页模板。

[查看示例](https://deepwn.github.io) · [配置文档](./public/config.example.md) ·
[快速开始](#部署到-github-pages)

---

## 目录

- [特性](#特性)
- [设计理念](#设计理念)
- [预览](#预览)
- [快速开始](#快速开始)
- [配置指南](#配置指南)
- [自定义样式](#自定义样式)
- [部署](#部署)
- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [贡献](#贡献)

---

## 特性

### 核心功能

- 📊 **自动获取 GitHub 数据** - 自动拉取仓库、成员等信息
- 🎨 **完全可定制** - 通过 `config.json` 轻松调整外观和行为
- 📱 **响应式设计** - 完美适配手机、平板、桌面设备
- 🌓 **暗色主题** - 专为 GitHub Pages 暗色背景优化
- ⚡ **高性能** - 基于 Vite 构建，首屏加载快速

### 视觉效果

- ✨ **渐变文字** - 支持多彩渐变效果
- 🌟 **发光效果** - 增强暗色背景下的文字可读性
- 🎯 **悬浮动画** - 项目卡片悬停交互效果
- 🔗 **纹理背景** - 微妙的径向渐变和点阵纹理

---

## 设计理念

### 1. 配置优先 (Configuration-First)

本项目采用**声明式配置**理念，所有视觉和内容相关的调整都通过 `config.json` 完成，无需修改代码。

```json
{
  "baseAccount": "your-username",
  "type": "org"
}
```

### 2. GitHub 原生风格

设计遵循 GitHub 的视觉语言，保持与 GitHub 生态的一致性：

- 暗色主题配色方案
- 圆角卡片设计
- 毛玻璃背景效果
- GitHub Actions 风格的状态指示器

### 3. 零运维

部署后无需服务器，所有内容由 GitHub 自动生成和维护：

- GitHub Actions 自动构建
- Cloudflare CDN 加速
- 免费 HTTPS 证书
- 自动更新内容

---

## 预览

### 默认主题

```
┌─────────────────────────────────────────┐
│          Open to Collaborations         │
├─────────────────────────────────────────┤
│                                         │
│              Website Name               │
│         Your Bio / Description          │
│      GitHub  •  Email  •  Twitter       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│           Featured Projects             │
│    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│    │Card │ │Card │ │Card │ │Card │      │
│    └─────┘ └─────┘ └─────┘ └─────┘      │
│                                         │
├─────────────────────────────────────────┤
│                 Footer                  │
└─────────────────────────────────────────┘
```

---

## 快速开始

### 方法一：Fork 并部署

1. **Fork 本仓库**

   点击页面右上角的 [Fork](https://github.com/deepwn/deepwn.github.io/fork) 按钮

2. **修改仓库名称**

   将仓库重命名为 `<your-username>.github.io`

3. **配置你的信息**

   编辑 `public/config.json`：

   ```json
   {
     "baseAccount": "your-github-username",
     "type": "user"
   }
   ```

4. **启用 GitHub Pages**

   进入仓库 **Settings → Pages**，将 Source 设置为 `main` 分支

5. **等待部署**

   几分钟后，你的个人主页将上线于 `https://<your-username>.github.io`

### 方法二：克隆并本地开发

```bash
# 克隆仓库
git clone https://github.com/deepwn/deepwn.github.io.git
cd deepwn.github.io

# 安装依赖
bun install

# 启动开发服务器
bun dev
```

---

## 配置指南

本项目采用**声明式配置**理念，所有视觉和内容相关的调整都通过 `config.json` 完成，无需修改代码。

### 完整配置结构

```json
{
  "site": {
    "baseAccount": "your-github-username",
    "type": "user",
    "website": {
      "title": "Your Name",
      "favicon": "/favicon.svg"
    }
  },
  "theme": {
    "preset": "default",
    "colors": {
      "accent": "green",
      "heading": "text-white",
      "body": "text-gray-300",
      "muted": "text-gray-500"
    },
    "background": {
      "main": "#0d1117",
      "gradient": "linear-gradient(to bottom, #0d1117 0%, #161b22 50%, #0d1117 100%)"
    }
  },
  "sections": {
    "base": {
      "enabled": true,
      "scrollTipLabel": "More Info",
      "logoSrc": "",
      "logoScale": 1,
      "disableLogo": false,
      "nameFontFamily": "font-sans",
      "nameSize": "4xl",
      "nameText": "",
      "disableName": false,
      "descriptionFontFamily": "font-sans",
      "descriptionSize": "lg",
      "descriptionText": "",
      "disableDescription": false
    },
    "members": {
      "enabled": true,
      "title": {
        "title": "Group Members",
        "description": "A young, active and innovative team",
        "accentColor": "from-green-400 to-blue-500"
      },
      "countLabel": "members",
      "hiddenUsers": 0,
      "owner": "",
      "appendUsers": [],
      "separatorColor": "bg-gray-700"
    },
    "projects": {
      "enabled": true,
      "title": {
        "title": "Featured Projects",
        "description": "A collection of open source work and experiments",
        "accentColor": "from-blue-400 to-purple-500"
      },
      "emptyText": "No projects found",
      "hideViewAll": false,
      "hiddenRepos": []
    },
    "footer": {
      "enabled": true,
      "customText": "",
      "hideBuiltWith": false
    }
  }
}
```

### 字段说明

#### Site Configuration (站点配置)

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `site.baseAccount` | GitHub 用户名或组织名 | (必填) |
| `site.type` | 账户类型：`"user"` 或 `"org"` | `"user"` |
| `site.website.title` | 浏览器标签页标题 | `"GitHub Profile"` |
| `site.website.favicon` | 网站图标路径（相对于 public 文件夹） | `"/favicon.svg"` |

#### Theme Configuration (主题配置)

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `theme.preset` | 主题预设名称 | `"default"` |
| `theme.colors.accent` | 强调色（主题预设决定实际颜色） | - |
| `theme.colors.heading` | 标题文字颜色类名 | - |
| `theme.colors.body` | 正文文字颜色类名 | - |
| `theme.colors.muted` | 辅助文字颜色类名 | - |
| `theme.background.main` | 主背景色 | `#0d1117` |
| `theme.background.gradient` | 背景渐变样式 | - |

#### Base Section Configuration (主区域配置)

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `sections.base.enabled` | 是否显示主区域 | `true` |
| `sections.base.scrollTipLabel` | 滚动提示文字 | `"More Info"` |
| `sections.base.logoSrc` | 自定义 Logo 图片 URL | - |
| `sections.base.logoScale` | Logo 缩放比例 (0.5-2) | `1` |
| `sections.base.disableLogo` | 是否禁用 Logo 显示 | `false` |
| `sections.base.nameFontFamily` | 名称字体类名 | - |
| `sections.base.nameSize` | 名称字体大小 (`sm`/`base`/`lg`/`xl`/`2xl`/`3xl`/`4xl`/`5xl`/`6xl`/`7xl`) | - |
| `sections.base.nameText` | 自定义名称文本（覆盖 GitHub 显示名称） | - |
| `sections.base.disableName` | 是否禁用名称显示 | `false` |
| `sections.base.descriptionFontFamily` | 描述字体类名 | - |
| `sections.base.descriptionSize` | 描述字体大小 (`sm`/`base`/`lg`/`xl`/`2xl`) | - |
| `sections.base.descriptionText` | 自定义描述文本（覆盖 GitHub 简介） | - |
| `sections.base.disableDescription` | 是否禁用描述显示 | `false` |

#### Members Section Configuration (成员区域配置)

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `sections.members.enabled` | 是否显示成员区域 | `true` |
| `sections.members.title.title` | 区域标题 | `"Group Members"` |
| `sections.members.title.description` | 区域描述 | `"A young, active and innovative team"` |
| `sections.members.title.accentColor` | 渐变色类名 | - |
| `sections.members.countLabel` | 成员数量标签后缀 | `"members"` |
| `sections.members.hiddenUsers` | 隐藏成员占位数量 | `0` |
| `sections.members.owner` | 组织所有者用户名（显示特殊标识） | - |
| `sections.members.appendUsers` | 额外添加的成员用户名列表 | `[]` |
| `sections.members.separatorColor` | 分隔线颜色类名 | - |

#### Projects Section Configuration (项目区域配置)

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `sections.projects.enabled` | 是否显示项目区域 | `true` |
| `sections.projects.title.title` | 区域标题 | `"Featured Projects"` |
| `sections.projects.title.description` | 区域描述 | `"A collection of open source work and experiments"` |
| `sections.projects.title.accentColor` | 渐变色类名 | - |
| `sections.projects.emptyText` | 无项目时显示文字 | `"No projects found"` |
| `sections.projects.hideViewAll` | 是否隐藏"查看全部仓库"链接 | `false` |
| `sections.projects.hiddenRepos` | 要隐藏的仓库名称列表 | `[]` |

#### Footer Section Configuration (页脚配置)

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `sections.footer.enabled` | 是否显示页脚 | `true` |
| `sections.footer.customText` | 自定义页脚文字 | - |
| `sections.footer.hideBuiltWith` | 是否隐藏"Built with" 署名 | `false` |

### 仓库过滤配置

```json
{
  "sections": {
    "projects": {
      "hiddenRepos": ["archive-repo", "private-repo"]
    }
  }
}
```

- `hiddenRepos` - 要隐藏的仓库名称数组（黑名单）
- `listing_repos` - 只显示指定的仓库名称数组（白名单，与黑名单二选一）

---

## 自定义样式

### 添加全局样式

编辑 `src/index.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义动画 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 自定义背景 */
body {
  background: linear-gradient(to bottom, #0d1117 0%, #161b22 50%, #0d1117 100%);
}
```

### 修改颜色主题

项目使用 Tailwind CSS，所有颜色可通过 Tailwind 类名调整：

```json
{
  "typography": {
    "bio": {
      "textColor": "text-blue-400"
    },
    "team": {
      "background": "bg-blue-900/30"
    }
  }
}
```

---

## 部署

### 自动部署 (推荐)

项目已配置 GitHub Actions，提交代码后自动部署。

### 手动部署

```bash
# 构建生产版本
bun run build

# 部署到 gh-pages 分支
bunx gh-pages -d dist
```

### 自定义域名

1. 在 `public/` 目录添加 `CNAME` 文件：

   ```
   your-domain.com
   ```

2. 在 GitHub 仓库 **Settings → Pages** 中配置自定义域名

---

## 项目结构

```
deepwn.github.io/
├── public/
│   ├── config.json          # 主配置文件
│   ├── config.example.json   # 配置示例
│   ├── config.example.md    # 配置文档
│   ├── CNAME                # 自定义域名（可选）
│   └── favicon.svg          # 网站图标
├── src/
│   ├── components/
│   │   ├── BaseLogo.tsx   # 头像组件
│   │   ├── Footer.tsx           # 页脚
│   │   ├── BaseSection.tsx      # 主要区域
│   │   ├── BaseInfoText.tsx      # 名称展示
│   │   ├── ProjectsSection.tsx  # 项目展示
│   │   ├── TeamSection.tsx      # 团队标签
│   │   └── ui/                  # 基础 UI 组件
│   ├── services/
│   │   ├── config.ts       # 配置类型定义
│   │   └── github.ts       # GitHub API 服务
│   ├── lib/
│   │   └── utils.ts        # 工具函数
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── index.html              # HTML 模板
├── package.json            # 项目依赖
├── tailwind.config.js      # Tailwind 配置
├── vite.config.ts          # Vite 配置
└── tsconfig.json           # TypeScript 配置
```

---

## 技术栈

| 类别     | 技术                       |
| -------- | -------------------------- |
| 框架     | React 19 + TypeScript      |
| 构建工具 | Vite 7                     |
| 样式     | Tailwind CSS 3             |
| 动画     | Framer Motion              |
| 图标     | Lucide React + React Icons |
| 包管理器 | Bun                        |
| 测试     | Vitest                     |
| 代码规范 | ESLint + Prettier          |

---

## 贡献

欢迎贡献代码、主题、建议！或对分支美化自行二开后发布。

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交改动 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 致谢

- [GitHub Pages](https://pages.github.com/) - 托管服务
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [React](https://reactjs.org/) - 前端框架
- [Shadcn UI](https://shadcn.com/) - UI 组件

---

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](./LICENSE) 文件。

---

**Made with ⚡ by [deepwn](https://github.com/deepwn)**
