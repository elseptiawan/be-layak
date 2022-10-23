'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('companies', { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nama: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      email: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "default-logo.png"
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      jatah_cuti: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      no_hp: {
        type: Sequelize.STRING,
        allowNull: false
      },
      web: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('companies');
  }
};
