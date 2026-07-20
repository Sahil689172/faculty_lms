// Provide the environment the app modules require, before any of them are imported.
process.env.NODE_ENV = "test";
process.env.PORT = "4000";
process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/faculty_lms_test";
process.env.DIRECT_URL = "postgresql://user:pass@localhost:5432/faculty_lms_test";
process.env.CORS_ORIGIN = "http://localhost:5173";
process.env.JWT_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
process.env.JWT_EXPIRES_IN = "1h";
process.env.BCRYPT_SALT_ROUNDS = "10";
