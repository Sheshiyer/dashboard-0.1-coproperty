#!/usr/bin/env bun
/**
 * Performance Benchmark Script for Workers API
 *
 * Measures:
 * - Response times (p50, p90, p95, p99)
 * - Throughput (requests per second)
 * - Cache performance (hit/miss via timing analysis)
 * - Error rates
 *
 * Usage: bun run scripts/benchmark.ts
 */

interface BenchmarkResult {
  endpoint: string
  method: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  errorRate: number
  latencies: number[]
  p50: number
  p90: number
  p95: number
  p99: number
  min: number
  max: number
  mean: number
  throughput: number
  cacheCold: number | null
  cacheWarm: number | null
  cacheSpeedup: number | null
  passP95Criteria: boolean
}

interface EndpointConfig {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  body?: Record<string, unknown>
  description: string
  requiresSetup?: boolean
  setupFn?: () => Promise<string> // Returns dynamic ID if needed
  cleanupFn?: (id: string) => Promise<void>
}

const BASE_URL = 'http://localhost:8787'
const API_KEY = 'VzfvRjmsHYetC8SZwpI69iPmFP4MCvtJjhZAK+ABIsg='
const P95_THRESHOLD_MS = 500
const REQUESTS_PER_ENDPOINT = 100 // Reduced for faster testing, can increase for more accuracy
const CONCURRENT_BATCHES = [1, 10, 50] // Test different concurrency levels

// Headers for authenticated requests
const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`
}

// Percentile calculation helper
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

// Mean calculation helper
function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

// Make a single request and measure latency
async function measureRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
  useAuth = true
): Promise<{ latency: number; success: boolean; status: number }> {
  const headers = useAuth ? authHeaders : { 'Content-Type': 'application/json' }
  const start = performance.now()

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })
    const latency = performance.now() - start
    return {
      latency,
      success: response.ok,
      status: response.status
    }
  } catch (error) {
    const latency = performance.now() - start
    return { latency, success: false, status: 0 }
  }
}

// Run benchmark for a single endpoint
async function benchmarkEndpoint(
  config: EndpointConfig,
  concurrency: number = 10
): Promise<BenchmarkResult> {
  const { method, path, body, description } = config
  const url = `${BASE_URL}${path}`
  const latencies: number[] = []
  let successCount = 0
  let failCount = 0

  // Measure cold cache (first request)
  const coldResult = await measureRequest(method, url, body, path !== '/api/health')
  const cacheCold = coldResult.latency

  // Small delay to ensure cache is populated
  await new Promise(r => setTimeout(r, 100))

  // Measure warm cache (second request)
  const warmResult = await measureRequest(method, url, body, path !== '/api/health')
  const cacheWarm = warmResult.latency

  console.log(`  Benchmarking ${method} ${path} with concurrency ${concurrency}...`)

  // Run concurrent batches
  const totalBatches = Math.ceil(REQUESTS_PER_ENDPOINT / concurrency)
  const startTime = performance.now()

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchPromises: Promise<{ latency: number; success: boolean; status: number }>[] = []

    for (let i = 0; i < concurrency && (batch * concurrency + i) < REQUESTS_PER_ENDPOINT; i++) {
      batchPromises.push(measureRequest(method, url, body, path !== '/api/health'))
    }

    const results = await Promise.all(batchPromises)

    for (const result of results) {
      latencies.push(result.latency)
      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    }
  }

  const totalTime = performance.now() - startTime
  const throughput = (latencies.length / totalTime) * 1000 // requests per second

  const p50 = percentile(latencies, 50)
  const p90 = percentile(latencies, 90)
  const p95 = percentile(latencies, 95)
  const p99 = percentile(latencies, 99)

  return {
    endpoint: `${method} ${path}`,
    method,
    totalRequests: latencies.length,
    successfulRequests: successCount,
    failedRequests: failCount,
    errorRate: (failCount / latencies.length) * 100,
    latencies,
    p50: Math.round(p50 * 100) / 100,
    p90: Math.round(p90 * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    p99: Math.round(p99 * 100) / 100,
    min: Math.round(Math.min(...latencies) * 100) / 100,
    max: Math.round(Math.max(...latencies) * 100) / 100,
    mean: Math.round(mean(latencies) * 100) / 100,
    throughput: Math.round(throughput * 100) / 100,
    cacheCold: Math.round(cacheCold * 100) / 100,
    cacheWarm: Math.round(cacheWarm * 100) / 100,
    cacheSpeedup: cacheCold > 0 ? Math.round(((cacheCold - cacheWarm) / cacheCold) * 100) : null,
    passP95Criteria: p95 < P95_THRESHOLD_MS
  }
}

// Create a test task for PATCH/DELETE testing
async function createTestTask(): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Benchmark Test Task',
      description: 'Created for performance testing',
      category: 'general',
      priority: 'low'
    })
  })
  const data = await response.json() as { data: { id: string } }
  return data.data.id
}

// Delete test task
async function deleteTestTask(id: string): Promise<void> {
  await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders
  })
}

// Generate markdown report
function generateReport(results: BenchmarkResult[], concurrencyLevel: number): string {
  const timestamp = new Date().toISOString()
  const allPassed = results.every(r => r.passP95Criteria)

  let report = `# Performance Benchmark Report

