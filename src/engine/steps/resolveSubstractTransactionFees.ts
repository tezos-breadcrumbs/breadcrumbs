import {
  EFeePayer,
  StepArguments,
  DelegatorPayment,
} from "src/engine/interfaces";
import { add, subtract } from "src/utils/math";

export const resolveSubstractTransactionFees = (
  args: StepArguments
): StepArguments => {
  const { config, cycleReport } = args;
  const { feeIncome, delegatorPayments, feesPaid } = cycleReport;

  const _delegatorPayments: DelegatorPayment[] = [];
  let _feeIncome = feeIncome;
  let _feesPaid = feesPaid;

  const bakerPaysTransactionFee =
    config.payment_requirements?.baker_pays_transaction_fee;

  for (const payment of delegatorPayments) {
    _feesPaid = add(_feesPaid, payment.transactionFee ?? 0);

    _feeIncome = bakerPaysTransactionFee
      ? subtract(_feeIncome, payment.transactionFee ?? 0)
      : _feeIncome;

    _delegatorPayments.push({
      ...payment,
      transactionFeePaidBy: bakerPaysTransactionFee
        ? EFeePayer.Baker
        : EFeePayer.Delegator,
      amount: bakerPaysTransactionFee
        ? payment.amount
        : subtract(payment.amount, payment.transactionFee ?? 0),
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
