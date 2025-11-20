// welcome-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 监听属性变化
   */
  observers: {
    'visible': function(newValue) {
      if (newValue) {
        // 当弹窗显示时，隐藏底部tabbar
        wx.hideTabBar();
        // 禁止页面滚动
        wx.setPageStyle({
          style: {
            overflow: 'hidden',
            height: '100vh'
          }
        });
      } else {
        // 当弹窗隐藏时，显示底部tabbar
        wx.showTabBar();
        // 恢复页面滚动
        wx.setPageStyle({
          style: {
            overflow: 'auto',
            height: 'auto'
          }
        });
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 缩短描述文本，使其更加简洁
    description: '感谢使用ShiHua Music！\n\n这里是您的专属音乐空间，汇集海量优质音乐资源，为您提供极致听觉体验。\n\n无论是热门流行、经典摇滚，还是小众独立音乐，我们都精心挑选，满足您的多元音乐品味。\n\n个性化推荐系统让每一首歌都懂您的心情，智能播放列表陪伴您度过每一个精彩瞬间。\n\n立即开始探索，让音乐点亮生活，拾取属于音乐的华章！'

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击确定按钮
    onConfirm() {
      // 触发自定义事件，通知父组件弹窗已关闭
      this.triggerEvent('confirm');
    }
  }
})