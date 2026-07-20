export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Faculty Lesson Management System API",
    version: "1.0.0",
    description:
      "REST API for faculty to authenticate and manage lessons (metadata + file uploads).",
  },
  servers: [{ url: "/api", description: "API base path" }],
  tags: [
    { name: "Health", description: "Service health" },
    { name: "Auth", description: "Authentication" },
    { name: "Lessons", description: "Lesson management (faculty only)" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string" },
              details: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
      Faculty: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              accessToken: { type: "string" },
              faculty: { $ref: "#/components/schemas/Faculty" },
            },
          },
        },
      },
      Lesson: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          originalFileName: { type: "string" },
          mimeType: { type: "string" },
          fileSize: { type: "integer" },
          facultyId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness + database connectivity",
        security: [],
        responses: { "200": { description: "Service healthy" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Faculty login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "400": { description: "Validation error", content: errorContent() },
          "401": { description: "Invalid credentials", content: errorContent() },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current faculty profile",
        responses: {
          "200": { description: "Faculty profile" },
          "401": { description: "Unauthenticated", content: errorContent() },
        },
      },
    },
    "/lessons": {
      get: {
        tags: ["Lessons"],
        summary: "List the authenticated faculty's lessons",
        responses: {
          "200": { description: "List of lessons" },
          "401": { description: "Unauthenticated", content: errorContent() },
        },
      },
      post: {
        tags: ["Lessons"],
        summary: "Create a lesson with a file",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "file"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Lesson created" },
          "400": { description: "Validation error / file required", content: errorContent() },
          "401": { description: "Unauthenticated", content: errorContent() },
          "413": { description: "File too large", content: errorContent() },
          "415": { description: "Unsupported file type", content: errorContent() },
        },
      },
    },
    "/lessons/{id}": {
      get: {
        tags: ["Lessons"],
        summary: "Get an owned lesson",
        parameters: [lessonIdParam()],
        responses: {
          "200": { description: "Lesson" },
          "404": { description: "Not found", content: errorContent() },
        },
      },
      patch: {
        tags: ["Lessons"],
        summary: "Update lesson metadata and/or replace the file",
        parameters: [lessonIdParam()],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Lesson updated" },
          "400": { description: "Validation error", content: errorContent() },
          "404": { description: "Not found", content: errorContent() },
        },
      },
      delete: {
        tags: ["Lessons"],
        summary: "Delete an owned lesson (and its file)",
        parameters: [lessonIdParam()],
        responses: {
          "200": { description: "Lesson deleted" },
          "404": { description: "Not found", content: errorContent() },
        },
      },
    },
    "/lessons/{id}/download": {
      get: {
        tags: ["Lessons"],
        summary: "Get a short-lived signed download URL",
        parameters: [lessonIdParam()],
        responses: {
          "200": { description: "Signed URL payload" },
          "404": { description: "Not found", content: errorContent() },
          "503": { description: "Storage not configured", content: errorContent() },
        },
      },
    },
  },
};

function errorContent() {
  return {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  };
}

function lessonIdParam() {
  return {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string", format: "uuid" },
  };
}