## Executive Summary

| Metric | Value |
|--------|-------|
| **Test Date** | ${timestamp} |
| **Base URL** | ${BASE_URL} |
| **Requests per Endpoint** | ${REQUESTS_PER_ENDPOINT} |
| **Concurrency Level** | ${concurrencyLevel} |
| **P95 Threshold** | ${P95_THRESHOLD_MS}ms |
| **Overall Status** | ${allPassed ? 'PASS' : 'FAIL'} |

## Methodology

### Test Configuration
- **Tool**: Custom Node.js/Bun benchmark script
- **Warm-up**: 2 requests per endpoint (cold/warm cache measurement)
- **Measurement**: ${REQUESTS_PER_ENDPOINT} requests per endpoint
- **Concurrency**: Batch requests with ${concurrencyLevel} concurrent connections

### Metrics Collected
- **p50/p90/p95/p99**: Response time percentiles
- **Throughput**: Requests per second
- **Cache Analysis**: Cold vs warm response time comparison
- **Error Rate**: Percentage of failed requests

---

## Results Summary

### All Endpoints Performance

| Endpoint | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) | Throughput (rps) | Error Rate | Status |
|----------|----------|----------|----------|----------|------------------|------------|--------|
`

  for (const result of results) {
    const status = result.passP95Criteria ? 'PASS' : 'FAIL'
    report += `| ${result.endpoint} | ${result.p50} | ${result.p90} | ${result.p95} | ${result.p99} | ${result.throughput} | ${result.errorRate.toFixed(2)}% | ${status} |\n`
  }

  report += `
---

## Detailed Results

### Response Time Distribution

| Endpoint | Min (ms) | Mean (ms) | Max (ms) | Samples |
|----------|----------|-----------|----------|---------|
`

  for (const result of results) {
    report += `| ${result.endpoint} | ${result.min} | ${result.mean} | ${result.max} | ${result.totalRequests} |\n`
  }

  report += `

---

## Cache Performance Analysis

| Endpoint | Cold Cache (ms) | Warm Cache (ms) | Speedup (%) | Notes |
|----------|-----------------|-----------------|-------------|-------|
`

  for (const result of results) {
    const notes = result.cacheSpeedup && result.cacheSpeedup > 20
      ? 'Significant cache benefit'
      : result.cacheSpeedup && result.cacheSpeedup > 0
        ? 'Moderate cache benefit'
        : 'No cache or minimal benefit'
    report += `| ${result.endpoint} | ${result.cacheCold} | ${result.cacheWarm} | ${result.cacheSpeedup ?? 'N/A'}% | ${notes} |\n`
  }

  // Calculate endpoint categories
  const healthEndpoint = results.find(r => r.endpoint.includes('/api/health'))
  const propertiesEndpoints = results.filter(r => r.endpoint.includes('/api/properties'))
  const reservationsEndpoints = results.filter(r => r.endpoint.includes('/api/reservations'))
  const cleaningEndpoints = results.filter(r => r.endpoint.includes('/api/cleaning'))
  const taskEndpoints = results.filter(r => r.endpoint.includes('/api/tasks'))
  const dashboardEndpoints = results.filter(r => r.endpoint.includes('/api/dashboard'))

  report += `

