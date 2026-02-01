"use client";

import * as React from "react";
import { useEffect, useCallback } from "react";

type KeyCombo = {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

type HotkeyHandler = (event: KeyboardEvent) => void;

/**
 * Parse a hotkey string like "mod+k" or "shift+/" into a KeyCombo object.
 * "mod" maps to metaKey on Mac and ctrlKey on other platforms.
 */
function parseHotkey(hotkey: string): KeyCombo {
  const parts = hotkey.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);

  const isMac =
    typeof navigator !== "undefined" && navigator.platform?.includes("Mac");

  return {
    key,
    metaKey: modifiers.includes("mod") ? isMac : modifiers.includes("meta"),
    ctrlKey: modifiers.includes("mod") ? !isMac : modifiers.includes("ctrl"),
    shiftKey: modifiers.includes("shift"),
    altKey: modifiers.includes("alt"),
  };
}

function matchesHotkey(event: KeyboardEvent, combo: KeyCombo): boolean {
  if (event.key.toLowerCase() !== combo.key) return false;
  if (combo.metaKey && !event.metaKey) return false;
  if (combo.ctrlKey && !event.ctrlKey) return false;
  if (combo.shiftKey && !event.shiftKey) return false;
  if (combo.altKey && !event.altKey) return false;
  return true;
}

/**
 * Register a global keyboard shortcut.
 *
 * @param hotkey - Key combination string, e.g. "mod+k", "shift+/", "escape"
 * @param handler - Callback when the hotkey is pressed
 * @param enabled - Whether the hotkey is active (default: true)
 */
export function useHotkeys(
  hotkey: string,
  handler: HotkeyHandler,
  enabled = true,
) {
  // Memoize combo to avoid re-parsing on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const combo = React.useMemo(() => parseHotkey(hotkey), [hotkey]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger in input fields unless it's a meta/ctrl combo
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInput && !combo.metaKey && !combo.ctrlKey) return;

      if (matchesHotkey(event, combo)) {
        event.preventDefault();
        event.stopPropagation();
        handler(event);
      }
    },
    [handler, combo],
  );

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown, enabled]);
}
