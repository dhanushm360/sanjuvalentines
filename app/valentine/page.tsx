"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const NO_CLICKS_TO_YES = 10;
const NO_CLICKS_FULL_CARD = 6;
const CURSOR_MIN_DIST_PX = 60;
const MAX_PUSH_PX = 14;
const FREEZE_AFTER_MS = 6000;

export default function Valentine() {
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [noStuck, setNoStuck] = useState(false);
  const [noButtonFrozen, setNoButtonFrozen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const yesBtnRef = useRef<HTMLButtonElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const noTranslateRef = useRef({ x: 0, y: 0 });

  const yesText =
    yesCount === 0
      ? "Yes 💘"
      : yesCount === 1
        ? "YES obviously 💞"
        : yesCount === 2
          ? "OKAY YES YES 💗"
          : yesCount === 3
            ? "STOP IM YOURS 💍"
            : "STOP IM YOURS 💍";

  const fullCardMode = noCount >= NO_CLICKS_FULL_CARD;
  const yesScale = 1 + noCount * 0.22;

  const handleNoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNoStuck(true);
    setNoCount((c) => {
      const next = c + 1;
      if (next >= NO_CLICKS_TO_YES)
        setTimeout(() => (window.location.href = "/yes"), 0);
      return next;
    });
  };

  const handleCardClick = () => {
    if (!fullCardMode) return;
    setYesCount((c) => {
      const next = c + 1;
      if (next >= 2) setTimeout(() => (window.location.href = "/yes"), 0);
      return next;
    });
  };

  const handleYesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fullCardMode) return;
    setYesCount((c) => c + 1);
    if (yesCount >= 2) window.location.href = "/yes";
  };

  useEffect(() => {
    const t = setTimeout(() => setNoButtonFrozen(true), FREEZE_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (noButtonFrozen || fullCardMode) return;
    const card = cardRef.current;
    const noBtn = noBtnRef.current;
    const yesBtn = yesBtnRef.current;
    if (!card || !noBtn) return;

    const onMouseMove = (e: MouseEvent) => {
      const cardRect = card.getBoundingClientRect();
      const noRect = noBtn.getBoundingClientRect();
      const yesRect = yesBtn?.getBoundingClientRect();
      const padding = 24;
      const cardPadding = 28;
      const gap = 8;

      const btnCenterX = noRect.left + noRect.width / 2;
      const btnCenterY = noRect.top + noRect.height / 2;
      const dx = e.clientX - btnCenterX;
      const dy = e.clientY - btnCenterY;
      const dist = Math.hypot(dx, dy);

      if (dist >= CURSOR_MIN_DIST_PX || dist < 2) return;

      const push = Math.min(MAX_PUSH_PX, CURSOR_MIN_DIST_PX - dist);
      const moveHorizontal = Math.abs(dx) >= Math.abs(dy);
      const deltaTx = moveHorizontal ? -Math.sign(dx) * push : 0;
      const deltaTy = moveHorizontal ? 0 : -Math.sign(dy) * push;
      let tx = noTranslateRef.current.x + deltaTx;
      let ty = noTranslateRef.current.y + deltaTy;

      const layoutLeft = noRect.left - cardRect.left - noTranslateRef.current.x;
      const layoutTop = noRect.top - cardRect.top - noTranslateRef.current.y;
      const minXCard = cardPadding + padding - layoutLeft;
      const maxX =
        cardRect.right -
        cardRect.left -
        cardPadding -
        padding -
        noRect.width -
        layoutLeft;
      const minY = cardPadding + padding - layoutTop;
      const maxY =
        cardRect.bottom -
        cardRect.top -
        cardPadding -
        padding -
        noRect.height -
        layoutTop;
      const minXNoOverlap =
        yesRect != null
          ? yesRect.right - cardRect.left - layoutLeft + gap
          : minXCard;
      const minX = Math.max(minXCard, minXNoOverlap);

      tx = Math.min(maxX, Math.max(minX, tx));
      ty = Math.min(maxY, Math.max(minY, ty));

      noTranslateRef.current = { x: tx, y: ty };
      noBtn.style.transform = `translate(${tx}px, ${ty}px)`;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [noButtonFrozen, fullCardMode]);

  return (
    <main className="valPage">
      <div className="valBg" />

      <motion.div
        ref={cardRef}
        className={`valCard ${fullCardMode ? "valCardClickable" : ""}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        onClick={handleCardClick}
      >
        {fullCardMode && (
          <button
            type="button"
            className="valCardOverlay"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            {yesText}
          </button>
        )}
        <img src="/dudu-flower.gif" alt="" className="valFlower" aria-hidden />
        <h1>sanju will you be my valentine?</h1>

        <div
          ref={rowRef}
          className={`row valButtonRow ${fullCardMode ? "valButtonRowFull" : ""}`}
        >
          <div className="valButtonGroup">
            <motion.button
              ref={yesBtnRef}
              className="primary valYesBtn"
              style={{
                minWidth: fullCardMode ? 0 : `${100 + noCount * 72}px`,
                flexGrow: fullCardMode ? 1 : 0,
                flexShrink: 0,
                flexBasis: fullCardMode ? "0%" : "auto",
              }}
              animate={{ scale: fullCardMode ? 1 : yesScale }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={handleYesClick}
            >
              {yesText}
            </motion.button>
            <button
              ref={noBtnRef}
              className="ghost valNoBtn"
              onClick={handleNoClick}
              onMouseEnter={() => {
                if (
                  noStuck ||
                  fullCardMode ||
                  noButtonFrozen ||
                  !cardRef.current ||
                  !noBtnRef.current
                )
                  return;
                const card = cardRef.current.getBoundingClientRect();
                const noBtn = noBtnRef.current.getBoundingClientRect();
                const yesBtn = yesBtnRef.current?.getBoundingClientRect();
                const padding = 24;
                const cardPadding = 28;
                const gap = 8;
                const minXCard = card.left + cardPadding - noBtn.left + padding;
                const maxX =
                  card.right - cardPadding - noBtn.width - noBtn.left - padding;
                const minY = card.top + cardPadding - noBtn.top + padding;
                const maxY =
                  card.bottom -
                  cardPadding -
                  noBtn.height -
                  noBtn.top -
                  padding;
                const minXNoOverlap =
                  yesBtn != null ? yesBtn.right - noBtn.left + gap : minXCard;
                const minX = Math.max(minXCard, minXNoOverlap);
                const moveHorizontal = Math.random() < 0.5;
                const maxJump = 36;
                const x = moveHorizontal
                  ? Math.min(
                      maxX,
                      Math.max(minX, (Math.random() - 0.5) * maxJump * 2),
                    )
                  : 0;
                const y = moveHorizontal
                  ? 0
                  : Math.min(
                      maxY,
                      Math.max(minY, (Math.random() - 0.5) * maxJump * 2),
                    );
                noTranslateRef.current = { x, y };
                noBtnRef.current.style.transform = `translate(${x}px, ${y}px)`;
              }}
            >
              No
            </button>
          </div>
        </div>
        {!fullCardMode && (
          <p className="valCardHint">
            I don&apos;t think &quot;No&quot; wants u 🌚
          </p>
        )}
      </motion.div>
    </main>
  );
}
