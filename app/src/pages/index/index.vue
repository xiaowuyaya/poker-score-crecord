<template>
  <view class="container">
    <view class="header">
      <view class="info" @click="toLogin">
        <image class="info-avatar" :src="userinfo.avatar" />
        <view class="info-name">{{ userinfo.nick_name }}</view>
        <view class="record">
          <u-tag
            text="历史战绩"
            @click="showRecord"
            plain
            type="warning"
            shape="circle"
          ></u-tag>
        </view>
      </view>
      <view class="data">
        <view class="win">
          <view class="win-num">{{ win_data.num }}</view>
          <view class="win-text">胜场</view>
        </view>
        <view class="win">
          <view class="win-num">{{ win_data.rate }}%</view>
          <view class="win-text">胜率</view>
        </view>
      </view>
    </view>
    <view class="panel">
      <view class="top">
        <view class="title">功能列表</view>
        <!-- <view class="sub">sub</view> -->
      </view>
      <view class="content">
        <view
          class="cell"
          @click="goCell(index)"
          v-for="(item, index) in cell_list"
          :key="index"
        >
          <view class="media">
            <u-badge
              :show="item.showBadge"
              :isDot="true"
              :absolute="true"
              :offset="[0, 0]"
              type="error"
            ></u-badge>
            <image :src="item.img" />
          </view>
          <view class="text">{{ item.text }}</view>
        </view>
        <view class="cell">
          <view class="media">
            <button open-type="contact" style="background: transparent">
              <image :src="anno_img" />
            </button>
          </view>
          <view class="text">联系我们</view>
        </view>
      </view>
    </view>
    <!-- <view class="panel">
      <view class="top">
        <view class="title">近日战况</view>
      </view>
      <view class="content">
      </view>
    </view> -->

    <!-- 加入房间弹出层 -->
    <u-popup
      :customStyle="{ width: '85%', height: '580rpx' }"
      :show="join_show"
      round="10"
      mode="center"
      @close="join_show = false"
      @open="join_show = true"
    >
      <view class="pop">
        <view class="title">加入已经创建的房间</view>
        <u-form labelPosition="left" labelWidth="60">
          <u-form-item label="房间号">
            <u--input
              type="number"
              placeholder="请输入6位房间号"
              border="surround"
              clearable
              v-model="room_no"
              @change="changeButton"
              maxlength="6"
            ></u--input>
          </u-form-item>
          <u-button
            text="加入房间"
            type="error"
            :disabled="join_btn"
            @click="joinRoom"
          ></u-button>
        </u-form>
        <view class="divider">
          <u-divider sty text="或者" :hairline="true"></u-divider>
        </view>
        <u-button
          text="扫码加入房间"
          @click="scanCode"
          icon="scan"
          type="success"
        ></u-button>
      </view>
    </u-popup>
    <!-- 页脚 -->
    <view class="footer">
      &copy;{{ new Date().getFullYear() }} eiko.ren All rights reserved.
    </view>
  </view>
</template>

