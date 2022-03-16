const PREFIX = 'room';

module.exports = () => {
  return async (ctx, next) => {
    const { app, socket, logger, helper } = ctx;
    const id = socket.id;
    const nsp = app.io.of('/');
    const query = socket.handshake.query;

    // 用户信息
    const { room, userId } = query;
    const rooms = [ room ];
    socket.id = userId



    // 检查房间是否存在，不存在则踢出用户
    const hasRoom = await app.redis.get("room_"+room);

    if (!hasRoom) {
      console.log("room is not exist");
      nsp.to(room).emit("room",{code: 400, msg: "room is not exist"});
    }else{
    // 用户加入
      socket.join(room, () => {

        console.log("用户:" + userId + "加入了房间:" + room)
        // 获取当前房间用户
        nsp.to(room).emit("room",{code: 200, msg:"用户连接", data: socket.id})
        // nsp.to(room).emit("user_list",{code: 200, data: socket.adapter.rooms[room]})
        socket.emit("user_list",{code: 200, data: socket.adapter.rooms[room]})
        nsp.to(room).emit("user_list",{code: 200, data: socket.adapter.rooms[room]})

      });
    }

    // 判断redis是否存在该房间的账单
    let Bill = await app.redis.get("bill_"+room);
    if (!Bill){

        let temp = socket.adapter.rooms[room].sockets

      for(i in temp){
        temp[i] = 0
      }
      temp["tea"] = 0
      await app.redis.set("bill_"+room, JSON.stringify(temp))
    }else {
      p = JSON.parse(Bill)
      if (!p[userId]){
        p[userId] = 0
      }
      await app.redis.set("bill_"+room, JSON.stringify(p))
    }
    let new_bill = await app.redis.get("bill_"+room);
    socket.emit("bill",{code: 200, data: JSON.parse(new_bill)})
    nsp.to(room).emit("bill",{code: 200, data: JSON.parse(new_bill)})



    // 用户退出连接时返回当前房间用户信息
    socket.on('disconnect', function(){
      // 获取当前房间用户
      console.log("exitg")
      nsp.to(room).emit("user_leave",{code: 200, data: socket.adapter.rooms[room]})
      nsp.to(room).emit("info",{code: 200, msg:"用户断开连接", data: socket.id})
    });




    await next();

  };
};
