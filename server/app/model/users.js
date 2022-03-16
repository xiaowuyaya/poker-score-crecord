module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize
  const Users = app.model.define('users', {
    id: {type: INTEGER, primaryKey: true},
    username: STRING(255),
    nickname: STRING(255),
    avatar: STRING(255),
    sex: INTEGER(11),
    age: INTEGER(11),
  },{
    timestamps: false,
    tableName: "users"
  })
  return Users
}