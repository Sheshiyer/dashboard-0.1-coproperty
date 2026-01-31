"use client";

import * as React from "react";
import {
  OccupancyRateAreaChart,
  RevenuePayoutLineChart,
  PropertyPerformanceBarChart,
  HorizontalBarChartExample,
  BookingSourcePieChart,
  MultiSeriesBarChartExample,
  MultiSeriesAreaChartExample,
  LoadingSkeletonExamples,
  DashboardWidgetExamples,
  CustomColorChartExample,
} from "./charts.examples";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

/**
 * Charts Test Page
 *
 * Interactive test page showcasing all chart components with examples
 * Use this page to:
 * - Verify chart rendering in light and dark modes
 * - Test responsive behavior
 * - Validate color schemes
 * - Check loading and empty states
 */

export default function ChartsTestPage() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    // Detect initial theme
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Chart Components Test Page
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Interactive showcase of all themed Recharts components
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Current theme:
            </span>
            <span className="px-3 py-1 rounded-full bg-property-primary/10 text-property-primary dark:bg-property-secondary/10 dark:text-property-secondary text-sm font-medium">
              {isDarkMode ? "Dark Mode" : "Light Mode"}
            </span>
          </div>
        </div>

        {/* Section: Multi-Series Line Chart */}
        <section className="space-y-4">
          <div className="border-l-4 border-property-primary pl-4">
            <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Line Charts (Multi-Series)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Revenue vs Payout with dashed comparison line
            </p>
          </div>
          <RevenuePayoutLineChart />
        </section>

        {/* Section: Area Charts */}
        <section className="space-y-4">
          <div className="border-l-4 border-success-500 pl-4">
            <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Area Charts
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              30-day occupancy trend with gradient fill
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OccupancyRateAreaChart />
            <MultiSeriesAreaChartExample />
          </div>
        </section>

        {/* Section: Bar Charts */}
        <section className="space-y-4">
          <div className="border-l-4 border-info-500 pl-4">
            <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Bar Charts
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Single and multi-series bar comparisons
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PropertyPerformanceBarChart />
            <HorizontalBarChartExample />
          </div>
          <MultiSeriesBarChartExample />
        </section>

        {/* Section: Pie & Donut Charts */}
        <section className="space-y-4">
          <div className="border-l-4 border-warning-500 pl-4">
            <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Pie & Donut Charts
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Booking source distribution with styled legend
            </p>
          </div>
          <BookingSourcePieChart />
        </section>

        {/* Section: Dashboard Widgets */}
        <section className="space-y-4">
          <div className="border-l-4 border-purple-500 pl-4">
            <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Dashboard Widgets
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Compact charts for dashboard overview cards
            </p>
          </div>
          <DashboardWidgetExamples />
        </section>

        {/* Section: Custom Colors */}
        <section className="space-y-4">
          <div className="border-l-4 border-pink-500 pl-4">
            <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Custom Colors
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Charts with custom brand colors
            </p>
          </div>
          <CustomColorChartExample />
        </section>

        {/* Section: Loading & Empty States */}
        <section className="space-y-4">
          <div className="border-l-4 border-error-500 pl-4">
            <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Loading & Empty States
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Skeleton loading and no-data scenarios
            </p>
          </div>
          <LoadingSkeletonExamples />
        </section>

        {/* Color Reference */}
        <section className="space-y-4">
          <div className="border-l-4 border-property-secondary pl-4">
            <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Color Reference
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Available chart colors from the design system
            </p>
          </div>
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Chart Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { name: "Primary", color: "#0F766E", var: "property-primary" },
                  { name: "Secondary", color: "#14B8A6", var: "property-secondary" },
                  { name: "CTA", color: "#0369A1", var: "property-cta" },
                  { name: "Success", color: "#10b981", var: "success" },
                  { name: "Warning", color: "#f59e0b", var: "warning" },
                  { name: "Error", color: "#ef4444", var: "error" },
                  { name: "Blue", color: "#3b82f6", var: "info" },
                  { name: "Purple", color: "#a855f7", var: "purple-500" },
                  { name: "Indigo", color: "#6366f1", var: "indigo-500" },
                  { name: "Pink", color: "#ec4899", var: "pink-500" },
                  { name: "Cyan", color: "#06b6d4", var: "cyan-500" },
                  { name: "Orange", color: "#f97316", var: "orange-500" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    <div
                      className="w-10 h-10 rounded-md border-2 border-white dark:border-gray-800 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                        {item.color}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-500">
          <p>
            Built with Recharts | Styled with Tailwind CSS | Themed for Co.Property
          </p>
          <p className="mt-2">
            Toggle dark mode in the header to see theme-aware colors
          </p>
        </div>
      </div>
    </div>
  );
}
