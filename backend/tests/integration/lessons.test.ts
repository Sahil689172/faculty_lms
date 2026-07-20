import request from "supertest";

jest.mock("../../src/lib/prisma.js", () => ({ prisma: {} }));
jest.mock("../../src/modules/lesson/lesson.repository.js");

import { createApp } from "../../src/app.js";
import { signAccessToken } from "../../src/utils/jwt.js";
import { Roles } from "../../src/constants/roles.js";
import { lessonRepository } from "../../src/modules/lesson/lesson.repository.js";

const mockedLessonRepo = lessonRepository as jest.Mocked<typeof lessonRepository>;
const app = createApp();

const token = signAccessToken({
  sub: "11111111-1111-4111-8111-111111111111",
  email: "faculty@example.com",
  role: Roles.FACULTY,
});

describe("Lessons API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when listing without a token", async () => {
    const res = await request(app).get("/api/lessons");
    expect(res.status).toBe(401);
  });

  it("returns an empty list for an authenticated faculty", async () => {
    mockedLessonRepo.findManyByFaculty.mockResolvedValue([]);

    const res = await request(app).get("/api/lessons").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it("returns 400 for an invalid lesson id", async () => {
    const res = await request(app)
      .get("/api/lessons/not-a-uuid")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 for a lesson that is not found or not owned", async () => {
    mockedLessonRepo.findByIdAndFaculty.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/lessons/22222222-2222-4222-8222-222222222222")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("LESSON_NOT_FOUND");
  });
});
