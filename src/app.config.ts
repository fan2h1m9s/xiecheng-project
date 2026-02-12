export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/hotel-list/index',
    'pages/hotel-map/index',
    'pages/hotel-detail/index',
    'pages/date-select/index',
    'pages/city-select/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '易宿酒店预订平台',
    navigationBarTextStyle: 'black'
  },
  permission: {
    'scope.userLocation': {
      desc: '用于展示附近酒店和地图位置'
    }
  },
  requiredPrivateInfos: ['getLocation'],
  lazyCodeLoading: 'requiredComponents'
})
