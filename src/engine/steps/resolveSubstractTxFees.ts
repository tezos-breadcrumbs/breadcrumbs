import { StepArguments } from "src/engine/interfaces";

export const resolveSubstractTxFees = (args: StepArguments): StepArguments => {
  const { config, cycleReport } = args;

  let feeIncome = cycleReport.feeIncome;
  for (const payment of cycleReport.delegatorPayments) {
    if (config.baker_pays_tx_fee) {
      feeIncome = feeIncome.minus(payment.txFee ?? 0);
    }
  }

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      feeIncome,
    },
  };
};
