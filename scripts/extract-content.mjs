import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, relative, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const contentDir = resolve(root, 'content');
const originalDir = resolve(contentDir, 'original');
mkdirSync(originalDir, { recursive: true });

const SOURCE_EXTENSIONS = new Set(['.html', '.css', '.js', '.mjs', '.json', '.yaml', '.yml', '.md', '.txt', '.ps1']);
const excludedRoots = new Set(['.git', 'node_modules', 'dist', 'content']);
const generatedArtifacts = new Set(['scripts/extract-content.mjs', 'CONTENT_EXTRACTION_REPORT.md']);
const protagonistTerms = ['nahida', '纳西妲', '主角', '旅行者'];
const worldTerms = ['原神', '须弥', '提瓦特', '草神', '小吉祥草王', '现实世界'];

function posix(path) { return path.replaceAll('\\', '/'); }
function json(value) { return `${JSON.stringify(value, null, 2)}\n`; }
function writeJson(name, value) { writeFileSync(resolve(contentDir, name), json(value), 'utf8'); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
function sourceRef(file, line = null) { return { file, ...(line ? { line } : {}) }; }
function marker(type, reason) { return `{${type}: ${reason}}`; }

function walk(dir, output = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedRoots.has(entry.name)) continue;
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else output.push(full);
  }
  return output;
}

const allFiles = walk(root).filter((file) => !generatedArtifacts.has(posix(relative(root, file))));
const textFiles = allFiles.filter((file) => SOURCE_EXTENSIONS.has(extname(file).toLowerCase()));
const sourceInventory = allFiles.map((file) => {
  const bytes = readFileSync(file);
  return { path: posix(relative(root, file)), type: extname(file).slice(1).toLowerCase() || 'none', bytes: bytes.length, sha256: sha256(bytes) };
});

const lineIndex = [];
const protagonistReferences = [];
const worldReferences = [];
const textErrors = [];
for (const file of textFiles) {
  const rel = posix(relative(root, file));
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const text = lines[index];
    if (!text.trim()) continue;
    const base = { file: rel, line: index + 1, text };
    if (/[\u3400-\u9fff]/u.test(text)) lineIndex.push(base);
    const protagonistHits = protagonistTerms.filter((term) => text.toLowerCase().includes(term.toLowerCase()));
    if (protagonistHits.length) protagonistReferences.push({ ...base, terms: protagonistHits });
    const worldHits = worldTerms.filter((term) => text.includes(term));
    if (worldHits.length) worldReferences.push({ ...base, terms: worldHits });
    if (text.includes('[object Object]')) textErrors.push({ ...base, marker: marker('TEXT_ERROR', '[object Object] 原文不可推断，需回查来源') });
  }
}

const context = vm.createContext({ console: { log() {}, warn() {}, error() {} } });
context.window = context;
context.globalThis = context;
const runtimeFiles = [
  'src/core/util.js', 'src/core/rng.js', 'src/data/config.js', 'src/data/geo.js',
  'src/data/destinations.js', 'src/data/companions.js', 'src/data/events.js',
  'src/data/templates.js', 'src/data/farm.js', 'src/data/kitchen.js', 'src/data/home.js',
  'src/data/visitor.js', 'src/data/journey.js', 'src/data/achievements.js', 'assets/manifest.js'
];
for (const file of runtimeFiles) {
  vm.runInContext(readFileSync(resolve(root, file), 'utf8'), context, { filename: file });
}
const data = context.NT.data;
const assetManifest = context.NT.assetManifest;

function clean(value, seen = new WeakSet()) {
  if (typeof value === 'function') return { $function: value.toString() };
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return { $circular: true };
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => clean(item, seen));
  const result = {};
  for (const [key, item] of Object.entries(value)) result[key] = clean(item, seen);
  return result;
}

const extractedData = {};
for (const [key, value] of Object.entries(data)) {
  if (typeof value !== 'function') extractedData[key] = clean(value);
}

writeFileSync(resolve(originalDir, 'source-inventory.json'), json(sourceInventory), 'utf8');
writeFileSync(resolve(originalDir, 'source-text-snapshot.json'), json(textFiles.map((file) => ({ path: posix(relative(root, file)), content: readFileSync(file, 'utf8') }))), 'utf8');
writeFileSync(resolve(originalDir, 'text-occurrences.json'), json(lineIndex), 'utf8');
writeFileSync(resolve(originalDir, 'protagonist-references.json'), json(protagonistReferences), 'utf8');
writeFileSync(resolve(originalDir, 'world-references.json'), json(worldReferences), 'utf8');
const externalCopyTable = resolve(root, '..', '..', '游戏文案总表.txt');
const externalObjectObjectCount = existsSync(externalCopyTable)
  ? (readFileSync(externalCopyTable, 'utf8').match(/\[object Object\]/g) || []).length
  : null;
