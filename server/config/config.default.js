module.exports = appInfo => {
  const config = exports = {}
  config.keys = appInfo.name + "_10895852_2821"
  config.middleware = []
  // 取消安全证书验证
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ["*"], // 白名单
  }

  // mysql
  config.sequelize = {
    dialect: 'mysql',
    host: "localhost",
    port: 3306,
    database: "wx_scoring_app",
    username: "root",
    password: "root"
  }
  // 允许跨域
  config.cors = {
    credentials: true,
    origin: "*",
    allowMethods: "GET,PUT,POST,DELETE"
  }

  //redis
  config.redis = {
    client: {
      port: 6379,          // Redis port
      host: '127.0.0.1',   // Redis host
      password: '',
      db: 0
    }
  }

  config.io = {
    namespace: {
        '/': {
            connectionMiddleware: [ 'auth' ],
            packetMiddleware: [ ]
        }
    }
 };





  const userConfig = {}

  return {
    ...config,
    ...userConfig
  }
}