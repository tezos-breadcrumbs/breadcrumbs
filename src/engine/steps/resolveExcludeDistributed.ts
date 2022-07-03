import { find, groupBy, some } from "lodash";
import { globalCliOptions } from "src/cli";
import { join } from "path";

import { BasePayment, StepArguments } from "src/engine/interfaces";
import { readPaymentReport } from "src/fs-client";
import { REPORTS_SUCCESS_PAYMENTS_DIRECTORY } from "src/utils/constants";

export const resolveExcludeDistributed = async (
  args: StepArguments
): Promise<StepArguments> => {
  const { cycleReport } = args;

  const { delegatorPayments, feeIncomePayments, bondRewardPayments, cycle } =
    cycleReport;

  const paidPayments = await readPaymentReport(
    cycle,
    join(globalCliOptions.workDir, REPORTS_SUCCESS_PAYMENTS_DIRECTORY)
  );
  const paidPaymentsGrouped = groupBy(paidPayments, (payment) => payment.type);
  const nonDistributedDelegatorPayments = delegatorPayments.filter(
    (payment) =>
      !some(
        paidPaymentsGrouped[payment.type],
        (paid) => paid.recipient === payment.recipient
      )
  );
  const nonDistributedFeeIncomePayments = feeIncomePayments.filter(
    (payment) =>
      !some(
        paidPaymentsGrouped[payment.type],
        (paid) => paid.recipient === payment.recipient
      )
  );
  const nonDistributedBondRewardPayments = bondRewardPayments.filter(
    (payment) =>
      !some(
        paidPaymentsGrouped[payment.type],
        (paid) => paid.recipient === payment.recipient
      )
  );

  const distributedPayments = [
    ...delegatorPayments.filter(
      (payment) => !nonDistributedDelegatorPayments.includes(payment)
    ),
    ...feeIncomePayments.filter(
      (payment) => !nonDistributedFeeIncomePayments.includes(payment)
    ),
    ...bondRewardPayments.filter(
      (payment) => !nonDistributedBondRewardPayments.includes(payment)
    ),
  ]
    .map((payment) =>
      find(
        paidPaymentsGrouped[payment.type],
        (paid) => paid.recipient === payment.recipient
      )
    )
    .filter((payment) => payment) as BasePayment[];

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      delegatorPayments: nonDistributedDelegatorPayments,
      feeIncomePayments: nonDistributedFeeIncomePayments,
      bondRewardPayments: nonDistributedBondRewardPayments,
      distributedPayments,
    },
  };
};
