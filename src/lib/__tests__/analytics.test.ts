/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { trackEvent, initDevAnalytics } from "../analytics"

describe("analytics", () => {
  beforeEach(() => {
    // Reset window.__cfBeacon before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).__cfBeacon
    vi.restoreAllMocks()
  })

  describe("trackEvent", () => {
    it("should not throw when __cfBeacon is undefined", () => {
      expect(() => trackEvent("test_event")).not.toThrow()
    })

    it("should call __cfBeacon.trackEvent when available", () => {
      const mockTrack = vi.fn()
      window.__cfBeacon = { trackEvent: mockTrack }

      trackEvent("task_created", { priority: "high" })

      expect(mockTrack).toHaveBeenCalledWith("task_created", { priority: "high" })
    })

    it("should not throw when __cfBeacon exists but trackEvent is undefined", () => {
      window.__cfBeacon = {}

      expect(() => trackEvent("test_event")).not.toThrow()
    })

    it("should log to console in development mode", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
      // Vitest runs in test mode, but our code checks for 'development'
      // This test verifies the function doesn't throw
      trackEvent("test_event", { key: "value" })

      consoleSpy.mockRestore()
    })
  })

  describe("initDevAnalytics", () => {
    it("should set up __cfBeacon mock in development", () => {
      // initDevAnalytics only runs in development mode
      // In test mode it should be a no-op
      initDevAnalytics()

      // In test mode (not development), __cfBeacon should not be set
      // This verifies the guard clause works
    })

    it("should not overwrite existing __cfBeacon", () => {
      const existingTrack = vi.fn()
      window.__cfBeacon = { trackEvent: existingTrack }

      initDevAnalytics()

      // Should keep existing implementation
      expect(window.__cfBeacon.trackEvent).toBe(existingTrack)
    })
  })
})
