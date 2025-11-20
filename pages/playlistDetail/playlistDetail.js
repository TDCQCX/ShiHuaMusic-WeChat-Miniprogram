// pages/playlistDetail/playlistDetail.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    playlistId: '',
    playlist: {
      name: '加载中...',
      description: '',
      coverImgUrl: '/assets/images/default-cover.svg',
      creator: {
        nickname: 'ShiHua Music',
        avatarUrl: '/assets/images/default-cover.svg'
      },
      trackCount: 0,
      tags: ['流行', '音乐', '播放列表']
    },
    songs: [
      {
        songId: 1,
        songName: '默认歌曲示例',
        artistName: '示例艺术家',
        album: '示例专辑',
        duration: 180000,
        coverUrl: '/assets/images/default-cover.svg',
        audioUrl: '',
        likeStatus: 0,
        releaseTime: '2023'
      }
    ],
    comments: [
      {
        commentId: 1,
        username: '示例用户',
        userAvatar: '/assets/images/default-cover.svg',
        content: '这是一个示例评论，展示评论区功能',
        createTime: '2023-01-01 12:00',
        likeCount: 5
      }
    ],
    activeTab: 'songs', // songs 或 comments
    isCollected: false,
    commentContent: '',
    maxLength: 180,
    loading: true,
    error: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 确保tabBar显示
    wx.showTabBar();
    
    // 获取歌单ID
    if (options.id) {
      this.setData({ playlistId: options.id });
      this.getPlaylistDetail(options.id);
    } else {
      this.setData({ 
        loading: false,
        error: '歌单ID不存在' 
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 确保tabBar显示
    wx.showTabBar();
    
    // 检查登录状态变化，更新收藏状态
    if (this.data.playlistId) {
      this.checkCollectionStatus();
    }
    
    // 确保页面加载完成后显示默认数据
    if (this.data.loading) {
      setTimeout(() => {
        if (this.data.loading) {
          this.setData({ loading: false });
        }
      }, 3000); // 3秒后如果仍然在加载状态，自动显示默认数据
    }
  },

  /**
   * 获取歌单详情
   */
  getPlaylistDetail(playlistId) {
    wx.showLoading({ title: '加载中' });
    
    app.request({
      url: `/playlist/getPlaylistDetail/${playlistId}`,
      method: 'GET',
      success: (res) => {
        console.log('歌单详情API响应:', res);
        if (res.code === 0 && res.data) {
          const playlistData = res.data;
          
          // 转换歌曲数据
          const convertedSongs = playlistData.songs.map(song => ({
            songId: song.songId,
            songName: song.songName,
            artistName: song.artistName,
            album: song.album,
            duration: song.duration,
            coverUrl: song.coverUrl || '/assets/images/default-cover.svg',
            audioUrl: song.audioUrl,
            likeStatus: song.likeStatus || 0,
            releaseTime: song.releaseTime
          }));

          this.setData({
            playlist: {
              name: playlistData.title || '未知歌单',
              description: playlistData.introduction || '',
              coverImgUrl: playlistData.coverUrl || '/assets/images/default-cover.svg',
              creator: {
                nickname: 'ShiHua Music',
                avatarUrl: '/assets/images/default-cover.svg'
              },
              trackCount: playlistData.songs.length,
              tags: playlistData.tags || []
            },
            songs: convertedSongs,
            comments: playlistData.comments || [],
            loading: false,
            error: ''
          });
          
          // 更新导航栏标题
          wx.setNavigationBarTitle({ title: playlistData.title || '歌单详情' });
          
          // 检查收藏状态
          this.checkCollectionStatus();
        } else {
          // API请求成功但数据不符合预期，显示默认数据
          console.warn('歌单数据不符合预期，显示默认数据');
          this.setData({ 
            loading: false,
            error: res.message || '获取歌单详情失败' 
          });
        }
      },
      fail: (error) => {
        console.error('获取歌单详情失败:', error);
        // 请求失败时保持默认数据，但显示错误提示
        this.setData({ 
          loading: false,
          error: '网络错误，请稍后重试' 
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  /**
   * 检查歌单收藏状态
   */
  checkCollectionStatus() {
    // 这里应该调用检查收藏状态的API
    // 暂时设置为false，实际使用时需要根据用户登录状态和API返回值更新
    this.setData({ isCollected: false });
  },

  /**
   * 切换收藏状态
   */
  toggleCollect() {
    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const action = this.data.isCollected ? '取消收藏' : '收藏';
    wx.showLoading({ title: `${action}中` });
    
    // 这里应该调用收藏/取消收藏的API
    // 暂时模拟成功
    setTimeout(() => {
      this.setData({ isCollected: !this.data.isCollected });
      wx.showToast({ title: `${action}成功` });
      wx.hideLoading();
    }, 500);
  },

  /**
   * 播放全部歌曲
   */
  handlePlayAll() {
    if (this.data.songs.length === 0) {
      wx.showToast({ title: '歌单暂无歌曲', icon: 'none' });
      return;
    }

    // 将歌曲添加到全局播放列表并播放第一首
    const audioManager = app.globalData.audioManager;
    
    // 转换歌曲格式
    const playList = this.data.songs.map(song => ({
      songId: song.songId,
      songName: song.songName,
      artistName: song.artistName,
      album: song.album,
      coverUrl: song.coverUrl,
      audioUrl: song.audioUrl,
      duration: song.duration
    }));

    // 播放第一首歌
    audioManager.play(playList[0], playList);
  },

  /**
   * 播放单首歌曲
   */
  handlePlaySong(e) {
    const songIndex = e.currentTarget.dataset.index;
    const song = this.data.songs[songIndex];
    
    if (song) {
      const audioManager = app.globalData.audioManager;
      audioManager.play(song, this.data.songs);
    }
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  /**
   * 发布评论
   */
  handleComment() {
    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const content = this.data.commentContent.trim();
    if (!content) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发布中' });
    
    // 这里应该调用发布评论的API
    // 暂时模拟成功
    setTimeout(() => {
      // 添加新评论到列表开头
      const newComment = {
        commentId: Date.now(),
        username: app.globalData.userInfo?.username || '用户',
        userAvatar: '/assets/images/default-cover.svg',
        content: content,
        createTime: new Date().toLocaleString(),
        likeCount: 0
      };
      
      this.setData({
        comments: [newComment, ...this.data.comments],
        commentContent: ''
      });
      
      wx.showToast({ title: '评论发布成功' });
      wx.hideLoading();
    }, 500);
  },

  /**
   * 点赞评论
   */
  handleLike(e) {
    const commentId = e.currentTarget.dataset.id;
    
    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    // 更新评论点赞数
    const updatedComments = this.data.comments.map(comment => {
      if (comment.commentId === commentId) {
        return { ...comment, likeCount: comment.likeCount + 1 };
      }
      return comment;
    });

    this.setData({ comments: updatedComments });
    wx.showToast({ title: '点赞成功' });
  },

  /**
   * 删除评论
   */
  handleDelete(e) {
    const commentId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          // 删除评论
          const updatedComments = this.data.comments.filter(
            comment => comment.commentId !== commentId
          );
          this.setData({ comments: updatedComments });
          wx.showToast({ title: '删除成功' });
        }
      }
    });
  },

  /**
   * 输入评论内容
   */
  onCommentInput(e) {
    this.setData({ commentContent: e.detail.value });
  },

  /**
   * 格式化歌曲时长
   */
  formatDuration(duration) {
    if (!duration) return '0:00';
    
    // 转换为秒
    const totalSeconds = Math.floor(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // 格式化显示（确保秒数为两位数）
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    if (this.data.playlistId) {
      this.getPlaylistDetail(this.data.playlistId);
    }
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.playlist.name || '歌单分享',
      path: `/pages/playlistDetail/playlistDetail?id=${this.data.playlistId}`
    };
  }
});