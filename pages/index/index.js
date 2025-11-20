// index.js
const app = getApp()

Page({
  data: {
    banners: [],
    recommendedPlaylists: [],
    recommendedSongs: [],
    showWelcomeModal: false
  },

  onLoad() {
    // 获取全局应用实例
    const app = getApp();
    // 设置欢迎弹窗显示状态
    this.setData({
      showWelcomeModal: app.globalData.showWelcomeModal
    });
    // 加载首页数据
    this.loadHomeData()
    
    // 监听全局播放状态
    this.updatePlayerStatus()
  },

  onShow() {
    // 页面显示时更新播放状态
    this.updatePlayerStatus()
  },

  // 跳转到全部歌曲页面
  navigateToAllSongs() {
    wx.navigateTo({
      url: '/pages/library/library'
    })
  },

  // 加载首页数据
  async loadHomeData() {
    try {
      console.log('开始加载首页数据')

      // 加载轮播图
      try {
        const bannerRes = await app.request('/banner/getBannerList')
        console.log('轮播图响应:', bannerRes)
        
        if (bannerRes.code === 0 && bannerRes.data && Array.isArray(bannerRes.data)) {
          // 转换数据格式，使用app.processImageUrl处理图片URL
          const formattedBanners = bannerRes.data.map(banner => ({
            ...banner,
            imageUrl: app.processImageUrl(banner.bannerUrl) // 确保字段名一致并正确处理URL
          }))
          this.setData({ banners: formattedBanners })
        }
      } catch (bannerError) {
        console.error('轮播图加载失败:', bannerError)
      }

      // 加载推荐歌单
      try {
        const playlistsRes = await app.request('/playlist/getRecommendedPlaylists')
        console.log('推荐歌单响应:', playlistsRes)
        
        if (playlistsRes.code === 0 && playlistsRes.data && Array.isArray(playlistsRes.data)) {
          // 显示前8个歌单，以显示两排
          const limitedPlaylists = playlistsRes.data.slice(0, 8);
          this.setData({ recommendedPlaylists: limitedPlaylists })
        }
      } catch (playlistError) {
        console.error('推荐歌单加载失败:', playlistError)
      }

      // 加载推荐歌曲
      try {
        const songsRes = await app.request('/song/getRecommendedSongs')
        console.log('推荐歌曲响应:', songsRes)
        
        if (songsRes.code === 0 && songsRes.data && Array.isArray(songsRes.data)) {
          // 转换歌曲时长格式
          const formattedSongs = songsRes.data.map(song => ({
            ...song,
            duration: this.formatDuration(song.duration || 0)
          }))
          this.setData({ recommendedSongs: formattedSongs })
        }
      } catch (songError) {
        console.error('推荐歌曲加载失败:', songError)
      }
      
      console.log('首页数据加载完成')
    } catch (error) {
      console.error('加载首页数据失败:', error)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    }
  },
  
  // 格式化时长（秒转分:秒）
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  },

  // 跳转到歌单详情
  navigateToPlaylistDetail(e) {
    const playlistId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/playlistDetail/playlistDetail?id=${playlistId}`
    })
  },

  // 播放歌曲
  playSong(e) {
    const index = e.currentTarget.dataset.index;
    const song = this.data.recommendedSongs[index];
    
    if (song) {
      // 获取全局的音频管理器
      const audioManager = app.globalData.audioManager;
      
      // 使用音频管理器播放歌曲，与其他页面保持一致的调用方式
      audioManager.play(song, this.data.recommendedSongs);
    }
  },
  
  // 更新播放器状态
  updatePlayerStatus() {
    try {
      // 获取全局音频管理器
      const audioManager = getApp().globalData.audioManager;
      if (!audioManager) {
        console.warn('音频管理器未初始化');
        return;
      }
      
      // 获取当前播放状态，但不重置或修改任何播放状态
      // 只做记录，让播放器组件通过事件监听自动处理状态同步
      const currentState = audioManager.getState();
      console.log('检查播放器状态，当前歌曲:', currentState.currentSong ? currentState.currentSong.songName : '无', 
                  '播放进度:', currentState.progress.toFixed(2) + '%');
      
      // 确保不重置播放列表，这是导致切到首页时播放器状态异常的关键
      // 不要在首页加载时替换全局的播放列表
    } catch (error) {
      console.error('更新播放器状态失败:', error);
    }
  },
  
  // 处理欢迎弹窗确认事件
  onWelcomeModalConfirm() {
    const app = getApp();
    // 调用全局方法关闭弹窗并记录状态
    app.closeWelcomeModal();
    // 更新页面数据，隐藏弹窗
    this.setData({
      showWelcomeModal: false
    });
  },
  
  // 下拉刷新功能 - 重新加载轮播图、推荐歌单和推荐歌曲
  onPullDownRefresh() {
    this.loadHomeData().finally(() => {
      // 无论成功失败都停止下拉刷新动画
      wx.stopPullDownRefresh()
    })
  }
})