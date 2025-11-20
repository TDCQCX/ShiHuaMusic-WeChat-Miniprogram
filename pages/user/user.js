// user.js
const app = getApp()

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      username: '',
      avatarUrl: ''
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 检查登录状态并加载用户信息
  checkLoginStatus() {
    // 调用app的checkLoginStatus方法进行异步验证
    app.checkLoginStatus().then(isValid => {
      if (isValid) {
        this.setData({ isLoggedIn: true })
        this.fetchUserProfile()
      } else {
        // 确保状态被正确重置为未登录
        this.setData({ 
          isLoggedIn: false,
          userInfo: {
            username: '',
            avatarUrl: ''
          }
        })
      }
    }).catch(() => {
      // 发生错误时也设置为未登录状态
      this.setData({ 
        isLoggedIn: false,
        userInfo: {
          username: '',
          avatarUrl: ''
        }
      })
    })
  },

  // 获取用户信息
  fetchUserProfile() {
    return new Promise((resolve, reject) => {
      // 先检查全局用户信息是否存在
      if (app.globalData.userInfo) {
        // 处理头像URL - 优先使用userAvatar字段，然后才是avatarUrl
        const avatarField = app.globalData.userInfo.userAvatar || app.globalData.userInfo.avatarUrl
        const avatarUrl = app.processImageUrl(avatarField)
        this.setData({
          userInfo: {
            username: app.globalData.userInfo.username || '',
            avatarUrl: avatarUrl || ''
          }
        })
        resolve(app.globalData.userInfo)
        return
      }
      
      // 调用封装的request方法，与music-client保持一致
      app.request({
        url: '/user/getUserInfo',
        method: 'GET',
        success: (res) => {
          if (res.success || res.code === 0) {
            const userData = res.data || res
            // 处理头像URL - 优先使用userAvatar字段，然后才是avatarUrl
            const avatarField = userData.userAvatar || userData.avatarUrl
            const avatarUrl = app.processImageUrl(avatarField)
            
            // 更新本地状态
            this.setData({
              userInfo: {
                username: userData.username || '',
                avatarUrl: avatarUrl || ''
              }
            })
            
            // 更新全局用户信息
            app.globalData.userInfo = userData
            wx.setStorageSync('userInfo', userData)
            resolve(userData)
          } else {
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            })
            reject(new Error('获取用户信息失败'))
          }
        },
        fail: (error) => {
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  },

  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 导航到编辑个人信息页面
  navigateToEdit() {
    wx.navigateTo({
      url: '/pages/user/user-edit'
    })
  },

  // 跳转到最近播放页面
  goToRecent() {
    // 确保已登录
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }
    
    wx.navigateTo({
      url: '/pages/recent-play/recent-play'
    })
  },

  // 跳转到我的歌单页面
  goToPlaylists() {
    // 确保已登录
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }
    
    wx.navigateTo({
      url: '/pages/my-playlists/my-playlists'
    })
  },

  // 跳转到我的喜欢页面
  goToFavorites() {
    // 确保已登录
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }
    
    wx.navigateTo({
      url: '/pages/my-favorites/my-favorites'
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态和用户信息
          app.globalData.userInfo = null
          app.globalData.token = null
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')
          
          // 刷新页面以显示未登录状态
          this.setData({
            isLoggedIn: false,
            userInfo: {
              username: '',
              avatarUrl: ''
            }
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})