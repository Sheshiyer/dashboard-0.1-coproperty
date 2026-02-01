import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.d.ts', 'node_modules/**'],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 65, // Lower threshold for branches due to complex conditional logic
                statements: 80,
            },
        },
        testTimeout: 10000,
        hookTimeout: 10000,
    },
})
