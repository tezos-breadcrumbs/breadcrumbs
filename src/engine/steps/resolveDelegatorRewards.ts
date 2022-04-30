import BigNumber from "bignumber.js";
import { getApplicableFee, getRedirectAddress } from "src/engine/helpers";
import { Payment, StepArguments } from "src/engine/interfaces";
import { add, divide, multiply, subtract } from "src/utils/math";

export const resolveDelegatorRewards = (args: StepArguments): StepArguments => {
  const { config, cycleData, cycleReport, distributableRewards } = args;
  const {
    cycleDelegatedBalance: applicableTotalDelegatedBalance,
    cycleStakingBalance,
    cycleRewards,
    cycleShares,
  } = cycleData;

  let delegatorPayments: Payment[] = [];
  let _feeIncome = new BigNumber(0);
  let _rewardsAllocated = new BigNumber(0);

  for (const share of cycleShares) {
    const applicableFee = getApplicableFee(config, share.address);
    const paymentAddress = getRedirectAddress(config, share.address);

    const { delegatorShare, bakerShare } = getRewardShare(
      share.balance,
      applicableTotalDelegatedBalance,
      distributableRewards,
      applicableFee
    );

    delegatorPayments.push({
      cycle: cycleReport.cycle,
      delegator: share.address,
      paymentAddress,
      delegatorBalance: share.balance,
      bakerStakingBalance: cycleStakingBalance,
      bakerCycleRewards: cycleRewards,
      feeRate: applicableFee,
      paymentAmount: delegatorShare,
      paymentHash: "",
    });

    _rewardsAllocated = add(_rewardsAllocated, add(delegatorShare, bakerShare));
    _feeIncome = add(_feeIncome, bakerShare);
  }
  return {
    ...args,
    cycleReport: {
      ...args.cycleReport,
      feeIncome: _feeIncome,
      payments: args.cycleReport.payments.concat(delegatorPayments),
    },
    distributableRewards: subtract(
      args.distributableRewards,
      _rewardsAllocated
    ),
  };
};

const getRewardShare = (
  delegatorBalance: BigNumber,
  applicableTotalDelegatedBalance: BigNumber,
  distributableRewards: BigNumber,
  applicableFee: BigNumber
) => {
  const delegatorPercentageShare = divide(
    delegatorBalance,
    applicableTotalDelegatedBalance
  );

  const delegatorAbsoluteShare = multiply(
    delegatorPercentageShare,
    distributableRewards
  );

  const bakerAbsoluteShare = multiply(delegatorAbsoluteShare, applicableFee);

  return {
    bakerShare: bakerAbsoluteShare,
    delegatorShare: subtract(delegatorAbsoluteShare, bakerAbsoluteShare),
  };
};
