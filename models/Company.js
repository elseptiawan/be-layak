const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define('Company', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          nama: {
            type: DataTypes.STRING,
            allowNull: false
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false
          },
          template_surat_cuti: {
            type: DataTypes.STRING
          },
          alamat: {
            type: DataTypes.STRING,
            allowNull: false
          },
          jatah_cuti: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          no_hp: {
            type: DataTypes.STRING,
            allowNull: false
          },
          web: {
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
        tableName: 'companies'
    });

    return Company;
}