"use client";

import { useEffect, useRef } from "react";

/**
 * Makes a horizontally-overflowing row (a sport-pill ribbon, tab strip,
 * etc.) navigable with a plain mouse: a vertical scroll-wheel motion
 * scrolls it sideways, and click-and-drag pans it too, mirroring how a
 * trackpad/touch swipe already works on the same element.
 *
 * Usage: spread `scrollProps` onto the scrollable element, and guard any
 * onClick handlers on its children with `if (wasDragged()) return;` so a
 * drag doesn't also register as a click.
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const scrollRef = useRef<T>(null);
  const dragState = useRef({
    down: false,
    startX: 0,
    startScroll: 0,
    dragged: false,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Let native horizontal input (trackpad swipe, shift+wheel) through
      // untouched; only hijack a predominantly-vertical wheel gesture.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      down: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      dragged: false,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragState.current.down || !scrollRef.current) return;
      const delta = moveEvent.clientX - dragState.current.startX;
      if (Math.abs(delta) > 3) dragState.current.dragged = true;
      scrollRef.current.scrollLeft = dragState.current.startScroll - delta;
    };

    const onMouseUp = () => {
      dragState.current.down = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const wasDragged = () => dragState.current.dragged;

  return { scrollRef, onMouseDown, wasDragged };
}