writeFileSync(resolve(originalDir, 'text-errors.json'), json({
  projectSource: textErrors,
  externalCopyTableAudit: {
    path: posix(externalCopyTable), importedIntoGameContent: false, occurrences: externalObjectObjectCount,
    marker: marker('TEXT_ERROR', `${externalObjectObjectCount ?? '未知'} 处 [object Object] 位于外部文案总表；禁止猜测原文，未导入游戏内容`)
  }
}), 'utf8');
writeFileSync(resolve(originalDir, 'extracted-runtime-data.json'), json(extractedData), 'utf8');
writeFileSync(resolve(originalDir, 'asset-manifest.json'), json(clean(assetManifest)), 'utf8');

const protagonist = {
  id: 'columbina',
  name: '哥伦比娅',
  displayName: '哥伦比娅',
  status: 'planned-single-source-not-wired',
  original: {
    inferredId: 'nahida',
    name: '纳西妲',
    aliases: ['纳西妲', '小纳西妲', '纳西妲大人', '小吉祥草王', '草神', '草神姐姐', '她', '主角', '旅行者'],
    identity: '《原神》须弥的草神/小吉祥草王',
    personality: ['智慧', '温和', '好奇', '说话简短克制', '偶尔带学究气', '轻微幽默感'],
    voice: '第一人称、温柔、好奇、短句、克制',
    stateDataPath: 'NT.data.nahidaStates',
    saveDataPath: 'home.nahida',
    assetDataPath: 'NT.assetManifest.nahida'
  },
  mappings: [
    { from: 'nahida', to: 'columbina', marker: marker('PROTAGONIST_MAPPING', 'nahida → columbina；需迁移逻辑、资源和存档兼容') },
    { from: '纳西妲', to: '哥伦比娅', marker: marker('PROTAGONIST_MAPPING', '纳西妲 → 哥伦比娅；仅纯名称位置可直接替换') },
    { from: '主角', to: '哥伦比娅', marker: marker('PROTAGONIST_MAPPING', '通用角色标签需改为统一 protagonist 引用') },
    { from: '旅行者', to: null, marker: marker('CHARACTER_RELATIONSHIP', '旅行者在现有 AI Prompt 中是照顾主角的人，不能直接等同哥伦比娅') }
  ],
  assets: Object.entries(assetManifest.nahida).map(([mood, file]) => ({ mood, assetId: `protagonist_${mood}`, originalAssetId: `nahida_${mood}`, pathStem: `图片素材/${file}`, marker: marker('ASSET_REPLACE', `当前${mood}主角立绘表现原主角，需要制作哥伦比娅版本`) })),
  behaviors: clean(data.nahidaStates),
  review: [
    marker('PROTAGONIST_REWRITE', '原主角身份、性格、语气、兴趣与行为需要基于用户确认的哥伦比娅设定重写'),
    marker('WORLD_CONFIRM', '哥伦比娅与现实地点、原神角色及现有家园的关系尚未确定'),
    marker('LOGIC_REVIEW', 'nahidaStates、home.nahida、assetManifest.nahida 与渲染变量需迁移到统一 protagonist.id'),
    marker('SAVE_MIGRATION', '旧存档 home.nahida 字段必须兼容读取，禁止直接改键导致丢档'),
    marker('AI_PROMPT_REWRITE', '日记和聊天 Prompt 明确绑定纳西妲/须弥草神，需整体重写而非替换姓名')
  ],
  references: protagonistReferences.map(({ file, line, terms }) => ({ file, line, terms }))
};
writeJson('protagonist.json', protagonist);

const characters = [{
  characterId: 'protagonist', name: '哥伦比娅', displayName: '哥伦比娅', role: 'protagonist',
  description: marker('PROTAGONIST_REWRITE', '完整人物设定待用户确认；唯一数据源见 content/protagonist.json'),
  appearance: marker('ASSET_REPLACE', '三态主角立绘需重新制作'), relationshipToProtagonist: 'self',
  dialogues: [], locations: [], assets: ['protagonist_idle', 'protagonist_happy', 'protagonist_tired'],
  references: [sourceRef('content/protagonist.json')], status: 'planned'
}, ...data.companions.map((item) => ({
  characterId: item.id, name: item.name, displayName: item.name, role: 'companion-and-visitor',
  description: item.traits.join('、'), appearance: clean(item.sprite),
  relationshipToProtagonist: { originalAddress: item.callNahida, marker: marker('CHARACTER_RELATIONSHIP', `${item.name}对原主角的称呼“${item.callNahida}”需按新关系重设`) },
  dialogues: { catchphrases: item.catchphrases, meetLines: item.meetLines, affinityLines: item.affinityLines },
  locations: { tags: item.tags, homeLocationId: data.companionHome[item.id] || null },
  assets: [`companion_${item.id}`],
  references: [sourceRef('src/data/companions.js'), sourceRef('assets/manifest.js'), sourceRef('src/data/journey.js')],
  marker: marker('CHARACTER', '原神角色；是否保留及与哥伦比娅的关系需要确认')
})), {
  characterId: 'traveler_player', name: '旅行者', displayName: '旅行者', role: 'player/caregiver-reference',
  description: '仅在聊天 Prompt 中作为一直照顾原主角的人出现', appearance: null,
  relationshipToProtagonist: marker('CHARACTER_RELATIONSHIP', '与哥伦比娅的关系尚未定义，不能直接当作主角别名'),
  dialogues: [], locations: [], assets: [], references: [sourceRef('src/data/templates.js')], status: 'referenced-only'
}, ...['wanderer', 'alhaitham'].map((id) => ({
  characterId: id, name: null, displayName: null, role: 'companion-home-reference', description: null, appearance: null,
  relationshipToProtagonist: marker('CHARACTER', `${id} 只在 companionHome 中出现，不在 companions 角色表中`),
  dialogues: [], locations: [data.companionHome[id]], assets: [], references: [sourceRef('src/data/journey.js')], status: 'orphan-reference'
}))];
writeJson('characters.json', characters);

