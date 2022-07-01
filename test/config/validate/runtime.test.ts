import { omit } from "lodash";
import {
  BreadcrumbsConfiguration,
  EPayoutWalletMode,
} from "src/config/interfaces";
import { schema } from "src/config/validate/runtime";

const baseConfig: BreadcrumbsConfiguration = {
  baking_address: "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur",
  default_fee: 10,
  network_configuration: { rpc_url: "https://ithacanet.ecadinfra.com" },
  payout_wallet_mode: EPayoutWalletMode.LocalPrivateKey,
};

describe("configuration validation (runtime)", () => {
  test("accepts valid required arguments", () => {
    expect(schema.validate(baseConfig).error).toBeUndefined();
  });

  test("does not accept invalid keys", () => {
    expect(schema.validate({ ...baseConfig, foo: "bar" }).error).toBeDefined();
  });

  test("accepts number strings for number arguments", () => {
    expect(
      schema.validate({
        ...baseConfig,
        default_fee: "1",
        payment_requirements: { minimum_amount: "1" },
        delegator_requirements: { minimum_balance: "100" },
        income_recipients: {
          fee_income: {
            KT19UA2fYomEAptTiwBV6dvqm4mNZL7JPquK: "100",
          },
        },
      }).error
    ).toBeUndefined();
  });

  test("does not accept missing required arguments", () => {
    const requiredKeys = [
      "baking_address",
      "default_fee",
      "network_configuration.rpc_url",
      "payout_wallet_mode",
    ];

    for (const key of requiredKeys) {
      const config = omit(baseConfig, key);
      const result = schema.validate(config);
      expect(result.error?.message).toEqual(`"${key}" is required`);
    }
  });
  test("does not accept an invalid baking address", () => {
    const invalidValues = ["foo", 1, "KT19UA2fYomEAptTiwBV6dvqm4mNZL7JPquK"];

    for (const v of invalidValues) {
      const input = { ...baseConfig, baking_address: v };
      expect(schema.validate(input).error).toBeDefined();
    }
  });

  test("does not accept an invalid default fee", () => {
    const invalidValues = ["-1", "101", -1, 101, "foo", true];

    for (const v of invalidValues) {
      const input = { ...baseConfig, default_fee: v };
      expect(schema.validate(input).error).toBeDefined();
    }
  });
  test("does not accept an invalid payout mode", () => {
    const invalidValues = ["foo", true, 1];

    for (const v of invalidValues) {
      const input = { ...baseConfig, payout_wallet_mode: v };
      expect(schema.validate(input).error).toBeDefined();
    }
  });
  test("does not accept an invalid RPC URL", () => {
    const invalidValues = [
      "http://ithacanet.ecadinfra.com",
      true,
      1,
      "foo.bar",
    ];

    for (const v of invalidValues) {
      const input = { ...baseConfig, network_configuration: { rpc_url: v } };
      expect(schema.validate(input).error).toBeDefined();
    }
  });

  test("accepts valid overdelegation.guard", () => {
    const input = { ...baseConfig, overdelegation: { guard: true } };
    expect(schema.validate(input).error).toBeUndefined();
  });

  test("does not accept invalid overdelegation.guard", () => {
    const invalidValues = ["foo", 1, []];

    for (const v of invalidValues) {
      const input = {
        ...baseConfig,
        overdelegation: {
          guard: v,
        },
      };
      expect(schema.validate(input).error).toBeDefined();
      expect(
        schema.validate(input).error?.message.includes("overdelegation.guard")
      ).toBe(true);
    }
  });

  test("accepts valid overdelegation.excluded_addresses", () => {
    const input = {
      ...baseConfig,
      overdelegation: {
        excluded_addresses: ["KT19UA2fYomEAptTiwBV6dvqm4mNZL7JPquK"],
      },
    };
    expect(schema.validate(input).error).toBeUndefined();
  });

  test("does not accept invalid overdelegation.excluded_addresses", () => {
    const invalidValues = [["foo"], [1], true, "bar"];

    for (const v of invalidValues) {
      const input = {
        ...baseConfig,
        overdelegation: {
          excluded_addresses: v,
        },
      };
      expect(schema.validate(input).error).toBeDefined();
      expect(
        schema
          .validate(input)
          .error?.message.includes("overdelegation.excluded_addresses")
      ).toBe(true);
    }
  });

  test("does not accept invalid delegator_overrides (wrong key)", () => {
    const invalidValues = ["foo", 1];

    for (const v of invalidValues) {
      const input = {
        ...baseConfig,
        delegator_overrides: {
          [v]: {
            recipient: "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur",
          },
        },
      };

      expect(schema.validate(input).error).toBeDefined();

      expect(
        schema.validate(input).error?.message.includes("delegator_overrides")
      ).toBe(true);
    }
  });

  test("accepts valid delegator_overrides (fee)", () => {
    const input = {
      ...baseConfig,
      delegator_overrides: {
        KT19UA2fYomEAptTiwBV6dvqm4mNZL7JPquK: { fee: 8 },
      },
    };
    expect(schema.validate(input).error).toBeUndefined();
  });

  test("does not accept invalid delegator_overrides (fee)", () => {
    const invalidValues = ["foo", true, []];

    for (const v of invalidValues) {
      const input = {
        ...baseConfig,
        delegator_overrides: {
          KT19UA2fYomEAptTiwBV6dvqm4mNZL7JPquK: {
            fee: v,
          },
        },
      };
      expect(schema.validate(input).error).toBeDefined();

      expect(
        schema.validate(input).error?.message.includes("delegator_overrides")
      ).toBe(true);
    }
  });

  test("accepts valid delegator_overrides (recipient)", () => {
    const input = {
      ...baseConfig,
      delegator_overrides: {
        KT19UA2fYomEAptTiwBV6dvqm4mNZL7JPquK: {
          recipient: "tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur",
        },
      },
    };
    expect(schema.validate(input).error).toBeUndefined();
  });

  test("does not accept invalid delegator_overrides (recipient)", () => {
    const invalidValues = ["foo", 1, []];

    for (const v of invalidValues) {
      const input = {
        ...baseConfig,
        delegator_overrides: {
          KT19UA2fYomEAptTiwBV6dvqm4mNZL7JPquK: {
            recipient: v,
          },
        },
      };
      expect(schema.validate(input).error).toBeDefined();

      expect(
        schema.validate(input).error?.message.includes("delegator_overrides")
      ).toBe(true);
    }
  });

  test("accepts valid payment_requirements", () => {
    const input = {
      ...baseConfig,
      payment_requirements: {
        minimum_amount: 1,
      },
    };
    expect(schema.validate(input).error).toBeUndefined();
  });

  test("does not accept invalid payment_requirements", () => {
    const invalidValues = ["foo", []];

    for (const v of invalidValues) {
      const input = {
        ...baseConfig,
        payment_requirements: {
          minimum_amount: v,
        },
      };
      expect(schema.validate(input).error).toBeDefined();

      expect(
        schema.validate(input).error?.message.includes("payment_requirements")
      ).toBe(true);
    }
  });

  test("accepts valid delegator_requirements", () => {
    const input = {
      ...baseConfig,
      delegator_requirements: {
        minimum_balance: 100,
      },
    };
    expect(schema.validate(input).error).toBeUndefined();
  });

  test("does not accept invalid delegator_requirements", () => {
    const invalidValues = ["foo", []];

    for (const v of invalidValues) {
      const input = {
        ...baseConfig,
        delegator_requirements: {
          minimum_balance: v,
        },
      };
      expect(schema.validate(input).error).toBeDefined();

      expect(
        schema.validate(input).error?.message.includes("delegator_requirements")
      ).toBe(true);
    }
  });

  test("accepts valid income recipients.fee_income", () => {
    const input = {
      ...baseConfig,
      income_recipients: {
        fee_income: {
          tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur: 100,
        },
      },
    };
    expect(schema.validate(input).error).toBeUndefined();
  });

  test("does not accept invalid income_recipients.fee_income", () => {
    const invalidValues = [
      "foo",
      [],
      1,
      /* Shares not amounting to 100% */
      {
        tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur: 60,
        tz1PmGK1VS9VdJrwLiWi6XM95fY7RCUyJ2Tr: 39,
      },
      {
        tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur: 101,
      },
    ];

    for (const v of invalidValues) {
      const input = {
        ...baseConfig,
        income_recipients: {
          fee_income: v,
        },
      };
      expect(schema.validate(input).error).toBeDefined();

      expect(
        schema
          .validate(input)
          .error?.message.includes("income_recipients.fee_income")
      ).toBe(true);
    }
  });

  test("accepts valid income recipients.bond_rewards", () => {
    const input = {
      ...baseConfig,
      income_recipients: {
        bond_rewards: {
          tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur: 60,
          tz1PmGK1VS9VdJrwLiWi6XM95fY7RCUyJ2Tr: 40,
        },
      },
    };
    expect(schema.validate(input).error).toBeUndefined();
  });

  test("does not accept invalid income_recipients.bond_rewards", () => {
    const invalidValues = [
      "foo",
      [],
      1,
      /* Shares not amounting to 100% */
      {
        tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur: 60,
        tz1PmGK1VS9VdJrwLiWi6XM95fY7RCUyJ2Tr: 39,
      },
      {
        tz1Uoy4PdQDDiHRRec77pJEQJ21tSyksarur: 101,
      },
    ];

    for (const v of invalidValues) {
      const input = {
        ...baseConfig,
        income_recipients: {
          bond_rewards: v,
        },
      };
      expect(schema.validate(input).error).toBeDefined();

      expect(
        schema
          .validate(input)
          .error?.message.includes("income_recipients.bond_rewards")
      ).toBe(true);
    }
  });
});
