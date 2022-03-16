<template>
  <view class="container">
    <u-popup
      :customStyle="{ width: '70%', height: '600rpx' }"
      round="10"
      :show="code_show"
      mode="center"
      @close="closeCodeShow(0)"
      @open="openCodeShow(0)"
    >
      <view class="pop-content">
        <view class="title">房间号：{{ roomNo }}</view>
        <view class="divider">
          <u-divider sty text="扫码加入" :hairline="true"></u-divider>
        </view>
        <image :src="codeImg"></image>
      </view>
    </u-popup>

    <!-- 转账窗口 -->
    <u-popup
      :customStyle="{ width: '60%', height: '350rpx' }"
      round="10"
      :show="deal_show"
      mode="center"
      @close="closeCodeShow(1)"
      @open="openCodeShow(1)"
    >
      <view class="deal">
        <view>请输入数额</view>
        <view class="box">
          <u-number-box size="normal" v-model="deal_num" integer></u-number-box>
        </view>
        <u-button type="error" text="拿去" @click="deal"></u-button>
      </view>
    </u-popup>

    <u-modal
      :show="showModal"
      content="是否结算并退出房间？"
      confirmText="确定"
      cancelText="取消"
      :showCancelButton="true"
      width="480rpx"
      @confirm="quit"
      @cancel="showModal = false"
    ></u-modal>
    <!-- 人员列表 -->
    <view class="header">
      <view
        class="cell"
        v-for="(item, index) in userlist"
        :key="index"
        @click="gameDeal(item.openid)"
      >
        <image :src="item.avatar_url" mode="scaleToFill" />
        <view class="nickname">{{ item.nick_name }}</view>
        <view class="money">¥ {{ bill[item.openid] }}</view>
      </view>
      <view class="cell" @click="gameDeal('tea')">
        <image :src="tea_img" mode="scaleToFill" />
        <view class="nickname">茶水</view>
        <view class="money">¥ {{ bill["tea"] }}</view>
      </view>
    </view>

    <view class="content">
      <view class="sub">当前房间号：{{ roomNo }}</view>
      <scroll-view scroll-y="true" :show-scrollbar="true">
        <view class="row" v-for="(item, index) in record" :key="index">
          <text class="name">{{ item.payer }}</text>
          <text class="text">丢给了</text>
          <text class="name">{{ item.payee }}</text>
          <text class="money">{{ item.amount }} 元</text>
        </view>
      </scroll-view>
    </view>
    <view class="btn">
      <u-button
        class="btn-"
        type="error"
        :plain="false"
        text="结算退出"
        @click="showModal = true"
        :customStyle="{ width: '30%', height: '60rpx' }"
      ></u-button>
      <u-button
        class="btn-"
        type="primary"
        :plain="false"
        text="邀请好友"
        @click="code_show = true"
        :customStyle="{ width: '30%', height: '60rpx' }"
      ></u-button>
      <u-button
        class="btn-"
        type="primary"
        :plain="false"
        text="意见反馈"
        openType="contact"
        :customStyle="{ width: '30%', height: '60rpx' }"
      ></u-button>
    </view>
    <!-- 退出逻辑 -->
    <!-- <view @click="exit">exit</view> -->
  </view>
</template>

