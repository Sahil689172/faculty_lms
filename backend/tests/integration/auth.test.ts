import request from "supertest";
import bcrypt from "bcrypt";

jest.mock("../../src/lib/prisma.js", () => ({ prisma: {} }));
jest.mock("../../src/modules/faculty/faculty.repository.js");

import { createApp } from "../../src/app.js";
import { facultyRepository } from "../../src/modules/faculty/faculty.repository.js";

const mockedRepo = facultyRepository as jest.Mocked<typeof facultyRepository>;
const app = createApp();

describe("POST /api/auth/login", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when the body is invalid", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 for an unknown user", async () => {
    mockedRepo.findByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "unknown@example.com", password: "secret123" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 200 and a token for valid credentials", async () => {
    const passwordHash = await bcrypt.hash("secret123", 10);

    mockedRepo.findByEmail.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Demo Faculty",
      email: "faculty@example.com",
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "faculty@example.com", password: "secret123" });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.faculty.email).toBe("faculty@example.com");
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
