'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payment.init({
    cycle: DataTypes.STRING,
    delegatorAddress: DataTypes.STRING,
    paymentAddress: DataTypes.STRING,
    delegatorBalance: DataTypes.STRING,
    bakerBalance: DataTypes.STRING,
    feeRate: DataTypes.STRING,
    paymentAmount: DataTypes.STRING,
    paymentHash: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};