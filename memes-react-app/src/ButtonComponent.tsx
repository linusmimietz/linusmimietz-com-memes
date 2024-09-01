import React, { useState } from "react";
import { Button as AntButton } from "antd";
import Lottie from "react-lottie-player";
import ConfettiAnimation from "./assets/animations/confetti-1.json";

interface ButtonProps {
  text: string;
  textColor: string;
  backgroundColor: string;
  minWidth?: string;
  onClick: () => void;
  iconLeft?: string;
  iconRight?: string;
  lottieAnimation?: string; // Path to the Lottie JSON file
}

const ButtonComponent: React.FC<ButtonProps> = ({ text, textColor, backgroundColor, minWidth = "auto", onClick, iconLeft, iconRight, lottieAnimation }) => {
  const [animations, setAnimations] = useState<Array<{ id: number; isAnimating: boolean; rotation: number }>>([]);

  const handleButtonClick = () => {
    onClick();
    // Add a new animation instance to the array
    const newRotation = animations.length === 0 ? 0 : Math.random() * 360; // Rotation is 0 if it's the first animation, otherwise random
    setAnimations((prev) => [...prev, { id: Date.now(), isAnimating: true, rotation: newRotation }]);
  };

  const handleAnimationComplete = (id: number) => {
    // Remove the animation from the array after it completes
    setAnimations((prev) => prev.filter((animation) => animation.id !== id));
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {animations.map(
        (animation) =>
          animation.isAnimating && (
            <Lottie
              key={animation.id}
              animationData={ConfettiAnimation}
              play
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${animation.rotation}deg)`,
                width: "250px",
                height: "250px",
                pointerEvents: "none", // Allows clicks to pass through to button
                zIndex: 0,
              }}
              loop={false}
              segments={[10, 30]}
              speed={1.5}
              onComplete={() => handleAnimationComplete(animation.id)}
            />
          )
      )}
      <AntButton
        onClick={handleButtonClick}
        style={{
          color: textColor,
          backgroundColor: backgroundColor,
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "12px",
          paddingBottom: "14px",
          fontSize: "18px",
          lineHeight: "120%",
          borderRadius: "4px",
          minWidth: minWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderColor: "transparent",
          boxShadow: "none",
          height: "auto",
        }}
        className="custom-button"
      >
        {iconLeft && <img src={iconLeft} alt="Icon Left" style={{ width: "24px", height: "24px", marginRight: "8px" }} />}
        {text}
        {iconRight && <img src={iconRight} alt="Icon Right" style={{ width: "24px", height: "24px", marginLeft: "8px" }} />}
      </AntButton>
    </div>
  );
};

export default ButtonComponent;
