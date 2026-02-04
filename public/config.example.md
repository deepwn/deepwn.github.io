# 配置文件详解 (Configuration Guide)

本文档详细说明 `config.json` 中所有可用的配置选项。

---

## 目录

- [基础设置](#基础设置)
- [网站设置](#网站设置)
- [排版设置](#排版设置)
  - [名称设置](#名称设置)
  - [简介设置](#简介设置)
  - [Logo 设置](#logo-设置)
  - [团队协作标签设置](#团队协作标签设置)
- [仓库过滤](#仓库过滤)
- [自定义链接](#自定义链接)
- [Tailwind CSS 类名参考](#tailwind-css-类名参考)

---

## 基础设置

```json
{
  "baseAccount": "your-github-username",
  "type": "user"
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `baseAccount` | 是 | 要展示的 GitHub 用户名或组织名 |
| `type` | 否 | 账户类型：`"user"`（个人）或 `"org"`（组织），默认为 `"user"` |

---

## 网站设置

```json
{
  "website": {
    "title": "Your Name - Developer",
    "favicon": "/favicon.svg"
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 否 | 浏览器标签页显示的标题 |
| `favicon` | 否 | 网站图标路径，支持 `.svg`、`.png`、`.ico` 等格式 |

---

## 排版设置

### 名称设置

控制主页顶部显示的名称样式：

```json
{
  "typography": {
    "name": {
      "enabled": false,
      "fontSize": "text-5xl",
      "fontSizeMd": "md:text-7xl",
      "fontSizeLg": "lg:text-8xl",
      "fontWeight": "font-bold"
    }
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `enabled` | 否 | 是否启用自定义名称（`false` 则显示 GitHub 用户名） |
| `fontSize` | 否 | 移动端字体大小，使用 Tailwind 尺寸类 |
| `fontSizeMd` | 否 | 平板及以上设备的字体大小 |
| `fontSizeLg` | 否 | 大屏幕设备的字体大小 |
| `fontWeight` | 否 | 字重：`font-thin`、`font-extralight`、`font-light`、`font-normal`、`font-medium`、`font-semibold`、`font-bold`、`font-extrabold`、`font-black` |

**可选扩展字段**（取消注释即可启用）：

```json
{
  "typography": {
    "name": {
      "enabled": true,
      "fontSize": "text-5xl",
      "fontWeight": "font-bold",
      "color": "text-white",
      "spacing": 4,
      "gradient": {
        "enabled": true,
        "from": "from-green-400",
        "via": "via-blue-500",
        "to": "to-purple-500"
      },
      "glow": {
        "enabled": true,
        "intensity": "medium"
      },
      "animation": {
        "enabled": true,
        "type": "text-glow"
      }
    }
  }
}
```

| 扩展字段 | 说明 |
|----------|------|
| `color` | 文字颜色，使用 Tailwind 颜色类如 `text-white`、`text-gray-300` |
| `spacing` | 名称与简介之间的垂直间距，默认为 4 |
| `gradient` | 渐变色效果，启用后覆盖 `color` 设置 |
| `glow` | 发光效果，增强暗色背景下的可读性 |
| `animation` | 文字动画效果 |

### 简介设置

控制名称下方的简介文字：

```json
{
  "typography": {
    "bio": {
      "enabled": true,
      "fontSize": "text-lg",
      "fontSizeMd": "md:text-xl",
      "fontWeight": "font-medium",
      "textColor": "text-gray-300"
    }
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `enabled` | 否 | 是否显示简介（当 `type` 为 `org` 时通常显示组织描述） |
| `fontSize` | 否 | 移动端字体大小 |
| `fontSizeMd` | 否 | 平板及以上设备字体大小 |
| `fontWeight` | 否 | 字重 |
| `textColor` | 否 | 文字颜色类 |

### Logo 设置

```json
{
  "typography": {
    "logo": {
      "enabled": true,
      "shape": "none",
      "src": "/your-logo.png",
      "scale": 1,
      "onlineIndicator": {
        "enabled": false,
        "color": "green"
      }
    }
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `enabled` | 否 | 是否显示 Logo/头像 |
| `shape` | 否 | 形状：`circle`（圆形）、`square`（方形）、`none`（使用自定义图片） |
| `src` | 否 | 自定义图片路径（相对于 `public` 文件夹） |
| `scale` | 否 | Logo 大小缩放倍数，默认为 1 |
| `onlineIndicator` | 否 | 在线状态指示器配置 |

### 团队协作标签设置

```json
{
  "typography": {
    "team": {
      "enabled": true,
      "label": "Open to Collaborations",
      "fontSize": "text-sm",
      "fontSizeMd": "md:text-base",
      "fontWeight": "font-medium",
      "textColor": "text-gray-200",
      "background": "bg-black/30",
      "borderColor": "border-white/10",
      "indicator": {
        "enabled": true,
        "color": "green",
        "animate": true
      }
    }
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `enabled` | 否 | 是否显示协作标签 |
| `label` | 否 | 标签文字内容 |
| `fontSize` | 否 | 移动端字体大小 |
| `fontSizeMd` | 否 | 平板及以上设备字体大小 |
| `fontWeight` | 否 | 字重 |
| `textColor` | 否 | 文字颜色类（需包含 `text-` 前缀） |
| `background` | 否 | 背景类（需包含 `bg-` 前缀，支持透明度如 `bg-white/10`） |
| `borderColor` | 否 | 边框颜色类（需包含 `border-` 前缀） |
| `indicator` | 否 | 左侧指示点配置 |

---

## 仓库过滤

```json
{
  "repoFilter": {
    "hidden_repos": ["archive-repo", "private-repo"]
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `hidden_repos` | 否 | 要隐藏的仓库名称数组，这些仓库将不会显示在项目列表中 |

---

## 成员过滤

用于配置额外的成员和拥有者标识：

```json
{
  "memberFilter": {
    "append_users": ["contributor1", "contributor2"],
    "owner": "main-owner"
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `append_users` | 否 | 额外的 GitHub 用户名数组，这些用户会被添加到成员列表中（自动去重） |
| `owner` | 否 | 组织/账户拥有者的 GitHub 用户名，拥有者会在成员列表中显示特殊标识 |

**示例效果**：
- 当 `owner` 设置为 `"alice"` 时，成员列表中的 `"alice"` 会显示特殊的拥有者标识（与普通成员不同的指示器样式）

---

## 自定义链接

```json
{
  "customLinks": {
    "enabled": true,
    "links": [
      {
        "label": "GitHub",
        "url": "https://github.com/your-username",
        "icon": "FaGithub"
      }
    ]
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `enabled` | 否 | 是否显示自定义链接区域 |
| `links` | 否 | 链接数组，每个链接包含 `label`、`url`、`icon` |

### 可用图标

项目使用 [Lucide React](https://lucide.dev) 和 [React Icons](https://react-icons.github.io/react-icons) 图标库：

| 前缀 | 图标库 | 示例 |
|------|--------|------|
| `Fa` | Font Awesome | `FaGithub`, `FaEnvelope`, `FaLinkedin`, `FaDiscord` |
| `Si` | Simple Icons | `SiX` (Twitter/X), `SiDiscord`, `SiGithub` |
| `Lu` | Lucide | `LuExternalLink`, `LuMail`, `LuGlobe` |

---

## Tailwind CSS 类名参考

### 字体大小

| 类名 | 移动端 | 大屏 |
|------|--------|------|
| `text-xs` | 12px | - |
| `text-sm` | 14px | - |
| `text-base` | 16px | - |
| `text-lg` | 18px | - |
| `text-xl` | 20px | - |
| `text-2xl` | 24px | - |
| `text-3xl` | 30px | - |
| `text-4xl` | 36px | - |
| `text-5xl` | 48px | 48px |
| `text-6xl` | 48px | 60px |
| `text-7xl` | 48px | 72px |
| `text-8xl` | 48px | 96px |
| `text-9xl` | 48px | 128px |

响应式前缀：`md:`（≥768px）、`lg:`（≥1024px）、`xl:`（≥1280px）

### 颜色

| 颜色类示例 | 说明 |
|------------|------|
| `text-white` | 纯白 |
| `text-gray-300` | 浅灰色 |
| `text-green-400` | 绿色 |
| `text-blue-500` | 蓝色 |
| `bg-black/50` | 黑色 50% 透明度 |
| `bg-white/10` | 白色 10% 透明度 |
| `border-white/20` | 白色边框 20% 透明度 |

### 字重

| 类名 | 字重 |
|------|------|
| `font-thin` | 100 |
| `font-extralight` | 200 |
| `font-light` | 300 |
| `font-normal` | 400 |
| `font-medium` | 500 |
| `font-semibold` | 600 |
| `font-bold` | 700 |
| `font-extrabold` | 800 |
| `font-black` | 900 |

---

## 完整示例

```json
{
  "baseAccount": "deepwn",
  "type": "org",
  "website": {
    "title": "deePwn = Developer + Researcher",
    "favicon": "/deepwn.png"
  },
  "typography": {
    "name": {
      "enabled": false,
      "fontSize": "text-5xl",
      "fontSizeMd": "md:text-7xl",
      "fontSizeLg": "lg:text-8xl",
      "fontWeight": "font-bold"
    },
    "bio": {
      "enabled": true,
      "fontSize": "text-lg",
      "fontSizeMd": "md:text-xl",
      "fontWeight": "font-medium",
      "textColor": "text-gray-300",
      "glow": {
        "enabled": true,
        "intensity": "low"
      },
      "animation": {
        "enabled": true,
        "type": "text-glow"
      }
    },
    "logo": {
      "enabled": true,
      "shape": "none",
      "src": "/deepwn1-01.png",
      "scale": 2,
      "onlineIndicator": {
        "enabled": false,
        "color": "green"
      }
    },
    "team": {
      "enabled": true,
      "label": "Open to Collaborations",
      "fontSize": "text-xl",
      "fontSizeMd": "md:text-2xl",
      "fontWeight": "font-medium",
      "textColor": "text-white",
      "background": "bg-white/10",
      "borderColor": "border-white/20",
      "indicator": {
        "enabled": true,
        "color": "green",
        "animate": true
      }
    }
  },
  "repoFilter": {
    "hidden_repos": ["deepwn.github.io"]
  },
  "customLinks": {
    "enabled": true,
    "links": [
      { "label": "GitHub", "url": "https://github.com/deepwn", "icon": "FaGithub" },
      { "label": "Email", "url": "mailto:admin@deepwn.com", "icon": "FaEnvelope" },
      { "label": "X (Twitter)", "url": "https://x.com/evil7x", "icon": "SiX" },
      { "label": "Contact", "url": "https://github.com/orgs/deepwn/discussions", "icon": "FaComments" }
    ]
  }
}
```