const destinationIds = new Set(data.destinations.map((item) => item.id));
const geoIds = new Set([...Object.keys(data.geo), ...Object.keys(data.homeCityGeo)]);
const locationIds = new Set([...destinationIds, ...geoIds, ...Object.keys(data.homeSpots)]);
const orphanLocationIds = [...geoIds].filter((id) => !destinationIds.has(id));
const homeNames = Object.fromEntries(data.homeCities().map((item) => [item.id, item.name]));
const locations = [
  ...data.destinations.map((item) => ({
    locationId: item.id, name: item.name, displayName: item.fullName || item.name, description: item.desc,
    region: '现实中国', type: 'travel-destination', coordinates: { lat: item.lat, lng: item.lng },
    image: `background_${item.id}`, events: [...(item.sights || []), ...(item.foods || []), ...(item.activities || [])],
    dialogues: [], achievements: data.achievements.filter((achievement) => [...achievement.test.toString().matchAll(/byDestination\.([a-z][a-z0-9_]*)/g)].some((match) => match[1] === item.id)).map((achievement) => achievement.id),
    postcards: [`postcard_destination_${item.id}`], references: [sourceRef('src/data/destinations.js'), sourceRef('src/data/geo.js'), sourceRef('assets/manifest.js')],
    marker: marker('LOCATION_CONFIRM', '现实世界旅行地点是否保留在哥伦比娅版本中，需要确认')
  })),
  ...orphanLocationIds.map((id) => ({
    locationId: id, name: homeNames[id] || id, displayName: homeNames[id] || id, description: null,
    region: '现实中国', type: data.homeCityGeo[id] ? 'home-city-only' : 'geo-only',
    coordinates: clean(data.geo[id] || data.homeCityGeo[id]), image: assetManifest.backgrounds[id] ? `background_${id}` : null,
    events: [], dialogues: [], achievements: data.achievements.filter((achievement) => [...achievement.test.toString().matchAll(/byDestination\.([a-z][a-z0-9_]*)/g)].some((match) => match[1] === id)).map((achievement) => achievement.id), postcards: [],
    references: [sourceRef('src/data/geo.js')], marker: id === 'kanas'
      ? marker('LOCATION_ORPHAN', 'kanas / 喀纳斯存在于 geo 与成就，但 destinations 中无定义')
      : marker('LOCATION', '仅可选家乡/地理数据，不是旅行目的地')
  })),
  ...Object.entries(data.homeSpots).map(([id, item]) => ({
    locationId: `home_${id}`, name: item.label, displayName: item.label, description: null, region: 'home', type: 'home-spot',
    coordinates: { x: item.x, y: item.y }, image: 'home', events: [], dialogues: [], achievements: [], postcards: [],
    references: [sourceRef('src/data/home.js')], marker: marker('LOCATION_REVIEW', '家园落点与原主角动作/现有背景绑定，换图时需重新测量')
  }))
];
writeJson('locations.json', locations);

const world = {
  worldId: 'world_pending', name: null, background: null, timePeriod: null,
  currentLayers: [
    { type: 'genshin', evidence: ['纳西妲', '须弥草神', '小吉祥草王', ...characters.map((item) => item.name)], marker: marker('WORLD_CONFIRM', '原神角色与设定是否保留，需要用户确认') },
    { type: 'real-world-china', evidence: data.destinations.map((item) => item.name), marker: marker('WORLD_CONFIRM', '17 个现实中国目的地是否保留，需要用户确认') },
    { type: 'original-game', evidence: ['旅行食物里程', '家园农场', '玩具访客', '确定性明信片'], marker: marker('WORLD_REVIEW', '原创玩法逻辑可保留，但叙事解释需与新世界观一致') }
  ],
  geographyRules: { model: 'real latitude/longitude and kilometer distance', sources: ['src/data/geo.js', 'src/geo.js'] },
  travelLogic: '现实地理距离 + 食物公里数 + 随机旅途事件',
  homeLogic: '16:9 家园，主角状态、农场、厨房、玩具和访客并存',
  protagonistRelationship: marker('WORLD_REWRITE', '哥伦比娅为何居住于此、与现实地点/原神角色的关系尚未设计'),
  aiWorldPrompt: marker('AI_WORLD', 'Prompt 一方面禁止真实地名，事实数据另一方面提供真实目的地，存在直接冲突'),
  conflicts: [
    marker('WORLD', '现有内容同时混合现实中国地点和原神角色/神明身份'),
    marker('WORLD_CONFIRM', '当前世界是否继续使用原神世界观，需要确认'),
    marker('WORLD_CONFIRM', '现实世界地理与真实地名是否继续保留，需要确认')
  ],
  references: worldReferences.map(({ file, line, terms }) => ({ file, line, terms }))
};
writeJson('world.json', world);

