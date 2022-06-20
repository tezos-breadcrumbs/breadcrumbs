import { EFeePayer, StepArguments } from "src/engine/interfaces";
import { add, subtract } from "src/utils/math";

export const resolveSubstractTransactionFees = (
  args: StepArguments
): StepArguments => {
  const { config, cycleReport } = args;
  const { feeIncome, delegatorPayments, feesPaid } = cycleReport;

  let _feeIncome = feeIncome;
  let _delegatorPayments = delegatorPayments;
  let _feesPaid = feesPaid;

  for (const payment of delegatorPayments) {
    _feesPaid = add(_feesPaid, payment.transactionFee);

    _feeIncome = config.baker_pays_tx_fee
      ? subtract(_feeIncome, payment.transactionFee)
      : _feeIncome;

    _delegatorPayments.push({
      ...payment,
      transactionFeePaidBy: config.baker_pays_tx_fee
        ? EFeePayer.Baker
        : EFeePayer.Delegator,
      amount: config.baker_pays_tx_fee
        ? payment.amount
        : subtract(payment.amount, payment.transactionFee),
    });
  }

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      feesPaid: _feesPaid,
      delegatorPayments: _delegatorPayments,
      feeIncome: _feeIncome,
    },
  };
};
