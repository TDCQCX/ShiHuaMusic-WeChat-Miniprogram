// login.js
const app = getApp()

Page({
  data: {
    email: '',
    password: '',
    loading: false,
    errors: {}
  },

  onLoad() {
    // 在登录页面暂停播放
    try {
      const audioManager = getApp().globalData.audioManager;
      if (audioManager && audioManager.isPlaying) {
        audioManager.pause();
        console.log('在登录页面暂停了播放');
      }
    } catch (error) {
      console.warn('暂停播放失败:', error);
    }
    
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (token) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  onEmailInput(e) {
    this.setData({
      email: e.detail.value,
      'errors.email': ''
    })
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
      'errors.password': ''
    })
  },

  // 表单验证
  validateForm() {
    const { email, password } = this.data
    const errors = {}
    let isValid = true

    // 邮箱验证
    if (!email) {
      errors.email = '请输入邮箱'
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        errors.email = '请输入正确的邮箱格式'
        isValid = false
      }
    }

    // 密码验证
    if (!password) {
      errors.password = '请输入密码'
      isValid = false
    } else {
      // 密码格式：8-18位数字、字母、符号的任意两种组合
      const passwordRegex = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z\W]{8,18}$/
      if (!passwordRegex.test(password)) {
        errors.password = '密码格式：8-18位数字、字母、符号的任意两种组合'
        isValid = false
      }
    }

    this.setData({ errors })
    return isValid
  },

  switchToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },

  switchToReset() {
    wx.navigateTo({
      url: '/pages/reset-password/reset-password'
    })
  },

  handleLogin() {
    // 表单验证
    if (!this.validateForm()) {
      return
    }

    const { email, password } = this.data
    
    // 显示加载状态
    wx.showLoading({
      title: '登录中',
      mask: true
    })
    
    // 调用登录接口，与music-client保持一致
    app.request({
      url: '/user/login',
      method: 'POST',
      data: {
        email,
        password
      },
      // 禁用app.request内部的loading，由我们自己控制
      showLoading: false,
      success: (res) => {
        console.log('登录响应:', res)
        // 先隐藏加载提示
        wx.hideLoading()
        
        if (res.success || res.code === 0) {
          // 先保存token
          const token = res.data?.token || res.token || res.data
          
          console.log('获取到的token:', token)
          
          // 设置全局token和登录状态
          app.globalData.token = token
          wx.setStorageSync('token', token)
          
          // 显示加载状态
          wx.showLoading({
            title: '获取用户信息',
            mask: true
          })
          
          // 然后调用getUserInfo接口获取用户信息
          app.request({
            url: '/user/getUserInfo',
            method: 'GET',
            showLoading: false,
            success: (userInfoRes) => {
              wx.hideLoading()
              if (userInfoRes.success || userInfoRes.code === 0) {
                const userInfo = userInfoRes.data || userInfoRes
                
                // 使用app的setUserInfo方法保存用户信息
                app.setUserInfo(userInfo)
                
                wx.showToast({ 
                  title: res.message || '登录成功',
                  icon: 'success',
                  duration: 1500
                })
                
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/index/index'
                  })
                }, 1500)
              } else {
                // 确保错误信息显示足够时间
                wx.showToast({ 
                  title: userInfoRes.message || '获取用户信息失败', 
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: (err) => {
              console.error('获取用户信息失败', err)
              wx.hideLoading()
              wx.showToast({ 
                title: '获取用户信息失败', 
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          // 显示登录失败信息，确保在真机上能正确显示
          const errorMsg = res.message || '登录失败，请检查邮箱和密码'
          console.error('登录失败:', errorMsg)
          wx.showToast({ 
            title: errorMsg, 
            icon: 'none',
            duration: 2000 // 增加显示时间
          })
        }
      },
      fail: (err) => {
        console.error('登录请求失败', err)
        wx.hideLoading()
        wx.showToast({ 
          title: '网络错误，请检查网络连接', 
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})
