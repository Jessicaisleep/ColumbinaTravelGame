/* 哥伦比娅的旅行 · 家的数据
 * 家是一个 16:9 的全屏世界。背景会根据屏幕比例等比裁剪；主角和可交互物
 * 集中在房屋正门前的庭院中，保证不同尺寸的界面都能看到主要内容。
 */
(function (root) {
  'use strict';
  var NT = (root.NT = root.NT || {});
  NT.data = NT.data || {};

  /* ---------------- 布局 ---------------- */

  NT.data.HOME_W = 1280;
  NT.data.HOME_H = 720;

  /** 三个区域，纯用于摆放与描述 */
  NT.data.homeAreas = [
    { id: 'left',  name: '左侧庭院', x: [0.02, 0.34] },
    { id: 'front', name: '正门前',   x: [0.35, 0.65] },
    { id: 'right', name: '右侧庭院', x: [0.66, 0.98] }
  ];

  /**
   * 哥伦比娅会去的位置。坐标按家.png 的房屋正门和前庭重新标定。
   * y 是脚底基准。field 为真的位置，她在那里就是在照看那块田。
   * 所有日常状态都保持在房屋前，默认落点 yard 正对大门。
   */
  NT.data.homeSpots = {
    bed:     { x: 0.440, y: 0.810, area: 'front', label: '房屋前', onBed: true },
    shelf:   { x: 0.420, y: 0.820, area: 'front', label: '屋前左侧' },
    desk:    { x: 0.560, y: 0.820, area: 'front', label: '屋前右侧' },
    stove:   { x: 0.590, y: 0.850, area: 'front', label: '屋前右侧' },
    door:    { x: 0.500, y: 0.820, area: 'front', label: '正门前' },
    dry:     { x: 0.400, y: 0.880, area: 'front', label: '左侧花圃', field: 'dry' },
    wet:     { x: 0.600, y: 0.880, area: 'front', label: '右侧花圃', field: 'wet' },
    yard:    { x: 0.500, y: 0.860, area: 'front', label: '房屋前' },
    gate:    { x: 0.500, y: 0.930, area: 'front', label: '庭院入口' },
    lawn:    { x: 0.560, y: 0.890, area: 'front', label: '前庭' }
  };

  NT.data.spotById = function (id) { return NT.data.homeSpots[id]; };

  /**
   * 玩具落位槽。分散在前庭左右两侧，**一共 5 个**。
   *
   * 为什么是 5 个（不是 8 个）：
   *   · 主角要站到玩具旁边玩，来访的同伴也要玩 —— 院子里同时有人有玩具
   *   · 同伴的立绘有些比主角宽，需要的空档更大
   *   · 摆太满就会出问题：她站到别的玩具上、玩具互相压住
   *   5 个槽位能把行距拉到 0.2，上面这些问题就都不存在了。
   *
   * 中央正门及通道留空，避免玩具遮住主角；外侧槽位也给最大尺寸的吊床
   * 留出了完整显示空间。
   */
  NT.data.toySlots = [
    { x: 0.160, y: 0.820, area: 'left',  place: 'outdoor' },
    { x: 0.300, y: 0.960, area: 'left',  place: 'outdoor' },
    { x: 0.700, y: 0.960, area: 'right', place: 'outdoor' },
    { x: 0.840, y: 0.820, area: 'right', place: 'outdoor' },
    { x: 0.880, y: 0.960, area: 'right', place: 'outdoor' }
  ];

  /* ---------------- 哥伦比娅的居家状态 ---------------- */

  /**
   * spot 决定她会走到哪里；dwell 是停留时长（分钟）；mood 决定立绘姿态。
   * poke 是"被点一下"时的反应：anim 是小动作，lines 是反应台词。
   */
  NT.data.nahidaStates = [
    { id: 'idle', name: '静静观察', mood: 'idle', weight: 13, spot: 'yard', dwell: 2.5,
      lines: ['……你来了。', '刚才的云像一段没有写完的故事。', '月灵在找东西。我猜它忘了自己把东西藏在哪里。'],
      poke: { anim: 'perk', lines: ['……嗯？', '（慢慢抬起头）我在听。', '你来了。正好，陪我坐一会儿。'] } },
    { id: 'sleep', name: '休息', mood: 'tired', weight: 7, spot: 'bed', dwell: 6, lie: true,
      lines: ['（她睡着了，呼吸很轻）', '（翻了个身，没有醒）', '……再陪我一会儿。'],
      poke: { anim: 'roll', lines: ['（把脸埋进枕头）', '……我醒着。大概。', '（把被子往上拉了拉）'] } },
    { id: 'eat', name: '准备食物', mood: 'happy', weight: 11, spot: 'desk', dwell: 2.5,
      lines: ['刚做好的，还热。你要不要尝一口？', '这一份留给你。月灵不许先动。', '一起吃吧。食物被分享以后，会更像“家”。'],
      poke: { anim: 'offer', lines: ['（把碗往你那边推了推）', '先尝这一口。', '等一下，还很烫。'] } },
    { id: 'play', name: '玩月亮棋', mood: 'happy', weight: 25, spot: 'lawn', dwell: 2.5, useToy: true,
      lines: ['要下一盘月亮棋吗？', '月灵们把棋子藏起来了……还差一枚。', '（把画板往旁边挪了挪）这一块留给你。'],
      poke: { anim: 'perk', lines: ['正好。陪我把这一局下完吧。', '刚才那一步，你看见了吗？', '（向身旁让出一点位置）坐这里。'] } },
    { id: 'read', name: '阅读', mood: 'idle', weight: 10, spot: 'shelf', dwell: 3,
      lines: ['这一页读了三遍，每一次理解都不太一样。', '书里的故事结束了，留下的问题没有。', '（把书页压好）你也想看吗？'],
      poke: { anim: 'lookup', lines: ['……等一下，这段看完。', '（从书上方看了你一眼）', '你坐近一点，我们一起看。'] } },
    { id: 'water', name: '照看田地', mood: 'idle', weight: 11, spot: 'dry', dwell: 2, altSpot: 'wet',
      lines: ['土还是湿的，今天不用浇了。', '这棵比昨天高了一点。真的。', '水要慢慢浇，根才不会松。'],
      poke: { anim: 'wave', lines: ['小心，别站太近。', '这棵今天已经喝饱了。', '（往旁边挪了半步）你来试试？'] } },
    { id: 'cook', name: '做饭', mood: 'happy', weight: 9, spot: 'stove', dwell: 2.5,
      lines: ['火候比上次好。', '你闻到了吗？', '等一下就好。然后一起吃。'],
      poke: { anim: 'stir', lines: ['火有点大。', '你来尝尝咸淡？', '（一边说一边搅了两下）'] } },
    { id: 'stretch', name: '舒展身体', mood: 'happy', weight: 5, spot: 'door', dwell: 1.5,
      lines: ['坐得太久了。', '你也起来走一走吧。', '肩膀有一点僵。'],
      poke: { anim: 'shy', lines: ['（放下手臂，转头看你）什么时候来的？', '……用眼过度。', '只是坐得太久了。'] } },
    { id: 'lookout', name: '等待归来', mood: 'idle', weight: 9, spot: 'gate', dwell: 2.5,
      lines: ['……没什么，只是在等你。', '风把门吹响时，我总会抬头。', '门口的路很远，也会把重要的人带回来。'],
      poke: { anim: 'turn', lines: ['（转过身来）你回来了。', '我没有等很久。', '（轻轻握住你的手）回家吧。'] } }
  ];

  NT.data.nahidaStateById = function (id) {
    var l = NT.data.nahidaStates;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return l[0];
  };

  /* ---------------- 玩具 ---------------- */

  /** place: indoor 只能摆屋里，outdoor 只能摆院子/花园 */
  NT.data.toys = [
    { id: 'moon_chess', name: '月亮棋', icon: 'moon', rarity: 'R', place: 'outdoor',
      desc: '刻着月相纹样的棋盘，棋子像被月光磨圆的小石头。',
      playLines: ['（把一枚棋子推到你面前）这一步留给你。', '月灵又把棋子挪走了……难怪局面不对。', '有人坐在对面，棋盘才算完整。'] },
    { id: 'moon_chime', name: '月灵风铃', icon: 'bell', rarity: 'N', place: 'outdoor',
      desc: '月灵形状的小风铃，风吹过时会发出很轻的清响。',
      playLines: ['要安静一点，才能听见最后那个音。', '风停了，声音还留了一会儿。', '像是很远的地方，有谁在回应。'] },
    { id: 'moon_pool', name: '月影水池', icon: 'fish', rarity: 'R', place: 'outdoor',
      desc: '浅浅的一池水，天气晴朗时可以完整映出月亮。',
      playLines: ['水里的月亮不会掉下来，只是会被风暂时分开。', '（指尖碰了一下水面）很凉。你也试试？', '月灵把这里叫作观众席。'] },
    { id: 'moon_lantern', name: '月光灯', icon: 'lantern', rarity: 'N', place: 'outdoor',
      desc: '外壳刻有月相纹样，入夜后会亮起柔和的光。',
      playLines: ['挂高一点，晚归的人会知道这里有人等他。', '它不需要比月亮更亮。', '照清回家的路就够了。'] },
    { id: 'hammock', name: '吊床', icon: 'feather', rarity: 'SR', place: 'outdoor',
      desc: '绑在两棵树之间，躺下时能从叶片间看见月光。',
      playLines: ['晃着晃着就困了。', '（向旁边挪了挪）这里还能坐一个人。', '从下面看，月光是碎的。'] },
    { id: 'moon_canvas', name: '月灵画板', icon: 'flower', rarity: 'N', place: 'outdoor',
      desc: '为梅拉和其他月灵准备的画板，旁边放着画笔与颜料。',
      playLines: ['梅拉画的是月亮。旁边这个……应该是我们。', '月光不是纯白色的。', '（把画笔递给你）替这里添一笔吧。'] },
    { id: 'moon_harp', name: '修复后的月灵琴', icon: 'bell', rarity: 'SR', place: 'outdoor',
      desc: '重新修好的小琴，月灵拨动琴弦时，声音像落在水面上的光。',
      playLines: ['这个旋律……是我诞生时记得的声音。', '月灵弹琴时，总要先选喜欢的位置。', '下一段，你愿意和我一起听吗？'] },
    { id: 'moon_mosaic', name: '月光矿石拼画', icon: 'stone', rarity: 'R', place: 'outdoor',
      desc: '用不同色泽的矿石拼出月亮、花草与旅途见闻。',
      playLines: ['这一块像银月之庭的月光。', '空隙也会成为图案的一部分。', '（把浅色矿石放进你掌心）最后一块由你来放。'] },
    { id: 'frostfin_whale', name: '霜鳍鲸咬咬玩具', icon: 'fish', rarity: 'SR', place: 'outdoor',
      desc: '桑多涅送来的霜鳍鲸造型玩具，据说只是“结构测试品”。',
      playLines: ['它看起来很严肃。和送它来的人有一点像。', '桑多涅知道月灵喜欢它，大概会假装不在意。', '（轻轻按了一下）会响。'] },
    { id: 'animal_headwear', name: '动物头饰', icon: 'mask', rarity: 'N', place: 'outdoor',
      desc: '旅行途中收集的柔软头饰，适合拍照、画画或逗小动物。',
      playLines: ['（戴好头饰）……不许笑得太大声。', '月灵坚持说这个适合我。', '你也有一只。这样就不是我一个人了。'] }
  ];

  /**
   * 每件玩具相对主角身高的显示尺寸（倍数）。
   * 含义是"图片内容高度 / 主角身高"，按各自的视觉大小估算。
   * 换素材之后想调大小，改这里就行。
   */
  NT.data.toySizeRatio = {
    moon_chess: 0.48, moon_chime: 0.45, moon_pool: 0.44, moon_lantern: 0.44,
    hammock: 0.95, moon_canvas: 0.62, moon_harp: 0.64, moon_mosaic: 0.48,
    frostfin_whale: 0.42, animal_headwear: 0.35
  };

  NT.data.toySize = function (id) {
    var r = NT.data.toySizeRatio[id];
    return (typeof r === 'number') ? r : 0.6;
  };

  NT.data.toyById = function (id) {
    var l = NT.data.toys;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  };

  /** 某个槽位是否适合这件玩具 */
  NT.data.toyFitsSlot = function (toyId, slotIndex) {
    var toy = NT.data.toyById(toyId);
    var slot = NT.data.toySlots[slotIndex];
    if (!toy || !slot) return false;
    return toy.place === slot.place;
  };

  /* ---------------- 交流 ---------------- */

  NT.data.chatTopics = [
    {
      id: 'trip', label: '聊聊旅途', options: [
        { text: '这次去了哪里？', replies: [
          '去了离银月之庭很远的地方。路上的事，我写在明信片背面了。',
          '本来沿着地图走，后来被一只月灵带去了另一条路。这样也不错。',
          '风很大。站在高处时，像是整片天空都在向前走。'
        ] },
        { text: '路上累不累？', replies: [
          '会累。（轻轻握住你的手）不过现在已经好了。',
          '有一段路很难走。但想到回来可以讲给你听，就没有那么漫长。',
          '还好。我不急着抵达，沿途的故事也值得听完。'
        ] },
        { text: '带的吃的够吗？', replies: [
          '刚好够。还给你留了一份。',
          '有剩的。下次我们一起准备，会更合适。',
          '差一点。后来在安全的营地补充了食物，没有随便接受陌生人的东西。'
        ] }
      ]
    },
    {
      id: 'today', label: '问问她今天', options: [
        { text: '今天在做什么？', replies: [
          '替梅拉准备颜料。她把最亮的那一种藏起来了。',
          '读书，也听月灵弹了一会儿琴。',
          '把旅行记录重新排了一遍。按故事发生的顺序。'
        ] },
        { text: '睡得好吗？', replies: [
          '很好。梦里月亮离得很近，却没有要求我成为谁。',
          '还好。半夜听见月灵在窗边说话。',
          '不太好。想事情想到很晚……现在你在，可以休息了。'
        ] },
        { text: '有没有想我？', replies: [
          '……想了。（把额头轻轻靠过来）这样回答够不够？',
          '想起你第一次叫我名字的那天，也想起你现在就在这里。',
          '月灵们想你了。我也是。'
        ] }
      ]
    },
    {
      id: 'farm', label: '说说田里的事', options: [
        { text: '田里长得怎么样？', replies: ['玄此玉田长得很好，楚此诸田的水位还要再看一下。', '有一棵长得特别快，我怀疑它偷偷多喝了水。', '今晚有月光，也许它们会长得更安静一点。'] },
        { text: '需要我帮忙吗？', replies: ['需要。（把工具递给你）我们一起。', '帮我看看楚此诸田吧。我去照顾另一边。', '先陪我坐一会儿，再去也来得及。'] },
        { text: '种什么比较好？', replies: ['种你喜欢的。照顾它的理由会更长久。', '先选容易照看的，旅行回来也不会错过。', '月灵投票选了三种……它们显然没有理解只能选一种。'] }
      ]
    },
    {
      id: 'home', label: '说说家里', options: [
        { text: '这里算是家吗？', replies: ['算。因为我知道离开以后还会回来。', '有书、月灵，还有你。已经足够像家了。', '名字让人留下来，家让人愿意回来。'] },
        { text: '玩具好玩吗？', replies: ['月亮棋和那架琴都很安静，却不会让人觉得孤单。', '梅拉又在画板上添了一笔。她说那是月光落下来的样子。', '（轻轻拍了拍身旁的位置）你也来试试？'] },
        { text: '喜欢这里吗？', replies: ['喜欢。这里有人等我，也有人知道我不想被怎样称呼。', '嗯。月光落下来时，不需要先经过神殿。', '这里的路通向外面，也会把我们带回来。'] }
      ]
    },
    {
      id: 'small', label: '随便聊聊', options: [
        { text: '你在想什么？', replies: ['在想名字为什么会让人留下来。你要听吗？', '在想月亮明明很远，为什么引力仍能抵达这里。', '在想你刚才那句话。它比你以为的更重要。'] },
        { text: '给你讲个事', replies: ['好。（把书合上）你慢慢说。', '嗯，我听着。', '坐近一点吧。故事不用隔着那么远讲。'] },
        { text: '摸摸头', replies: ['（低下头，没有躲开）……既然是你，可以再停一会儿。', '头发有点乱。帮我梳一梳吧。', '（握住你的手腕）不是拒绝，只是想让你慢一点。'] }
      ]
    }
  ];

  NT.data.chatTopicById = function (id) {
    var l = NT.data.chatTopics;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  };

  /* ---------------- 出门方式 ---------------- */

  NT.data.travelModes = [
    { id: 'region', name: '选区域', desc: '指定一个提瓦特区域' },
    { id: 'bearing', name: '选路线', desc: '选择大致路线方向' },
    { id: 'random', name: '随它去', desc: '让旅途决定目的地' }
  ];
})(typeof window !== 'undefined' ? window : this);
