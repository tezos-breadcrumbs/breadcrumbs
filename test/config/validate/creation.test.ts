import {
  validPercentage,
  validBakingAddress,
  validPrivateKey,
} from "src/config/validate/creation";

describe("configuration validation (creation)", () => {
  describe("validPercentage", () => {
    it("returns true if an valid public percentage given", () => {
      expect(validPercentage(100)).toBe(true);
    });

    it("returns message if an invalid percentage", () => {
      const invalidValues = ["foo", 101, -1];
      for (const v of invalidValues) {
        expect(validPercentage(v)).not.toBe(true);
      }
    });
  });
});

describe("validBakingAddress", () => {
  it("returns true if an valid public key hash is given", () => {
    expect(validBakingAddress("tz2EfZMt9Zs9S4WmxRGmDxQFNpFaYukFmsDh")).toBe(
      true
    );
  });

  it("returns false if an invalid public key hash is given", () => {
    const invalidValues = ["foo", 1, "tz2EfZMt9Zs9S4WmxRGmDxQFNpFaYukFmsD"];
    for (const v of invalidValues) {
      expect(validBakingAddress(v)).not.toBe(true);
    }
  });

  it("returns false if KT address is given", () => {
    expect(validBakingAddress("KT1GEDCeg5yJuuLkSvVGXniQfQzhgTwCzXdb")).not.toBe(
      true
    );
  });
});

describe("validBakingAddress", () => {
  it("returns false if an invalid private key hash is given", async () => {
    const invalidValues = ["foo", 1, "tz2EfZMt9Zs9S4WmxRGmDxQFNpFaYukFmsD"];
    for (const v of invalidValues) {
      expect(await validPrivateKey(v)).not.toBe(true);
    }
  });

  it("returns true if valid  private key is given", async () => {
    expect(
      await validPrivateKey(
        "edsk2rKA8YEExg9Zo2qNPiQnnYheF1DhqjLVmfKdxiFfu5GyGRZRnb" /* Found on https://tezostaquito.io/docs/inmemory_signer/ */
      )
    ).toBe(true);
  });
});