const dialogues = [];
function addDialogue(id, speakerId, text, context, extra = {}) {
  dialogues.push({ dialogueId: id, speakerId, text, context, locationId: extra.locationId || null, trigger: extra.trigger || null, condition: extra.condition || null, variables: [...new Set(text.match(/\{[a-zA-Z][a-zA-Z0-9]*\}/g) || [])], references: extra.references || [], ...(extra.marker ? { marker: extra.marker } : {}) });
}
for (const state of data.nahidaStates) {
  state.lines.forEach((text, i) => addDialogue(`protagonist_state_${state.id}_${i + 1}`, 'protagonist', text, 'home-state', { locationId: `home_${state.spot}`, trigger: state.id, references: [sourceRef('src/data/home.js')] }));
  state.poke.lines.forEach((text, i) => addDialogue(`protagonist_poke_${state.id}_${i + 1}`, 'protagonist', text, 'poke-response', { locationId: `home_${state.spot}`, trigger: `poke:${state.id}`, references: [sourceRef('src/data/home.js')], marker: marker('TEXT_REVIEW', '原主角行为和语气绑定，需按哥伦比娅设定重写') }));
}
for (const topic of data.chatTopics) for (const [optionIndex, option] of topic.options.entries()) {
  addDialogue(`player_chat_${topic.id}_${optionIndex + 1}`, 'player', option.text, 'chat-option', { trigger: topic.id, references: [sourceRef('src/data/home.js')] });
  option.replies.forEach((text, i) => addDialogue(`protagonist_chat_${topic.id}_${optionIndex + 1}_${i + 1}`, 'protagonist', text, 'chat-reply', { trigger: topic.id, references: [sourceRef('src/data/home.js')], marker: marker('TEXT_REVIEW', '回复表现原主角性格，不能只替换姓名') }));
}
for (const [key, lines] of [['arrive', data.visitorArrive], ['leave', data.visitorLeave], ['alone', data.visitorAlone]]) lines.forEach((text, i) => addDialogue(`visitor_${key}_${i + 1}`, 'companion_generic', text, `visitor-${key}`, { references: [sourceRef('src/data/visitor.js')] }));
for (const [i, pair] of data.visitorGreet.entries()) {
  addDialogue(`visitor_greet_${i + 1}_protagonist`, 'protagonist', pair[0], 'visitor-greeting', { references: [sourceRef('src/data/visitor.js')], marker: marker('TEXT_REVIEW', '原主角待客语气需确认') });
  addDialogue(`visitor_greet_${i + 1}_companion`, 'companion_generic', pair[1], 'visitor-greeting', { references: [sourceRef('src/data/visitor.js')] });
}
for (const toy of data.toys) toy.playLines.forEach((text, i) => addDialogue(`protagonist_toy_${toy.id}_${i + 1}`, 'protagonist', text, 'toy-play', { trigger: toy.id, references: [sourceRef('src/data/home.js')], marker: marker('TEXT_REVIEW', '玩具台词表现原主角行为与语气，需按哥伦比娅设定审查') }));
for (const state of data.visitorStates) state.lines.forEach((text, i) => addDialogue(`visitor_state_${state.id}_${i + 1}`, 'companion_generic', text, 'visitor-state', { trigger: state.id, references: [sourceRef('src/data/visitor.js')] }));
for (const character of data.companions) {
  character.catchphrases.forEach((text, i) => addDialogue(`character_${character.id}_catchphrase_${i + 1}`, character.id, text, 'character-catchphrase', { references: [sourceRef('src/data/companions.js')] }));
  character.meetLines.forEach((text, i) => addDialogue(`character_${character.id}_meet_${i + 1}`, 'protagonist_narration', text, 'companion-meeting', { references: [sourceRef('src/data/companions.js')], marker: marker('CHARACTER_RELATIONSHIP', '第一人称原主角叙述与配角相遇，需确认新关系') }));
  character.affinityLines.forEach((text, i) => addDialogue(`character_${character.id}_affinity_${i + 1}`, 'protagonist_narration', text, 'companion-affinity', { references: [sourceRef('src/data/companions.js')], marker: marker('CHARACTER_RELATIONSHIP', '第一人称原主角关系叙述，需确认新关系') }));
}
writeJson('dialogues.json', dialogues);

