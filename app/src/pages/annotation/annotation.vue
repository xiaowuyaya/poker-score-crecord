<template>
  <view class="container">
    <view class="panel" v-for="(item, index) in anno_list" :key="index">
      <view class="top">
        <view class="title">{{
          $u.timeFormat(item.create_at, "yyyy-mm-dd hh:MM")
        }}</view>
        <!-- <view class="sub">sub</view> -->
      </view>
      <view class="content">
        <view class="text">{{ item.content }}</view>
      </view>
    </view>
  </view>
</template>

<script>
const config = require("../../util/config.default");
export default {
  data() {
    return {
      anno_list: [],
    };
  },
  onShow() {
    let _this = this;
    uni.$u.http.get(config.root + "/annotation/findAll").then((res) => {
      _this.anno_list = res.data.data.data;
      uni.setStorage({
        key: "ANO_NUM",
        data: _this.anno_list.length,
      });
    });
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  height: 100%;

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
        padding: 20rpx;
        width: 100%;
        font-weight: bold;
        font-size: 32rpx;
        border-bottom: 1rpx #f1f1f1 solid;
      }
    }

    .content {
      margin-top: 10rpx;
      padding: 20rpx;
      display: flex;
      flex: 1;
      justify-content: space-between;
    }
    .text {
      width: 100%;
      word-break: break-all;
    }
  }
}
</style>