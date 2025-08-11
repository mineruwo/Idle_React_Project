import { useEffect, useState } from "react";
import "./BubbleAnimation.css";
import cherryImg from "./cherry1.png";

const BubbleAnimation = ({ warmth = 60 }) => {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    let bubbleLimit = 40;
    let createSpeed = 200;

    if (warmth < 70) {
      bubbleLimit = 10;
      createSpeed = 800;
    } else if (warmth < 90) {
      bubbleLimit = 20;
      createSpeed = 500;
    }

    const interval = setInterval(() => {
      setBubbles((prev) => {
        const now = Date.now();
        const filtered = prev.filter((b) => now - b.createdAt < 8000);
        return [...filtered, createBubble()];
      });
    }, createSpeed);

    return () => clearInterval(interval);
  }, [warmth]);

  const createBubble = () => {
    const id = Date.now() + Math.random();
    return {
      id,
      left: Math.random() * 100 + "%",
      direction: Math.random() > 0.5 ? "bubble-left" : "bubble-right",
      createdAt: Date.now(),
    };
  };

  return (
    <div className="bubble-container">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`bubble ${bubble.direction}`}
          style={{
            left: bubble.left,
          }}
        >
          <img
            src={cherryImg}
            alt="벚꽃"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default BubbleAnimation;