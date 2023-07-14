export default {
    transform: {
		'^.+\\.ts?$': 'ts-jest'
	},
    testEnvironment: 'node',
    clearMocks: true,
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
		coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  };
  