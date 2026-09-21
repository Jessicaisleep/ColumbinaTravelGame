# 阶段 A 基线记录

日期：2026-09-21（Asia/Shanghai）

## 自检

在 `http://localhost:5173/开始游戏.html?selftest=1` 运行浏览器内置自检：

```text
自检结果: 230 通过 / 0 失败
```

命令行检查也通过：

- `npm install`：通过，依赖审计无漏洞
- `npm test`：10 项项目检查全部 PASS
- `npm run build`：Vite 构建及旧版兼容入口复制通过

## 基线截图

已捕获家园首屏基线截图：[baseline-game.png](./baseline-game.png)。截图中的真实场景、主角、按钮和横屏提示可用于后续回归对比；自检页面截图同时保留在任务会话中。重新生成方式为：

```text
npm run dev -- --host localhost
打开 /开始游戏.html?selftest=1
```

## 资源与存档基线

- `图片素材/图标-192.png`：真实 PNG，192×192。
- `图片素材/图标-512.png`：真实 PNG，512×512；两者均由新增的 `图片素材/图标.jpg` 生成，作为网页/PWA/主屏图标的统一来源。
- 既有存档键 `columbina-travel/save/v2` 与旧键迁移保留；关闭页面、切后台、戳角色、聊天和既有数据行为都会落盘。
- 工作区原有素材改动（`卧室.png`、`图标.jpg`、`浴室.png`，以及已删除的旧图标/未使用素材）未被还原或覆盖。
