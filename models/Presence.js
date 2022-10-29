const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Presence = sequelize.define('Presence', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          clock_in: {
            type: DataTypes.TIME
          },
          clock_out: {
            type: DataTypes.TIME
          },
          foto: {
            type: DataTypes.STRING
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
          },
    }, {
        tableName: "presences"
    });
    Presence.associate = function(models) {
      Presence.belongsTo(models.User, {
          foreignKey: 'user_id',
          as: 'user'
      });
  }

    return Presence;
}