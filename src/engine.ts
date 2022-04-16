import _ from "lodash";
import client from "./client";
import config from "../config.json";
import { CycleData } from "./client/abstract_client";
import { BigNumber } from "bignumber.js";
import { add, divide, multiply, subtract } from "./utils/math";

interface Payment {
  cycle: number;
  delegator: string;
  paymentAddress: string;
  delegatorBalance: BigNumber;
  bakerStakingBalance: BigNumber;
  bakerCycleRewards: BigNumber;
  feeRate: BigNumber;
  paymentAmount: BigNumber;
  paymentHash: string;
}

interface CycleReport {
  cycle: number;
  payments: Payment[];
  feeIncome: BigNumber;
  lockedBondRewards: BigNumber;
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
    // .catch(console.error);
    .then(console.log);
};

const processSelf = (
  data: CycleData,
  report: CycleReport,
  rewardBucket: BigNumber
): Promise<[CycleData, CycleReport, BigNumber]> => {
  const { cycleDelegatedBalance, cycleStakingBalance, cycleRewards } = data;

  const bakerBalance = subtract(cycleStakingBalance, cycleDelegatedBalance);
  const bakerBalanceRewards = multiply(
    divide(bakerBalance, cycleStakingBalance),
    cycleRewards
  );

  return Promise.resolve([
    data,
    _.set(report, "lockedBondRewards", bakerBalanceRewards),
    subtract(rewardBucket, bakerBalanceRewards),
  ]);
};

const processDelegators = ([data, report, rewardBucket]: [
  CycleData,
  CycleReport,
  BigNumber
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
  let feeIncome = new BigNumber(0);

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

    rewardBucket = add(bakerShare, delegatorShare);
    feeIncome = add(feeIncome, bakerShare);
  }

  console.log("remainingRewards", rewardBucket.div(1000000).toString());
  return Promise.resolve([
    data,
    { ...report, payments, feeIncome },
    rewardBucket,
  ]);
};

const getApplicableFee = (delegator: string): BigNumber => {
  return new BigNumber(config.default_fee).div(100);
};

const getPaymentAddress = (delegator: string): string => {
  return delegator;
};

const getRewardSplit = (
  cycleDelegatorBalance: BigNumber,
  cycleDelegatedBalance: BigNumber,
  cycleRewards: BigNumber,
  applicableFee: BigNumber
) => {
  const delegatorShare = multiply(
    divide(cycleDelegatorBalance, cycleDelegatedBalance),
    cycleRewards
  );

  const netDelegatorShare = multiply(
    delegatorShare,
    subtract(1, applicableFee)
  );
  const bakerShare = multiply(delegatorShare, applicableFee);

  return { bakerShare, delegatorShare: netDelegatorShare };
};

const initializeCycleReport = (cycle): CycleReport => {
  return {
    cycle,
    payments: [],
    lockedBondRewards: new BigNumber(0),
    feeIncome: new BigNumber(0),
  };
};

run("tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur", 468);
