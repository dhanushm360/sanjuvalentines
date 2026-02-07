"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect } from "react";

export default function Yes() {
  useEffect(() => {
    const createHeart = () => {
      const heart = document.createElement("div");
      heart.classList.add("heart");
      document.querySelector(".heart-container")?.appendChild(heart);

      heart.style.left = Math.random() * 100 + "vw";
      heart.style.animationDuration = Math.random() * 2 + 3 + "s"; // 3-5 seconds
      heart.style.opacity = String(Math.random());
      heart.style.fontSize = Math.random() * 10 + 10 + "px"; // 10-20px

      setTimeout(() => {
        heart.remove();
      }, 5000); // Remove after 5 seconds

      const size = Math.random() * 20 + 10; // 10-30px
      heart.style.width = size + "px";
      heart.style.height = size + "px";
    };

    const interval = setInterval(createHeart, 300); // Create a heart every 300ms

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="yesPage">
      <div className="valBg" />
      <div className="heart-container"></div>

      <motion.div
        className="valCard"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55 }}
      >
        <h1>YAYYYYY 💞</h1>
        <p>
          Okay
          <br />
          ur officially my valentine now 🥰🥰
        </p>
        <Image
          src="/bear-kiss-bear-kisses.gif"
          alt="Bear Kisses"
          width={200}
          height={200}
          style={{
            objectFit: "contain",
            margin: "20px auto 0 auto",
            display: "block",
          }}
        />

        <p style={{ opacity: 0.8, marginTop: 12 }}>
          <br />
          no changing ur mind 😌
        </p>
      </motion.div>
    </main>
  );
}
