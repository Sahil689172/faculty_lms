import {
  createLessonSchema,
  updateLessonSchema,
} from "../../src/modules/lesson/lesson.validation.js";

describe("lesson validation", () => {
  it("accepts a valid create payload", () => {
    const result = createLessonSchema.safeParse({ title: "Intro", description: "About" });
    expect(result.success).toBe(true);
  });

  it("rejects a create payload without a title", () => {
    const result = createLessonSchema.safeParse({ description: "About" });
    expect(result.success).toBe(false);
  });

  it("trims the title", () => {
    const result = createLessonSchema.safeParse({ title: "  Intro  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Intro");
    }
  });

  it("allows an empty update object (file-only update handled in controller)", () => {
    const result = updateLessonSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects an over-long title on update", () => {
    const result = updateLessonSchema.safeParse({ title: "x".repeat(201) });
    expect(result.success).toBe(false);
  });
});
