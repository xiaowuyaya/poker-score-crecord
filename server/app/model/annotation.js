module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize
  const Annotation = app.model.define('annotation', {
    id: {type: INTEGER, primaryKey: true},
    create_at: DATE,
    content: STRING(255)
  },{
    timestamps: false,
    tableName: "annotation"
  })
  return Annotation
}