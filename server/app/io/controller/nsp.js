const Controller = require('egg').Controller;

class NspController extends Controller {

  async msg(){
    const { ctx, app } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const client = socket.id;

    nsp.to(399033).emit('msg',{code: 200,id:client, msg: "got it" })
  }

  // 转账处理
  async deal(){
    const { ctx, app, service } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const {room, payer, payee, amount} = message
    console.log(message)

    const bill = await service.cache.get("bill_"+room)
    // console.log(bill_temp)
    bill[payer] = bill[payer] - amount
    bill[payee] = bill[payee] + amount
    nsp.to(room).emit("bill",{code: 200, data: bill})
    nsp.to(room).emit("record",{code: 200, data: {payer,payee,amount}})
    await service.cache.set("bill_"+room, bill)
  }

  // 退出房间
  async quitRoom(){
    const { ctx, app, service } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;

    const {room, openid, amount} = message
    console.log(message)


    let bill = await service.cache.get("bill_"+room)
    delete bill[openid]
    await service.cache.set("bill_"+room, bill)

    console.log(1)
    // 计入战绩
    let recode = await ctx.model['Record'].findOne({where:{openid: openid}})
    // console.log(recode.total)
    if (!recode){
      await ctx.model['Record'].create({openid: openid, total: 0, win: 0})
    }else {
      recode.total += 1
      if (amount >= 0){
        recode.win += 1
      }

      await recode.update({id: recode.id, total: recode.total, win: recode.win})
    }

    // 判断自己是不是最后一个人
    try {
      socket.adapter.rooms[room].length
    }catch (err){
      await service.cache.del('bill_'+room)
      await service.cache.del('room_'+room)
    }

    socket.leave(room);
    nsp.to(room).emit("user_list",{code: 200, data: socket.adapter.rooms[room]})


  }

  async forceDisconnect(){
    const { ctx, app } = this;
    const socket = ctx.socket;
    socket.disconnect(true);
    console.log("quit")
  }
}

module.exports = NspController;
