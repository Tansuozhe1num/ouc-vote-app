export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/draw/index',
    'pages/rank/index',
    'pages/inbox/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/publish/index',
    'pages/auth/index',
    'pages/profile/index',
    'pages/chat/index',
    'pages/settings/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    backgroundColor: '#ffffff',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '同频 · CAMPUS',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#ff2442',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: '发现', iconPath: 'assets/tabbar/index.png', selectedIconPath: 'assets/tabbar/index-selected.png' },
      { pagePath: 'pages/draw/index', text: '随机搭子', iconPath: 'assets/tabbar/draw.png', selectedIconPath: 'assets/tabbar/draw-selected.png' },
      { pagePath: 'pages/publish/index', text: '发布', iconPath: 'assets/tabbar/plus.png', selectedIconPath: 'assets/tabbar/plus-selected.png' },
      { pagePath: 'pages/inbox/index', text: '消息', iconPath: 'assets/tabbar/inbox.png', selectedIconPath: 'assets/tabbar/inbox-selected.png' },
      { pagePath: 'pages/mine/index', text: '我的', iconPath: 'assets/tabbar/mine.png', selectedIconPath: 'assets/tabbar/mine-selected.png' }
    ]
  },
  networkTimeout: { request: 15000, uploadFile: 60000 }
})
