// eslint-disable-next-line n/no-unpublished-import
import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**', '!**/dist/**'],
};

export default config;
