// library.js - 全部音乐页面
const app = getApp()

Page({
  data: {
    recommendedSongs: [],
    searchKeyword: '',
    isLoading: false,
    showBackTop: false
  },

  onLoad() {
    // 加载推荐歌曲
    this.loadRecommendedSongs()
  },

  // 加载推荐歌曲
  async loadRecommendedSongs(isAppend = false) {
    try {
      // 对于追加模式，先设置isLoading状态，但不要改变歌曲列表
      // 这样可以避免页面在加载过程中出现刷新
      if (isAppend) {
        this.setData({ isLoading: true })
      } else {
        // 初始加载时设置isLoading
        this.setData({ isLoading: true })
      }
      
      // 调用获取推荐歌曲的API
      const res = await app.request('/song/getRecommendedSongs')
      console.log('推荐歌曲响应:', res)
      
      if (res.code === 0 && res.data && Array.isArray(res.data)) {
        // 格式化歌曲时长
        const formattedSongs = res.data.map(song => ({
          ...song,
          duration: this.formatDuration(song.duration || 0)
        }))
        
        // 确保只获取20条新歌曲
        const newSongs = formattedSongs.slice(0, 20)
        
        if (isAppend) {
          // 追加模式 - 只追加新歌曲，不改变已有数据
          // 使用数组扩展操作符创建新数组，避免直接修改原数组
          const updatedSongs = [...this.data.recommendedSongs, ...newSongs]
          // 一次性更新所有数据，避免多次setData导致的界面闪烁
          this.setData({
            recommendedSongs: updatedSongs,
            isLoading: false
          })
        } else {
          // 初始加载模式
          this.setData({
            recommendedSongs: newSongs,
            isLoading: false
          })
        }
      } else {
        this.setData({ 
          isLoading: false
        })
        wx.showToast({
          title: '获取歌曲列表失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载歌曲失败:', error)
      this.setData({ 
        isLoading: false
      })
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

  // 搜索相关函数 - 暂时保留但不使用
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  onSearchConfirm() {
    this.loadRecommendedSongs()
  },

  onClearSearch() {
    this.setData({ searchKeyword: '' })
    this.loadRecommendedSongs()
  },

  // 播放歌曲
  playSong(e) {
    const { song, index } = e.currentTarget.dataset
    
    if (song) {
      // 设置全局播放状态
      app.globalData.currentSong = song
      app.globalData.currentSongList = this.data.recommendedSongs
      app.globalData.currentIndex = index
      
      // 使用全局音频管理器播放歌曲
      const audioManager = app.globalData.audioManager;
      audioManager.play(song, this.data.recommendedSongs);
    }
  },

  // 上拉加载更多 - 追加20条新的随机歌曲
  onReachBottom() {
    // 防止重复加载
    if (!this.data.isLoading) {
      // 直接调用加载方法，使用追加模式
      this.loadRecommendedSongs(true)
    }
  },

  // 分享功能
  // 监听页面滚动，控制回到顶部按钮显示
  onPageScroll: function(e) {
    // 当滚动距离超过300px时显示回到顶部按钮
    this.setData({
      showBackTop: e.scrollTop > 300
    })
  },

  onBackTopClick: function() {
    // 点击回到顶部按钮，滚动到页面顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  // 页面显示时检查播放状态
  onShow: function() {
    const app = getApp();
    const audioManager = app.globalData.audioManager;
    const state = audioManager.getState();
    this.setData({ showPlayer: !!state.currentSong });
  },

  onShareAppMessage() {
    return {
      title: '我的音乐库',
      path: '/pages/library/library'
    }
  }
})