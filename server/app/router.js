module.exports = app =>{
  const { router, controller, io } = app;

  // socket.io
  io.of('/').route('deal', io.controller.nsp.deal);
  io.of('/').route('quitRoom', io.controller.nsp.quitRoom);
  io.of('/').route('forceDisconnect', io.controller.nsp.forceDisconnect);
  // go
  router.post('/wx/login/',controller.weixin.login)
  router.get('/wx/getRoomScanCode/',controller.weixin.getRoomScanCode)
  router.get('/wx/getUserinfoByOpenid',controller.weixin.getUserinfoByOpenid)
  router.get('/wx/getRecordByOpenid',controller.weixin.getRecordByOpenid)
  router.get('/annotation/findAll', controller.annotation.findAll);
  router.get('/room/getRoomNo', controller.room.getRoomNo);
  router.get('/room/getRoomStatus', controller.room.getRoom);
  router.get('/room/delRoom', controller.room.delRoom);

}
