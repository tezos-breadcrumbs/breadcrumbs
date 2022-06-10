import { BigNumber } from "bignumber.js";
import _ from "lodash";
import { getApplicableFee, getRedirectAddress } from "src/engine/helpers";
import {
  DelegatorPayment,
  EPaymentType,
  StepArguments,
} from "src/engine/interfaces";
import {
  add,
  divide,
  multiply,
  subtract,
  sum,
  integerize,
} from "src/utils/math";

export const resolveDelegatorRewards = (args: StepArguments): StepArguments => {
  const { config, cycleData, cycleReport, distributableRewards } = args;
  const { cycleStakingBalance, cycleRewards, cycleShares } = cycleData;

  /* The total delegated balance minus any excluded delegator shares */
  /* This proportionally distributes the reward share of excluded delegators to the rest of the pool */
  const applicableTotalDelegatedBalance = sum(
    ..._.map(cycleShares, (share) => share.balance)
  );

  const delegatorPayments: DelegatorPayment[] = [];
  let _feeIncome = new BigNumber(0);
  let _rewardsAllocated = new BigNumber(0);

  for (const share of cycleShares) {
    const applicableFee = getApplicableFee(config, share.address);
    const recipient = getRedirectAddress(config, share.address);

    const { delegatorShare, bakerShare } = getRewardShare(
      share.balance,
      applicableTotalDelegatedBalance,
      distributableRewards,
      applicableFee
    );

    delegatorPayments.push({
      type: EPaymentType.Delegator,
      cycle: cycleReport.cycle,
      delegator: share.address,
      recipient,
      delegatorBalance: share.balance,
      bakerStakingBalance: cycleStakingBalance,
      bakerCycleRewards: cycleRewards,
      feeRate: applicableFee,
      fee: bakerShare,
      amount: delegatorShare,
      hash: "",
    });

    _rewardsAllocated = add(_rewardsAllocated, add(delegatorShare, bakerShare));
    _feeIncome = add(_feeIncome, bakerShare);
  }
  return {
    ...args,
    cycleReport: {
      ...args.cycleReport,
      feeIncome: _feeIncome,
      delegatorPayments,
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
    bakerShare: integerize(bakerAbsoluteShare),
    delegatorShare: integerize(
      subtract(delegatorAbsoluteShare, bakerAbsoluteShare)
    ),
  };
};
