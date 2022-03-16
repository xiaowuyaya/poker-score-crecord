module.exports = app => {
  const { STRING, INTEGER,DATE } = app.Sequelize
  const WxUser = app.model.define('users', {
    id: {type: INTEGER, primaryKey: true},
    nick_name: STRING(255),
    gender: STRING(255),
    avatar_url: STRING(255),
    country: STRING(255),
    province: STRING(255),
    city: STRING(255),
    openid: STRING(255),
    create_at: DATE,
  },{
    timestamps: false,
    tableName: "wx_user"
  })
  return WxUser
}