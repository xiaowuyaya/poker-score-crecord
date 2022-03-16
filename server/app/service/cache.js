const BaseService = require("./base")


class CacheService extends BaseService {
  async set(key, value, seconds) {
    value = JSON.stringify(value);
    if (this.app.redis) {
      if (!seconds) {
        await this.app.redis.set(key, value);
      } else {
        await this.app.redis.set(key, value, 'EX', seconds)
      }
    }
  }

  async get(key) {
    if (this.app.redis) {
      var data = await this.app.redis.get(key);
      if (!data) return;
      return JSON.parse(data)
    }
  }

  async del(key) {
    if (this.app.redis) {
      var data = await  this.app.redis.del(key)
      if (!data) return;
      return JSON.parse(data)
    }
  }

  async expire(key, seconds) {
    if (this.app.redis) {
      await await app.redis.expire(key, seconds)
    }
  }
}

module.exports = CacheService;