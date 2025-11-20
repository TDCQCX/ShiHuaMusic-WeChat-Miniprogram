// pages/register/register.js
const app = getApp()

Page({
  data: {
    username: '',
    email: '',
    password: '',
    verificationCode: '',
    loading: false,
    countdown: 0,
    errors: {},
    timer: null
  },

  onLoad: function() {
    // 在注册页面暂停播放
    try {
      const audioManager = getApp().globalData.audioManager;
      if (audioManager && audioManager.isPlaying) {
        audioManager.pause();
        console.log('在注册页面暂停了播放');
      }
    } catch (error) {
      console.warn('暂停播放失败:', error);
    }
    
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (token) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  onUnload: function() {
    // 清除定时器
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },

  onUsernameInput: function(e) {
    this.setData({
      username: e.detail.value,
      'errors.username': ''
    })
  },

  onEmailInput: function(e) {
    this.setData({
      email: e.detail.value,
      'errors.email': ''
    })
  },

  onVerificationCodeInput: function(e) {
    this.setData({
      verificationCode: e.detail.value,
      'errors.verificationCode': ''
    })
  },

  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value,
      'errors.password': ''
    })
  },

  // 表单验证
  validateForm: function() {
    const { username, email, password, verificationCode } = this.data
    const errors = {}
    let isValid = true

    // 用户名验证
    if (!username) {
      errors.username = '请输入用户名'
      isValid = false
    } else {
      const usernameRegex = /^[a-zA-Z0-9_-]{4,16}$/
      if (!usernameRegex.test(username)) {
        errors.username = '用户名格式：4-16位字符（字母、数字、下划线、连字符）'
        isValid = false
      }
    }

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

    // 验证码验证
    if (!verificationCode) {
      errors.verificationCode = '请输入验证码'
      isValid = false
    } else {
      const codeRegex = /^[0-9a-zA-Z]{6}$/
      if (!codeRegex.test(verificationCode)) {
        errors.verificationCode = '验证码格式：6位字符（大小写字母、数字）'
        isValid = false
      }
    }

    // 密码验证
    if (!password) {
      errors.password = '请输入密码'
      isValid = false
    } else {
      const passwordRegex = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z\W]{8,18}$/
      if (!passwordRegex.test(password)) {
        errors.password = '密码格式：8-18位数字、字母、符号的任意两种组合'
        isValid = false
      }
    }

    this.setData({ errors })
    return isValid
  },

  // 发送验证码
  handleSendCode: function() {
    const { email } = this.data
    
    // 简单验证邮箱
    if (!email) {
      wx.showToast({ title: '请先输入邮箱', icon: 'none' })
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      wx.showToast({ title: '请输入正确的邮箱格式', icon: 'none' })
      return
    }

    // 调用发送验证码接口
    app.request({
      url: '/user/sendVerificationCode',
      method: 'GET',
      params: { email },
      success: (res) => {
        if (res.success || res.code === 0) {
          wx.showToast({ title: '验证码已发送', icon: 'success' })
          
          // 开始倒计时
          this.setData({ countdown: 60 })
          const timer = setInterval(() => {
            this.setData({
              countdown: this.data.countdown - 1
            })
            if (this.data.countdown <= 0) {
              clearInterval(timer)
              this.setData({ timer: null })
            }
          }, 1000)
          this.setData({ timer })
        } else {
          wx.showToast({ title: res.message || '发送验证码失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('发送验证码失败', err)
        wx.showToast({ title: '网络错误，请重试', icon: 'none' })
      }
    })
  },

  // 注册处理
  handleRegister: function() {
    // 表单验证
    if (!this.validateForm()) {
      return
    }

    const { username, email, password, verificationCode } = this.data
    
    this.setData({ loading: true })
    
    // 调用注册接口
    app.request({
      url: '/user/register',
      method: 'POST',
      data: {
        username,
        email,
        password,
        verificationCode
      },
      success: (res) => {
        if (res.success || res.code === 0) {
          wx.showToast({ title: '注册成功，请登录', icon: 'success' })
          // 跳转到登录页面
          wx.redirectTo({ url: '/pages/login/login' })
        } else {
          wx.showToast({ title: res.message || '注册失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('注册请求失败', err)
        wx.showToast({ title: '网络错误，请重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // 跳转到登录页面
  switchToLogin: function() {
    wx.navigateTo({ url: '/pages/login/login' })
  }
})