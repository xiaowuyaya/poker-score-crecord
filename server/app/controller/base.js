const Controller = require('egg').Controller

class baseController extends Controller{
  // 操作成功
  async success(data, msg, code = 200){
    const {ctx} = this
    ctx.body = {
      code, msg, data
    }
  }

  // 操作失败
  async fail(msg, code = 403){
    const {ctx} = this
    ctx.body = {
      code, msg
    }
  }

}

module.exports = baseController