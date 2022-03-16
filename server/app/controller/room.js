const baseController = require("./base")

class RoomController extends baseController{
  async getRoomNo() {
    const { ctx, service } = this;
    const openid = ctx.query.openid
    while(true){
      // 生成随机6位数
    const r_num = Math.random().toFixed(6).slice(-6)
    // redis中是否存在
    const isExist = await service.cache.get("room_"+r_num)
    // 不存在将其缓存
    if(!isExist){
      await this.service.cache.set("room_"+r_num, openid)
      // 跳出循环
      return this.success(r_num, "房间创建成功")
      break
    }
    }
  }

  async getRoom() {
    const { ctx, service } = this;
    const room_no = ctx.query.roomNo
    const res = await service.cache.get("room_"+room_no)
    if(res){
      return this.success(true)
    }
    return this.success(false)
  }

  async delRoom() {
    const { ctx, service } = this;
    const room_no = ctx.query.roomNo
    const res = await service.cache.del("room_"+room_no)
    return this.success(res)
  }
}
module.exports = RoomController;
