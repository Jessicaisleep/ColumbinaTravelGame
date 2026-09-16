/* 哥伦比娅的旅行 · 提瓦特地图定位
 * 提瓦特区域不能通过现实浏览器/IP 定位映射；游戏所在地固定为挪德卡莱。
 */
(function (root) {
  'use strict';
  var NT = (root.NT = root.NT || {});
  NT.geo = {
    detect: function () {
      return Promise.resolve({
        regionId: 'nod_krai',
        regionName: '挪德卡莱',
        source: 'game'
      });
    }
  };
})(typeof window !== 'undefined' ? window : this);
