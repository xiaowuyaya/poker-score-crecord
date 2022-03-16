const BaseService = require("./base")

class AnnotationService extends BaseService {
  //查询所有数据
  async findAll() {
    let data = await this._findAll('Annotation')
    let total = await this._count('Annotation')
    return {
      total,
      data
    }
  }

  //根据ID查询数据
  async findById(id) {
    return await this._findById('Annotation', id)
  }

  //新增数据
  async add(json) {
    return await this._add('Annotation', json)
  }

  //编辑数据
  async edit() {
    let data = await this._edit('Users', json);
    if (!data) return "Id传入有误"
    return data
  }

  //删除数据
  async del(id) {
    let data = await this._delete('Annotation', id);
    if (!data) return "Id传入有误"
    return data
  }
}

module.exports = AnnotationService;