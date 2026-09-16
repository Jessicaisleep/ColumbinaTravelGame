/* 哥伦比娅的旅行 · 提瓦特区域
 * mapX/mapY 是游戏内抽象地图坐标，仅用于计算旅途成本，不代表现实经纬度。
 */
(function (root) {
  'use strict';
  var NT = (root.NT = root.NT || {});
  NT.data = NT.data || {};

  NT.data.destinations = [
    {
      id: 'mondstadt', name: '蒙德', fullName: '蒙德·风与诗歌的国度',
      bearing: 'w', mapX: 2, mapY: 5, lat: 2, lng: 5, remoteness: 1.0,
      desc: '风、诗歌与城邦生活交织的地方。歌声会沿着道路去往很远的地方。',
      tags: ['mondstadt', 'wind', 'city', 'plain', 'poetry'], rarity: 'N', weight: 12,
      weatherCompat: ['clear', 'cloudy', 'wind'], anchorY: 0.73, depthScale: 1,
      stampHue: 205, palette: { sky: ['#9ed4ef', '#eaf7ff'], far: '#9db9bd', mid: '#6d9d82', near: '#47745d', ground: '#729b68' },
      arriveLines: [
        '风从很远的地方来，带着歌声，也带着我还没听过的故事。',
        '这里的风不要求谁跟随它。难怪人们把自由写进歌里。',
        '（抬头听了一会儿）旋律被风带走，又从另一条街回来。'
      ],
      scenery: [
        { name: '风中的城与原野', desc: '风穿过城门和草地，远处的风车缓慢转动。', sticker: 'compass' },
        { name: '诗与歌的夜晚', desc: '人们围坐在灯下，把旅途写成新的歌。', sticker: 'star' }
      ],
      food: [
        { name: '分享了一份蒙德点心', desc: '味道轻快，适合一边听故事一边慢慢吃。', sticker: 'candy' },
        { name: '喝了清香的饮品', desc: '风把香气吹散了一点，入口反而更柔和。', sticker: 'tea' }
      ],
      play: [
        { name: '听了一首风中的歌', desc: '最后一个音结束后，风还替它延长了一会儿。', sticker: 'bell' },
        { name: '沿着风的方向散步', desc: '没有急着抵达，只把沿路的故事记下来。', sticker: 'map' }
      ]
    },
    {
      id: 'liyue', name: '璃月', fullName: '璃月·山海与契约之地',
      bearing: 's', mapX: 6, mapY: 8, lat: 6, lng: 8, remoteness: 1.05,
      desc: '山海相接、重视契约与历史的土地。旧日故事也在普通人的一天里延续。',
      tags: ['liyue', 'mountain', 'sea', 'city', 'contract'], rarity: 'R', weight: 10,
      weatherCompat: ['clear', 'cloudy', 'rain'], anchorY: 0.72, depthScale: 1.03,
      stampHue: 38, palette: { sky: ['#d7c18b', '#f7edcf'], far: '#b99a68', mid: '#8d7555', near: '#65513e', ground: '#8b7659' },
      arriveLines: [
        '山与海在这里彼此守望。很久以前的约定，也许就是这样留下来的。',
        '神明的故事很长，人的一天却也有值得记住的重量。',
        '（望向远处的灯火）这里把承诺写进石头，也写进日常。'
      ],
      scenery: [
        { name: '山海之间', desc: '高处能看见水路与层叠山影，一直延伸到云下。', sticker: 'stone' },
        { name: '灯火中的港城', desc: '灯一盏盏亮起来，像把归途标在夜色里。', sticker: 'lantern' }
      ],
      food: [
        { name: '尝了璃月风味的热食', desc: '香气很足，适合在走过山路后慢慢分享。', sticker: 'bowl' },
        { name: '带回一份精致点心', desc: '形状像小小的月相，月灵围着看了很久。', sticker: 'dumpling' }
      ],
      play: [
        { name: '听人讲了一段旧契约', desc: '故事已经很久，却仍有人记得承诺为何开始。', sticker: 'book' },
        { name: '沿着山海路线访古', desc: '石刻有些模糊，剩下的部分仍足够让人停步。', sticker: 'map' }
      ]
    },
    {
      id: 'inazuma', name: '稻妻', fullName: '稻妻·雷光与群岛',
      bearing: 'e', mapX: 11, mapY: 7, lat: 11, lng: 7, remoteness: 1.25,
      desc: '群岛、雷光与漫长记忆构成的国度。海让岛屿分开，也让航路指向相遇。',
      tags: ['inazuma', 'island', 'sea', 'thunder', 'sakura', 'memory'], rarity: 'R', weight: 9,
      weatherCompat: ['clear', 'cloudy', 'rain', 'wind'], anchorY: 0.7, depthScale: 1.03,
      stampHue: 285, palette: { sky: ['#b9a6dc', '#eee8fb'], far: '#8d82b0', mid: '#675c91', near: '#493e6e', ground: '#75658f' },
      arriveLines: [
        '海把岛屿分开，又让每一条航路都指向相遇。',
        '雷光只亮了一瞬，却把远处的山照得很清楚。',
        '短暂并不等于没有留下痕迹。花瓣落下时，我这样想。'
      ],
      scenery: [
        { name: '雷光下的群岛', desc: '云层亮起的一瞬，海与远山都有了清晰轮廓。', sticker: 'star' },
        { name: '随风而落的花瓣', desc: '风停时，衣袖里已经留下几片花瓣。', sticker: 'flower' }
      ],
      food: [
        { name: '吃了一份岛上料理', desc: '摆放得很整齐，味道比外表更温和。', sticker: 'bowl' },
        { name: '分享了随身点心', desc: '坐在能听见海声的地方，食物也像带了一点潮气。', sticker: 'candy' }
      ],
      play: [
        { name: '乘船穿过岛屿', desc: '海面不断改变颜色，月灵一直停在船头。', sticker: 'fish' },
        { name: '记录了一次雷光', desc: '它太快了，只能画下记忆里剩下的轮廓。', sticker: 'camera' }
      ]
    },
    {
      id: 'sumeru', name: '须弥', fullName: '须弥·雨林与沙海',
      bearing: 's', mapX: 5, mapY: 12, lat: 5, lng: 12, remoteness: 1.2,
      desc: '雨林与沙海并存，知识、梦境和生命彼此交错。',
      tags: ['sumeru', 'rainforest', 'desert', 'knowledge', 'dream'], rarity: 'R', weight: 10,
      weatherCompat: ['clear', 'cloudy', 'rain', 'wind'], anchorY: 0.7, depthScale: 1.04,
      stampHue: 135, palette: { sky: ['#a9d8c0', '#e9f5e9'], far: '#83ae8a', mid: '#5d8669', near: '#3f6350', ground: '#6f8d61' },
      arriveLines: [
        '雨林里的声音很多。闭上眼睛以后，反而更容易分清每一种生命。',
        '沙海看起来空无一物，却把时间留下的痕迹保存得很完整。',
        '知识能解释许多事情，也会诚实地留下仍不知道的部分。'
      ],
      scenery: [
        { name: '雨林的层叠生命', desc: '叶片遮住一部分天空，每一层都有不同的声音。', sticker: 'leaf' },
        { name: '沙海中的遗迹', desc: '被风磨过的石头仍留着无法完全辨认的文字。', sticker: 'sand' }
      ],
      food: [
        { name: '尝了当地香料料理', desc: '香味很复杂，吃完后仍能分辨出几层不同味道。', sticker: 'bowl' },
        { name: '分享了新鲜水果', desc: '果香清爽，月灵似乎比人更早闻到。', sticker: 'grape' }
      ],
      play: [
        { name: '观察了一处生态', desc: '先记录，再询问熟悉这里的人，没有贸然触碰。', sticker: 'book' },
        { name: '阅读了一本旧记录', desc: '答案不在最后一页，而在被反复修改的边角。', sticker: 'book' }
      ]
    },
    {
      id: 'fontaine', name: '枫丹', fullName: '枫丹·水与审判之国',
      bearing: 'c', mapX: 6, mapY: 3, lat: 6, lng: 3, remoteness: 1.1,
      desc: '水域、城市、机关与公开审判交织的国度。真相有时藏在谢幕之后。',
      tags: ['fontaine', 'water', 'sea', 'city', 'machine', 'justice'], rarity: 'R', weight: 9,
      weatherCompat: ['clear', 'cloudy', 'rain'], anchorY: 0.72, depthScale: 1,
      stampHue: 198, palette: { sky: ['#9fcde0', '#e8f5fa'], far: '#87adc0', mid: '#5d849b', near: '#3e6178', ground: '#6b91a2' },
      arriveLines: [
        '水会映出人的样子，也会把藏起来的声音传得很远。',
        '这里的人习惯注视舞台。我更想知道谢幕后，他们怎样称呼彼此。',
        '机关的声音很精确。水流却总会找到没有被规定的方向。'
      ],
      scenery: [
        { name: '水路与城市机关', desc: '水面映着建筑与灯光，机关沿固定节奏运转。', sticker: 'gear' },
        { name: '谢幕后的小路', desc: '离开热闹的舞台，才能听清普通人的脚步。', sticker: 'mask' }
      ],
      food: [
        { name: '尝了一份枫丹甜点', desc: '外形精致，切开后香气才慢慢散出来。', sticker: 'cake' },
        { name: '喝了清澈的饮品', desc: '入口很轻，余味却停留得比想象中久。', sticker: 'tea' }
      ],
      play: [
        { name: '观察了一组机关', desc: '爱诺大概会想拆开看看。幸好她今天不在。', sticker: 'gear' },
        { name: '沿水路记录城市', desc: '同一座建筑在不同水面里，像有不同的表情。', sticker: 'camera' }
      ]
    },
    {
      id: 'natlan', name: '纳塔', fullName: '纳塔·火与同行者的土地',
      bearing: 'w', mapX: 1, mapY: 11, lat: 1, lng: 11, remoteness: 1.35,
      desc: '火、部族、竞争与同行关系鲜明的土地。故事围着火继续传下去。',
      tags: ['natlan', 'fire', 'mountain', 'tribe', 'companion'], rarity: 'SR', weight: 7,
      weatherCompat: ['clear', 'cloudy', 'wind'], anchorY: 0.69, depthScale: 1.05,
      stampHue: 8, palette: { sky: ['#f2b17e', '#ffe4c8'], far: '#c77c55', mid: '#9b5842', near: '#6d3d32', ground: '#9d6745' },
      arriveLines: [
        '这里的火不是为了驱散谁。人们围着它坐下，故事就有了继续传下去的地方。',
        '路很热，也很长。幸好同行的人会把脚步留给彼此。',
        '火光照亮的不是胜负，而是谁愿意站在同伴身边。'
      ],
      scenery: [
        { name: '火光与山路', desc: '热风沿山路升起，远处的火光像不会熄灭的路标。', sticker: 'flame' },
        { name: '同行者的营地', desc: '人们分享食物、路线和各自带来的故事。', sticker: 'tent' }
      ],
      food: [
        { name: '分享了火边料理', desc: '刚离开火焰时很烫，等大家坐齐正好入口。', sticker: 'bowl' },
        { name: '尝了当地果实', desc: '味道明亮直接，像这里的人说话一样。', sticker: 'grape' }
      ],
      play: [
        { name: '和伙伴走过一段山路', desc: '没有人催促落后者，队伍因此一直保持完整。', sticker: 'compass' },
        { name: '听了一段部族故事', desc: '讲述者不断添入新的名字，让过去继续活在现在。', sticker: 'book' }
      ]
    },
    {
      id: 'nod_krai', name: '挪德卡莱', fullName: '挪德卡莱·月光归处',
      bearing: 'n', mapX: 8, mapY: 0, lat: 8, lng: 0, remoteness: 1,
      desc: '游戏所在地与家园起点。银月之庭、霜月之坊与月灵都在月光下留下自己的故事。',
      tags: ['nod_krai', 'moon', 'frostmoon', 'home', 'island', 'snow', 'mystery'], rarity: 'SR', weight: 12,
      weatherCompat: ['clear', 'cloudy', 'snow', 'wind', 'moonlit', 'fog'], anchorY: 0.7, depthScale: 1.04,
      stampHue: 255, palette: { sky: ['#8f9bc7', '#d9ddf4'], far: '#777fa5', mid: '#5c6288', near: '#414664', ground: '#696d8d' },
      arriveLines: [
        '月光落在银月之庭。这里曾有人等待月神，如今也有人只是在等哥伦比娅回家。',
        '月灵从草叶后探出头来。（轻轻抬手回应）我认得它，也认得这条回去的路。',
        '人们仍会谈起库塔尔，但朋友叫我的名字。两种声音都属于这里的故事。'
      ],
      scenery: [
        { name: '银月之庭', desc: '月光停在庭院与月灵身上，安静得像一幅还在呼吸的画。', sticker: 'moon' },
        { name: '霜月路线', desc: '霜月之坊与祈月之夜的灯光沿道路延伸。', sticker: 'snowflake' }
      ],
      food: [
        { name: '分享了新鲜水果', desc: '月灵围过来时，每一份都被认真分得一样多。', sticker: 'grape' },
        { name: '喝了清香的热饮', desc: '香气淡雅，适合在月光下慢慢说话。', sticker: 'tea' }
      ],
      play: [
        { name: '和月灵一起画画', desc: '梅拉把月光画得很淡，却把朋友画得很清楚。', sticker: 'flower' },
        { name: '下了一盘月亮棋', desc: '棋子少了一枚。最后在努昂诺塔身后找到了。', sticker: 'moon' }
      ]
    }
  ];

  NT.data.destinationById = function (id) {
    var list = NT.data.destinations;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };

  NT.data.destinationsByBearing = function (bearing) {
    return NT.data.destinations.filter(function (d) {
      return bearing === 'any' || d.bearing === bearing;
    });
  };
})(typeof window !== 'undefined' ? window : this);
