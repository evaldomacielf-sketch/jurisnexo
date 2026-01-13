module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@jurisnexo/config(|/.*)$': '<rootDir>/../../packages/config/src/$1',
        '^@jurisnexo/db(|/.*)$': '<rootDir>/../../packages/db/src/$1',
        '^@jurisnexo/shared(|/.*)$': '<rootDir>/../../packages/shared/src/$1',
    },
};
