/**
 * Tests for web-vitals module.
 *
 * bun test does not natively support jsdom, so we mock the browser globals
 * (window, navigator) directly in each test.
 */
import { describe, it, expect, beforeEach, mock, type Mock } from "bun:test"

// Set up minimal browser globals BEFORE importing the module under test
const mockLocation = { href: "http://localhost:3000/dashboard" }

// @ts-expect-error -- setting up minimal browser env for bun test
globalThis.window = { location: mockLocation }
// @ts-expect-error -- extending navigator
Object.assign(globalThis.navigator, { userAgent: "bun-test-agent" })

// Now import the module under test (reads window/navigator at call time)
const { sendToAnalytics } = await import("../web-vitals")

describe("web-vitals", () => {
  let fetchSpy: Mock<(...args: unknown[]) => Promise<Response>>

  beforeEach(() => {
    fetchSpy = mock(() => Promise.resolve(new Response()))
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    // Remove sendBeacon between tests
    Object.defineProperty(globalThis.navigator, "sendBeacon", {
      value: undefined,
      writable: true,
      configurable: true,
    })
  })

  describe("sendToAnalytics", () => {
    const mockMetric = {
      name: "LCP" as const,
      value: 2500,
      rating: "good" as const,
      delta: 2500,
      id: "v5-1234567890-1234567890",
      navigationType: "navigate" as const,
      entries: [],
    }

    it("should send metric via sendBeacon when available", () => {
      const sendBeaconMock = mock(() => true)
      Object.defineProperty(globalThis.navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      sendToAnalytics(mockMetric)

      expect(sendBeaconMock).toHaveBeenCalledTimes(1)
      const [url, body] = sendBeaconMock.mock.calls[0]
      expect(url).toContain("/api/analytics/vitals")

      const parsed = JSON.parse(body as string)
      expect(parsed.name).toBe("LCP")
      expect(parsed.value).toBe(2500)
      expect(parsed.rating).toBe("good")
      expect(parsed.delta).toBe(2500)
      expect(parsed.id).toBe("v5-1234567890-1234567890")
      expect(parsed.navigationType).toBe("navigate")
      expect(parsed.url).toBeDefined()
    })

    it("should fall back to fetch when sendBeacon is not available", () => {
      sendToAnalytics(mockMetric)

      expect(fetchSpy).toHaveBeenCalledTimes(1)
      const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit]
      expect(url).toContain("/api/analytics/vitals")
      expect(options.method).toBe("POST")
      expect(options.keepalive).toBe(true)
      expect((options.headers as Record<string, string>)["Content-Type"]).toBe("application/json")
    })

    it("should include userAgent in the payload", () => {
      const sendBeaconMock = mock(() => true)
      Object.defineProperty(globalThis.navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      sendToAnalytics(mockMetric)

      const body = JSON.parse(sendBeaconMock.mock.calls[0][1] as string)
      expect(body.userAgent).toBeDefined()
      expect(typeof body.userAgent).toBe("string")
    })

    it("should include current URL in the payload", () => {
      const sendBeaconMock = mock(() => true)
      Object.defineProperty(globalThis.navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      sendToAnalytics(mockMetric)

      const body = JSON.parse(sendBeaconMock.mock.calls[0][1] as string)
      expect(body.url).toBe("http://localhost:3000/dashboard")
    })

    it("should not throw on network errors", () => {
      Object.defineProperty(globalThis.navigator, "sendBeacon", {
        value: () => { throw new Error("Network error") },
        writable: true,
        configurable: true,
      })

      expect(() => sendToAnalytics(mockMetric)).not.toThrow()
    })

    it("should handle all five metric types", () => {
      const sendBeaconMock = mock(() => true)
      Object.defineProperty(globalThis.navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      const metrics = [
        { ...mockMetric, name: "CLS" as const, value: 0.05 },
        { ...mockMetric, name: "INP" as const, value: 80 },
        { ...mockMetric, name: "LCP" as const, value: 2500 },
        { ...mockMetric, name: "FCP" as const, value: 1800 },
        { ...mockMetric, name: "TTFB" as const, value: 400 },
      ]

      for (const metric of metrics) {
        sendToAnalytics(metric)
      }

      expect(sendBeaconMock).toHaveBeenCalledTimes(5)
    })

    it("should send to the correct workers endpoint", () => {
      const sendBeaconMock = mock(() => true)
      Object.defineProperty(globalThis.navigator, "sendBeacon", {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      sendToAnalytics(mockMetric)

      const [url] = sendBeaconMock.mock.calls[0]
      expect(url).toBe("http://localhost:8787/api/analytics/vitals")
    })
  })
})