<script>
const io = require("../../util/weapp.socket.io");
const config = require("../../util/config.default");
export default {
  data() {
    return {
      openid: null,
      roomNo: null,
      codeImg: null,
      code_show: false,
      deal_show: false,
      showModal: false,
      deal_num: 1,
      deal_to: null,
      userlist: [],
      bill: {},
      record: [],
      tea_img: config.img.tea,
    };
  },
  onLoad(value) {
    const roomNo = value.roomNo;
    this.openid = value.openid;
    this.roomNo = roomNo;
    // 设置标题
    uni.setNavigationBarTitle({
      title: "房间号：" + roomNo,
    });

    if (!this.openid) {
      uni.showToast({ title: "请先授权登入，并从首页加入房间", icon: "none" });
      setTimeout(() => {
        uni.$u.route({ url: "/pages/index/index", type: "reLaunch" });
      }, 1500);
    }

    // 设置缓存
    uni.setStorage({
      key: "room_no",
      data: roomNo,
    });

    let _this = this;
    // 生成房间二维码
    uni.$u.http
      .get(config.root + "/wx/getRoomScanCode/?roomNo=" + roomNo)
      .then((res) => {
        _this.codeImg = "data:image/png;base64," + res.data.data;
      });

    // socket
    const ws_url = config.root + "?room=" + roomNo + "&userId=" + this.openid;
    const socket = (this.socket = io(ws_url));

    // 监听socket连接
    socket.on("connect", function () {
      console.log("房间socket连接成功");
    });

    // 监听是否有人掉线
    socket.on("info", function (res) {
      let name = null;
      _this.userlist.forEach((element) => {
        if (element.openid == res.data) {
          name = element.nick_name;
        }
      });
      uni.showToast({ title: name + "断开连接...", icon: "none" });
    });

    // 监听用户列表 信息
    socket.on("user_list", (d) => {
      let users = Object.keys(d.data.sockets);
      let temp = [];
      users.forEach((e) => {
        uni.$u.http
          .get(config.root + "/wx/getUserinfoByOpenid?openid=" + e)
          .then((res) => {
            temp.push(res.data.data);
          });
      });
      _this.userlist = temp;
    });
    // 监听账单 信息
    socket.on("bill", (d) => {
      _this.bill = d.data;
    });

    // 监听记录 信息
    socket.on("record", (d) => {
      let temp = d.data;
      _this.userlist.forEach((element) => {
        if (element.openid == temp.payer) {
          temp.payer = element.nick_name;
        }
        if (element.openid == temp.payee) {
          temp.payee = element.nick_name;
        }
      });

      _this.record.push(temp);
    });
  },
  onUnload() {
    this.socket.disconnect();
  },
  methods: {
    exit: function () {
      users.forEach((e) => {
        uni.$u.http
          .get(config.root + "/room/delRoom?roomNo=" + this.roomNo)
          .then((res) => {
            // 清缓存
            uni.removeStorage({
              key: "room_no",
            });
            //返回首页
            uni.$u.route({ type: "back", delta: 1 });
          })
          .catch((err) => {
            console.error(err);
            uni.showToast({ title: "网络异常，请稍后再试", icon: "error" });
          });
      });
    },
    closeCodeShow: function (e) {
      if (e === 0) {
        this.code_show = false;
      } else {
        this.deal_show = false;
      }
    },
    openCodeShow: function (e) {
      if (e === 0) {
        this.code_show = true;
      } else {
        this.deal_show = true;
      }
    },
    gameDeal: function (e) {
      if (e == this.openid) {
        return;
      }
      this.deal_to = e;
      this.openCodeShow(1);
    },
    deal: function () {
      const data = {
        room: this.roomNo,
        payer: this.openid,
        payee: this.deal_to,
        amount: this.deal_num,
      };
      this.socket.emit("deal", data);
      this.deal_num = 1;
      this.deal_show = false;
    },
    quit: function () {
      // 删除房间缓存
      uni.removeStorage({
        key: "room_no",
      });

      // 请求删除服务器账单
      this.socket.emit("quitRoom", {
        openid: this.openid,
        room: this.roomNo,
        amount: this.bill[this.openid],
      });
      this.socket.disconnect();
      uni.$u.route({ url: "/pages/index/index", type: "reLaunch" });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  height: 100%;

  .pop-content {
    padding: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    .title {
      font-size: 38rpx;
      font-weight: 700;
    }

    image {
      width: 380rpx;
      height: 380rpx;
    }
  }

  .deal {
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    .box {
      margin-top: 20rpx;
      margin-bottom: 20rpx;
      padding: 20rpx;
    }
  }

  .header {
    padding: 20rpx;
    background-color: #fff;
    border-radius: 20rpx;
    display: flex;
    justify-content: space-between;
    box-shadow: 1rpx 1rpx 1rpx #f0f0f0;

    .cell {
      padding: 5rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      image {
        border-radius: 50%;
        width: 80rpx;
        height: 80rpx;
      }
      .nickname {
        font-size: 26rpx;
      }
      .money {
        color: #ef3e4a;
        font-weight: 700;
        font-size: 26rpx;
      }
    }
  }

  .content {
    padding: 20rpx;
    margin-top: 20rpx;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 1rpx 1rpx 1rpx #f0f0f0;
    height: 70%;

    .sub {
      text-align: center;
      font-size: 26rpx;
      color: #999;
    }

    scroll-view {
      padding: 20rpx;
      height: 90%;

      .row {
        margin-left: 35rpx;
        margin-bottom: 5rpx;

        .name {
          font-size: 30rpx;
          font-weight: 700;
          margin: 0 10rpx;
          color: #525252;
        }
        .text {
          color: #414141;
        }
        .money {
          color: #ca3e47;
        }
      }
    }
  }

  .btn {
    padding: 20rpx;
    margin-top: 20rpx;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 1rpx 1rpx 1rpx #f0f0f0;
    display: flex;
  }
}
</style>