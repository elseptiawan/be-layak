const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Precense = sequelize.define('Precense', {
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
            type: DataTypes.TIME,
            allowNull: false
          },
          clock_out: {
            type: DataTypes.TIME,
            allowNull: false
          },
          foto: {
            type: DataTypes.STRING,
            allowNull: false
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
        tableName: "precenses"
    });

    return Precense;
}