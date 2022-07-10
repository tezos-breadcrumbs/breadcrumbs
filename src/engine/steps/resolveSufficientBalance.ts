import { getSignerBalance } from "src/engine/helpers";
import { StepArguments } from "src/engine/interfaces";
import { multiply, sum } from "src/utils/math";

const BUFFER_FACTOR = 1.01;

export const resolveSufficientBalance = async (
  args: StepArguments
): Promise<StepArguments> => {
  const { tezos, cycleReport } = args;

  const signerBalance = await getSignerBalance(tezos);

  const totalPayable = multiply(
    sum(
      ...[
        ...cycleReport.delegatorPayments,
        ...cycleReport.feeIncomePayments,
        ...cycleReport.bondRewardPayments,
      ].map((payment) => payment.amount)
    ),
    BUFFER_FACTOR
  );

  return signerBalance.gte(totalPayable)
    ? args
    : { ...args, flags: { insufficientBalance: true } };
};
