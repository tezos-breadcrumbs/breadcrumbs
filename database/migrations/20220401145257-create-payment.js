'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cycle: {
        type: Sequelize.STRING
      },
      delegatorAddress: {
        type: Sequelize.STRING
      },
      paymentAddress: {
        type: Sequelize.STRING
      },
      delegatorBalance: {
        type: Sequelize.STRING
      },
      bakerBalance: {
        type: Sequelize.STRING
      },
      bakerIncome: {
        type: Sequelize.STRING
      },
      feeRate: {
        type: Sequelize.STRING
      },
      paymentAmount: {
        type: Sequelize.STRING
      },
      paymentHash: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
  }
};