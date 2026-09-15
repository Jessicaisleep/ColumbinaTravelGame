# Content Extraction Report

项目：现有旅行游戏 → 哥伦比娅内容审查阶段  
分支：feature/content-extraction-columbina  
原则：只提取、分类、标记、映射和审查；未改游戏运行内容、玩法或存档结构。

## 提取总览

- 源文件：123
- 中文文本行：3116
- 主角关键词引用：275
- 角色记录：12（8 个可用配角、1 个规划主角、旅行者关系引用、2 个孤儿角色引用）
- 正式目的地：17
- 地点记录：62
- 对白/叙述：251
- 事件：46
- 成就：36
- 资源：41
- 缺失资源：0
- [object Object] 游戏项目源码命中：0
- [object Object] 外部文案总表命中：114（只计数，未导入游戏内容）
- 引用/计数错误：5

## 核心结论

1. {PROTAGONIST_REWRITE: 原主角不只是名称；身份、性格、语气、行为、关系、Prompt、立绘和存档字段均绑定纳西妲}
2. {WORLD: 内容同时包含现实中国地理与《原神》角色/须弥神明设定，世界边界必须由用户确认}
3. {LOCATION_ORPHAN: kanas / 喀纳斯在 geo 和成就中存在，但 destinations 没有定义}
4. {AI_PROMPT_REWRITE: 日记与聊天 Prompt 明确指定纳西妲；其中禁止真实地名的约束又与真实目的地事实冲突}
5. {SAVE_MIGRATION: home.nahida 是真实存档字段；下一阶段改名必须兼容旧存档}
6. {ASSET_REPLACE: 主角三态图片必须重新制作；本阶段仅登记，不删除原图}

## 需要人工确认

- 哥伦比娅的人物身份、性格、语气、兴趣、行为禁区与玩家关系。
- 是否保留《原神》角色和设定；是否保留 17 个现实中国目的地。
- 现有家园、农场、厨房、玩具与访客是否符合新主角。
- 主角三态立绘、网页图标和家园背景的制作方向。
- kanas 是补充为正式目的地、改成别的地点，还是在确认后移除其成就引用。

## 可追溯资料

- content/original/source-inventory.json：原文件哈希清单。
- content/original/text-occurrences.json：逐行中文内容索引。
- content/original/protagonist-references.json：主角关键词逐行命中。
- content/original/world-references.json：世界观关键词逐行命中。
- content/original/extracted-runtime-data.json：运行时数据对象的原始提取。
- content/references.json：内容引用图与缺失引用。

## 阶段边界

本阶段没有把游戏正式改成哥伦比娅版本，也没有创作新剧情。下一阶段应按“人物设定确认 → 世界观确认 → 地点与关系确认 → 文案重写 → 资源替换 → 存档兼容迁移 → 游戏接入”的顺序进行。
