# 跨境电商 AI 工作流调研问卷

精粹科技电商项目

这是一个可直接部署的静态网页问卷，用于按部门收集跨境电商团队的业务流程、AI 可改造节点、人工审核节点和数据沉淀现状。

## 文件

- `index.html`：入口页面
- `styles.css`：页面样式
- `survey-data.js`：浏览器可直接加载的问题数据，本地双击 `index.html` 也能渲染
- `app.js`：表单交互、Supabase 提交、导出逻辑
- `survey-schema.mjs`：Node 测试使用的问题结构镜像
- `app.mjs`：早期模块版入口，当前页面不再依赖它
- `supabase-schema.sql`：Supabase 建表和 RLS 策略
- `tests/survey-schema.test.mjs`：基础结构测试

## 使用方式

本地预览可以直接打开 `index.html`，也可以启动静态服务器：

```bash
python3 -m http.server 8765
```

然后访问：

```text
http://localhost:8765/index.html
```

## GitHub Pages + Supabase

推荐部署方式：

1. 在 Supabase 新建项目。
2. 打开 Supabase SQL Editor，执行 `supabase-schema.sql`。
3. 在 Supabase Project Settings -> API 中复制：
   - Project URL
   - anon public key
4. 打开 `app.js`，填写：

```js
const SUPABASE_URL = "https://你的项目.supabase.co";
const SUPABASE_ANON_KEY = "你的 anon public key";
```

5. 把这些静态文件提交到 GitHub 仓库。
6. 在 GitHub 仓库 Settings -> Pages 中启用 GitHub Pages。
7. 把生成的网址发给客户填写。

当前版本即使没有配置 Supabase，也会把提交保存在填写者浏览器的 `localStorage` 中，并支持导出 JSON / CSV。正式多人收集时建议配置 Supabase。

## 验证

```bash
node --check app.js
node --check survey-data.js
node tests/survey-schema.test.mjs
```
