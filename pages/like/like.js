// like.js
const app = getApp()

Page({
  data: {
    songs: [],
    isLoading: false
  },

  onLoad() {
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

  // 加载收藏的歌曲
  loadLikedSongs() {
    this.setData({ isLoading: true })
    
    // 模拟数据，实际应调用API
    setTimeout(() => {
      const songs = [
        {
          songId: '1',
          songName: '海阔天空',
          artistName: 'Beyond',
          coverUrl: 'https://img1.baidu.com/it/u=3945994808,3696504509&fm=253&fmt=auto&app=138&f=JPEG?w=889&h=500',
          audioUrl: 'https://example.com/songs/1.mp3'
        },
        {
          songId: '2',
          songName: '光辉岁月',
          artistName: 'Beyond',
          coverUrl: 'https://img2.baidu.com/it/u=3804298115,3537968118&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          audioUrl: 'https://example.com/songs/2.mp3'
        },
        {
          songId: '3',
          songName: '真的爱你',
          artistName: 'Beyond',
          coverUrl: 'https://img0.baidu.com/it/u=3592891237,2372292998&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=800',
          audioUrl: 'https://example.com/songs/3.mp3'
        },
        {
          songId: '4',
          songName: '不再犹豫',
          artistName: 'Beyond',
          coverUrl: 'https://img1.baidu.com/it/u=1886866861,2570801312&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          audioUrl: 'https://example.com/songs/4.mp3'
        },
        {
          songId: '5',
          songName: '喜欢你',
          artistName: 'Beyond',
          coverUrl: 'https://img1.baidu.com/it/u=3781264307,3669301443&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          audioUrl: 'https://example.com/songs/5.mp3'
        }
      ]
      
      this.setData({
        songs,
        isLoading: false
      })
    }, 500)
  },

  // 播放歌曲
  playSong(e) {
    const songId = e.currentTarget.dataset.id
    const song = this.data.songs.find(s => s.songId === songId)
    
    if (song) {
      // 设置当前播放歌曲
      const audioContext = app.globalData.audioContext
      audioContext.src = song.audioUrl
      audioContext.play()
      
      // 保存到全局
      app.globalData.currentSong = song
      app.globalData.isPlaying = true
      wx.setStorageSync('currentSong', song)
      wx.setStorageSync('isPlaying', true)
    }
  },

  // 切换收藏状态
  toggleLike(e) {
    e.stopPropagation() // 阻止事件冒泡
    
    const songId = e.currentTarget.dataset.id
    const index = this.data.songs.findIndex(s => s.songId === songId)
    
    if (index !== -1) {
      // 模拟取消收藏，实际应调用API
      wx.showModal({
        title: '取消收藏',
        content: '确定要取消收藏这首歌曲吗？',
        success: (res) => {
          if (res.confirm) {
            // 从列表中移除
            const newSongs = [...this.data.songs]
            newSongs.splice(index, 1)
            
            this.setData({
              songs: newSongs
            })
            
            wx.showToast({
              title: '已取消收藏',
              icon: 'success'
            })
          }
        }
      })
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
  },

  // 去发现音乐
  goToDiscover() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '我喜欢的音乐',
      path: '/pages/like/like'
    }
  }
})