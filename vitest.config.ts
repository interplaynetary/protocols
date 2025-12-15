import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Test environment
        environment: 'node',

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: [
                'src/**/*.test.ts',
                'src/**/__tests__/**',
                'src/**/*.d.ts',
                'node_modules/**'
            ],
            thresholds: {
                lines: 90,
                functions: 90,
                branches: 85,
                statements: 90
            }
        },

        // Test file patterns
        include: ['src/**/*.test.ts'],

        // Globals (optional - enables describe/it/expect without imports)
        globals: true,

        // Timeout for long-running tests
        testTimeout: 10000
    }
});
