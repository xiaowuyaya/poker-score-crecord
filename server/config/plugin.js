'use strict'

module.exports = {
  // 引入egg-sequelize
  sequelize: {
    enable: true,
    package: "egg-sequelize",
  },
  // 引入egg-cors
  cors: {
    enable: true,
    package: "egg-cors"
  },
  // 引入redis
  redis: {
    enable: true,
    package: 'egg-redis',
  },

  io: {
    enable: true,
    package: 'egg-socket.io'
  }

}