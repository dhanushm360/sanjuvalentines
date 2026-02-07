"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { title: "Step 1", text: "Take a deep breath… something fun is coming!" },
  { title: "Step 2", text: "Remember how we can make even normal days special?" },
  { title: "Step 3", text: "I love you. That’s all. 💖" },
  { title: "Final", text: "Click next for the big question!" },
];

export default function Steps() {
  const [i, setI] = useState(0);
  const step = steps[i];

  return (
    <main className="steps">
      <div className="stepsBg" />
      <div className="cardWrap">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2>{step.title}</h2>
            <p>{step.text}</p>

            <div className="btnRow">
              {i > 0 && (
                <button className="ghost" onClick={() => setI(i - 1)}>
                  ← Back
                </button>
              )}

              {i < steps.length - 1 ? (
                <button className="primary" onClick={() => setI(i + 1)}>
                  Next →
                </button>
              ) : (
                <button
                  className="primary"
                  onClick={() => (window.location.href = "/valentine")}
                >
                  Go →
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
