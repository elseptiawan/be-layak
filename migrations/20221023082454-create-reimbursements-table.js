'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('reimbursements', { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      jumlah_uang: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tanggal_pembayaran: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      bukti_pembayaran: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kebutuhan: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bukti_reimburse: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Pending"
      },
      alasan_ditolak: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('reimbursements');
  }
};
