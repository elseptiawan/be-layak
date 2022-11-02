const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Leave = sequelize.define('Leave', {
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
          tipe_cuti: {
            type: DataTypes.STRING,
            allowNull: false
          },
          start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
          },
          end_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
          },
          status: {
            type: DataTypes.STRING,
            defaultValue: "Pending",
            allowNull: false
          },
          surat_cuti: {
            type: DataTypes.STRING,
            allowNull: false
          },
          deskripsi: {
            type: DataTypes.TEXT
          },
          alasan_ditolak: {
            type: DataTypes.TEXT
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
        tableName: 'leaves'
    });
    Leave.associate = function(models) {
      Leave.belongsTo(models.User, {
          foreignKey: 'user_id',
          as: 'user'
      });
  }

    return Leave;
}