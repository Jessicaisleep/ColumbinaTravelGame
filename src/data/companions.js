/* 哥伦比娅的旅行 · 角色池
 * visitor=true：会主动来家园找哥伦比娅。
 * encounter=true：会在旅途中被随机遇到。
 */
(function (root) {
  'use strict';
  var NT = (root.NT = root.NT || {});
  NT.data = NT.data || {};

  function role(id, name, rarity, weight, callColumbina, traits, tags, meetLines, affinityLines, flags, sprite) {
    return {
      id: id,
      name: name,
      rarity: rarity,
      weight: weight,
      callNahida: callColumbina,
      callColumbina: callColumbina,
      traits: traits,
      catchphrases: affinityLines.slice(0, 2),
      meetLines: meetLines,
      affinityLines: affinityLines,
      visitor: !!flags.visitor,
      encounter: !!flags.encounter,
      tags: tags,
      sprite: sprite
    };
  }

  NT.data.companions = [
    role('paimon', '派蒙', 'N', 14, '哥伦比娅',
      ['直率', '爱吃', '热心', '健谈'], ['visitor', 'home', 'food'],
      ['派蒙抱着一袋点心飞进院子，说这次真的会记得给大家留一份。', '还没看见人，就听见派蒙在门外问哥伦比娅今天想玩什么。'],
      ['她们和月灵一起分点心。派蒙负责分，哥伦比娅负责让每一份看起来一样多。', '派蒙讲起最近的旅途，哥伦比娅安静听完，又补上了她漏掉的三个细节。'],
      { visitor: true }, { hair: '#f2e6c8', dress: '#e8e2f0', accent: '#f5c451', skin: '#ffe0c8', hat: 'none' }),

    role('lauma', '菈乌玛', 'R', 12, '哥伦比娅',
      ['虔诚', '温柔', '坚定', '善解人意'], ['visitor', 'nod_krai', 'moon'],
      ['菈乌玛从霜月之坊来访，没有行礼，只是像家人一样叫了哥伦比娅的名字。', '她带来霜月之子的近况，也带来一份仍然温热的食物。'],
      ['她们在月光下散步，谈的不是神谕，而是家里最近发生的小事。', '菈乌玛陪哥伦比娅整理祈月笺，把写给朋友的那一叠放在最上面。'],
      { visitor: true }, { hair: '#d7d1e8', dress: '#725f8e', accent: '#d7b9ff', skin: '#ffe0c8', hat: 'none' }),

    role('sandrone', '桑多涅', 'SR', 8, '哥伦比娅',
      ['理性', '毒舌', '专注', '关心藏在讥讽里'], ['visitor', 'nod_krai', 'machine'],
      ['桑多涅带着一件刚修好的装置来访，开口先挑出了院子里的三处问题。', '她把霜鳍鲸玩具放到桌上，说这只是测试品，不是礼物。'],
      ['她们一边修月灵琴，一边指出对方没有藏好的担心。', '桑多涅嘴上嫌月灵碍事，离开前却把每一根琴弦都调好了。'],
      { visitor: true }, { hair: '#d9c4ab', dress: '#4a3c52', accent: '#c08b65', skin: '#ffe0c8', hat: 'cap' }),

    role('arlecchino', '阿蕾奇诺', 'SR', 7, '哥伦比娅',
      ['冷静', '敏锐', '克制', '重视承诺'], ['visitor', 'city', 'nod_krai'],
      ['阿蕾奇诺按约定来到门前，没有随从，也没有多余的寒暄。', '她确认周围安全后，把一封没有署名的信交给哥伦比娅。'],
      ['她们坐下来交换近况，不必解释彼此为什么愿意帮忙。', '阿蕾奇诺陪她下完一盘月亮棋。两个人都没有故意让步。'],
      { visitor: true }, { hair: '#ece8e3', dress: '#35303a', accent: '#c94a55', skin: '#f4d7ca', hat: 'none' }),

    role('flins', '菲林斯', 'R', 10, '哥伦比娅小姐',
      ['礼貌', '沉稳', '可靠', '富有责任感'], ['visitor', 'nod_krai', 'night'],
      ['菲林斯结束巡查后来到家园，礼貌地问哥伦比娅小姐是否愿意一起走走。', '他带来道路与月矩力异常的记录，也记得给月灵留下一份小礼物。'],
      ['他们沿着夜路同行。没有人被保护在身后，只是彼此照看。', '菲林斯帮忙检查院外的照明，哥伦比娅替他准备了清香的热饮。'],
      { visitor: true }, { hair: '#d6d2c8', dress: '#30495f', accent: '#80b6cc', skin: '#e8c9b5', hat: 'none' }),

    role('nefer', '奈芙尔', 'R', 9, '哥伦比娅小姐',
      ['机敏', '从容', '善于观察', '重视情报'], ['visitor', 'nod_krai', 'mystery'],
      ['奈芙尔像是早就算准了时间，把一条线索压在带来的礼物下面。', '她来找哥伦比娅喝茶，也顺便问起那件与月光有关的委托。'],
      ['她们交换故事和线索，都知道什么可以说，什么不该继续追问。', '奈芙尔说情报不能白送，最后只收下一枚画着月相的小卡片。'],
      { visitor: true }, { hair: '#2e2d3c', dress: '#734f71', accent: '#d5b86c', skin: '#c98f72', hat: 'none' }),

    role('aino', '爱诺', 'N', 11, '哥伦比娅姐姐',
      ['聪明', '好奇', '直率', '擅长机械'], ['visitor', 'nod_krai', 'machine'],
      ['爱诺抱着一堆零件跑来，说其中一件也许能让月灵琴弹出新的声音。', '她叫着哥伦比娅姐姐进门，认真说明这和月神身份没有关系。'],
      ['她们把零件按大小排好，又一起寻找被月灵藏走的那一枚。', '爱诺研究月矩力能否驱动装置，哥伦比娅坚持先从不会爆炸的版本开始。'],
      { visitor: true }, { hair: '#a98d72', dress: '#617d8f', accent: '#e2ba6a', skin: '#f1d1bd', hat: 'none' }),

    role('ineffa', '伊涅芙', 'R', 9, '哥伦比娅小姐',
      ['严谨', '忠诚', '敏锐', '善于分析'], ['visitor', 'nod_krai', 'machine'],
      ['伊涅芙带来一份风险清单，最后一项写着“不要独自承担全部责任”。', '她准确识别了哥伦比娅的气息，却只用普通称呼在门外问好。'],
      ['她们一起照看爱诺。事实上，爱诺觉得需要被照看的更像是她们两个。', '伊涅芙整理旅行记录，并把可能暴露月神身份的内容单独标记出来。'],
      { visitor: true }, { hair: '#d8e1e4', dress: '#52676e', accent: '#91c7d1', skin: '#ecd2c3', hat: 'none' }),

    role('dainsleif', '戴因斯雷布', 'SR', 6, '哥伦比娅',
      ['沉着', '警觉', '克制', '洞察深刻'], ['visitor', 'ruin', 'night'],
      ['戴因在黄昏后到访，只问她是否愿意谈一谈。', '他带来遗迹中的新线索，也给哥伦比娅足够的时间判断是否要介入。'],
      ['他们谈起故乡、名字与命运留下的痕迹。准确的理解比安慰更接近陪伴。', '交谈结束后，他们在院中安静坐了一会儿，没有急着为彼此下结论。'],
      { visitor: true }, { hair: '#d2d4d9', dress: '#273752', accent: '#6da0d6', skin: '#dec0ae', hat: 'none' }),

    role('mera', '梅拉', 'SR', 5, '哥伦比娅',
      ['独立', '灵动', '专注', '喜欢绘画'], ['visitor', 'nod_krai', 'moon', 'art'],
      ['梅拉抱着画板飞进院子，颜料在身后留下细小的月光。', '她举起一幅新画，催促哥伦比娅猜出画中的朋友是谁。'],
      ['她们一起调颜料，把月光、花草和朋友画进同一张画里。', '哥伦比娅替梅拉准备画展，梅拉把最中间的位置留给共同完成的作品。'],
      { visitor: true }, { hair: '#d4e4ff', dress: '#7385b9', accent: '#f0d9ff', skin: '#dbe8ff', hat: 'none' }),

    role('nuonuo_tota', '努昂诺塔', 'SR', 5, '哥伦比娅',
      ['安静', '忠诚', '敏锐', '与月矩力共鸣'], ['visitor', 'nod_krai', 'moon', 'soul'],
      ['努昂诺塔沿着熟悉的共鸣来到家园，安静停在哥伦比娅身旁。', '它从月光里探出身影，像是在确认她仍记得回家的方向。'],
      ['哥伦比娅从细微的共鸣中理解它，而不是把它当成没有意志的影子。', '它们一起听修好的月灵琴。旋律结束后，努昂诺塔仍陪她坐了很久。'],
      { visitor: true }, { hair: '#e8e9ff', dress: '#7d72aa', accent: '#bfc7ff', skin: '#e3e7ff', hat: 'none' }),

    role('collei', '柯莱', 'N', 13, '哥伦比娅小姐',
      ['认真', '容易紧张', '努力'], ['sumeru', 'rainforest', 'plain'],
      ['在林间路口遇到柯莱。她抱着巡林记录，先确认哥伦比娅是否需要帮助。', '柯莱有些紧张地打招呼，并没有追问这位陌生旅人的身份。'],
      ['她们交换沿途观察。柯莱记录植物，哥伦比娅补上月光下才看得到的细节。', '分别前，哥伦比娅认真感谢她的引路，并记住了不能随意触碰的植物。'],
      { encounter: true }, { hair: '#7fae5c', dress: '#4f7a4a', accent: '#c8e08a', skin: '#ffe0c8', hat: 'none' }),

    role('tighnari', '提纳里', 'R', 11, '哥伦比娅',
      ['严谨', '敏锐', '知识丰富'], ['sumeru', 'rainforest', 'desert'],
      ['在林地边缘遇到提纳里。他先指出附近植物的风险，再询问她的路线。', '提纳里注意到月灵的异常反应，但没有在证据不足时贸然断言。'],
      ['他讲解雨林生态，哥伦比娅认真听完，也提出了几个关于月光与植物的问题。', '两人共同记录一处异常生态，各自保留了仍需验证的结论。'],
      { encounter: true }, { hair: '#4f6f4a', dress: '#7a9a5c', accent: '#d8e8a0', skin: '#ffe0c8', hat: 'ear' }),

    role('cyno', '赛诺', 'R', 9, '哥伦比娅',
      ['严肃', '冷幽默', '执着'], ['sumeru', 'desert', 'ruin'],
      ['赛诺在遗迹附近确认她没有危险后，才用一句冷笑话作为正式问候。', '他先说明此地的风险，再问哥伦比娅是否愿意同行一段。'],
      ['赛诺讲了一个需要解释三遍的笑话。哥伦比娅听完，认真指出了第四种理解。', '遇到威胁时，两个人都没有轻视对方的判断，很快完成了分工。'],
      { encounter: true }, { hair: '#e8e2d0', dress: '#3f4a6a', accent: '#d4b45c', skin: '#d9b090', hat: 'ear' }),

    role('nilou', '妮露', 'R', 10, '哥伦比娅小姐',
      ['温柔', '热爱舞蹈', '善解人意'], ['sumeru', 'city', 'water'],
      ['妮露正在水边排练，看到哥伦比娅停下来听，便邀请她看完这一段。', '她注意到哥伦比娅喜欢旋律，于是从舞蹈谈起音乐和故事。'],
      ['妮露跳了一段安静的舞，哥伦比娅用歌声回应了其中的旋律。', '她们讨论表演怎样让陌生人理解彼此，而不必先知道对方的身份。'],
      { encounter: true }, { hair: '#e07a9a', dress: '#5f8fc4', accent: '#f0d0e0', skin: '#ffe0c8', hat: 'none' }),

    role('dehya', '迪希雅', 'R', 9, '哥伦比娅',
      ['豪爽', '可靠', '警觉'], ['sumeru', 'desert', 'mountain'],
      ['迪希雅确认前方路线安全后，邀请哥伦比娅同行到下一个休息点。', '她没有把哥伦比娅当成需要保护的弱者，只提醒彼此照看侧后方。'],
      ['她们轮流判断路线与风向，谁也没有强迫谁接受帮助。', '休息时迪希雅递来水囊，哥伦比娅把准备好的食物分成两份。'],
      { encounter: true }, { hair: '#e8a04a', dress: '#a04a3a', accent: '#e8c060', skin: '#c9906a', hat: 'none' }),

    role('klee', '可莉', 'SR', 7, '哥伦比娅姐姐',
      ['精力充沛', '天真', '需要安全引导'], ['mondstadt', 'plain', 'adventure'],
      ['远处传来一声闷响。哥伦比娅循声找到可莉，先确认没有人受伤。', '可莉从草丛后跑出来，叫她哥伦比娅姐姐，并展示今天的冒险路线。'],
      ['哥伦比娅陪她寻找漂亮石头，同时明确哪些危险物不能带回家园。', '可莉想把礼物送给月灵。两个人最后选择了不会爆炸的小花和果实。'],
      { encounter: true }, { hair: '#f0d070', dress: '#e05a4a', accent: '#f8f0e0', skin: '#ffe0c8', hat: 'cap' }),

    role('qiqi', '七七', 'SR', 7, '哥伦比娅小姐',
      ['安静', '记性不佳', '认真'], ['liyue', 'mountain', 'herb'],
      ['七七站在山路边核对采药笔记，哥伦比娅放慢脚步，没有突然打扰她。', '七七把“哥伦比娅小姐”写进本子，又认真确认了一遍读音。'],
      ['她们按笔记寻找药草。哥伦比娅观察月光下的轮廓，七七负责核对名称。', '分别前，七七写下下次见面的提醒；哥伦比娅答应也会记得。'],
      { encounter: true }, { hair: '#a8b8d8', dress: '#4a5a7a', accent: '#e0e8f0', skin: '#e8d8e0', hat: 'cap' }),

    role('varka', '法尔伽', 'SR', 6, '哥伦比娅小姐',
      ['豪迈', '经验丰富', '重视同伴'], ['mondstadt', 'field', 'expedition'],
      ['法尔伽在远征路线附近认出她，爽朗地称呼哥伦比娅小姐。', '他没有公开谈论她的身份，只问是否需要一位熟悉道路的同行者。'],
      ['他们交换各自见过的远方故事。法尔伽讲得热闹，哥伦比娅听得很认真。', '面对突发危险时，两人很快形成默契，也尊重彼此选择的行动方式。'],
      { encounter: true }, { hair: '#ded1bb', dress: '#4f6072', accent: '#b8d1e2', skin: '#ddb999', hat: 'none' }),

    role('nicole', '尼可', 'SSR', 4, '哥伦比娅',
      ['神秘', '敏锐', '善用隐喻'], ['witch', 'mystery', 'all'],
      ['尼可的声音在不经意间出现，像是在故事翻页时补上一句注释。', '她没有直接给出答案，只提醒哥伦比娅注意被所有人忽略的线索。'],
      ['她们谈论故事、名字与世界留下的痕迹，彼此都不会把隐喻误当作命令。', '尼可给出一种可能，哥伦比娅保留亲自确认真相的选择。'],
      { encounter: true }, { hair: '#b9a8cc', dress: '#4c3d67', accent: '#d7b5ed', skin: '#efd4c3', hat: 'cap' }),

    role('durin', '杜林', 'SR', 5, '哥伦比娅',
      ['真诚', '好奇', '重视朋友'], ['mondstadt', 'dragon', 'sky'],
      ['杜林从高处注意到月灵的光，降下来询问它们是不是迷路了。', '他认出哥伦比娅后，邀请她一起看看从天空才能看见的风景。'],
      ['他们交流对世界的新发现，也谈起被名字与朋友重新接纳的意义。', '杜林放慢速度照顾地面的同伴，哥伦比娅替他记下沿途最明亮的地方。'],
      { encounter: true }, { hair: '#57526f', dress: '#3e496b', accent: '#b082cf', skin: '#d5b7ad', hat: 'horn' }),

    role('wanderer', '阿帽', 'SR', 6, '哥伦比娅',
      ['敏锐', '嘴硬', '独立', '言辞直接'], ['sumeru', 'wind', 'all'],
      ['阿帽从高处落下，先评价她选的路线太慢，随后却没有立刻离开。', '他认出哥伦比娅，但没有替她公开过去，也没有追问她为何来到这里。'],
      ['他们直接指出对方没有说出口的问题，谁也不要求对方立刻回答。', '阿帽嘴上说只是顺路，最后仍陪她走过最容易迷失方向的一段。'],
      { encounter: true }, { hair: '#333d58', dress: '#40577e', accent: '#7fc8d6', skin: '#efd0bd', hat: 'cap' })
  ];

  NT.data.visitingCompanions = function () {
    return NT.data.companions.filter(function (c) { return c.visitor; });
  };

  NT.data.encounterCompanions = function () {
    return NT.data.companions.filter(function (c) { return c.encounter; });
  };

  NT.data.companionById = function (id) {
    var list = NT.data.companions;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };
})(typeof window !== 'undefined' ? window : this);
