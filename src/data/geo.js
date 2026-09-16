/* 哥伦比娅的旅行 · 提瓦特抽象地图与行程花费
 * 为兼容旧引擎保留 distanceKm / foodKm 字段名；界面统一称为“旅途点”。
 * 坐标只表示区域在游戏地图上的相对位置，不是现实经纬度。
 */
(function (root) {
  'use strict';
  var NT = (root.NT = root.NT || {});
  NT.data = NT.data || {};

  NT.data.geo = {
    mondstadt: { lat: 2, lng: 5, remoteness: 1.00 },
    liyue:      { lat: 6, lng: 8, remoteness: 1.05 },
    inazuma:    { lat: 11, lng: 7, remoteness: 1.25 },
    sumeru:     { lat: 5, lng: 12, remoteness: 1.20 },
    fontaine:   { lat: 6, lng: 3, remoteness: 1.10 },
    natlan:     { lat: 1, lng: 11, remoteness: 1.35 },
    nod_krai:   { lat: 8, lng: 0, remoteness: 1.00 }
  };

  NT.data.geoOf = function (id) {
    var dest = NT.data.destinationById ? NT.data.destinationById(id) : null;
    if (dest && typeof dest.mapX === 'number' && typeof dest.mapY === 'number') {
      return {
        lat: dest.mapX,
        lng: dest.mapY,
        remoteness: typeof dest.remoteness === 'number' ? dest.remoteness : 1.2,
        inline: true
      };
    }
    if (dest && typeof dest.lat === 'number' && typeof dest.lng === 'number') {
      return {
        lat: dest.lat,
        lng: dest.lng,
        remoteness: typeof dest.remoteness === 'number' ? dest.remoteness : 1.2,
        inline: true
      };
    }
    return NT.data.geo[id] || NT.data.geo.nod_krai;
  };

  NT.data.hasRealGeo = function (id) {
    var dest = NT.data.destinationById ? NT.data.destinationById(id) : null;
    return !!NT.data.geo[id] || !!(dest &&
      ((typeof dest.mapX === 'number' && typeof dest.mapY === 'number') ||
       (typeof dest.lat === 'number' && typeof dest.lng === 'number')));
  };

  NT.data.homeCityGeo = {};
  NT.data.homeCities = function () {
    return [{ id: 'nod_krai', name: '挪德卡莱', bearing: 'n', isDestination: true }];
  };

  NT.data.homeCityById = function (id) {
    return id === 'nod_krai' ? NT.data.homeCities()[0] : null;
  };

  NT.data.homeName = function () { return '挪德卡莱'; };

  var MAP_POINT_SCALE = 140;

  NT.data.distanceKm = function (aId, bId) {
    if (aId === bId) return 0;
    var a = NT.data.geoOf(aId);
    var b = NT.data.geoOf(bId);
    var dx = b.lat - a.lat;
    var dy = b.lng - a.lng;
    return Math.round(Math.sqrt(dx * dx + dy * dy) * MAP_POINT_SCALE);
  };

  NT.data.travelCost = function (homeId, destId) {
    if (homeId === destId) return 0;
    var d = NT.data.distanceKm(homeId, destId);
    return Math.round(d * NT.data.geoOf(destId).remoteness);
  };

  NT.data.lerpGeo = function (aId, bId, f) {
    var a = NT.data.geoOf(aId);
    var b = NT.data.geoOf(bId);
    return { lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f };
  };

  NT.data.nearestDestination = function (point, excludeIds) {
    excludeIds = excludeIds || [];
    var best = null;
    var bestD = Infinity;
    var list = NT.data.destinations || [];
    for (var i = 0; i < list.length; i++) {
      if (excludeIds.indexOf(list[i].id) >= 0) continue;
      var g = NT.data.geoOf(list[i].id);
      var dx = g.lat - point.lat;
      var dy = g.lng - point.lng;
      var d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = list[i]; }
    }
    return best;
  };

  /* 现实定位不适用于提瓦特地图；保留接口并固定返回游戏所在地。 */
  NT.data.nearestToLatLng = function () {
    return NT.data.destinationById('nod_krai');
  };

  NT.data.KM_PER_HOUR = 95;
  NT.data.MAX_HOURS = 48;
  NT.data.MIN_HOURS = 1;

  NT.data.hoursForCost = function (costKm) {
    if (costKm <= 0) return NT.data.MIN_HOURS;
    return NT.data.clampHours(1 + costKm / NT.data.KM_PER_HOUR);
  };

  NT.data.clampHours = function (h) {
    if (h < NT.data.MIN_HOURS) return NT.data.MIN_HOURS;
    if (h > NT.data.MAX_HOURS) return NT.data.MAX_HOURS;
    return Math.round(h * 10) / 10;
  };

  NT.data.distanceTier = function (cost) {
    if (cost <= 0) return { id: 'local', name: '家园周边', order: 0 };
    if (cost <= 500) return { id: 'near', name: '短途', order: 1 };
    if (cost <= 1000) return { id: 'region', name: '邻近区域', order: 2 };
    if (cost <= 1500) return { id: 'mid', name: '跨域', order: 3 };
    if (cost <= 2100) return { id: 'far', name: '远行', order: 4 };
    return { id: 'extreme', name: '极远', order: 5 };
  };
})(typeof window !== 'undefined' ? window : this);