<script>
const config = require("../../util/config.default");
export default {
  data() {
    return {
      isLogin: false,
      join_show: false,
      room_no: null,
      join_btn: true,
      userinfo: {
        avatar: config.img.default_avatar,
        nick_name: "点此授权登入",
        openid: 0,
      },
      win_data: {
        num: 0,
        rate: 0,
      },
      cell_list: [
        {
          img: config.img.create_room,
          text: "创建房间",
          showBadge: false,
        },
        {
          img: config.img.join_room,
          text: "加入房间",
          showBadge: false,
        },
        {
          img: config.img.annotation,
          text: "官方公告",
          showBadge: false,
        },
      ],
      anno_img: config.img.connect,
    };
  },
  onLoad() {
    //share
    uni.$u.mpShare = {
      title: "打牌计分器", // 默认为小程序名称，可自定义
    };

    // 判断是否授权登入
    let _this = this;
    try {
      const res = uni.getStorageSync("USER_INFO");
      if (res) {
        this.isLogin = true;
        this.userinfo.avatar = res.avatar_url;
        this.userinfo.nick_name = res.nick_name;
        this.userinfo.openid = res.openid;
      }
    } catch (e) {}

    //  uni.getStorageAs({
    //   key: "USER_INFO",

    //   success: function (res) {
    //     _this.isLogin = true;
    //     _this.userinfo.avatar = res.data.avatar_url;
    //     _this.userinfo.nick_name = res.data.nick_name;
    //     _this.userinfo.openid = res.data.openid;
    //   },
    //   fail: function (err) {},
    // });
  },
  onShow() {
    let _this = this;
    // 判断是否有新的公告
    uni.getStorage({
      key: "ANO_NUM",
      success: ({ data }) => {
        uni.$u.http
          .get(config.root + "/annotation/findAll")
          .then((res) => {
            const new_num = res.data.data.data.length;
            if (new_num > data) {
              _this.cell_list[2].showBadge = true;
            }
          })
          .catch((err) => {
            _this.cell_list[2].showBadge = true;
          });
      },
    });

    // 获取战绩
    if (this.userinfo.openid != 0) {
      uni.$u.http
        .get(
          config.root + "/wx/getRecordByOpenid?openid=" + this.userinfo.openid
        )
        .then((res) => {
          _this.win_data.num = res.data.data.win;
          _this.win_data.rate =
            Math.round((res.data.data.win / res.data.data.total) * 10000) /
            100.0;
        });
    }
  },
  methods: {
    toLogin: function () {
      if (!this.isLogin) {
        uni.$u.route("/pages/getAuth/getAuth");
      }
    },
    goCell: function (e) {
      let _this = this;
      switch (e) {
        case 0:
          if (!this.isLogin) {
            uni.showToast({ title: "请先授权登入！", icon: "error" });
            return;
          }

          const roomNo = uni.getStorageSync("room_no");
          if (!roomNo) {
            // 房间不存在 创建房间
            //创建房间
            uni.showLoading({
              title: "创建房间中...",
            });
            uni.$u.http
              .get(
                config.root + "/room/getRoomNo?openid=" + _this.userinfo.openid
              )
              .then((res) => {
                if (res.data.code === 200) {
                  const room_no = res.data.data;
                  uni.hideLoading();
                  uni.$u.route("/pages/room/room", {
                    roomNo: room_no,
                    openid: _this.userinfo.openid,
                  });
                } else {
                  uni.hideLoading();
                  uni.showToast({
                    title: "创建失败，服务器异常",
                    icon: "error",
                  });
                }
              })
              .catch((err) => {
                uni.hideLoading();
                uni.showToast({
                  title: "创建失败，请求发送异常",
                  icon: "error",
                });
              });
          } else {
            // 房间存在 回到房间
            uni.$u.route("/pages/room/room", {
              roomNo: roomNo,
              openid: _this.userinfo.openid,
            });
          }

          break;
        case 1:
          if (!this.isLogin) {
            uni.showToast({ title: "请先授权登入！", icon: "error" });
            return;
          }
          uni.getStorage({
            key: "room_no",
            success(res) {
              uni.$u.route("/pages/room/room", {
                roomNo: res.data,
                openid: _this.userinfo.openid,
              });
            },
            fail() {
              _this.join_show = true;
            },
          });

          break;
        case 2:
          uni.$u.route("/pages/annotation/annotation");
          break;
      }
    },
    changeButton: function (e) {
      if (e.length === 6) {
        this.join_btn = false;
      } else {
        this.join_btn = true;
      }
    },
    scanCode: function () {
      uni.showToast({title: "暂不支持该功能。", icon: "none"})
      // uni.scanCode({
      //   scanType:["qrCode"],
      //   success: function (res) {
      //     console.log(res);
      //     console.log("条码类型：" + res.scanType);
      //     console.log("条码内容：" + res.result);
      //   },
      // });
    },
    joinRoom: function () {
      let _this = this;
      uni.$u.http
        .get(config.root + "/room/getRoomStatus?roomNo=" + this.room_no)
        .then((res) => {
          if (res.data.data) {
            uni.$u.route("/pages/room/room", {
              roomNo: _this.room_no,
            });
          } else {
            uni.showToast({ title: "该房间不存在", icon: "error" });
          }
        });
    },
    showRecord: function () {
      uni.showToast({
        title: "暂未开放",
        icon: "none",
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  padding: 20rpx;
  height: 100%;

  .header {
    background-color: #ef3e4a;
    border-radius: 20rpx;
  }

  .info {
    display: flex;
    padding: 10rpx;
    align-items: center;

    .info-avatar {
      width: 120rpx;
      height: 120rpx;
      margin: 40rpx 0 0 40rpx;
      border-radius: 50%;
    }

    .info-name {
      color: #fff;
      font-size: 40rpx;
      font-weight: 700;
      margin-left: 20rpx;
    }

    .record {
      margin-left: auto;
      margin-right: 20rpx;
    }
  }

  .data {
    display: flex;
    border-top: 1rpx #ff8b8b solid;
    margin: 20rpx;
    padding: 20rpx;

    .win {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .win-num {
        color: #ffdf99;
        font-size: 38rpx;
        font-weight: bold;
      }

      .win-text {
        color: #fff;
        font-size: 34rpx;
        font-weight: bold;
      }
    }

    .win:first-child {
      border-right: 1rpx #ff8b8b solid;
    }
  }

  .panel {
    margin-top: 20rpx;
    background-color: #fff;
    padding: 20rpx;
    border-radius: 20rpx;

    .top {
      // padding: 10rpx;
      display: flex;
      flex: 1;
      justify-content: space-between;

      .title {
        font-weight: bold;
        font-size: 28rpx;
      }
    }

    .content {
      margin-top: 10rpx;
      padding: 20rpx;
      display: flex;
      flex: 1;
      justify-content: space-between;

      .cell {
        // background-color: green;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        button {
          width: 100rpx !important;
          height: 100rpx !important;
          border: none;
          margin: 0;
          padding: 0;
          margin-bottom: 10rpx;
        }
        button::after {
          border: none;
        }
        .media {
          position: relative;
          image {
            width: 100rpx;
            height: 100rpx;
          }
        }

        .text {
          font-size: 28rpx;
          margin-top: 5rpx;
        }

        .text:last-child {
          margin-top: 5rpx;
        }
      }
    }
  }

  .pop {
    padding: 20rpx 40rpx;

    .title {
      font-size: 34rpx;
      font-weight: 700;
      text-align: center;
      margin-bottom: 20rpx;
    }
    .divider {
      margin-top: 20rpx;
      margin-bottom: 20rpx;
    }
  }

  .footer {
    color: #999;
    font-size: 24rpx;
    text-align: center;
    margin-top: 40rpx;
  }
}
</style>
