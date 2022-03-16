<template>
  <view class="container">
    <view class="content">
      <u-button
        @click="getUserInfo"
        type="primary"
        size="large "
        text="点击授权用户信息(仅微信名、头像)"
      ></u-button>
    </view>
  </view>
</template>

<script>
const config = require("../../util/config.default");
export default {
  data() {
    return {};
  },
  onLoad() {},
  methods: {
    getUserInfo: function () {
      // 获取用户信息
      uni.getUserProfile({
        desc: "获取头像以及用户名",
        lang: "zh_CN",
        success(profileRes) {
          // 登入流程
          uni.login({
            provider: "weixin",
            success: (loginRes) => {
              const code = loginRes.code;

              uni.$u.http
                .post(config.root + "/wx/login", {
                  code,
                  encryptedData: profileRes.encryptedData,
                  iv: profileRes.iv,
                  signature: profileRes.signature,
                })
                .then((res) => {
                  if (res.data.code === 200) {
                    // 缓存状态
                    uni.setStorage({
                      key: "USER_INFO",
                      data: res.data.data,
                    });
                    uni.showToast({
                      title: "授权成功",
                      duration: 1500,
                      success() {
                        uni.$u.route({url: '/pages/index/index',type: "reLaunch"});
                      },
                    });
                  }
                });
            },
            fail: (error) => {
              console.error("wx.login: ", error);
            },
          });
        },
        fail(err) {
          console.error("getUserProfile fail: ", err);
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.content {
  padding: 20rpx;
  margin-top: 50%;
}
</style>
