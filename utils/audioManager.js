// 全局音频管理器
class AudioManager {
  constructor() {
    this.audioContext = wx.createInnerAudioContext();
    this.currentSong = null;
    this.playingList = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.loopMode = 0; // 0: 循环播放, 1: 单曲循环, 2: 随机播放
    this.progress = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.listeners = {};
    this.init();
  }

  init() {
    const audio = this.audioContext;

    // 监听播放事件
    audio.onPlay(() => {
      this.isPlaying = true;
      this.emit('play', this.currentSong);
    });

    // 监听暂停事件
    audio.onPause(() => {
      this.isPlaying = false;
      this.emit('pause');
    });

    // 监听停止事件
    audio.onStop(() => {
      this.isPlaying = false;
      this.progress = 0;
      this.currentTime = 0;
      this.emit('stop');
    });

    // 监听播放结束事件
    audio.onEnded(() => {
      this.handlePlayEnd();
    });

    // 监听错误事件
    audio.onError((res) => {
      console.error('播放错误:', res);
      this.emit('error', res);
    });

    // 监听时间更新事件
    audio.onTimeUpdate(() => {
      if (audio.duration > 0) {
        this.currentTime = audio.currentTime;
        this.duration = audio.duration;
        this.progress = (audio.currentTime / audio.duration) * 100;
        this.emit('timeUpdate', {
          currentTime: this.currentTime,
          duration: this.duration,
          progress: this.progress
        });
      }
    });

    // 监听加载开始事件
    audio.onCanplay(() => {
      this.emit('canplay');
    });
  }

  // 播放指定歌曲
  playSong(song) {
    if (!song || !song.audioUrl) {
      console.error('歌曲信息不完整');
      return;
    }

    // 查找歌曲在播放列表中的位置
    const index = this.playingList.findIndex(item => item.songId === song.songId);
    if (index !== -1) {
      this.currentIndex = index;
    }

    this.currentSong = song;
    this.audioContext.src = song.audioUrl;
    this.audioContext.play();
    this.isPlaying = true;

    this.emit('change', this.currentSong);
  }

  // 添加到播放列表并播放
  play(song, playlist = []) {
    if (playlist && playlist.length > 0) {
      this.playingList = playlist;
      this.currentIndex = playlist.findIndex(item => item.songId === song.songId);
    }
    this.playSong(song);
  }

  // 播放/暂停切换
  togglePlay() {
    if (!this.currentSong) return;

    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  // 暂停
  pause() {
    this.audioContext.pause();
    this.isPlaying = false;
  }

  // 恢复播放
  resume() {
    this.audioContext.play();
    this.isPlaying = true;
  }

  // 停止
  stop() {
    this.audioContext.stop();
    this.isPlaying = false;
  }

  // 上一首
  playPrev() {
    if (this.playingList.length === 0) return;

    if (this.loopMode === 2) {
      // 随机播放
      this.playRandom();
    } else {
      // 循环播放
      this.currentIndex = (this.currentIndex - 1 + this.playingList.length) % this.playingList.length;
      const prevSong = this.playingList[this.currentIndex];
      this.playSong(prevSong);
    }
  }

  // 下一首
  playNext() {
    if (this.playingList.length === 0) return;

    if (this.loopMode === 2) {
      // 随机播放
      this.playRandom();
    } else {
      // 循环播放
      this.currentIndex = (this.currentIndex + 1) % this.playingList.length;
      const nextSong = this.playingList[this.currentIndex];
      this.playSong(nextSong);
    }
  }

  // 随机播放
  playRandom() {
    if (this.playingList.length === 0) return;

    let randomIndex;
    if (this.playingList.length > 1) {
      // 确保不重复播放同一首歌
      do {
        randomIndex = Math.floor(Math.random() * this.playingList.length);
      } while (randomIndex === this.currentIndex);
    } else {
      randomIndex = 0;
    }

    this.currentIndex = randomIndex;
    const randomSong = this.playingList[randomIndex];
    this.playSong(randomSong);
  }

  // 处理播放结束
  handlePlayEnd() {
    if (this.loopMode === 1) {
      // 单曲循环
      this.audioContext.seek(0);
      this.audioContext.play();
    } else {
      // 循环播放或随机播放
      this.playNext();
    }
  }

  // 切换循环模式
  toggleLoopMode() {
    this.loopMode = (this.loopMode + 1) % 3;
    let modeText = '';
    switch (this.loopMode) {
      case 0:
        modeText = '循环播放';
        break;
      case 1:
        modeText = '单曲循环';
        break;
      case 2:
        modeText = '随机播放';
        break;
    }
    wx.showToast({
      title: modeText,
      icon: 'none',
      duration: 1000
    });
    this.emit('loopModeChange', this.loopMode);
  }

  // 跳转到指定时间
  seek(time) {
    if (this.audioContext) {
      this.audioContext.seek(time);
    }
  }

  // 设置音量
  setVolume(volume) {
    if (this.audioContext) {
      this.audioContext.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // 获取音量
  getVolume() {
    return this.audioContext ? this.audioContext.volume : 1;
  }

  // 添加事件监听
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // 移除事件监听
  off(event, callback) {
    if (!this.listeners[event]) return;
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      delete this.listeners[event];
    }
  }

  // 触发事件
  emit(event, ...args) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`事件 ${event} 处理错误:`, error);
      }
    });
  }

  // 格式化时间
  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // 获取当前状态
  getState() {
    return {
      currentSong: this.currentSong,
      isPlaying: this.isPlaying,
      progress: this.progress,
      currentTime: this.currentTime,
      duration: this.duration,
      loopMode: this.loopMode,
      playingList: this.playingList,
      currentIndex: this.currentIndex
    };
  }
}

// 导出单例实例
const audioManager = new AudioManager();
module.exports = audioManager;