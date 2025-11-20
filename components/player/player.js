// player.js
const app = getApp();

Component({
  properties: {
    // 播放器组件现在始终显示，不再需要showPlayer属性
  },

  data: {
    currentSong: {
      songId: '',
      songName: '未知歌曲',
      artistName: '未知歌手',
      coverUrl: '',
      audioUrl: ''
    },
    isPlaying: false,
    progress: 0,
    currentTime: '00:00',
    duration: '00:00',
    loopMode: 0 // 0: 列表循环, 1: 单曲循环, 2: 顺序播放
  },

  lifetimes: {
    attached: function() {
      // 初始化音频管理器事件监听
      this.initAudioManager();
      // 延迟更新播放器状态，给音频管理器一些时间确保状态正确
      setTimeout(() => {
        this.updatePlayerState();
      }, 100);
    },
    detached: function() {
      // 清理事件监听
      this.removeListeners();
    }
  },
  pageLifetimes: {
    show: function() {
      // 当页面显示时，立即更新播放器状态，确保与实际播放状态同步
      this.updatePlayerState();
    }
  },

  methods: {
    // 初始化音频管理器事件监听
    initAudioManager: function() {
      const audioManager = app.globalData.audioManager;
      // 播放状态变化监听
      // 存储绑定后的函数引用，以便后续正确移除监听器
      this._boundHandlePlay = this.handlePlay.bind(this);
      this._boundHandlePause = this.handlePause.bind(this);
      this._boundHandleStop = this.handleStop.bind(this);
      this._boundHandleSongChange = this.handleSongChange.bind(this);
      this._boundHandleTimeUpdate = this.handleTimeUpdate.bind(this);
      this._boundHandleLoopModeChange = this.handleLoopModeChange.bind(this);
      
      audioManager.on('play', this._boundHandlePlay);
      audioManager.on('pause', this._boundHandlePause);
      audioManager.on('stop', this._boundHandleStop);
      audioManager.on('change', this._boundHandleSongChange);
      audioManager.on('timeUpdate', this._boundHandleTimeUpdate);
      audioManager.on('loopModeChange', this._boundHandleLoopModeChange);
    },

    // 清理事件监听
    removeListeners: function() {
      const audioManager = app.globalData.audioManager;
      audioManager.off('play', this._boundHandlePlay);
      audioManager.off('pause', this._boundHandlePause);
      audioManager.off('stop', this._boundHandleStop);
      audioManager.off('change', this._boundHandleSongChange);
      audioManager.off('timeUpdate', this._boundHandleTimeUpdate);
      audioManager.off('loopModeChange', this._boundHandleLoopModeChange);
      
      // 清理引用
      this._boundHandlePlay = null;
      this._boundHandlePause = null;
      this._boundHandleStop = null;
      this._boundHandleSongChange = null;
      this._boundHandleTimeUpdate = null;
      this._boundHandleLoopModeChange = null;
    },

    // 更新播放器状态
    updatePlayerState: function() {
      try {
        const audioManager = app.globalData.audioManager;
        if (!audioManager) {
          console.warn('音频管理器未初始化');
          return;
        }
        
        // 获取当前状态
        const state = audioManager.getState();
        
        // 比较当前状态和组件状态，只在状态变化时更新，避免不必要的渲染
        const updateData = {};
        
        // 只在播放状态变化时更新
        if (this.data.isPlaying !== state.isPlaying) {
          updateData.isPlaying = state.isPlaying;
        }
        
        // 只在循环模式变化时更新
        if (this.data.loopMode !== state.loopMode) {
          updateData.loopMode = state.loopMode;
        }
        
        // 只有当存在有效的currentSong且与当前不同时才更新歌曲信息
        if (state.currentSong && Object.keys(state.currentSong).length > 0) {
          const currentSongId = this.data.currentSong && this.data.currentSong.songId;
          const newSongId = state.currentSong.songId;
          
          // 只有当歌曲发生变化时才更新
          if (currentSongId !== newSongId) {
            updateData.currentSong = state.currentSong;
          }
        }
        
        // 只有当有有效的进度信息且与当前不同时才更新
        if (state.progress >= 0 && state.currentTime >= 0 && state.duration > 0) {
          // 进度变化超过1%时才更新，避免频繁更新
          if (Math.abs(this.data.progress - state.progress) > 1 || 
              this.data.duration !== audioManager.formatTime(state.duration)) {
            updateData.progress = state.progress;
            updateData.currentTime = audioManager.formatTime(state.currentTime);
            updateData.duration = audioManager.formatTime(state.duration);
          }
        }
        
        // 只有当有数据需要更新时才调用setData
        if (Object.keys(updateData).length > 0) {
          this.setData(updateData);
          console.log('播放器状态已更新:', updateData);
        }
      } catch (error) {
        console.error('更新播放器状态失败:', error);
      }
    },

    // 处理播放事件
    handlePlay: function() {
      this.setData({ isPlaying: true });
    },

    // 处理暂停事件
    handlePause: function() {
      this.setData({ isPlaying: false });
    },

    // 处理停止事件
    handleStop: function() {
      this.setData({ 
        isPlaying: false,
        progress: 0,
        currentTime: '00:00'
      });
    },

    // 处理歌曲切换
    handleSongChange: function(song) {
      this.setData({ 
        currentSong: song,
        progress: 0,
        currentTime: '00:00',
        duration: '00:00'
      });
    },

    // 处理时间更新
    handleTimeUpdate: function(info) {
      const audioManager = app.globalData.audioManager;
      this.setData({
        progress: info.progress,
        currentTime: audioManager.formatTime(info.currentTime),
        duration: audioManager.formatTime(info.duration)
      });
    },

    // 处理循环模式变化
    handleLoopModeChange: function(mode) {
      this.setData({ loopMode: mode });
    },

    // 切换播放/暂停
    togglePlay: function() {
      const audioManager = app.globalData.audioManager;
      audioManager.togglePlay();
    },

    // 播放上一首
    playPrev: function() {
      const audioManager = app.globalData.audioManager;
      audioManager.playPrev();
    },

    // 播放下一首
    playNext: function() {
      const audioManager = app.globalData.audioManager;
      audioManager.playNext();
    },

    // 切换循环模式
    toggleLoopMode: function() {
      const audioManager = app.globalData.audioManager;
      audioManager.toggleLoopMode();
    },

    // 滑块拖动中
    onSliderChanging: function(e) {
      const { value } = e.detail;
      const audioManager = app.globalData.audioManager;
      const state = audioManager.getState();
      const currentTime = (value / 100) * state.duration;
      this.setData({
        currentTime: audioManager.formatTime(currentTime)
      });
    },

    // 滑块拖动结束
    onSliderChange: function(e) {
      const { value } = e.detail;
      const audioManager = app.globalData.audioManager;
      const state = audioManager.getState();
      const seekTime = (value / 100) * state.duration;
      audioManager.seek(seekTime);
    },

    // 点击歌曲信息区域不执行任何操作，因为不再需要跳转到歌曲详情页
    onSongInfoTap: function() {
      // 可以添加其他功能，如展开更多信息等
    }
  }
});