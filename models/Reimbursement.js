const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Reimbursement = sequelize.define('Reimbursement', {
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
          jumlah_uang: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          tanggal_pembayaran: {
            type: DataTypes.DATEONLY,
            allowNull: false
          },
          bukti_pembayaran: {
            type: DataTypes.STRING,
            allowNull: false
          },
          kebutuhan: {
            type: DataTypes.STRING,
            allowNull: false
          },
          bukti_reimburse: {
            type: DataTypes.STRING
          },
          status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Pending"
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
        tableName: 'reimbursements'
    });
    Reimbursement.associate = function(models) {
      Reimbursement.belongsTo(models.User, {
          foreignKey: 'user_id',
          as: 'user'
      });
  }

    return Reimbursement;
}