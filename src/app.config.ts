export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/hotel-list/index',
    'pages/hotel-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '酒店预订',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#1890ff',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '查询'
      },
      {
        pagePath: 'pages/hotel-list/index',
        text: '列表'
      },
      {
        pagePath: 'pages/hotel-detail/index',
        text: '详情'
      }
    ]
  },
  lazyCodeLoading: 'requiredComponents'
})
