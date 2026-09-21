/* 哥伦比娅的旅行 · 本地调试命令栏
 * 只调用游戏现有的存档、旅途、家园与田地接口，不建立第二套游戏状态。
 */
(function (root) {
  'use strict';
  var NT = root.NT;
  if (!NT || !NT.app) return;
  var app = NT.app;

  app.commandHistory = [];
  app.commandHistoryIndex = 0;
  app.commandNextCompanionId = null;
  app.commandNextEventId = null;
  app.commandNextJourneyEventId = null;

  function el(id) { return document.getElementById(id); }
  function lower(v) { return String(v || '').toLowerCase(); }
  function tokenize(text) {
    var out = [], re = /"([^"]*)"|'([^']*)'|([^\s]+)/g, m;
    while ((m = re.exec(text))) out.push(m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]));
    return out;
  }
  function find(list, value) {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    var key = lower(value);
    for (var i = 0; i < list.length; i++) {
      if (lower(list[i].id) === key || lower(list[i].name) === key || lower(list[i].fullName) === key) return list[i];
    }
    return null;
  }
  function label(x) { return x ? x.name + ' (' + x.id + ')' : '无'; }
  function listText(list) { return list.map(function (x) { return x.id + '=' + x.name; }).join('、'); }
  function saveAndRender() { NT.store.save(app.save); app.render(); }

  app.commandWrite = function (message, kind) {
    var output = el('command-output');
    if (!output) return;
    var prefix = kind === 'error' ? '错误：' : (kind === 'ok' ? '完成：' : '');
    output.textContent += (output.textContent ? '\n' : '') + prefix + String(message);
    var lines = output.textContent.split('\n');
    if (lines.length > 160) output.textContent = lines.slice(lines.length - 160).join('\n');
    output.scrollTop = output.scrollHeight;
  };

  app.openCommandBar = function () {
    var panel = el('command-panel'), input = el('command-input');
    if (!panel) return;
    panel.hidden = false;
    if (input) setTimeout(function () { input.focus(); input.select(); }, 0);
  };
  app.closeCommandBar = function () {
    var panel = el('command-panel');
    if (panel) panel.hidden = true;
  };
  app.toggleCommandBar = function () {
    var panel = el('command-panel');
    if (!panel || panel.hidden) app.openCommandBar(); else app.closeCommandBar();
  };

  function allPostcardEvents() {
    var out = (NT.data.events || []).slice(), seen = {};
    out.forEach(function (e) { seen[e.id] = true; });
    (NT.data.destinations || []).forEach(function (d) {
      (NT.gacha.regionEvents(d.id) || []).forEach(function (e) {
        if (!seen[e.id]) { seen[e.id] = true; out.push(e); }
      });
    });
    return out;
  }

  function statusText() {
    var s = app.save, trip = s.activeTrip;
    var state = NT.home.state(s);
    var visitor = NT.home.visitorCompanion(s);
    return [
      '场景：' + app.screen + (app.modal ? ' / ' + app.modal : ''),
      '居家状态：' + label(state),
      '来访角色：' + label(visitor),
      '探索：' + (trip ? label(NT.data.destinationById(trip.destinationId)) + '，剩余 ' + Math.ceil(NT.clock.remaining(trip) / 1000) + ' 秒' : '无'),
      '下次指定偶遇：' + label(NT.data.companionById(app.commandNextCompanionId)),
      '下次指定见闻：' + label(find(allPostcardEvents(), app.commandNextEventId)),
      '下次过程事件：' + label(find(NT.data.journeyEvents || [], app.commandNextJourneyEventId)),
      '明信片：' + (s.album || []).length + ' 张'
    ].join('\n');
  }

  var HELP = [
    '基础：help / commands / clear / close / status',
    '界面：hall / home / backyard / bedroom / farm / kitchen / toys / chat / album / store / settings / outdoor / waiting / result',
    '探索：trip random [角色]；trip region <地区> [角色]；trip bearing <n|s|e|w|c|any> [角色]',
    '探索控制：trip finish [秒]；trip cancel confirm；trip result',
    '指定偶遇：encounter <角色ID或名称>；encounter random；encounter list',
    '指定见闻：event <事件ID或名称>；event random；event list',
    '过程事件：journey-event <事件ID或名称>；journey-event random；journey-event list',
    '角色来访：visitor <角色ID或名称>；visitor random；visitor clear；visitor list',
    '主角状态：state <状态ID或名称>；state random；state list；poke',
    '田地：farm list；farm status；farm plant <田块> <作物>；farm ready <田块|all>；farm harvest <田块|all>',
    '其他：save / export / assets / probe / sound <on|off> / bar / rotate / demo / reset confirm',
    '参数可写 ID 或中文名；含空格的名称请放在双引号中。完整清单见《命令栏使用说明.txt》。'
  ].join('\n');

  function openModal(id) {
    if (id === 'waiting' && !app.save.activeTrip) throw new Error('当前没有进行中的探索。');
    app.screen = 'home';
    app.modal = id;
    app.fieldSheet = null;
    app.render();
    return '已打开 ' + id;
  }

  function startTrip(mode, targetArg, companionArg) {
    if (app.save.activeTrip) throw new Error('已有探索正在进行，请先用 trip finish 完成或等待归来。');
    var opts = { mode: mode, dishId: 'none', rareItemIds: [], now: Date.now() };
    if (mode === 'region') {
      var dest = find(NT.data.destinations || [], targetArg);
      if (!dest) throw new Error('找不到地区：' + targetArg + '。可用 trip region list 查看。');
      opts.regionId = dest.id;
      opts.forceRegion = true;
    } else if (mode === 'bearing') {
      var dirs = { n: 1, s: 1, e: 1, w: 1, c: 1, any: 1, '北': 1, '南': 1, '东': 1, '西': 1, '中': 1, '随机': 1 };
      if (!dirs[targetArg]) throw new Error('路线应为 n/s/e/w/c/any（也可写北/南/东/西/中/随机）。');
      opts.bearingId = ({ '北': 'n', '南': 's', '东': 'e', '西': 'w', '中': 'c', '随机': 'any' })[targetArg] || targetArg;
    }
    var cid = app.commandNextCompanionId;
    if (companionArg) {
      var comp = find(NT.data.encounterCompanions(), companionArg);
      if (!comp) throw new Error('该角色不能作为旅途偶遇角色：' + companionArg);
      cid = comp.id;
    }
    if (cid) opts.forceCompanionId = cid;
    if (app.commandNextEventId) opts.forceEventId = app.commandNextEventId;
    if (opts.forceEventId) {
      var selectedEvent = find(allPostcardEvents(), opts.forceEventId);
      if (selectedEvent && selectedEvent.regionLocal) {
        if (mode !== 'region') throw new Error('地区专属见闻需要使用 trip region 指定对应地区。');
        var validLocal = NT.gacha.regionEvents(opts.regionId).some(function (ev) { return ev.id === selectedEvent.id; });
        if (!validLocal) throw new Error('见闻 ' + selectedEvent.name + ' 不属于所选地区。');
      }
    }
    if (app.commandNextJourneyEventId) opts.forceJourneyEventId = app.commandNextJourneyEventId;
    var result = NT.clock.depart(app.save, opts);
    if (!result.ok) throw new Error(result.error);
    app.commandNextCompanionId = null;
    app.commandNextEventId = null;
    app.commandNextJourneyEventId = null;
    app.modal = 'waiting';
    NT.store.save(app.save);
    app.render();
    return '已开始探索：' + label(NT.data.destinationById(result.trip.destinationId)) +
      (result.trip.companionId ? '，将遇见 ' + label(NT.data.companionById(result.trip.companionId)) : '');
  }

  function runTrip(args) {
    var sub = lower(args[0]);
    if (!sub || sub === 'status') return statusText();
    if (sub === 'random') return startTrip('random', null, args[1]);
    if (sub === 'region') {
      if (lower(args[1]) === 'list') return listText(NT.data.destinations || []);
      if (!args[1]) throw new Error('用法：trip region <地区ID或名称> [偶遇角色]');
      return startTrip('region', args[1], args[2]);
    }
    if (sub === 'bearing') {
      if (!args[1]) throw new Error('用法：trip bearing <n|s|e|w|c|any> [偶遇角色]');
      return startTrip('bearing', lower(args[1]), args[2]);
    }
    if (sub === 'finish') {
      if (!app.save.activeTrip) throw new Error('当前没有进行中的探索。');
      var seconds = args[1] === undefined ? 0 : Number(args[1]);
      if (!isFinite(seconds) || seconds < 0) throw new Error('秒数必须是大于等于 0 的数字。');
      if (seconds > 0) {
        app.save.activeTrip.dueAt = Date.now() + Math.round(seconds * 1000);
        NT.store.save(app.save); app.render();
        return '探索将在 ' + seconds + ' 秒后完成。';
      }
      app.save.activeTrip.dueAt = Date.now() - 1;
      var settled = app.settleIfDue(Date.now());
      app.render();
      return settled ? '探索已立即完成，结果弹窗已打开。' : '探索未能结算。';
    }
    if (sub === 'cancel') {
      if (lower(args[1]) !== 'confirm') throw new Error('取消探索不会返还已消耗物品；确认请输入 trip cancel confirm');
      if (!app.save.activeTrip) throw new Error('当前没有进行中的探索。');
      app.save.activeTrip = null; app.modal = null; saveAndRender();
      return '已取消当前探索（已消耗物品不会返还）。';
    }
    if (sub === 'result') {
      var album = app.save.album || [];
      if (!album.length) throw new Error('还没有已完成的探索结果。');
      app.viewing = album[album.length - 1]; app.modal = 'result'; app.screen = 'home'; app.render();
      return '已打开最近一次探索结果。';
    }
    throw new Error('未知 trip 子命令。输入 help 查看用法。');
  }

  function runVisitor(args) {
    var sub = args.join(' '), key = lower(sub);
    var list = NT.data.visitingCompanions();
    if (!sub || key === 'list') return listText(list);
    if (key === 'clear' || key === 'off') {
      app.save.home.visitor = null; saveAndRender(); return '来访角色已离开。';
    }
    var comp;
    if (key === 'random') comp = list[Math.floor(Math.random() * list.length)];
    else comp = find(list, sub);
    if (!comp) throw new Error('找不到可来访角色：' + sub);
    NT.home.debugAddVisitor(app.save, comp.id, Date.now());
    app.screen = 'home'; app.modal = null; saveAndRender();
    return label(comp) + ' 已来到家园。';
  }

  function runEncounter(args) {
    var sub = args.join(' '), key = lower(sub), list = NT.data.encounterCompanions();
    if (!sub || key === 'list') return listText(list);
    if (key === 'random' || key === 'off' || key === 'clear') {
      app.commandNextCompanionId = null; return '下一次探索恢复随机偶遇。';
    }
    var comp = find(list, sub);
    if (!comp) throw new Error('找不到可偶遇角色：' + sub);
    app.commandNextCompanionId = comp.id;
    return '下一次探索将指定遇见 ' + label(comp) + '。也可直接使用 trip ... <角色>。';
  }

  function runEvent(args) {
    var sub = args.join(' '), key = lower(sub), list = allPostcardEvents();
    if (!sub || key === 'list') return listText(list);
    if (key === 'random' || key === 'off' || key === 'clear') {
      app.commandNextEventId = null; return '下一次探索恢复随机见闻。';
    }
    var ev = find(list, sub);
    if (!ev) throw new Error('找不到旅途见闻：' + sub);
    app.commandNextEventId = ev.id;
    return '下一次探索将指定见闻 ' + label(ev) + '。地区专属事件需与目的地一致。';
  }

  function runJourneyEvent(args) {
    var sub = args.join(' '), key = lower(sub), list = NT.data.journeyEvents || [];
    if (!sub || key === 'list') return listText(list);
    if (key === 'random' || key === 'off' || key === 'clear') {
      app.commandNextJourneyEventId = null; return '下一次探索恢复随机过程事件。';
    }
    var ev = find(list, sub);
    if (!ev) throw new Error('找不到旅途过程事件：' + sub);
    app.commandNextJourneyEventId = ev.id;
    return '下一次探索的首个过程事件将指定为 ' + label(ev) + '。';
  }

  function runState(args) {
    var sub = args.join(' '), key = lower(sub), list = NT.data.nahidaStates || [];
    if (!sub || key === 'list') return listText(list);
    var st = key === 'random' ? list[Math.floor(Math.random() * list.length)] : find(list, sub);
    if (!st) throw new Error('找不到状态：' + sub);
    var now = Date.now(), old = NT.home.spot(app.save);
    app.save.home.nahida.prevSpotId = old && old.id ? old.id : 'yard';
    app.save.home.nahida.stateId = st.id;
    app.save.home.nahida.since = now;
    app.save.home.nahida.until = now + Math.round(st.dwell * 60000);
    saveAndRender();
    return '哥伦比娅已切换为 ' + label(st) + '。';
  }

  function runFarm(args) {
    var sub = lower(args[0]);
    if (!sub || sub === 'list') return '田块：' + listText(NT.data.fields || []) + '\n作物：' + listText(NT.data.crops || []);
    if (sub === 'status') {
      return (NT.data.fields || []).map(function (f) {
        var st = NT.farm.status(app.save, f.id, Date.now());
        return f.id + ' ' + f.name + '：' + (st.state === 'empty' ? '空闲' : label(st.crop) + ' / ' + st.state);
      }).join('\n');
    }
    if (sub === 'plant') {
      var field = find(NT.data.fields || [], args[1]), crop = find(NT.data.crops || [], args[2]);
      if (!field || !crop) throw new Error('用法：farm plant <田块ID或名称> <作物ID或名称>');
      var planted = NT.farm.plant(app.save, field.id, crop.id, Date.now());
      if (!planted.ok) throw new Error(planted.error);
      app.screen = 'farm'; saveAndRender(); return '已在 ' + label(field) + ' 种下 ' + label(crop) + '。';
    }
    if (sub === 'ready') {
      var readyIds = lower(args[1]) === 'all' ? NT.config.farm.plots.slice() : [args[1]];
      if (!args[1]) throw new Error('用法：farm ready <田块ID|all>');
      var changed = 0;
      readyIds.forEach(function (id) {
        var field = find(NT.data.fields || [], id), slot;
        if (field) { slot = NT.farm.slot(app.save, field.id); if (slot.cropId) { slot.readyAt = Date.now() - 1; changed++; } }
      });
      saveAndRender(); return '已催熟 ' + changed + ' 块田。';
    }
    if (sub === 'harvest') {
      if (!args[1]) throw new Error('用法：farm harvest <田块ID|all>');
      if (lower(args[1]) === 'all') {
        var all = NT.farm.harvestAll(app.save, Date.now());
        all.forEach(function (x) { NT.achievements.recordHarvest(app.save, x); });
        saveAndRender(); app.checkAchievements(); return '已收获 ' + all.length + ' 块田。';
      }
      var f = find(NT.data.fields || [], args[1]);
      if (!f) throw new Error('找不到田块：' + args[1]);
      var harvested = NT.farm.harvest(app.save, f.id, Date.now());
      if (!harvested) throw new Error('这块田没有可收获的成熟作物。');
      NT.achievements.recordHarvest(app.save, harvested);
      saveAndRender(); app.checkAchievements(); return '已收获 ' + harvested.itemName + ' ×' + harvested.qty + '。';
    }
    throw new Error('未知 farm 子命令。');
  }

  app.executeCommand = function (text) {
    text = String(text || '').trim();
    if (!text) return;
    app.commandHistory.push(text);
    if (app.commandHistory.length > 50) app.commandHistory.shift();
    app.commandHistoryIndex = app.commandHistory.length;
    app.commandWrite('> ' + text);
    var parts = tokenize(text), cmd = lower(parts.shift()), result;
    try {
      if (cmd === 'help' || cmd === 'commands' || cmd === '?') result = HELP;
      else if (cmd === 'clear') { var out = el('command-output'); if (out) out.textContent = ''; return; }
      else if (cmd === 'close' || cmd === 'exit') { app.closeCommandBar(); return; }
      else if (cmd === 'status') result = statusText();
      else if (cmd === 'home') { app.go('home'); result = '已回到家园。'; }
      else if (cmd === 'backyard') { app.go('backyard'); result = '已进入后院。'; }
      else if (cmd === 'bedroom') { app.go('bedroom'); result = '已进入卧室。'; }
      else if (cmd === 'farm' && !parts.length) { app.go('farm'); result = '已进入田地。'; }
      else if (cmd === 'farm') result = runFarm(parts);
      else if (cmd === 'kitchen' || cmd === 'toys' || cmd === 'chat' || cmd === 'album' || cmd === 'store' || cmd === 'settings' || cmd === 'outdoor' || cmd === 'waiting') result = openModal(cmd);
      else if (cmd === 'result') result = runTrip(['result']);
      else if (cmd === 'trip') result = runTrip(parts);
      else if (cmd === 'visitor') result = runVisitor(parts);
      else if (cmd === 'encounter') result = runEncounter(parts);
      else if (cmd === 'event') result = runEvent(parts);
      else if (cmd === 'journey-event' || cmd === 'journeyevent') result = runJourneyEvent(parts);
      else if (cmd === 'state') result = runState(parts);
      else if (cmd === 'poke') { app.poke(); result = '已触发点击互动。'; }
      else if (cmd === 'save') { NT.store.save(app.save); result = '当前进度已保存。'; }
      else if (cmd === 'export') { app.exportSave(); result = '已请求导出存档。'; }
      else if (cmd === 'assets' || cmd === 'probe') {
        var ast = NT.assets.status(), missing = NT.assets.missing();
        result = '素材：总计 ' + ast.total + '，已加载 ' + ast.ready + '，失败 ' + ast.error +
          (missing.length ? '\n失败项：' + missing.join('、') : '\n没有加载失败的素材。');
      }
      else if (cmd === 'sound') {
        if (lower(parts[0]) !== 'on' && lower(parts[0]) !== 'off') throw new Error('用法：sound <on|off>');
        app.save.settings.sound = lower(parts[0]) === 'on'; NT.sfx.setEnabled(app.save.settings.sound);
        NT.store.save(app.save); result = '音效已' + (app.save.settings.sound ? '开启。' : '关闭。');
      }
      else if (cmd === 'bar') { app.toggleBar(); result = '底部菜单已切换。'; }
      else if (cmd === 'rotate') { app.save.settings.rotateHintAt = 0; app.maybeShowRotateHint(); result = '已触发横屏提示。'; }
      else if (cmd === 'demo') { app.demoSeed(); app.render(); result = '试玩数据已写入。'; }
      else if (cmd === 'reset') {
        if (lower(parts[0]) !== 'confirm') throw new Error('清空全部进度需输入 reset confirm');
        app.resetAll(); result = '全部进度已清空。';
      }
      else throw new Error('未知命令：' + cmd + '。输入 help 查看全部命令。');
      if (result) app.commandWrite(result, 'ok');
    } catch (err) {
      app.commandWrite(err && err.message ? err.message : String(err), 'error');
      if (NT.sfx) NT.sfx.play('error');
    }
  };

  app.bindCommands = function () {
    if (app._commandsBound) return;
    app._commandsBound = true;
    var toggle = el('command-toggle'), close = el('command-close'), form = el('command-form'), input = el('command-input');
    if (toggle) toggle.addEventListener('click', app.toggleCommandBar);
    if (close) close.addEventListener('click', app.closeCommandBar);
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input) return;
      var value = input.value; input.value = ''; app.executeCommand(value); input.focus();
    });
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault();
      if (e.key === 'ArrowUp') app.commandHistoryIndex = Math.max(0, app.commandHistoryIndex - 1);
      else app.commandHistoryIndex = Math.min(app.commandHistory.length, app.commandHistoryIndex + 1);
      input.value = app.commandHistory[app.commandHistoryIndex] || '';
    });
    document.addEventListener('keydown', function (e) {
      var target = e.target;
      var editing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.code === 'Backquote' || e.key === '`' || e.key === '~') && !editing) {
        e.preventDefault(); app.toggleCommandBar();
      } else if (e.key === 'Escape' && el('command-panel') && !el('command-panel').hidden) {
        e.preventDefault(); app.closeCommandBar();
      }
    });
  };
})(typeof window !== 'undefined' ? window : this);
