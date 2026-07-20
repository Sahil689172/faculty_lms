/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        isolatedModules: true,
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "Node",
          target: "ES2022",
          esModuleInterop: true,
          skipLibCheck: true,
          resolveJsonModule: true,
          strict: true,
        },
      },
    ],
  },
};
