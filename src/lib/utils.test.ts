import { expect, test, describe } from "bun:test";
import { cn } from "./utils";

describe("Utils", () => {
    describe("cn", () => {
        test("merges class names correctly", () => {
            expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
        });

        test("handles conditional classes", () => {
            expect(cn("px-2", true && "py-1", false && "bg-red-500")).toBe("px-2 py-1");
        });

        test("merges tailwind classes using tailwind-merge (overrides)", () => {
            expect(cn("px-2 bg-red-500", "bg-blue-500")).toBe("px-2 bg-blue-500");
        });
    });
});