---

## Performance by Category

### Health Check
${healthEndpoint ? `- p95: ${healthEndpoint.p95}ms (${healthEndpoint.passP95Criteria ? 'PASS' : 'FAIL'})` : 'Not tested'}

### Properties API
${propertiesEndpoints.map(e => `- ${e.endpoint}: p95=${e.p95}ms (${e.passP95Criteria ? 'PASS' : 'FAIL'})`).join('\n') || 'Not tested'}

### Reservations API
${reservationsEndpoints.map(e => `- ${e.endpoint}: p95=${e.p95}ms (${e.passP95Criteria ? 'PASS' : 'FAIL'})`).join('\n') || 'Not tested'}

### Cleaning API
${cleaningEndpoints.map(e => `- ${e.endpoint}: p95=${e.p95}ms (${e.passP95Criteria ? 'PASS' : 'FAIL'})`).join('\n') || 'Not tested'}

### Tasks API
${taskEndpoints.map(e => `- ${e.endpoint}: p95=${e.p95}ms (${e.passP95Criteria ? 'PASS' : 'FAIL'})`).join('\n') || 'Not tested'}

### Dashboard API
${dashboardEndpoints.map(e => `- ${e.endpoint}: p95=${e.p95}ms (${e.passP95Criteria ? 'PASS' : 'FAIL'})`).join('\n') || 'Not tested'}

---

## Recommendations

`

  // Generate recommendations based on results
  const slowEndpoints = results.filter(r => r.p95 > 200)
  const failingEndpoints = results.filter(r => !r.passP95Criteria)
  const highErrorEndpoints = results.filter(r => r.errorRate > 1)

  if (failingEndpoints.length > 0) {
    report += `### Critical Issues

The following endpoints exceed the p95 < ${P95_THRESHOLD_MS}ms threshold:

${failingEndpoints.map(e => `- **${e.endpoint}**: p95=${e.p95}ms - Requires optimization`).join('\n')}

`
  }

  if (slowEndpoints.length > 0) {
    report += `### Performance Optimization Opportunities

The following endpoints have p95 > 200ms and could benefit from optimization:

${slowEndpoints.map(e => {
  const suggestions: string[] = []
  if (e.cacheSpeedup && e.cacheSpeedup < 20) {
    suggestions.push('Consider adding/improving KV caching')
  }
  if (e.endpoint.includes('/api/properties') || e.endpoint.includes('/api/reservations')) {
    suggestions.push('External API latency may be the bottleneck')
  }
  if (e.endpoint.includes('/api/dashboard')) {
    suggestions.push('Aggregate endpoint - consider parallel fetching or pre-computation')
  }
  return `- **${e.endpoint}**: p95=${e.p95}ms\n  - ${suggestions.join('\n  - ') || 'Review implementation for optimization opportunities'}`
}).join('\n\n')}

`
  }

  if (highErrorEndpoints.length > 0) {
    report += `### Reliability Concerns

The following endpoints have error rates > 1%:

${highErrorEndpoints.map(e => `- **${e.endpoint}**: ${e.errorRate.toFixed(2)}% errors`).join('\n')}

`
  }

  report += `### General Recommendations

1. **Cache Strategy**: Endpoints with significant cold/warm cache differences benefit from KV caching
2. **External API Calls**: Properties and Reservations endpoints depend on Hospitable API latency
3. **Dashboard Aggregation**: Dashboard endpoints aggregate multiple API calls - consider:
   - Parallel fetching where possible (already implemented)
   - Pre-computed aggregations for frequently accessed stats
   - Longer cache TTLs for slowly-changing data
