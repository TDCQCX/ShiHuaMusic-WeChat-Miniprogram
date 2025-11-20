// my-favorites.js
const app = getApp()

Page({
  data: {
    songs: [],
    isLoading: false
  },

  onLoad() {
    // 确保tabBar显示
    wx.showTabBar()
    // 检查登录状态
    this.checkLoginStatus()
  },

  onShow() {
    // 每次显示页面时重新加载数据
    if (app.globalData.isLoggedIn) {
      this.loadLikedSongs()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = app.globalData.isLoggedIn
    
    if (!isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '收藏功能需要登录后使用',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          } else {
            wx.navigateBack()
          }
        }
      })
    } else {
      this.loadLikedSongs()
    }
  },

  // 加载收藏的歌曲 - 使用与最近播放相同的推荐歌曲API
  async loadLikedSongs() {
    try {
      this.setData({ isLoading: true })
      console.log('开始加载收藏歌曲')
      
      // 调用与最近播放页面相同的推荐歌曲API
      const songsRes = await app.request('/song/getRecommendedSongs')
      console.log('推荐歌曲响应:', songsRes)
      
      if (songsRes.code === 0 && songsRes.data && Array.isArray(songsRes.data)) {
        // 限制为前10个歌曲
        const limitedSongs = songsRes.data.slice(0, 10)
        
        // 转换歌曲时长格式
        const formattedSongs = limitedSongs.map(song => ({
          ...song,
          duration: this.formatDuration(song.duration || 0)
        }))
        
        this.setData({
          songs: formattedSongs,
          isLoading: false
        })
      }
    } catch (error) {
      console.error('加载收藏歌曲失败:', error)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
      this.setData({ isLoading: false })
    }
  },
  
  // 格式化时长（秒转分:秒）
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  },

  // 播放歌曲
  playSong(e) {
    const songId = e.currentTarget.dataset.id
    const song = this.data.songs.find(s => s.songId === songId)
    
    if (song) {
      // 获取全局音频管理器
      const audioManager = app.globalData.audioManager
      
      // 使用音频管理器播放歌曲
      audioManager.play(song, this.data.songs)
      wx.setStorageSync('currentSong', song)
      wx.setStorageSync('isPlaying', true)
    }
  },

  // 显示更多选项
  showMoreOptions(e) {
    e.stopPropagation() // 阻止事件冒泡
    
    const songId = e.currentTarget.dataset.id
    const song = this.data.songs.find(s => s.songId === songId)
    
    wx.showActionSheet({
      itemList: ['分享', '查看歌手', '查看专辑', '添加到播放列表', '下载'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0: // 分享
            this.shareSong(song)
            break
          case 1: // 查看歌手
            // 歌手页面不存在，暂不支持此功能
            wx.showToast({
              title: '歌手详情功能暂未开放',
              icon: 'none'
            })
            break
          case 2: // 查看专辑
            wx.showToast({
              title: '专辑功能开发中',
              icon: 'none'
            })
            break
          case 3: // 添加到播放列表
            wx.showToast({
              title: '播放列表功能开发中',
              icon: 'none'
            })
            break
          case 4: // 下载
            wx.showToast({
              title: '下载功能开发中',
              icon: 'none'
            })
            break
        }
      }
    })
  },

  // 分享歌曲
  shareSong(song) {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})