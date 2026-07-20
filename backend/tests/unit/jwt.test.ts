import { signAccessToken, verifyAccessToken } from "../../src/utils/jwt.js";
import { Roles } from "../../src/constants/roles.js";

describe("jwt util", () => {
  const payload = {
    sub: "11111111-1111-4111-8111-111111111111",
    email: "faculty@example.com",
    role: Roles.FACULTY,
  };

  it("signs and verifies a token round-trip", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(Roles.FACULTY);
  });

  it("throws on a tampered token", () => {
    const token = signAccessToken(payload);
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });
});
