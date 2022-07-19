import { constructMessage } from "src/plugin/notification/helpers";

describe("constructMessage", () => {
  it("correctly constructs a message if all parameters are given", () => {
    const message = `In cycle <CYCLE> staking balance was <CYCLE_STAKING_BALANCE> and <T_REWARDS> tez were distributed to <N_DELEGATORS> delegators.`;

    const result = constructMessage(message, {
      cycle: "500",
      cycleStakingBalance: "100000",
      totalDistributed: "20",
      numberOfDelegators: "10",
    });

    expect(result).toBe(
      "In cycle 500 staking balance was 100000 and 20 tez were distributed to 10 delegators."
    );
  });
  it("correctly constructs a message if no parameters are given", () => {
    expect(constructMessage("FOO", {})).toBe("FOO");
  });
});
