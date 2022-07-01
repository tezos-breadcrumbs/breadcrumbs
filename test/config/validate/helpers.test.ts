import { isPKH, isAddress } from "src/config/validate/helpers";

describe("configuration helpers", () => {
  describe("isPKH", () => {
    it("returns true if an valid public key hash is given", () => {
      expect(isPKH("tz2EfZMt9Zs9S4WmxRGmDxQFNpFaYukFmsDh")).toBe(true);
    });

    it("returns false if an invalid public key hash is given", () => {
      const invalidValues = ["foo", 1, "tz2EfZMt9Zs9S4WmxRGmDxQFNpFaYukFmsD"];
      for (let v of invalidValues) {
        expect(isPKH(v)).toBe(false);
      }
    });

    it("returns false if KT address is given", () => {
      expect(isPKH("KT1GEDCeg5yJuuLkSvVGXniQfQzhgTwCzXdb")).toBe(false);
    });
  });
  describe("isAddress", () => {
    it("returns true if an tz address is given", () => {
      expect(isAddress("tz2EfZMt9Zs9S4WmxRGmDxQFNpFaYukFmsDh")).toBe(true);
    });

    it("returns true if an KT address is given", () => {
      expect(isAddress("KT1GEDCeg5yJuuLkSvVGXniQfQzhgTwCzXdb")).toBe(true);
    });

    it("returns false if neither a tz or KT address are given", () => {
      const invalidValues = ["foo", 1];
      for (let v of invalidValues) {
        expect(isAddress(v)).toBe(false);
      }
    });
  });
});
