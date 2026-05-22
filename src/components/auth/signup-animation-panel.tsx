"use client";

import Lottie from "lottie-react";
import { useCallback, useEffect, useState } from "react";

const ANIMATIONS = [
  [
    "/animations/Badminton_Player_Character3.json",
    "/animation/Badminton_Player_Character3.json",
  ],
  [
    "/animations/Soccer%20player%20kicking%20ball.json",
    "/animation/Soccer%20player%20kicking%20ball.json",
  ],
  [
    "/animations/Volley_Ball_Player_Character1.json",
    "/animation/Volley_Ball_Player_Character1.json",
  ],
  [
    "/animations/Volley_Ball_Player_Character3.json",
    "/animation/Volley_Ball_Player_Character3.json",
  ],
] as const;

const FADE_MS = 300;

async function fetchAnimation(paths: readonly string[]) {
  for (const src of paths) {
    const res = await fetch(src);
    if (res.ok) return res.json();
  }
  return null;
}

export function SignupAnimationPanel() {
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const currentPaths = ANIMATIONS[index];

  useEffect(() => {
    let cancelled = false;

    fetchAnimation(currentPaths).then((data) => {
      if (!cancelled) {
        setAnimationData(data);
        setOpacity(1);
        setIsFadingOut(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentPaths]);

  const handleComplete = useCallback(() => {
    setIsFadingOut(true);
    setOpacity(0);
  }, []);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "opacity" || !isFadingOut || opacity !== 0) {
        return;
      }
      setAnimationData(null);
      setIndex((i) => (i + 1) % ANIMATIONS.length);
    },
    [isFadingOut, opacity],
  );

  return (
    <div
      className="hidden h-full w-1/2 flex-col items-center justify-center bg-[#0d0d0d] md:flex"
      style={{ minHeight: "100%" }}
    >
      <div
        className="flex w-full max-w-[320px] items-center justify-center px-8"
        style={{
          opacity,
          transition: `opacity ${FADE_MS}ms ease-in-out`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {animationData ? (
          <Lottie
            key={currentPaths[0]}
            animationData={animationData}
            loop={false}
            onComplete={handleComplete}
            className="w-full max-w-[320px]"
            style={{ maxHeight: 360 }}
          />
        ) : (
          <div
            className="w-full max-w-[320px]"
            style={{ height: 280 }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
