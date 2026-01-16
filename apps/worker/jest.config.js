module.exports = {
  displayName: '@jurisnexo/worker',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  collectCoverageFrom: ['**/*.ts'],
  passWithNoTests: true,
};
