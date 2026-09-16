/* 哥伦比娅的旅行 · 可选 AI 接口占位
 * 当前版本只启用完全离线的本地模板。
 * 不在前端接收、保存或发送 API Key；未来联网功能必须通过安全后端代理。
 * 关键闸门 noNewFacts：AI 若编造了事实卡以外的地点/角色，直接判废。
 */
(function (root) {
  'use strict';
  var NT = (root.NT = root.NT || {});
  var U = NT.util;

  var ai = (NT.text = NT.text || {});
  var api = {};

  /** 禁止出现的现实世界词汇（轻量黑名单，不求完备，够挡住最明显的越界） */
  var BLOCKWORDS = [
    '微信', 'QQ', '淘宝', '支付宝', '抖音', '快手', '华为', '小米', '苹果手机',
    '政府', '总统', '主席', '选举', '疫情', '股票', '基金', '贷款',
    '玩家', '系统提示', 'AI', '人工智能', '语言模型', '模型', 'prompt', '助手',
    '米哈游', '原神玩家', '现实', '手机', '电脑', '互联网', '游戏'
  ];

  api.buildMessages = function (fact) {
    var res = NT.trip.resolve(fact);
    var lines = [];
    lines.push('【事实】');
    lines.push('目的地：' + (res.destination ? res.destination.name + '（' + res.destination.desc + '）' : '未知'));
    if (res.companion) {
      lines.push('同伴：' + res.companion.name +
        '（称呼你为「' + res.companion.callNahida + '」，性格：' + res.companion.traits.join('/') + '）');
    } else {
      lines.push('同伴：无（独自一人）');
    }
    lines.push('天气/时段：' + (res.weather ? res.weather.name : '') + ' / ' + (res.timeOfDay ? res.timeOfDay.name : ''));
    for (var i = 0; i < res.events.length; i++) {
      lines.push('事件：' + res.events[i].name + '（' + res.events[i].desc + '）');
    }
    lines.push('稀有度：' + fact.rarity);
    lines.push('');
    lines.push('参考笔触（可以改写，但不可新增事实）：');
    lines.push(fact.text && fact.text.diary ? fact.text.diary : '');
    lines.push('');
    lines.push('【输出】只输出 JSON。');

    return [
      { role: 'system', content: NT.data.systemPrompt }
    ].concat(NT.data.fewShot || []).concat([
      { role: 'user', content: lines.join('\n') }
    ]);
  };

  /** 前端直连已禁用，保留方法是为了不破坏旧调用点。 */
  api.call = function () {
    return Promise.reject(new Error('AI 功能尚未启用；需先配置安全后端代理。'));
  };

  /**
   * 越界校验：输出里若出现事实卡以外的地点名或角色名，判废。
   */
  api.noNewFacts = function (text, fact) {
    if (!text) return false;
    var res = NT.trip.resolve(fact);
    var t = String(text);

    function mentions(name) {
      if (!name) return false;
      // 同时匹配全名与 · 之后的短名
      if (t.indexOf(name) >= 0) return true;
      var short = name.indexOf('·') >= 0 ? name.split('·')[1] : null;
      return short ? t.indexOf(short) >= 0 : false;
    }

    // 1. 不得出现其它目的地
    for (var i = 0; i < NT.data.destinations.length; i++) {
      var d = NT.data.destinations[i];
      if (res.destination && d.id === res.destination.id) continue;
      if (mentions(d.name)) return false;
    }
    // 2. 不得出现其它同伴
    for (var j = 0; j < NT.data.companions.length; j++) {
      var c = NT.data.companions[j];
      if (res.companion && c.id === res.companion.id) continue;
      if (t.indexOf(c.name) >= 0) return false;
    }
    // 3. 黑名单词汇
    for (var k = 0; k < BLOCKWORDS.length; k++) {
      if (t.indexOf(BLOCKWORDS[k]) >= 0) return false;
    }
    return true;
  };

  api.validate = function (obj, fact) {
    if (!obj || typeof obj !== 'object') return false;
    if (typeof obj.diary !== 'string' || obj.diary.length < 20) return false;
    if (typeof obj.postcardBack !== 'string' || !obj.postcardBack.length) return false;
    if (obj.diary.length > 600) return false;
    return api.noNewFacts(obj.diary, fact) && api.noNewFacts(obj.postcardBack, fact);
  };

  /**
   * 渲染文本：三层降级。永远 resolve，绝不 reject。
   * @returns Promise<{source, diary, postcardBack, error?}>
   */
  api.render = function (fact, settings, fallbackText) {
    var base = fallbackText || NT.text.templateRender(fact);
    return Promise.resolve(base);
  };

  /* ---------------- AI 角色扮演聊天 ---------------- */

  /** 聊天文本的轻量校验：不查事实卡，只挡现实词汇和明显出戏 */
  api.checkChatText = function (text) {
    if (!text) return false;
    var t = String(text).trim();
    if (t.length < 1 || t.length > 120) return false;
    for (var i = 0; i < BLOCKWORDS.length; i++) {
      if (t.indexOf(BLOCKWORDS[i]) >= 0) return false;
    }
    // 出戏痕迹
    if (/^(作为|我是一个|我是AI|很抱歉|对不起，我)/.test(t)) return false;
    return true;
  };

  /** 把"她现在的状况"拼成上下文，让 AI 接得上话 */
  api.chatContext = function (save) {
    var lines = [];
    var st = NT.home.state(save);
    var spot = NT.home.spot(save);
    lines.push('【她最近的状态】');
    lines.push('她现在在家里：' + st.name + '（位置：' + (spot ? spot.label : '') + '）。');
    var playing = NT.home.playingToy(save);
    if (playing) lines.push('她正在玩：' + playing.name + '。');
    lines.push('游戏所在地：' + NT.data.homeName(save.homeId) + '。');
    lines.push('已经带回来 ' + (save.album || []).length + ' 张明信片。');
    var ready = NT.farm.hasReady(save, Date.now());
    if (ready) lines.push('田里有东西熟了。');
    if (save.activeTrip) {
      var d = NT.data.destinationById(save.activeTrip.destinationId);
      lines.push('她正在外面旅行。');
    }
    return lines.join('\n');
  };

  /**
   * AI 角色扮演聊天。永远 resolve，失败回退到预设回应。
   * @param save 存档
   * @param playerText 玩家说的话
   * @param history [{me:bool, text:string}] 最近几句
   * @param fallback 预设回复
   * @returns Promise<{text, source, error?}>
   */
  api.chat = function (save, playerText, history, fallback) {
    var preset = { text: fallback, source: 'preset' };
    return Promise.resolve(preset);
  };

  /** 测试连接 */
  api.test = function (settings) {
    return Promise.resolve({ ok: false, error: 'AI 功能尚未启用；需先配置安全后端代理。' });
  };

  NT.text.ai = api;
})(typeof window !== 'undefined' ? window : this);
