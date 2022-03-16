const BaseController = require("./base")
const WXBizDataCrypt = require('../util/WXBizDataCrypt');
const fs = require('fs');

const wxConfig = {
  appid: "wx8415355e323631f0",
  appSecret: "a7828f551e2795e43ba6afc7c74eeffe"
}

class WeixinController extends BaseController {
  // 登入逻辑
  async login() {
    const {
      ctx
    } = this;
    const urlStr = "https://api.weixin.qq.com/sns/jscode2session"
    const data = {
      appid: wxConfig.appid,
      secret: wxConfig.appSecret,
      js_code: ctx.request.body.code,
      grant_typr: "authorization_code"
    }
    const profileData = {
      encryptedData: ctx.request.body.encryptedData,
      iv: ctx.request.body.iv,
      signature: ctx.request.body.signature
    }
    const result = await ctx.curl(urlStr, {
      data: data,
      dataType: "json"
    })

    if (result.data.errmsg) {
      this.fail("login fail")
    } else {

      const pc = new WXBizDataCrypt(wxConfig.appid, result.data.session_key); // 生成解密钥匙
      const encodedata = pc.decryptData(profileData.encryptedData, profileData.iv); //  获取解密数据

      const user = {
        nick_name: encodedata.nickName,
        city: encodedata.city,
        country: encodedata.country,
        gender: encodedata.gender,
        avatar_url: encodedata.avatarUrl,
        city: encodedata.city,
        province: encodedata.province,
        openid: result.data.openid,
        create_at: new Date()
      }
      const {
        ctx
      } = this
      // 判断用户是否存在

      const post = await ctx.model["WxUser"].findAll({
        where: {
          openid: user.openid
        }
      })

      if (post.length != 0) {
        // 账号已注册
        this.success(user, "success")
      } else {
        // 未注册 添加到数据库
        try {
          await ctx.model["WxUser"].create(user)
          this.success(user, "success")
        } catch (error) {
          this.fail(error)
        }
      }
    }
  }

  // 获取房间二维码
  async getRoomScanCode(){
    const {ctx} = this;
    const roomNo = ctx.request.body.roomNo
    // 获取token
    const r1 = await ctx.curl("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+wxConfig.appid+"&secret="+wxConfig.appSecret, {
      dataType: "json"
    })
    const token = r1.data.access_token
    // 获取二维码
    const r2 = await ctx.curl("https://api.weixin.qq.com/wxa/getwxacode?access_token="+token, {
      method: 'POST',
      // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
      contentType: 'json',
      data: {
        path: "/pages/room/room?roomNo=" + roomNo
      },
      // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
      dataType: 'arraybuffer',
    });
    let base64str = Buffer.from(r2.data, 'binary').toString('base64'); // base64编码

    this.success(base64str)
  }

  // 根据openid获取用户信息
  async getUserinfoByOpenid(){
    const { ctx } = this
    let openid = ctx.query.openid
    try {
      const result = await ctx.model.WxUser.findOne({where: {openid: openid}})
      this.success(result)
    } catch (error) {
      this.fail(error)
      console.log(error)
    }
  }

  // 获取战绩
  async getRecordByOpenid(){
    const { ctx } = this
    let openid = ctx.query.openid
    try {
      const result = await ctx.model.Record.findOne({where: {openid: openid}})
      this.success(result)
    } catch (error) {
      this.fail(error)
      console.log(error)
    }
  }
}

module.exports = WeixinController
