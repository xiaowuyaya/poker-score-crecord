const baseController = require("./base")

class AnnotationController extends baseController{

//查询所有数据
async findAll() {
  const { ctx, service } = this;
  let result = await service.annotation.findAll()
  this.success(result, 'OK');
}
}
module.exports = AnnotationController;