const events = [
  ...data.events.map((item) => ({ eventId: item.id, category: 'destination-event', name: item.name, description: item.desc, conditions: { fitsTags: item.fitsTags }, effects: { rarity: item.rarity, mood: item.mood, weight: item.weight }, references: [sourceRef('src/data/events.js')], marker: marker('TEXT_REVIEW', '第一人称事件语气与新主角兼容性需审查') })),
  ...data.journeyEvents.map((item) => ({ eventId: item.id, category: 'journey-event', name: item.name, description: item.text, conditions: { needCompanion: !!item.needCompanion }, effects: clean(Object.fromEntries(Object.entries(item).filter(([key]) => !['id', 'name', 'text'].includes(key)))), references: [sourceRef('src/data/journey.js')], marker: marker('TEXT_REVIEW', '第一人称旅途叙述与哥伦比娅行为设定需审查') }))
];
writeJson('events.json', events);

const postcards = {
  templates: Object.fromEntries(Object.entries(data.templates).filter(([key]) => ['open', 'alone', 'eventLead', 'close', 'postcardBack', 'turnedBackOpen', 'turnedBackClose', 'turnedBackBack', 'soakedOpen', 'soakedClose', 'soakedBack', 'redirectedOpen', 'redirectedBack', 'journeyLead'].includes(key))),
  destinations: data.destinations.map((item) => ({ locationId: item.id, name: item.name, description: item.desc, sights: item.sights, foods: item.foods, activities: item.activities, image: `background_${item.id}` })),
  renderingReferences: [sourceRef('src/text/template-text.js'), sourceRef('src/render/postcard.js')],
  marker: marker('TEXT_REVIEW', '第一人称日记/明信片语气需按哥伦比娅设定整体审查')
};
writeJson('postcards.json', postcards);

const achievements = data.achievements.map((item) => ({
  achievementId: item.id, groupId: item.group, name: item.name, description: item.desc, icon: item.icon, conditionSource: item.test.toString(),
  protagonistBinding: /她|聊天|戳/.test(item.desc), locationReferences: [...item.test.toString().matchAll(/byDestination\.([a-z][a-z0-9_]*)/g)].map((match) => match[1]),
  references: [sourceRef('src/data/achievements.js')],
  ...(item.id === 'reach_kanas' || item.id === 'reach_three' ? { marker: marker('REFERENCE_ERROR', `${item.id} → locations.kanas 不存在于正式 destinations`) } : item.id === 'toy_all' ? { marker: marker('TEXT_ERROR', '说明写“全部 10 件玩具”，但 NT.data.toys 实际为 9 件') } : {})
}));
writeJson('achievements.json', achievements);

const uiSources = new Set(['index.html', '开始游戏.html', 'src/ui.js', 'src/achievements.js', 'src/farm.js', 'src/home.js', 'src/geo.js']);
const ui = lineIndex.filter((entry) => uiSources.has(entry.file)).map((entry, index) => ({
  uiTextId: `ui_${String(index + 1).padStart(4, '0')}`, text: entry.text.trim(), source: sourceRef(entry.file, entry.line),
  protagonistRelated: protagonistTerms.some((term) => entry.text.toLowerCase().includes(term.toLowerCase())),
  ...(protagonistTerms.some((term) => entry.text.toLowerCase().includes(term.toLowerCase())) ? { marker: marker('TEXT_REVIEW', 'UI 行包含原主角名称、ID或角色指代，需逐项分类') } : {})
}));
writeJson('ui.json', ui);

const items = {
  fields: clean(data.fields), crops: clean(data.crops), ingredients: clean(data.ingredients), rareDrops: clean(data.rareDrops),
  dishes: clean(data.dishes), toys: clean(data.toys), travelModes: clean(data.travelModes),
  review: marker('TEXT_REVIEW', '物品玩法数据暂不改；只需审查名称与世界观适配性'),
  references: [sourceRef('src/data/farm.js'), sourceRef('src/data/kitchen.js'), sourceRef('src/data/home.js')]
};
writeJson('items.json', items);

