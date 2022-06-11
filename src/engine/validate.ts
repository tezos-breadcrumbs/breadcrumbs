import { getConfig } from "src/config";
import { BasePayment } from "./interfaces";

const paymentRequirements = [
  (p: BasePayment) => p.recipient !== getConfig("baking_address"), // in case rewards are redirected to baker himself
  (p: BasePayment) =>
    getConfig("network_configuration")?.suppress_smartcontract_payments !=
      true || !p.recipient.startsWith("KT"), // TODO: we need to allow payments to smart contracts
  (p: BasePayment) => p.amount.gt(0), // TODO: Add check for transaction fee
];

export const arePaymentsRequirementsMet = (p: BasePayment) => {
  for (const requirement of paymentRequirements) {
    if (!requirement(p)) return false;
  }
  return true;
};
