/* 哥伦比娅的旅行 · 旅途过程事件
 * km 字段保留为兼容旧引擎的“旅途点”数值，不表示现实公里。
 */
(function (root) {
  'use strict';
  var NT = (root.NT = root.NT || {});
  NT.data = NT.data || {};

  NT.data.companionHome = {
    collei: 'sumeru', tighnari: 'sumeru', cyno: 'sumeru', nilou: 'sumeru',
    dehya: 'sumeru', klee: 'mondstadt', qiqi: 'liyue', varka: 'mondstadt',
    nicole: 'fontaine', durin: 'mondstadt', wanderer: 'sumeru'
  };

  NT.data.journeyEvents = [
    { id: 'ref_lift', kind: 'refill', weight: 9, km: [640, 980], name: '得到安全的同行帮助', text: '一名可靠的同行者确认了前方路线，替我们分担了一段路程。没有人询问不该知道的身份。' },
    { id: 'ref_orchard', kind: 'refill', weight: 9, km: [470, 750], name: '采到可以分享的果实', text: '在得到允许后采了一些新鲜果实。先分给月灵，再留下足够的路粮。' },
    { id: 'ref_share', kind: 'refill', weight: 9, km: [680, 1050], needCompanion: true, name: '同伴分享了干粮', text: '{companion}把包里的食物分成两份，说一个人吃不完。' },
    { id: 'ref_market', kind: 'refill', weight: 9, km: [520, 840], name: '在聚集地帮忙', text: '在聚集地帮忙整理了一会儿。离开时，大家坚持让我带上一份食物。' },
    { id: 'ref_noodle', kind: 'refill', weight: 9, km: [500, 800], name: '得到一份热食', text: '准备食物的人看出我们走了很远，给我们添了一份热食。' },
    { id: 'ref_eggs', kind: 'refill', weight: 9, km: [430, 690], name: '收到路人的善意', text: '在安全的屋檐下休息时，主人递来一份路上食用的食物。我们道谢后留下了回礼。' },

    { id: 'set_river', kind: 'setback', weight: 4, km: [0, 0], forceReturn: true, soaked: true, name: '在水边失足', text: '过水时脚下一滑。人没有受伤，只是需要停下来整理装备。' },
    { id: 'set_bag', kind: 'setback', weight: 7, km: [220, 420], name: '包被小动物翻开了', text: '休息时，一只好奇的小动物把包翻开了。食物少了一些，月灵找回了最重要的物品。' },
    { id: 'set_wrongway', kind: 'setback', weight: 7, km: [180, 380], name: '走错了路线', text: '走出一段才发现方向不对。回头并不可耻，只是需要多记住一条路。' },
    { id: 'set_rain', kind: 'setback', weight: 6, km: [150, 320], name: '被雨困住了', text: '雨势太大，只能在安全处等待。等云层散开时，天已经黑了。' },
    { id: 'set_shoe', kind: 'setback', weight: 5, km: [200, 400], name: '装备需要修理', text: '装备出现了小问题，只能放慢脚步。桑多涅大概会说，出发前检查得不够仔细。' },

    { id: 'red_invite', kind: 'redirect', weight: 4, needCompanion: true, useCompanionHome: true, name: '被邀请前往另一处', text: '{companion}说，既然已经到这里，不如去另一处看看。我确认过路线后，同意改变方向。' },
    { id: 'red_poster', kind: 'redirect', weight: 4, randomNearby: true, name: '看到新的区域线索', text: '发现一份指向其他区域的线索。它没有要求我立刻出发，但值得写进计划。' },
    { id: 'red_road', kind: 'redirect', weight: 3, randomNearby: true, name: '前方暂时无法通行', text: '前方暂时无法通行。我们沿着月灵找到的安全路线绕行，抵达了另一处。' },
    { id: 'red_letter', kind: 'redirect', weight: 3, randomAny: true, name: '收到一封旅途信件', text: '在安全的驿站收到一封信。地址指向另一段旅程，我决定先确认寄信人的身份。' },

    { id: 'meet_1', kind: 'companion', weight: 18, name: '遇到了同伴', text: '路上碰到了{companion}。确认彼此的路线后，我们一起走了一段。' },

    { id: 'see_lights', kind: 'sight', weight: 8, name: '远处的灯', text: '天快黑时，远处亮起一片灯。有人在等晚归的人。' },
    { id: 'see_field', kind: 'sight', weight: 8, name: '路边的田', text: '路边作物随风起伏。这里的人知道怎样让土地继续生长。' },
    { id: 'see_bridge', kind: 'sight', weight: 7, name: '过了一座桥', text: '桥很长。走到中间时，我停下来观察水面和桥下的光。' },
    { id: 'see_market', kind: 'sight', weight: 7, name: '路过一个聚集地', text: '人们在这里交换食物、消息和下一段路的方向。' },
    { id: 'see_hill', kind: 'sight', weight: 7, name: '翻过一座山', text: '翻过去后回头看，来时的路像一条还会继续延伸的线。' },
    { id: 'see_star', kind: 'sight', weight: 6, name: '停下来看星星', text: '走累了就停下来。月灵替我数到一半，自己先睡着了。' }
  ];

  NT.data.journeyEventById = function (id) {
    var l = NT.data.journeyEvents;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  };

  NT.data.journeyEventsByKind = function (kind) {
    return NT.data.journeyEvents.filter(function (e) { return e.kind === kind; });
  };
})(typeof window !== 'undefined' ? window : this);
