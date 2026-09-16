/* 哥伦比娅的旅行 · 提瓦特旅途见闻事件池 */
(function (root) {
  'use strict';
  var NT = (root.NT = root.NT || {});
  NT.data = NT.data || {};

  NT.data.events = [
    { id: 'found_flower', name: '发现一朵花', desc: '在风、月光或水汽交汇的地方发现一朵不熟悉的花，花瓣边缘有淡淡的光。', rarity: 'N', weight: 12, sticker: 'flower', mood: 'happy', fitsTags: ['wind', 'plain', 'moon', 'rainforest'] },
    { id: 'picked_seed', name: '捡到种子', desc: '一颗种子落在石缝里，像是被某种动物或风带到这里。', rarity: 'N', weight: 10, sticker: 'seed', mood: 'idle', fitsTags: ['plain', 'rainforest', 'natlan'] },
    { id: 'long_walk', name: '走了很久的路', desc: '路线比地图上看起来更长。走到后面腿有点沉，但沿途的景色没有重复。', rarity: 'N', weight: 12, sticker: 'map', mood: 'tired', fitsTags: [] },
    { id: 'shared_meal', name: '分吃了一顿饭', desc: '和旅行者或同伴把带来的食物分成几份，在安全的地方坐下来吃完。', rarity: 'N', weight: 11, sticker: 'cup', mood: 'happy', fitsTags: [] },
    { id: 'found_feather', name: '捡到一根羽毛', desc: '一根尚有余温的羽毛落在路边。附近没有看见它的主人。', rarity: 'N', weight: 9, sticker: 'feather', mood: 'idle', fitsTags: ['wind', 'plain', 'mountain'] },
    { id: 'took_photo', name: '留了一张影', desc: '记录下旅途中的风景、伙伴或月光；按下快门时正好有风。', rarity: 'N', weight: 10, sticker: 'camera', mood: 'happy', fitsTags: [] },
    { id: 'shelter_rain', name: '躲了一场雨', desc: '雨来得很快，同行的人在屋檐、树冠或岩壁下等待雨势变小。', rarity: 'R', weight: 8, sticker: 'leaf', mood: 'idle', fitsTags: ['rainforest', 'plain', 'fontaine'] },
    { id: 'night_stars', name: '看了很久的星星', desc: '夜色安静下来后，星星比白天看到的云还多。月灵也停在旁边一起看。', rarity: 'R', weight: 8, sticker: 'star', mood: 'idle', fitsTags: ['night', 'moon', 'mountain'] },
    { id: 'shell_on_beach', name: '捡到一只贝壳', desc: '在海岸或岛屿边捡到一枚贝壳，贴近耳边时只有很轻的潮声。', rarity: 'R', weight: 7, sticker: 'shell', mood: 'happy', fitsTags: ['sea', 'inazuma', 'fontaine', 'nod_krai'] },
    { id: 'snow_crystal', name: '接住一片雪', desc: '雪花落在手套上，还没看清形状就融化了。', rarity: 'R', weight: 7, sticker: 'snowflake', mood: 'idle', fitsTags: ['snow', 'nod_krai', 'mountain'] },
    { id: 'desert_mirage', name: '看见了幻影', desc: '远处仿佛有水或城市的倒影。走近后只剩风、沙和被光改变的轮廓。', rarity: 'R', weight: 6, sticker: 'sand', mood: 'tired', fitsTags: ['desert', 'sumeru'] },
    { id: 'old_book', name: '翻到一本旧书', desc: '在书架、遗迹或旅店角落翻到一本旧书，书页里夹着干掉的叶子。', rarity: 'R', weight: 7, sticker: 'book', mood: 'idle', fitsTags: ['city', 'home', 'sumeru', 'liyue'] },
    { id: 'street_food', name: '尝了当地的东西', desc: '在当地人的推荐下尝了一份食物，味道和准备方式都值得记下来。', rarity: 'R', weight: 8, sticker: 'candy', mood: 'happy', fitsTags: ['city'] },
    { id: 'climb_peak', name: '爬到了最高处', desc: '登上能够安全抵达的高处，从那里可以看见远处的路和同伴留下的灯光。', rarity: 'R', weight: 7, sticker: 'stone', mood: 'tired', fitsTags: ['mountain', 'snow', 'natlan'] },
    { id: 'found_lantern', name: '点亮了一盏灯', desc: '天黑得比预想中快。点亮灯后，同行者和晚归的月灵都找到了方向。', rarity: 'R', weight: 6, sticker: 'lantern', mood: 'idle', fitsTags: ['night', 'city', 'nod_krai'] },
    { id: 'met_traveler', name: '遇见另一个旅人', desc: '遇见一名路过的旅人。对方没有追问身份，只交换了方向与一句祝福。', rarity: 'R', weight: 6, sticker: 'bell', mood: 'happy', fitsTags: [] },
    { id: 'found_mushroom', name: '发现一丛蘑菇', desc: '发现颜色鲜艳的蘑菇。先观察、记录，并等待熟悉生态的同伴确认能否触碰。', rarity: 'R', weight: 6, sticker: 'mushroom', mood: 'idle', fitsTags: ['rainforest', 'nod_krai'] },
    { id: 'fish_jumped', name: '鱼跳出了水面', desc: '鱼跃出水面又恢复平静，只留下几圈扩散的波纹。', rarity: 'R', weight: 6, sticker: 'fish', mood: 'happy', fitsTags: ['sea', 'fontaine', 'liyue'] },
    { id: 'petal_rain', name: '花瓣落了一身', desc: '风停时，衣服和头发上已经落了一小捧花瓣。', rarity: 'R', weight: 7, sticker: 'flower', mood: 'happy', fitsTags: ['inazuma', 'plain', 'rainforest'] },
    { id: 'lost_way', name: '走错了路', desc: '地图上的路线在实地分成两条。虽然绕远，却看见了一段原本不会遇到的风景。', rarity: 'R', weight: 7, sticker: 'compass', mood: 'tired', fitsTags: [] },
    { id: 'ancient_ruin', name: '发现一处遗迹', desc: '发现一处年代久远的遗迹，石头上的文字已经磨损，只记录下仍看得清的部分。', rarity: 'SR', weight: 3, sticker: 'stone', mood: 'idle', fitsTags: ['desert', 'mountain', 'ruin'] },
    { id: 'rare_butterfly', name: '见到一只罕见的蝴蝶', desc: '一只颜色会随光线变化的蝴蝶停留片刻，然后飞入植物之间。', rarity: 'SR', weight: 3, sticker: 'butterfly', mood: 'happy', fitsTags: ['rainforest', 'plain', 'moon'] },
    { id: 'aurora', name: '看见了极光', desc: '夜空一层一层亮起来。没有人说话，月灵也只是安静地抬头。', rarity: 'SSR', weight: 1, sticker: 'star', mood: 'idle', fitsTags: ['snow', 'nod_krai', 'night'] },
    { id: 'old_friend_gift', name: '收到一件旧礼物', desc: '收到一件来自旧朋友或旧日旅途的礼物。它回到手中时，已经带上新的故事。', rarity: 'SSR', weight: 1, sticker: 'gift', mood: 'happy', fitsTags: [] }
  ];

  NT.data.eventById = function (id) {
    var l = NT.data.events;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  };

  /* 天气与时段是旅途事实卡的必需数据。 */
  NT.data.weathers = [
    { id: 'clear',   name: '晴',   weight: 34, satMul: 1.00, brightMul: 1.00, tint: null },
    { id: 'cloudy',  name: '多云', weight: 21, satMul: 0.94, brightMul: 0.97, tint: [205, 210, 220, 0.30, 'multiply'] },
    { id: 'rain',    name: '雨',   weight: 15, satMul: 0.88, brightMul: 0.90, tint: [110, 135, 175, 0.30, 'multiply'] },
    { id: 'snow',    name: '雪',   weight:  8, satMul: 0.84, brightMul: 1.04, tint: [225, 235, 250, 0.34, 'multiply'] },
    { id: 'wind',    name: '风',   weight: 10, satMul: 1.03, brightMul: 1.02, tint: null },
    { id: 'moonlit', name: '月光', weight:  7, satMul: 0.94, brightMul: 0.92, tint: [130, 145, 205, 0.22, 'soft-light'] },
    { id: 'fog',     name: '雾',   weight:  5, satMul: 0.82, brightMul: 0.96, tint: [205, 215, 225, 0.26, 'soft-light'] }
  ];

  NT.data.weatherById = function (id) {
    var l = NT.data.weathers;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  };

  NT.data.timesOfDay = [
    { id: 'dawn',  name: '清晨', weight: 20, brightMul: 0.97, tint: [255, 205, 150, 0.55, 'soft-light'], starAlpha: 0 },
    { id: 'day',   name: '白天', weight: 36, brightMul: 1.00, tint: null, starAlpha: 0 },
    { id: 'dusk',  name: '黄昏', weight: 22, brightMul: 0.90, tint: [255, 155, 115, 0.60, 'soft-light'], starAlpha: 0 },
    { id: 'night', name: '夜晚', weight: 22, brightMul: 0.72, tint: [72, 95, 175, 0.34, 'multiply'], starAlpha: 0.9 }
  ];

  NT.data.timeOfDayById = function (id) {
    var l = NT.data.timesOfDay;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  };
})(typeof window !== 'undefined' ? window : this);
