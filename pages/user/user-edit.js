// user-edit.js
const app = getApp()

Page({
  data: {
    isLoggedIn: false,
    userForm: {
      username: '',
      email: '',
      phone: '',
      introduction: '',
      avatarUrl: ''
    },
    errors: {},
    loading: false,
    avatarFile: null
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 检查登录状态并加载用户信息
  checkLoginStatus() {
    // 优先使用全局登录状态
    const isLoggedIn = app.globalData.isLoggedIn
    const token = app.globalData.token || wx.getStorageSync('token')
    
    // 如果全局登录状态为true或存在token，则认为已登录
    if (isLoggedIn || token) {
      this.setData({ isLoggedIn: true })
      this.fetchUserProfile()
    } else {
      this.setData({ isLoggedIn: false })
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        this.goBack()
      }, 1500)
    }
  },

  // 获取用户信息
  fetchUserProfile() {
    return new Promise((resolve, reject) => {
      // 调用封装的request方法，与music-client保持一致
      app.request({
        url: '/user/getUserInfo',
        method: 'GET',
        success: (res) => {
          if (res.success || res.code === 0) {
            const userData = res.data || res
            console.log('获取的用户信息:', userData)
            // 处理头像URL - 优先使用userAvatar字段（根据日志显示），然后才是avatarUrl
            const avatarField = userData.userAvatar || userData.avatarUrl
            const avatarUrl = app.processImageUrl(avatarField)
            console.log('处理后的头像URL:', avatarUrl)
            
            this.setData({
              userForm: {
                username: userData.username || '',
                email: userData.email || '',
                phone: userData.phone || '',
                introduction: userData.introduction || '',
                avatarUrl: avatarUrl || ''
              }
            })
            
            // 确保保存userId和头像信息
            const userInfoWithId = {
              ...userData,
              // 确保userId字段存在且正确，可能来自不同的字段名
              userId: userData.userId || userData.id || userData.user_id,
              // 确保头像URL在全局数据中正确存储
              avatarUrl: avatarUrl,
              userAvatar: userData.userAvatar || ''
            }
            
            // 更新全局用户信息
            app.globalData.userInfo = userInfoWithId
            wx.setStorageSync('userInfo', userInfoWithId)
            resolve(userInfoWithId)
          } else {
            console.error('获取用户信息失败:', res)
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            })
            reject(new Error('获取用户信息失败'))
          }
        },
        fail: (error) => {
          console.error('获取用户信息请求失败:', error)
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  },

  // 表单输入处理
  onUsernameInput(e) {
    const username = e.detail.value
    this.setData({
      'userForm.username': username,
      'errors.username': ''
    })
  },

  onEmailInput(e) {
    const email = e.detail.value
    this.setData({
      'userForm.email': email,
      'errors.email': ''
    })
  },

  onPhoneInput(e) {
    const phone = e.detail.value
    this.setData({
      'userForm.phone': phone,
      'errors.phone': ''
    })
  },

  onIntroductionInput(e) {
    const introduction = e.detail.value
    this.setData({
      'userForm.introduction': introduction
    })
  },

  // 处理头像选择
  handleChooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        console.log('选择的图片路径:', tempFilePath)
        // 上传头像
        this.uploadAvatar(tempFilePath)
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
      }
    })
  },

  // 上传头像
  uploadAvatar(filePath) {
    // 先隐藏之前可能存在的loading，防止重复显示
    try {
      wx.hideLoading()
    } catch (e) {}
    
    // 显示加载提示
    wx.showLoading({
      title: '上传中',
      mask: true
    })

    // 使用wx.uploadFile上传图片文件
    // 获取token，确保使用正确的格式
    let token = app.globalData.token || wx.getStorageSync('token')
    // 确保token格式正确，添加Bearer前缀（如果没有的话）
    if (token && !token.startsWith('Bearer ')) {
      token = 'Bearer ' + token
    }
    console.log('上传头像使用token:', token)
    console.log('上传URL:', app.globalData.baseUrl + '/user/updateUserAvatar')
    
    wx.uploadFile({
      url: app.globalData.baseUrl + '/user/updateUserAvatar',
      filePath: filePath,
      name: 'avatar', // 与后端保持一致的字段名
      header: {
        // 确保Authorization头格式正确
        'Authorization': token,
        'Content-Type': 'multipart/form-data'
      },
      success: (res) => {
        console.log('头像上传响应原始数据:', res)
        // 先隐藏loading，再进行其他操作
        wx.hideLoading()
        
        try {
          // 尝试解析JSON响应
          const result = JSON.parse(res.data)
          console.log('头像上传响应解析结果:', result)
          
          if (result.success || result.code === 0) {
            wx.showToast({
              title: '头像上传成功',
              icon: 'success'
            })
            // 更新本地头像URL
            const avatarUrl = app.processImageUrl(result.data || '')
            this.setData({
              'userForm.avatarUrl': avatarUrl
            })
            // 更新全局用户信息
            if (app.globalData.userInfo) {
              app.globalData.userInfo.avatarUrl = avatarUrl
              app.globalData.userInfo.userAvatar = result.data || '' // 同时更新userAvatar字段
              wx.setStorageSync('userInfo', app.globalData.userInfo)
            }
          } else {
            wx.showToast({
              title: result.message || '头像上传失败',
              icon: 'none'
            })
          }
        } catch (e) {
          console.error('解析上传响应失败:', e)
          // 处理非JSON响应，如403错误
          if (res.statusCode === 403) {
            wx.showToast({
              title: '权限不足，请重新登录',
              icon: 'none'
            })
            // 清除登录状态
            app.globalData.isLoggedIn = false
            app.globalData.userInfo = null
            app.globalData.token = null
            wx.removeStorageSync('token')
          } else {
            wx.showToast({
              title: '头像上传失败',
              icon: 'none'
            })
          }
        }
      },
      fail: (error) => {
        console.error('头像上传失败:', error)
        // 确保在fail回调中也隐藏loading
        wx.hideLoading()
        wx.showToast({
          title: '头像上传失败，请重试',
          icon: 'none'
        })
      },
      complete: () => {
        // 双重保障，确保loading被隐藏
        try {
          wx.hideLoading()
        } catch (e) {
          // ignore
        }
      }
    });
  },

  // 表单验证
  validateForm() {
    const { username, phone } = this.data.userForm
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

    // 邮箱现在是只读的，不需要验证

    // 手机号验证（可选）
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      errors.phone = '请输入正确的手机号格式'
      isValid = false
    }

    this.setData({ errors })
    return isValid
  },

  // 处理提交
  handleSubmit() {
    // 表单验证
    if (!this.validateForm()) {
      return
    }

    // 确保包含userId字段，这是更新用户信息的必要参数
    const userId = app.globalData.userInfo?.userId || 
                 app.globalData.userInfo?.id || 
                 app.globalData.userInfo?.user_id ||
                 wx.getStorageSync('userInfo')?.userId ||
                 wx.getStorageSync('userInfo')?.id ||
                 wx.getStorageSync('userInfo')?.user_id
    
    if (!userId) {
      wx.showToast({
        title: '用户信息不完整，请重新登录',
        icon: 'none'
      })
      return
    }

    // 复制userForm但排除avatarUrl字段，保留email（不允许用户修改）并添加userId
    const { userForm } = this.data
    const userInfoData = {
      ...userForm,
      userId: userId, // 添加用户ID，这是后端识别用户的关键字段
      // 确保使用正确的字段名格式
      id: userId,     // 可能后端使用id而不是userId
      user_id: userId // 可能后端使用user_id而不是userId
    }
    delete userInfoData.avatarUrl
    
    // 获取token，确保使用正确的格式
    let token = app.globalData.token || wx.getStorageSync('token')
    // 确保token格式正确，添加Bearer前缀（如果没有的话）
    if (token && !token.startsWith('Bearer ')) {
      token = 'Bearer ' + token
    }
    
    console.log('提交的数据:', userInfoData)
    console.log('使用的token:', token)
    
    this.setData({ loading: true })
    
    // 调用更新用户信息接口，与music-client保持一致
    app.request({
      url: '/user/updateUserInfo',
      method: 'PUT',
      data: userInfoData,
      showLoading: false, // 自己控制loading状态
      success: (res) => {
        console.log('更新响应:', res)
        // 处理各种可能的成功响应格式
        if (res.success === true || res.code === 0 || res.success === undefined && res.code === undefined) {
          wx.showToast({
            title: '信息更新成功',
            icon: 'success'
          })
          
          // 更新全局用户信息（保留最新的头像URL）
          const updatedUserInfo = res.data || userInfoData
          updatedUserInfo.avatarUrl = app.globalData.userInfo?.avatarUrl || userForm.avatarUrl
          updatedUserInfo.userId = userId
          app.globalData.userInfo = updatedUserInfo
          wx.setStorageSync('userInfo', updatedUserInfo)
          
          // 延迟返回上一页，让用户看到成功提示
          setTimeout(() => {
            this.goBack()
          }, 1500)
        } else {
          // 显示详细错误信息
          const errorMsg = res.message || res.error || '更新失败，错误码:' + res.code
          console.error('更新失败:', errorMsg)
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          })
        }
      },
      fail: (error) => {
        console.error('请求失败:', error)
        wx.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },


  // 处理删除账号
  handleDelete() {
    wx.showModal({
      title: '确认注销',
      content: '注销账号后将无法恢复，确定要继续吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteAccount()
        }
      }
    })
  },

  // 删除账号
  deleteAccount() {
    this.setData({ loading: true })
    
    app.request({
      url: '/user/deleteUser',
      method: 'DELETE',
      success: (res) => {
        if (res.success || res.code === 0) {
          // 清除登录状态和用户信息
          app.clearUserInfo()
          wx.removeStorageSync('token')
          
          wx.showToast({
            title: '账号已注销',
            icon: 'success'
          })
          
          // 跳转到登录页
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/login'
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.message || '注销失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  }
})