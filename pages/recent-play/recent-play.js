// pages/recent-play/recent-play.js
const app = getApp()

Page({
  data: {
    recentSongs: [],
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
      this.loadRecentSongs()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = app.globalData.isLoggedIn
    
    if (!isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '最近播放功能需要登录后使用',
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
      this.loadRecentSongs()
    }
  },

  // 加载最近播放数据 - 使用首页相同的推荐歌曲API
  async loadRecentSongs() {
    try {
      this.setData({ isLoading: true })
      console.log('开始加载最近播放歌曲')
      
      // 调用与首页相同的推荐歌曲API
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
          recentSongs: formattedSongs,
          isLoading: false
        })
      }
    } catch (error) {
      console.error('加载最近播放歌曲失败:', error)
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
    const song = this.data.recentSongs.find(s => s.songId === songId)
    
    if (song) {
      // 获取全局音频管理器
      const audioManager = app.globalData.audioManager
      
      // 使用音频管理器播放歌曲
      audioManager.play(song, this.data.recentSongs)
      wx.setStorageSync('currentSong', song)
      wx.setStorageSync('isPlaying', true)
      
      // 歌曲详情页已移除，不再跳转
    }
  },

  // 显示更多选项
  showMoreOptions(e) {
    e.stopPropagation() // 阻止事件冒泡
    
    const songId = e.currentTarget.dataset.id
    const song = this.data.recentSongs.find(s => s.songId === songId)
    
    wx.showActionSheet({
      itemList: ['分享', '查看歌手', '添加到歌单', '删除'],
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
          case 2: // 添加到歌单
            this.addToPlaylist(song)
            break
          case 3: // 删除
            this.deleteSong(songId)
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
  },

  // 添加到歌单
  addToPlaylist(song) {
    wx.showToast({
      title: '添加到歌单功能开发中',
      icon: 'none'
    })
  },

  // 删除歌曲
  deleteSong(songId) {
    const index = this.data.recentSongs.findIndex(s => s.songId === songId)
    if (index !== -1) {
      const newSongs = [...this.data.recentSongs]
      newSongs.splice(index, 1)
      
      this.setData({
        recentSongs: newSongs
      })
      
      wx.showToast({
        title: '已从最近播放中移除',
        icon: 'success'
      })
    }
  },

  // 去发现音乐
  goToDiscover() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})