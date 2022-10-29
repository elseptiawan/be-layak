const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
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
          nama: {
            type: DataTypes.STRING,
            allowNull: false
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
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
    });
    User.associate = function(models) {
        User.hasMany(models.Presence, {
            foreignKey: 'user_id',
            as: 'presences'
        });
        User.hasMany(models.Leave, {
            foreignKey: 'user_id',
            as: 'leaves'
        });
        User.hasMany(models.Reimbursement, {
            foreignKey: 'user_id',
            as: 'reimbursements'
        });
        User.belongsTo(models.Company, {
            foreignKey: 'company_id',
            as: 'company'
        });
    }

    return User;
}