function resolveAssetPath(stem) {
  const extensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  const stems = Array.isArray(stem) ? stem : [stem];
  for (const candidate of stems) {
    if (!candidate) continue;
    const direct = resolve(root, assetManifest.dir, candidate);
    if (existsSync(direct)) return direct;
    const withExtension = extensions.map((extension) => resolve(root, assetManifest.dir, candidate + extension)).find(existsSync);
    if (withExtension) return withExtension;
  }
  return null;
}
const assetRows = [];
function addAsset(assetId, stem, type, ownerId = null, locationId = null, sourcePath = 'assets/manifest.js') {
  const full = resolveAssetPath(stem);
  const displayStem = Array.isArray(stem) ? stem.join(' | ') : stem;
  const rel = full ? posix(relative(root, full)) : `图片素材/${displayStem}.{png,jpg,jpeg,webp,gif}`;
  const isProtagonist = type === 'protagonist';
  assetRows.push({
    assetId, path: rel, fileType: full ? extname(full).slice(1).toLowerCase() : null, currentUse: type, usageLocations: [sourcePath, 'src/assets.js'],
    characterId: ownerId, locationId, exists: !!full, bytes: full ? statSync(full).size : null, sha256: full ? sha256(readFileSync(full)) : null,
    needsReplacement: isProtagonist, replacementReason: isProtagonist ? '当前立绘表现原主角，需换为哥伦比娅' : null,
    marker: !full ? marker('ASSET_MISSING', `${displayStem} 未找到对应图片`) : isProtagonist ? marker('ASSET_REPLACE', '当前图片表现原主角，需要替换为哥伦比娅') : marker('ASSET_REVIEW', `${type}资源是否符合新世界观，需要确认`)
  });
}
for (const [mood, stem] of Object.entries(assetManifest.nahida)) addAsset(`protagonist_${mood}`, stem, 'protagonist', 'protagonist');
for (const [id, stem] of Object.entries(assetManifest.companions)) addAsset(`companion_${id}`, stem, 'companion', id);
for (const [id, stem] of Object.entries(assetManifest.backgrounds)) addAsset(`background_${id}`, stem, 'background', null, id);
for (const [id, stem] of Object.entries(assetManifest.toys)) addAsset(`toy_${id}`, stem, 'toy');
addAsset('home', assetManifest.home, 'home-background', null, 'home');
for (const [id, stem] of Object.entries(assetManifest.icons)) addAsset(`icon_${id}`, stem, 'icon');
for (const file of allFiles.filter((item) => posix(relative(root, item)).startsWith('图片素材/'))) {
  const rel = posix(relative(root, file));
  if (assetRows.some((item) => item.path === rel) || extname(file).toLowerCase() === '.txt') continue;
  const bytes = readFileSync(file);
  assetRows.push({ assetId: `unmapped_${basename(file, extname(file))}`, path: rel, fileType: extname(file).slice(1).toLowerCase(), currentUse: 'unmapped', usageLocations: [], characterId: null, locationId: null, exists: true, bytes: bytes.length, sha256: sha256(bytes), needsReplacement: false, replacementReason: null, marker: marker('ASSET_REVIEW', '文件存在但未被当前 manifest 映射，需要确认保留用途') });
}
writeJson('assets.json', assetRows);

const aiPrompts = {
  diarySystemPrompt: { text: data.systemPrompt, protagonistBinding: true, marker: marker('AI_PROMPT_REWRITE', '明确指定《原神》纳西妲、第一人称语气且禁止真实地名，与现有事实输入冲突'), references: [sourceRef('src/data/templates.js'), sourceRef('src/text/deepseek.js')] },
  fewShot: clean(data.fewShot).map((item, index) => ({ promptId: `few_shot_${index + 1}`, ...item, marker: marker('AI_CHARACTER', '示例含纳西妲称呼与原角色语气，需要重写') })),
  chatSystemPrompt: { text: data.chatSystemPrompt, protagonistBinding: true, marker: marker('AI_PROMPT_REWRITE', '明确绑定须弥草神纳西妲及与旅行者的关系，必须整体重设'), references: [sourceRef('src/data/templates.js'), sourceRef('src/text/deepseek.js')] },
  security: marker('AI_PROMPT_REWRITE', 'AI 必须继续为可选增强；API Key 不得写入前端、URL、localStorage或存档')
};
writeJson('ai-prompts.json', aiPrompts);

