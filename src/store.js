/* 哥伦比娅的旅行 · 存档
 * 存档里不存图片：明信片由事实卡确定性重绘。
 */
(function (root) {
  'use strict';
  var NT = (root.NT = root.NT || {});
  var C = NT.config;

  var store = {};
  var memory = {};
  var usingMemory = false;
  var loadedEmpty = false;

  function lsGet(k) { try { return root.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { root.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { root.localStorage.removeItem(k); return true; } catch (e) { return false; } }

  store.defaultSave = function () {
    return {
      version: 2,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),

      /** 游戏所在地固定为挪德卡莱 */
      homeId: 'nod_krai',
      homeChosen: true,

      activeTrip: null,
      album: [],
      companionAffinity: {},
      stats: { tripCount: 0, byDestination: {}, byCompanion: {} },

      /** 田地：背景图中的六块田各有一个独立槽位 */
      farm: {
        dry1: { cropId: null, plantedAt: 0, readyAt: 0 },
        dry2: { cropId: null, plantedAt: 0, readyAt: 0 },
        wet1: { cropId: null, plantedAt: 0, readyAt: 0 },
        dry3: { cropId: null, plantedAt: 0, readyAt: 0 },
        dry4: { cropId: null, plantedAt: 0, readyAt: 0 },
        wet2: { cropId: null, plantedAt: 0, readyAt: 0 }
      },

      /** 背包 */
      inventory: {
        ingredients: {},   // 食材 id -> 数量
        dishes: {},        // 料理 id -> 数量
        rare: {}           // 稀有道具 id -> 数量
      },

      /** 玩具：已拥有的 id 列表 */
      toys: [],

      /** 家：一个 16:9 的全屏世界，玩具摆在固定槽位上 */
      home: {
        placed: [],        // [{toyId, slot}]
        nahida: { stateId: 'idle', since: Date.now(), until: 0, prevSpotId: 'yard' },
        /** 来访的同伴。null = 家里没客人 */
        visitor: null,     // { companionId, stateId, since, until, arrivedAt, greeted }
        /** 上一个客人走的时间，用来做冷却 */
        lastVisitorAt: 0
      },

      settings: {
        aiEnabled: false,
        /** AI 仅保留功能开关；禁止把 API Key 写入存档或 localStorage。 */
        model: 'deepseek-chat',
        baseURL: 'https://api.deepseek.com',
        sound: true,
        /** 同伴来访时长：short / normal / long */
        visitorStay: 'normal'
      },

      seenIntro: false
    };
  };

  function deepDefaults(target, defaults) {
    for (var k in defaults) {
      if (!(k in target) || target[k] === null || target[k] === undefined) {
        target[k] = NT.util.clone(defaults[k]);
      } else if (typeof defaults[k] === 'object' && !Array.isArray(defaults[k]) && typeof target[k] === 'object') {
        deepDefaults(target[k], defaults[k]);
      }
    }
    return target;
  }

  store.load = function () {
    var currentRaw = usingMemory ? memory[C.SAVE_KEY] : lsGet(C.SAVE_KEY);
    var previousRaw = currentRaw ? null
      : (usingMemory ? memory[C.PREVIOUS_SAVE_KEY] : lsGet(C.PREVIOUS_SAVE_KEY));
    var raw = currentRaw || previousRaw;
    if (!raw) { loadedEmpty = true; return store.defaultSave(); }
    loadedEmpty = false;
    var s = NT.util.tryJSON(raw, null);
    if (!s || typeof s !== 'object') return store.defaultSave();
    deepDefaults(s, store.defaultSave());
    if (!Array.isArray(s.album)) s.album = [];
    if (!Array.isArray(s.toys)) s.toys = [];
    if (!Array.isArray(s.home.placed)) s.home.placed = [];
    /* 两块田旧存档 -> 六块田；只搬到尚未使用的第一块同类田。 */
    if (s.farm && s.farm.dry && !s.farm.dry1.cropId) s.farm.dry1 = NT.util.clone(s.farm.dry);
    if (s.farm && s.farm.wet && !s.farm.wet1.cropId) s.farm.wet1 = NT.util.clone(s.farm.wet);
    if (s.farm) { delete s.farm.dry; delete s.farm.wet; }
    /* 旧版现实地点存档迁移：家园统一回到挪德卡莱。 */
    if (!NT.data.destinationById || !NT.data.destinationById(s.homeId)) s.homeId = 'nod_krai';
    s.homeChosen = true;
    if (s.settings && Object.prototype.hasOwnProperty.call(s.settings, 'apiKey')) delete s.settings.apiKey;
    // 首次读到旧键时复制到新键。旧键暂不删除，出现异常时仍可回退。
    if (!currentRaw && previousRaw) {
      if (usingMemory) memory[C.SAVE_KEY] = raw;
      else lsSet(C.SAVE_KEY, raw);
    }
    return s;
  };

  store.save = function (s) {
    if (s.settings && Object.prototype.hasOwnProperty.call(s.settings, 'apiKey')) delete s.settings.apiKey;
    // 记录最近一次成功请求保存的时间，便于恢复/诊断；不改变既有存档键或数据结构。
    s.lastSeenAt = Date.now();
    var raw = JSON.stringify(s);
    if (usingMemory) { memory[C.SAVE_KEY] = raw; return true; }
    if (!lsSet(C.SAVE_KEY, raw)) {
      usingMemory = true;
      memory[C.SAVE_KEY] = raw;
      return false;
    }
    return true;
  };

  store.reset = function () {
    if (usingMemory) {
      delete memory[C.SAVE_KEY];
      delete memory[C.PREVIOUS_SAVE_KEY];
    } else {
      lsDel(C.SAVE_KEY);
      lsDel(C.PREVIOUS_SAVE_KEY);
    }
    return store.defaultSave();
  };

  store.isMemoryOnly = function () { return usingMemory; };
  /** 首次打开或浏览器清除站点数据后为 true，供界面提示玩家恢复备份。 */
  store.loadedEmpty = function () { return loadedEmpty; };
  store.exportJSON = function (s) { return JSON.stringify(s, null, 2); };

  /** 存档体积（字节），用于确认"不存图"的效果 */
  store.sizeOf = function (s) { return JSON.stringify(s).length; };

  NT.store = store;
})(typeof window !== 'undefined' ? window : this);
