import { hashPassword, verifyPassword } from "../../src/utils/password.js";

describe("password util", () => {
  it("hashes a password to a value different from the input", async () => {
    const hash = await hashPassword("secret123");
    expect(hash).not.toBe("secret123");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("secret123");
    await expect(verifyPassword("secret123", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("secret123");
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });
});