const missingReferences = [];
for (const achievement of achievements) for (const id of achievement.locationReferences) if (!destinationIds.has(id)) missingReferences.push({ from: `achievement.${achievement.achievementId}`, relation: 'references-location', to: `locations.${id}`, status: 'missing-destination', marker: marker('REFERENCE_ERROR', `achievement.${achievement.achievementId} → locations.${id} 不存在于正式目的地表`) });
for (const [characterId, locationId] of Object.entries(data.companionHome)) {
  if (!destinationIds.has(locationId)) missingReferences.push({ from: `companionHome.${characterId}`, relation: 'home-location', to: `locations.${locationId}`, status: 'missing-destination', marker: marker('REFERENCE_ERROR', `companionHome.${characterId} → locations.${locationId} 不存在`) });
  if (!data.companions.some((item) => item.id === characterId)) missingReferences.push({ from: `companionHome.${characterId}`, relation: 'character', to: `characters.${characterId}`, status: 'missing-character', marker: marker('REFERENCE_ERROR', `companionHome.${characterId} 存在，但 companions 中没有该角色`) });
}
missingReferences.push({ from: 'achievement.toy_all.description', relation: 'count', to: 'items.toys', status: 'count-mismatch', marker: marker('TEXT_ERROR', `成就说明写 10 件玩具，实际玩具数为 ${data.toys.length}`) });
for (const asset of assetRows.filter((item) => !item.exists)) missingReferences.push({ from: `assets.${asset.assetId}`, relation: 'file', to: asset.path, status: 'missing-file', marker: asset.marker });
const references = {
  graph: [
    { from: 'protagonist', to: 'characters', relation: 'relationships-and-addresses' },
    { from: 'protagonist', to: 'locations', relation: 'travel-home-and-world' },
    { from: 'protagonist', to: 'dialogues', relation: 'speaker-and-first-person-narration' },
    { from: 'dialogues', to: 'events', relation: 'triggers-and-narration' },
    { from: 'events', to: 'postcards', relation: 'fact-to-text-rendering' },
    { from: 'locations', to: 'postcards', relation: 'destination-and-background' },
    { from: 'locations', to: 'achievements', relation: 'destination-statistics' },
    { from: 'characters', to: 'assets', relation: 'sprite' },
    { from: 'locations', to: 'assets', relation: 'background' },
    { from: 'protagonist', to: 'ai-prompts', relation: 'persona-and-world' }
  ],
  missing: missingReferences,
  counts: { protagonistReferences: protagonistReferences.length, worldReferences: worldReferences.length, projectTextErrors: textErrors.length, externalCopyTableTextErrors: externalObjectObjectCount, assets: assetRows.length, missingAssets: assetRows.filter((item) => !item.exists).length }
};
writeJson('references.json', references);

const mapping = [
  { oldContent: 'nahida', newContent: 'columbina', changeType: 'protagonist-id', reason: '统一主角 ID', requiresHumanConfirmation: false, marker: marker('PROTAGONIST_ID', '代码和存档需兼容迁移，不能简单全文替换') },
  { oldContent: '纳西妲', newContent: '哥伦比娅', changeType: 'protagonist-name', reason: '用户指定新主角名称', requiresHumanConfirmation: false, marker: marker('PROTAGONIST_NAME', '纯显示名称可替换；人物设定文本不可直接替换') },
  { oldContent: 'NT.data.nahidaStates', newContent: 'protagonist.states', changeType: 'logic', reason: '移除散落的角色专有数据名', requiresHumanConfirmation: true, marker: marker('LOGIC_REVIEW', '迁移前需验证 home/render/time 全部调用') },
  { oldContent: 'save.home.nahida', newContent: 'save.home.protagonist', changeType: 'save', reason: '统一存档字段', requiresHumanConfirmation: true, marker: marker('SAVE_MIGRATION', '必须兼容旧字段并保留回滚，当前阶段不改存档') },
  { oldContent: 'assetManifest.nahida', newContent: 'assetManifest.protagonist', changeType: 'asset-logic', reason: '统一主角资源入口', requiresHumanConfirmation: true, marker: marker('LOGIC_REVIEW', '资源加载器和旧 manifest 需要兼容别名') },
  { oldContent: '主角-待机/开心/疲惫', newContent: null, changeType: 'asset', reason: '当前图片表现原主角', requiresHumanConfirmation: true, marker: marker('ASSET_REPLACE', '需用户提供或确认哥伦比娅三态立绘') },
  { oldContent: '须弥草神/小吉祥草王', newContent: null, changeType: 'character-world', reason: '原主角身份不可沿用为哥伦比娅设定', requiresHumanConfirmation: true, marker: marker('PROTAGONIST_REWRITE', '等待哥伦比娅人物设定') },
  { oldContent: '旅行者（照顾主角的人）', newContent: null, changeType: 'relationship', reason: '关系对象与玩家身份不明确', requiresHumanConfirmation: true, marker: marker('CHARACTER_RELATIONSHIP', '不能映射为哥伦比娅本人') },
  { oldContent: '现实中国目的地 + 原神角色', newContent: null, changeType: 'world', reason: '现有世界观边界冲突', requiresHumanConfirmation: true, marker: marker('WORLD_CONFIRM', '决定保留现实地点、原神世界或建立经确认的新边界') },
  { oldContent: '[object Object]', newContent: null, changeType: 'text-error', reason: '源文本序列化错误', requiresHumanConfirmation: true, marker: marker('TEXT_ERROR', '禁止猜测原文，必须回查来源') }
];
writeJson('content-mapping.json', mapping);

