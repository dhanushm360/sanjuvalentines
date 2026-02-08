"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CSSProperties } from "react";

export default function Page() {
  const [hasStartedVideo, setHasStartedVideo] = useState(false);
  const [pausedAtThreeSec, setPausedAtThreeSec] = useState(false);
  const [hasClickedOpenMe, setHasClickedOpenMe] = useState(false);
  const [showEndPlaceholder, setShowEndPlaceholder] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [videoZoomAtSeven, setVideoZoomAtSeven] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const envelopeHotspot = useMemo<CSSProperties>(() => {
    return {
      left: "48.8%",
      top: "57%",
      width: "6.2%",
      height: "6.5%",
      // Adjust skew (e.g. skewX for left/right tilt, skewY for forward/back), rotate for overlay tilt:
      transform: "rotate(4deg) skewX(-15deg) skewY(10deg)",
    };
  }, []);

  const onDeskEnvelopeClick = () => {
    setPausedAtThreeSec(false);
    setHasClickedOpenMe(false);
    setShowEndPlaceholder(false);
    setShowContinueButton(false);
    setVideoZoomAtSeven(false);
    // Start playback immediately on user gesture (required by browsers for unmuted/muted play)
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    setHasStartedVideo(true);
  };

  // On load: show first frame (currentTime = 0), don't play. When user clicks: play.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    if (!hasStartedVideo) return;
    let cancelled = false;
    const playFromStart = () => {
      if (cancelled) return;
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    const startWhenReady = () => {
      if (cancelled) return;
      if (video.readyState >= 2) {
        playFromStart();
      } else {
        video.addEventListener("loadeddata", playFromStart, { once: true });
      }
    };
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(startWhenReady);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", playFromStart);
    };
  }, [hasStartedVideo]);

  // At 2.3s: pause and show "open me"
  useEffect(() => {
    const video = videoRef.current;
    if (!hasStartedVideo || !video || hasClickedOpenMe) return;

    const onTimeUpdate = () => {
      if (video.currentTime >= 2.33 && !pausedAtThreeSec) {
        setPausedAtThreeSec(true);
        video.pause();
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [hasStartedVideo, pausedAtThreeSec, hasClickedOpenMe]);

  const onOpenMeClick = () => {
    setHasClickedOpenMe(true);
    videoRef.current?.play();
  };

  // Ensure video shows first frame when mounted (before user clicks)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasStartedVideo) return;
    video.currentTime = 0;
    const onLoaded = () => {
      video.currentTime = 0;
    };
    video.addEventListener("loadeddata", onLoaded, { once: true });
    if (video.readyState >= 2) video.currentTime = 0;
    return () => video.removeEventListener("loadeddata", onLoaded);
  }, [hasStartedVideo]);

  const onEnvelopeVideoEnded = () => {
    setShowEndPlaceholder(true);
  };

  // Show "Your message here" (1 sec before video end)
  useEffect(() => {
    const video = videoRef.current;
    if (!hasStartedVideo || !video) return;

    const checkShowPlaceholder = () => {
      const d = video.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      if (video.currentTime >= d - 1 && !showEndPlaceholder) {
        setShowEndPlaceholder(true);
        video.removeEventListener("timeupdate", checkShowPlaceholder);
      }
    };

    video.addEventListener("timeupdate", checkShowPlaceholder);
    return () => video.removeEventListener("timeupdate", checkShowPlaceholder);
  }, [hasStartedVideo, showEndPlaceholder]);

  // At 7s: seamless zoom in on video
  useEffect(() => {
    const video = videoRef.current;
    if (!hasStartedVideo || !video || videoZoomAtSeven) return;

    const onTimeUpdate = () => {
      if (video.currentTime >= 7) {
        setVideoZoomAtSeven(true);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [hasStartedVideo, videoZoomAtSeven]);

  // Show continue button 10 seconds after placeholder is shown
  useEffect(() => {
    if (!showEndPlaceholder || showContinueButton) return;
    const t = setTimeout(() => setShowContinueButton(true), 10000);
    return () => clearTimeout(t);
  }, [showEndPlaceholder, showContinueButton]);

  return (
    <main className="vday">
      {/* Background: video (desk + transitioning with zoom), then letter view covers */}
      <motion.div
        key="desk-bg"
        className="bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="envelopeVideoWrapper"
          animate={{
            scale: videoZoomAtSeven ? 1.5 : 1,
            opacity: 1,
          }}
          transition={{
            duration: videoZoomAtSeven ? 3.5 : 0.85,
            ease: videoZoomAtSeven
              ? [0.22, 0.61, 0.36, 1]
              : [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <video
            ref={videoRef}
            src="/Video_Revision_For_Envelope_Animation.mp4"
            playsInline
            muted
            preload="auto"
            onEnded={onEnvelopeVideoEnded}
            className="envelopeVideoInBg"
          />
          <div
            className="videoLetterboxCover videoLetterboxCoverTop"
            aria-hidden
          />
          <div
            className="videoLetterboxCover videoLetterboxCoverBottom"
            aria-hidden
          />
          <AnimatePresence>
            {pausedAtThreeSec && !hasClickedOpenMe && (
              <motion.div
                className="openMeOverlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  type="button"
                  className="openMeBtn"
                  onClick={onOpenMeClick}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15,
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  open me
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showEndPlaceholder && (
              <motion.div
                className="videoEndOverlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="videoEndMessage">
                  {[
                    { text: "Hi sanju banju,", title: true },
                    { spacer: true },
                    {
                      text: "We're far apart right now, but I still wanted to do something that feels like I'm right there with you.",
                    },
                    { spacer: true },
                    { text: "So I left this on your desk." },
                    { spacer: true },
                    {
                      text: "You make my days better, my heart feel full, and my life more dramatic (which I love). Even from far away, you've become the most constant part of my life.",
                    },
                    { spacer: true },
                    {
                      text: "I miss you — but I miss the little things too.",
                    },
                    {
                      text: "Your laugh. Your touch. Your presence.",
                    },
                    {
                      text: "The way you make everything feel like more.",
                    },
                    { spacer: true },
                    {
                      text: "And even though we're not in the same place right now, you still feel like home to me. But I hope we'll be in the same place soon.",
                    },
                    { spacer: true },
                    {
                      text: "So I need to ask you something…",
                    },
                  ].map((line, i) =>
                    "spacer" in line && line.spacer ? (
                      <div key={i} className="videoEndMessageSpacer" />
                    ) : (
                      <motion.p
                        key={i}
                        className={
                          line.title ? "videoEndMessageTitle" : undefined
                        }
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        {line.text}
                      </motion.p>
                    ),
                  )}
                </div>
                <div className="videoEndButtonSlot">
                  {showContinueButton && (
                    <motion.button
                      type="button"
                      className="continueToNextBtn"
                      onClick={() => (window.location.href = "/valentine")}
                      initial={{ clipPath: "inset(0 100% 0 0)" }}
                      animate={{ clipPath: "inset(0 0 0 0)" }}
                      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      okay... →
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Seamless zoom into: pink background + paper (transitioning + letter) */}
      <AnimatePresence>
        {false && (
          <motion.div
            className="letterView"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="letterViewPink" aria-hidden />
            <motion.div
              className="letter"
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <div className="paper paperWithShadow">
                <h1>Hi sanju banju 💌</h1>
                <p>
                  we’re long distance, but I still wanted to do something that
                  feels like I’m right there with you. So I left this on ur
                  desk. You make my days better, my life more dramatic (which I
                  love), and my heart so full. Even from far away, you’ve become
                  the most constant part of my life. I don’t just miss you, I
                  miss the little things. Your touch. Your laugh. Your presence.
                  The way you make everything feel fuller.
                </p>
                <p>
                  I love you in the quiet ways, in the small moments, in the
                  random conversations, in the comfort you bring me. And even
                  though we’re not in the same place, you still feel like home
                  to me. That&apos;s why I&apos;m going to ask you something....
                </p>
                <div className="paperBtns">
                  <button
                    className="primary"
                    onClick={() => (window.location.href = "/valentine")}
                  >
                    continue →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comic hint */}
      <AnimatePresence>
        {!hasStartedVideo && (
          <motion.div
            className="comicHint"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="hintCurvedArrow" aria-hidden>
              <img
                src="/pink-pink-arrow-element-arrow-element-pink-arrow-element-arrow-icon-icon-png.png"
                alt=""
                className="hintArrowImg"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotspot over the envelope */}
      {!hasStartedVideo && (
        <button
          className="hotspot"
          style={envelopeHotspot}
          onClick={onDeskEnvelopeClick}
          aria-label="Open envelope"
        />
      )}
    </main>
  );
}
