// app.js
const audioManager = require('./utils/audioManager');

App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    // baseUrl: 'http://localhost:8080', 
    baseUrl: 'http://192.168.66.241:8080',  // 后端服务器API
    audioContext: null,
    audioManager: audioManager,
    // imageBaseUrl: 'http://127.0.0.1:9000', 
    imageBaseUrl: 'http://192.168.66.241:9000', // 图片服务器API
    showWelcomeModal: false // 控制欢迎弹窗显示
  },

  onLaunch() {
    // 注意：不要在这里再次创建音频上下文，因为audioManager.js中已经创建了单例
    // 只保留事件监听，避免重复初始化导致状态丢失
    if (this.globalData.audioContext) {
      this.globalData.audioContext.onEnded(() => {
        // 歌曲播放结束时的处理
        this.handleAudioEnded()
      })
    }

    // 开发环境设置不校验域名安全性（仅在开发环境使用）
    wx.setEnableDebug({
      enableDebug: true
    })

    // 检查是否首次启动，控制欢迎弹窗显示
    const hasShownWelcome = wx.getStorageSync('hasShownWelcome')
    if (!hasShownWelcome) {
      this.globalData.showWelcomeModal = true
    }

    // 从本地存储恢复用户信息和token
    const userInfo = wx.getStorageSync('userInfo')
    const token = wx.getStorageSync('token')
    if (userInfo && token) {
      this.globalData.userInfo = userInfo
      this.globalData.token = token
      this.globalData.isLoggedIn = true
    }

    // 登录检查
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (!token) {
      return Promise.resolve(false);
    }
    
    // 存储token到全局数据
    this.globalData.token = token;
    
    return new Promise((resolve) => {
      this.request({
        url: '/user/getUserInfo',
        method: 'GET',
        success: (res) => {
          if (res.success || res.code === 0) {
            this.globalData.isLoggedIn = true;
            this.globalData.userInfo = res.data || res;
            wx.setStorageSync('userInfo', res.data || res);
            resolve(true);
          } else {
            this.globalData.isLoggedIn = false;
            this.globalData.userInfo = null;
            this.globalData.token = null;
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            resolve(false);
          }
        },
        fail: () => {
          this.globalData.isLoggedIn = false;
          this.globalData.userInfo = null;
          this.globalData.token = null;
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          resolve(false);
        }
      });
    });
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.isLoggedIn = true
    wx.setStorageSync('userInfo', userInfo)
  },

  clearUserInfo() {
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    wx.removeStorageSync('userInfo')
  },

  // 关闭欢迎弹窗并记录
  closeWelcomeModal() {
    this.globalData.showWelcomeModal = false
    wx.setStorageSync('hasShownWelcome', true)
  },

  // 处理图片URL，确保在小程序中可以正常显示
  processImageUrl(url) {
    if (!url) return ''
    
    // 如果URL已经是完整URL，只提取路径部分，保留完整路径信息
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        // 提取完整路径部分（从第一个/开始的所有内容）
        const pathStartIndex = url.indexOf('/', url.indexOf('://') + 3);
        const path = pathStartIndex !== -1 ? url.substring(pathStartIndex) : '/';
        // 使用全局配置的图片服务器地址拼接完整路径
        return `${this.globalData.imageBaseUrl}${path}`;
      } catch (e) {
        console.warn('Failed to process URL:', url, e);
        return url;
      }
    }
    
    // 否则拼接图片服务器地址，确保路径正确
    const cleanPath = url.startsWith('/') ? url : '/' + url;
    return `${this.globalData.imageBaseUrl}${cleanPath}`;
  },

  // 批量处理数据中的图片URL
  processImageUrlsInData(data, fields) {
    if (!Array.isArray(data)) return data
    
    return data.map(item => {
      const processedItem = { ...item }
      fields.forEach(field => {
        if (processedItem[field]) {
          processedItem[field] = this.processImageUrl(processedItem[field])
        }
      })
      return processedItem
    })
  },

  handleAudioEnded() {
    // 可以在这里实现自动播放下一首等逻辑
    console.log('歌曲播放结束')
  },

  // 封装网络请求
  request(options) {
    console.log('发送请求:', options.url, options.data)
    // 支持函数式调用或对象调用
    let url, method = 'GET', data, params, success, fail, complete, showLoading = true;
    
    if (typeof options === 'string') {
      url = options;
    } else {
      url = options.url;
      method = options.method || 'GET';
      data = options.data;
      params = options.params;
      success = options.success;
      fail = options.fail;
      complete = options.complete;
      showLoading = options.showLoading !== false;
    }
    
    const token = this.globalData.token || wx.getStorageSync('token');
    
    // 构建完整URL
    const fullUrl = `${this.globalData.baseUrl}${url}`;
    
    // 构建请求配置
    const requestConfig = {
      url: fullUrl,
      method,
      header: {
        'Content-Type': 'application/json'
      }
    };
    
    // 添加token（公开接口除外）
    const publicPaths = ['/user/login', '/user/register', '/user/sendVerificationCode', '/banner/getBanner', '/playlist/getRecommendedPlaylists', '/song/getRecommendedSongs', '/song/getAllSongs'];
    // 确保getUserInfo不在publicPaths中，以便正确添加token
    const isPublicPath = publicPaths.some(path => url.includes(path));
    
    if (token && !isPublicPath) {
      // 确保token格式正确，统一添加Bearer前缀
      const tokenValue = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
      requestConfig.header['Authorization'] = tokenValue;
      console.log('添加token:', tokenValue);
    }
    
    // 显示加载提示
    if (showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }
    
    // 添加请求数据
    if (data) {
      requestConfig.data = data;
    }
    
    // 添加查询参数
    if (params) {
      // 构建查询字符串
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      // 将查询字符串添加到URL
      requestConfig.url = `${requestConfig.url}?${queryString}`;
    }
    
    return new Promise((resolve, reject) => {
      wx.request({
        ...requestConfig,
        success: (res) => {
          console.log('请求响应:', options.url, res.data);
          // 隐藏加载提示
          if (showLoading) {
            wx.hideLoading();
          }
          
          // 处理401错误
          if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
            this.globalData.isLoggedIn = false;
            this.globalData.userInfo = null;
            this.globalData.token = null;
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            const errorMsg = '登录已过期，请重新登录';
            wx.showToast({
              title: errorMsg,
              icon: 'none'
            });
            if (fail) fail(new Error(errorMsg));
            reject(new Error(errorMsg));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            // 成功响应
            const result = res.data;
            if (success) success(result);
            resolve(result);
          } else {
            // 其他错误状态码
            const errorMsg = res.data?.message || res.data?.error || `请求失败: ${res.statusCode}`;
            wx.showToast({
              title: errorMsg,
              icon: 'none'
            });
            console.error(`请求失败: ${res.statusCode}`, res);
            if (fail) fail(new Error(errorMsg));
            reject(new Error(errorMsg));
          }
        },
        fail: (err) => {
          // 隐藏加载提示
          if (showLoading) {
            wx.hideLoading();
          }
          
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          console.error('网络请求失败:', err);
          if (fail) fail(err);
          reject(err);
        },
        complete: (res) => {
          // 隐藏加载提示
          if (showLoading) {
            wx.hideLoading();
          }
          
          if (complete) complete(res);
        }
      });
    });
  }
})