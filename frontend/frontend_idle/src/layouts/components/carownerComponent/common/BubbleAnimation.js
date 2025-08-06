import { useEffect, useState } from "react";
import "../common/BubbleAnimation.css";
import cherryImg from "../common/cherry.png";

const BubbleAnimation = ({ warmth = 60 }) => {
  const [bubbles, setBubbles] = useState([]);
  const [colorClass, setColorClass] = useState("bubble-low");

  useEffect(() => {
    let bubbleLimit = 0;
    let createSpeed = 0;
    let color = "";

    if (warmth < 70) {
      bubbleLimit = 10;
      createSpeed = 800;
      color = "bubble-low";
    } else if (warmth < 90) {
      bubbleLimit = 20;
      createSpeed = 500;
      color = "bubble-mid";
    } else {
      bubbleLimit = 40;
      createSpeed = 200;
      color = "bubble-high";
    }

    setColorClass(color);

    const interval = setInterval(() => {
      setBubbles((prev) => {
        const now = Date.now();
        const filtered = prev.filter(b => now - b.createdAt < 6000);
        // 지속적으로 생성되도록 항상 하나 추가
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
      animationDuration: `${4 + Math.random() * 3}s`,
      createdAt: Date.now(),
    };
  };

  return (
    <div className="bubble-container">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`bubble ${colorClass}`}
          style={{
            left: bubble.left,
            animationDuration: bubble.animationDuration,
          }}
        >
          <img
            src={cherryImg}
            alt="벚꽃"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 1,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default BubbleAnimation;