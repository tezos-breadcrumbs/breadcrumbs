import _ from "lodash";
import client from "./client";
import config from "../config.json";
import { CycleData } from "./client/abstract_client";

interface Payment {
  cycle: number;
  delegator: string;
  paymentAddress: string;
  delegatorBalance: number;
  bakerStakingBalance: number;
  bakerCycleRewards: number;
  feeRate: number;
  paymentAmount: number;
  paymentHash: string;
}

interface CycleReport {
  cycle: number;
  payments: Payment[];
  feeIncome: number;
  lockedBondRewards: number;
}

const run = async (baker, cycle: number) => {
  const data = await client.getCycleData(baker, cycle);
  const report = initializeCycleReport(cycle);

  // Process self rewards (data, report, rewardBucket)
  // - Deducts rewards due to baker stake (handling over-delegation protection)
  // - Returns a deducted reward Bucket
  // Process delegator rewards:
  // - Allocates rewards based on % of total delegated stake
  // - Applies fees
  // - Applies payment address
  // - Returns an object with an updatd delegator payments,feesEarned
  // Distribute income
  // - Allocates feeIncome and rewards due to bakerStake as per baker wishes.

  processSelf(data, report, data.cycleRewards)
    .then(processDelegators)
    .catch(console.error);
  // .then(console.log);
};

const processSelf = (
  data: CycleData,
  report: CycleReport,
  rewardBucket: number
): Promise<[CycleData, CycleReport, number]> => {
  const { cycleDelegatedBalance, cycleStakingBalance, cycleRewards } = data;

  const lockedBondRewards = _.multiply(
    _.divide(
      _.subtract(cycleStakingBalance, cycleDelegatedBalance),
      cycleStakingBalance
    ),
    cycleRewards
  );

  return Promise.resolve([
    data,
    _.set(report, "lockedBondRewards", lockedBondRewards),
    (rewardBucket -= lockedBondRewards),
  ]);
};

const processDelegators = ([data, report, rewardBucket]: [
  CycleData,
  CycleReport,
  number
]) => {
  const { cycle } = report;
  const {
    cycleRewards,
    cycleShares,
    cycleStakingBalance,
    cycleDelegatedBalance,
  } = data;

  const _rewardBucket = rewardBucket;

  let payments: Payment[] = [];
  let feeIncome: number = 0;

  for (const { address, balance } of cycleShares) {
    const fee = getApplicableFee(address);
    const paymentAddress = getPaymentAddress(address);

    const { bakerShare, delegatorShare } = getRewardSplit(
      balance,
      cycleDelegatedBalance,
      _rewardBucket,
      fee
    );

    payments.push({
      cycle,
      delegator: address,
      paymentAddress,
      delegatorBalance: balance,
      bakerStakingBalance: cycleStakingBalance,
      bakerCycleRewards: cycleRewards,
      feeRate: fee,
      paymentAmount: delegatorShare,
      paymentHash: "",
    });

    rewardBucket -= _.add(bakerShare, delegatorShare);
    feeIncome += bakerShare;
  }

  return Promise.resolve([
    data,
    { ...report, payments, feeIncome },
    rewardBucket,
  ]);
};

const getApplicableFee = (delegator: string): number => {
  return _.divide(Number(config.default_fee), 100);
};

const getPaymentAddress = (delegator: string): string => {
  return delegator;
};

const getRewardSplit = (
  cycleDelegatorBalance: number,
  cycleDelegatedBalance: number,
  cycleRewards: number,
  applicableFee: number
) => {
  const delegatorShare = _.multiply(
    _.divide(cycleDelegatorBalance, cycleDelegatedBalance),
    cycleRewards
  );

  const netDelegatorShare = _.multiply(delegatorShare, 1 - applicableFee);
  const bakerShare = _.multiply(delegatorShare, applicableFee);

  return { bakerShare, delegatorShare: netDelegatorShare };
};

const initializeCycleReport = (cycle): CycleReport => {
  return {
    cycle,
    payments: [],
    lockedBondRewards: 0,
    feeIncome: 0,
  };
};

run("tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur", 468);