const checks = {
  generatedAt: new Date().toISOString(),
  counts: {
    sourceFiles: sourceInventory.length, chineseTextLines: lineIndex.length, protagonistReferences: protagonistReferences.length,
    characterRecords: characters.length, playableCompanions: data.companions.length, destinations: data.destinations.length, locationRecords: locations.length, dialogues: dialogues.length,
    events: events.length, achievements: achievements.length, assets: assetRows.length, missingAssets: assetRows.filter((item) => !item.exists).length,
    textObjectObjectErrors: textErrors.length, externalCopyTableObjectObjectErrors: externalObjectObjectCount, missingReferences: missingReferences.length
  },
  assertions: {
    allDialoguesHaveUniqueId: new Set(dialogues.map((item) => item.dialogueId)).size === dialogues.length,
    allDialoguesHaveSpeaker: dialogues.every((item) => item.speakerId),
    allDialogueVariablesParse: dialogues.every((item) => item.variables.every((variable) => /^\{[a-zA-Z][a-zA-Z0-9]*\}$/.test(variable))),
    allManifestAssetsTracked: Object.values(assetManifest.nahida).length + Object.values(assetManifest.companions).length + Object.values(assetManifest.backgrounds).length + Object.values(assetManifest.toys).length + Object.values(assetManifest.icons).length + 1 <= assetRows.length,
    protagonistReferencesRecorded: protagonistReferences.length > 0,
    orphanKanasRecorded: missingReferences.some((item) => item.to === 'locations.kanas')
  }
};
writeJson('extraction-summary.json', checks);

const report = `# Content Extraction Report\n\n` +
`项目：现有旅行游戏 → 哥伦比娅内容审查阶段  \n` +
`分支：feature/content-extraction-columbina  \n` +
`原则：只提取、分类、标记、映射和审查；未改游戏运行内容、玩法或存档结构。\n\n` +
`## 提取总览\n\n` +
`- 源文件：${checks.counts.sourceFiles}\n- 中文文本行：${checks.counts.chineseTextLines}\n- 主角关键词引用：${checks.counts.protagonistReferences}\n` +
`- 角色记录：${checks.counts.characterRecords}（8 个可用配角、1 个规划主角、旅行者关系引用、2 个孤儿角色引用）\n- 正式目的地：${checks.counts.destinations}\n- 地点记录：${checks.counts.locationRecords}\n` +
`- 对白/叙述：${checks.counts.dialogues}\n- 事件：${checks.counts.events}\n- 成就：${checks.counts.achievements}\n- 资源：${checks.counts.assets}\n` +
`- 缺失资源：${checks.counts.missingAssets}\n- [object Object] 游戏项目源码命中：${checks.counts.textObjectObjectErrors}\n- [object Object] 外部文案总表命中：${checks.counts.externalCopyTableObjectObjectErrors}（只计数，未导入游戏内容）\n- 引用/计数错误：${checks.counts.missingReferences}\n\n` +
`## 核心结论\n\n` +
`1. ${marker('PROTAGONIST_REWRITE', '原主角不只是名称；身份、性格、语气、行为、关系、Prompt、立绘和存档字段均绑定纳西妲')}\n` +
`2. ${marker('WORLD', '内容同时包含现实中国地理与《原神》角色/须弥神明设定，世界边界必须由用户确认')}\n` +
`3. ${marker('LOCATION_ORPHAN', 'kanas / 喀纳斯在 geo 和成就中存在，但 destinations 没有定义')}\n` +
`4. ${marker('AI_PROMPT_REWRITE', '日记与聊天 Prompt 明确指定纳西妲；其中禁止真实地名的约束又与真实目的地事实冲突')}\n` +
`5. ${marker('SAVE_MIGRATION', 'home.nahida 是真实存档字段；下一阶段改名必须兼容旧存档')}\n` +
`6. ${marker('ASSET_REPLACE', '主角三态图片必须重新制作；本阶段仅登记，不删除原图')}\n\n` +
`## 需要人工确认\n\n` +
`- 哥伦比娅的人物身份、性格、语气、兴趣、行为禁区与玩家关系。\n` +
`- 是否保留《原神》角色和设定；是否保留 17 个现实中国目的地。\n` +
`- 现有家园、农场、厨房、玩具与访客是否符合新主角。\n` +
`- 主角三态立绘、网页图标和家园背景的制作方向。\n` +
`- kanas 是补充为正式目的地、改成别的地点，还是在确认后移除其成就引用。\n\n` +
`## 可追溯资料\n\n` +
`- content/original/source-inventory.json：原文件哈希清单。\n` +
`- content/original/text-occurrences.json：逐行中文内容索引。\n` +
`- content/original/protagonist-references.json：主角关键词逐行命中。\n` +
`- content/original/world-references.json：世界观关键词逐行命中。\n` +
`- content/original/extracted-runtime-data.json：运行时数据对象的原始提取。\n` +
`- content/references.json：内容引用图与缺失引用。\n\n` +
`## 阶段边界\n\n` +
`本阶段没有把游戏正式改成哥伦比娅版本，也没有创作新剧情。下一阶段应按“人物设定确认 → 世界观确认 → 地点与关系确认 → 文案重写 → 资源替换 → 存档兼容迁移 → 游戏接入”的顺序进行。\n`;
writeFileSync(resolve(contentDir, 'content-review.md'), report, 'utf8');
writeFileSync(resolve(root, 'CONTENT_EXTRACTION_REPORT.md'), report, 'utf8');

console.log(JSON.stringify(checks, null, 2));
if (Object.values(checks.assertions).some((value) => !value)) process.exitCode = 1;
