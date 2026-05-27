# KMS Web — 知识管理系统前端

Second Brain 风格的知识管理系统前端，基于 Next.js 16 + React 19 + Tailwind CSS 4。

![登录页](./docs/login.png) ![主页](./docs/home.png)

## 功能

- 🔐 JWT 认证（登录/注册/路由守卫）
- 📂 文件树浏览（自动展开目录）
- 📝 Markdown 笔记编辑器
- 🔍 全文搜索（实时搜索 + 结果高亮）
- 🕸️ 知识图谱可视化
- 📅 日记视图
- 🎨 深色主题（Second Brain 设计规范）

## 快速开始

### 前置条件

- Node.js >= 18
- 后端 [kms-server](https://github.com/Learner-XU/kms-server) 已运行在 `:8000`

### 安装运行

```bash
git clone git@github.com:Learner-XU/kms-web.git
cd kms-web
npm install
npx next dev -p 3456 -H 0.0.0.0
```

访问 **http://localhost:3456** → 注册账户 → 开始使用。

### 生产构建

```bash
npm run build
npx next start -p 3456 -H 0.0.0.0
```

## 技术栈

| 依赖 | 版本 |
|------|------|
| Next.js | 16.2.6 |
| React | 19.2.4 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Zustand | 状态管理 |
| Lucide React | 图标库 |
| Playwright | E2E 测试 |

## 项目结构

```
src/
├── app/
│   ├── page.tsx            # 主页（四栏布局）
│   ├── login/page.tsx      # 登录页
│   ├── register/page.tsx   # 注册页
│   └── layout.tsx          # 全局布局 + AuthGuard
├── components/
│   ├── AuthGuard.tsx       # 路由守卫（未登录跳转 /login）
│   ├── LeftNav.tsx         # 左侧导航（工作区/空间/收藏/标签/用户）
│   ├── FileBrowser.tsx     # 文件树浏览器（自动展开 + 搜索）
│   ├── MainEditor.tsx      # 笔记编辑器（查看/编辑/保存）
│   ├── RightSidebar.tsx    # 右侧边栏（反向链接/元数据）
│   ├── GraphView.tsx       # 知识图谱
│   ├── DiaryView.tsx       # 日记视图
│   └── NewNoteDialog.tsx   # 新建笔记对话框
└── lib/
    ├── api.ts              # API 客户端（自动带 Token，401 跳转）
    └── store.ts            # Zustand 全局状态
```

## API 代理

前端通过 Next.js rewrites 将 `/api/*` 代理到后端，局域网设备访问无需 CORS 配置：

```ts
// next.config.ts
rewrites: [
  { source: "/api/:path*", destination: "http://localhost:8000/api/:path*" }
]
```

## 环境配置

局域网访问需配置 `allowedDevOrigins`：

```ts
// next.config.ts
allowedDevOrigins: ["192.168.x.x"]  // 你的局域网 IP
```

## License

MIT
