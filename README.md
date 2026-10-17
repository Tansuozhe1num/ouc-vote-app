# 同频 · CAMPUS 小程序端

这是 `vote` 校园找搭子服务的 Taro 微信小程序端，复用现有 Spring Boot HTTP 接口，不使用 CloudBase 数据库或云函数。

## 页面

- 发现：分类、搜索、分页、下拉刷新、发布入口
- 随机搭子：登录后随机抽取并查看动态或发起私信
- 热榜：按服务端热度排序，支持刷新和详情
- 消息：会话列表、聊天、手动刷新
- 我的：个人资料、我的动态、服务设置
- 二级页：动态详情、登录注册、发布、个人资料、聊天、服务设置

## 开发

```bash
npm install
npm run dev:weapp
```

构建产物默认写入 `dist/`，微信开发者工具打开项目根目录即可（`project.config.json` 的 `miniprogramRoot` 已指向 `dist/`）。

## 连接后端

首次进入小程序后，从“我的 → 服务设置”填入后端地址。正式环境必须使用 HTTPS；本机调试可使用 `http://localhost:<port>` 或 `http://127.0.0.1:<port>`。

后端登录成功后通过 `campus_token` Cookie 返回 JWT，小程序会提取该值并在后续请求中发送 `Authorization: Bearer ...`。切换服务地址会清除旧会话。

## 联调前提

微信开发者工具需要把后端域名加入 `request 合法域名`，生产环境需要可访问的 HTTPS 域名。当前工作区没有安装 `node_modules`，因此构建需先执行 `npm install`。