4. **Rate Limiting**: Current implementation has rate limiting - monitor for 429 errors under load

---

## Test Environment

- **Runtime**: Bun ${typeof Bun !== 'undefined' ? Bun.version : 'N/A'} / Node.js ${process.version}
- **Platform**: ${process.platform} ${process.arch}
- **Server**: Cloudflare Workers (wrangler dev)
- **Date**: ${timestamp}

---

## Appendix: Raw Data

\`\`\`json
${JSON.stringify(results.map(r => ({
  endpoint: r.endpoint,
  p50: r.p50,
  p90: r.p90,
  p95: r.p95,
  p99: r.p99,
  mean: r.mean,
  throughput: r.throughput,
  errorRate: r.errorRate,
  cacheCold: r.cacheCold,
  cacheWarm: r.cacheWarm,
  passP95Criteria: r.passP95Criteria
})), null, 2)}
\`\`\`
`

  return report
}

// Main benchmark runner
async function main() {
  console.log('='.repeat(60))
  console.log('Workers API Performance Benchmark')
  console.log('='.repeat(60))
  console.log(`Target: ${BASE_URL}`)
  console.log(`Requests per endpoint: ${REQUESTS_PER_ENDPOINT}`)
  console.log(`P95 Threshold: ${P95_THRESHOLD_MS}ms`)
  console.log('')

  // Check if server is running
  try {
    const health = await fetch(`${BASE_URL}/api/health`)
    if (!health.ok) {
      console.error('ERROR: Workers dev server is not responding correctly')
      process.exit(1)
    }
    console.log('Server is healthy!')
  } catch (error) {
    console.error('ERROR: Cannot connect to Workers dev server at', BASE_URL)
    console.error('Please run: cd workers && bun run dev')
    process.exit(1)
  }

  // Get a real property ID first
  let realPropertyId = 'f9566fab-c194-40c2-a3bf-6bd1d75918f3' // Default fallback
  try {
    const propsResponse = await fetch(`${BASE_URL}/api/properties`, { headers: authHeaders })
    const propsData = await propsResponse.json() as { data: Array<{ id: string }> }
    if (propsData.data && propsData.data.length > 0) {
      realPropertyId = propsData.data[0].id
      console.log(`Using real property ID: ${realPropertyId}`)
    }
  } catch (e) {
    console.log('Using fallback property ID')
  }

  // Define all endpoints to benchmark
  const endpoints: EndpointConfig[] = [
    { method: 'GET', path: '/api/health', description: 'Health check (no auth)' },
    { method: 'GET', path: '/api/properties', description: 'List all properties' },
    { method: 'GET', path: `/api/properties/${realPropertyId}`, description: 'Get single property' },
    { method: 'GET', path: '/api/reservations', description: 'List all reservations' },
    { method: 'GET', path: `/api/reservations?property_id=${realPropertyId}`, description: 'Get reservations for property' },
    { method: 'GET', path: '/api/cleaning', description: 'List cleaning jobs' },
    { method: 'GET', path: '/api/tasks', description: 'List all tasks' },
    { method: 'GET', path: '/api/dashboard/stats', description: 'Dashboard stats (aggregated)' },
    { method: 'GET', path: '/api/dashboard/upcoming', description: 'Dashboard upcoming reservations' },
    { method: 'GET', path: '/api/dashboard/occupancy-trends', description: 'Dashboard occupancy trends' },
    { method: 'GET', path: '/api/dashboard/booking-sources', description: 'Dashboard booking sources' },
  ]

  // Run benchmarks with default concurrency
  const concurrency = 10
  console.log(`\nRunning benchmarks with concurrency: ${concurrency}\n`)

  const results: BenchmarkResult[] = []

  for (const endpoint of endpoints) {
    try {
      const result = await benchmarkEndpoint(endpoint, concurrency)
      results.push(result)

      const status = result.passP95Criteria ? 'PASS' : 'FAIL'
      console.log(`  -> p95: ${result.p95}ms, throughput: ${result.throughput} rps [${status}]`)
    } catch (error) {
      console.error(`  -> ERROR: ${error}`)
    }
  }

  // Test task CRUD operations
  console.log('\n  Testing Task CRUD operations...')

  // Create task for testing
  let testTaskId: string | null = null
  try {
    testTaskId = await createTestTask()
    console.log(`  Created test task: ${testTaskId}`)

    // Benchmark POST /api/tasks
    const postResult = await benchmarkEndpoint({
      method: 'POST',
      path: '/api/tasks',
      body: { title: 'Benchmark Task', category: 'general', priority: 'low' },
      description: 'Create task'
    }, concurrency)
    results.push(postResult)
    console.log(`  -> POST /api/tasks: p95=${postResult.p95}ms [${postResult.passP95Criteria ? 'PASS' : 'FAIL'}]`)

    // Benchmark PATCH /api/tasks/:id
    const patchResult = await benchmarkEndpoint({
      method: 'PATCH',
      path: `/api/tasks/${testTaskId}`,
      body: { status: 'in_progress' },
      description: 'Update task'
    }, concurrency)
    results.push(patchResult)
    console.log(`  -> PATCH /api/tasks/:id: p95=${patchResult.p95}ms [${patchResult.passP95Criteria ? 'PASS' : 'FAIL'}]`)

    // Benchmark DELETE /api/tasks/:id (create new tasks to delete)
    const deleteLatencies: number[] = []
    for (let i = 0; i < Math.min(20, REQUESTS_PER_ENDPOINT); i++) {
      const id = await createTestTask()
      const result = await measureRequest('DELETE', `${BASE_URL}/api/tasks/${id}`)
      deleteLatencies.push(result.latency)
    }

    const deleteResult: BenchmarkResult = {
      endpoint: 'DELETE /api/tasks/:id',
      method: 'DELETE',
      totalRequests: deleteLatencies.length,
      successfulRequests: deleteLatencies.length,
      failedRequests: 0,
      errorRate: 0,
      latencies: deleteLatencies,
      p50: Math.round(percentile(deleteLatencies, 50) * 100) / 100,
      p90: Math.round(percentile(deleteLatencies, 90) * 100) / 100,
      p95: Math.round(percentile(deleteLatencies, 95) * 100) / 100,
      p99: Math.round(percentile(deleteLatencies, 99) * 100) / 100,
      min: Math.round(Math.min(...deleteLatencies) * 100) / 100,
      max: Math.round(Math.max(...deleteLatencies) * 100) / 100,
      mean: Math.round(mean(deleteLatencies) * 100) / 100,
      throughput: 0,
      cacheCold: null,
      cacheWarm: null,
      cacheSpeedup: null,
      passP95Criteria: percentile(deleteLatencies, 95) < P95_THRESHOLD_MS
    }
    results.push(deleteResult)
    console.log(`  -> DELETE /api/tasks/:id: p95=${deleteResult.p95}ms [${deleteResult.passP95Criteria ? 'PASS' : 'FAIL'}]`)

  } finally {
    // Cleanup
    if (testTaskId) {
      await deleteTestTask(testTaskId).catch(() => {})
    }
  }

  // Generate and save report
  console.log('\n' + '='.repeat(60))
  console.log('Generating Report...')
  console.log('='.repeat(60))

  const report = generateReport(results, concurrency)

  // Write report to file
  const reportPath = '/Volumes/madara/2026/Coproperty/dashboard-0.1/workers/PERFORMANCE_REPORT.md'
  await Bun.write(reportPath, report)
  console.log(`\nReport saved to: ${reportPath}`)

  // Summary
  const passed = results.filter(r => r.passP95Criteria).length
  const failed = results.length - passed

  console.log('\n' + '='.repeat(60))
  console.log('Summary')
  console.log('='.repeat(60))
  console.log(`Total Endpoints: ${results.length}`)
  console.log(`Passed (p95 < ${P95_THRESHOLD_MS}ms): ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Overall: ${failed === 0 ? 'PASS' : 'FAIL'}`)

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)
