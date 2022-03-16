module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize
  const Record = app.model.define('record', {
    id: {type: INTEGER, primaryKey: true},
    openid: STRING(255),
    total: INTEGER,
    win: INTEGER
  },{
    timestamps: false,
    tableName: "record"
  })
  return Record
}
