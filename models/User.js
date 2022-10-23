const { DataTypes } = require("sequelize");

module.exports = (sequelize, Datatypes) => {
    const User = sequelize.define['User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          company_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false
          },
          password: {
            type: DataTypes.STRING,
            allowNull: false
          },
          position: {
            type: DataTypes.STRING,
            allowNull: false
          },
          role: {
            type: DataTypes.STRING,
            allowNull: false
          },
          foto_profil: {
            type: DataTypes.STRING
          },
          sisa_cuti: {
            type: DataTypes.INTEGER
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
        tableName : 'users'
    }];

    return User;
}