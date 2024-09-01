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
  iconLeft?: React.ReactNode; // Expects a React node for SVG icon
  iconRight?: React.ReactNode;
  lottieAnimation?: string; // Path to the Lottie JSON file
  disabled?: boolean; // Boolean to control disabled state
}

const ButtonComponent: React.FC<ButtonProps> = ({ text, textColor, backgroundColor, minWidth = "auto", onClick, iconLeft, iconRight, lottieAnimation, disabled = false }) => {
  const [animations, setAnimations] = useState<Array<{ id: number; isAnimating: boolean; rotation: number }>>([]);

  const handleButtonClick = () => {
    if (!disabled) {
      onClick();
      const newRotation = animations.length === 0 ? 0 : Math.random() * 360;
      setAnimations((prev) => [...prev, { id: Date.now(), isAnimating: true, rotation: newRotation }]);
    }
  };

  const handleAnimationComplete = (id: number) => {
    setAnimations((prev) => prev.filter((animation) => animation.id !== id));
  };

  const buttonStyle = disabled
    ? {
        color: backgroundColor,
        backgroundColor: "transparent",
        borderColor: backgroundColor,
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingTop: "12px",
        paddingBottom: "14px",
        fontSize: "18px",
        lineHeight: "120%",
        borderRadius: "4px",
        minWidth,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "none",
        height: "auto",
        borderWidth: "1px",
        borderStyle: "solid",
      }
    : {
        color: textColor,
        backgroundColor,
        borderColor: "transparent",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingTop: "12px",
        paddingBottom: "14px",
        fontSize: "18px",
        lineHeight: "120%",
        borderRadius: "4px",
        minWidth,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "none",
        height: "auto",
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
                pointerEvents: "none",
                zIndex: 0,
              }}
              loop={false}
              segments={[10, 30]}
              speed={1.5}
              onComplete={() => handleAnimationComplete(animation.id)}
            />
          )
      )}
      <AntButton onClick={handleButtonClick} style={buttonStyle} className="custom-button" disabled={disabled}>
        {iconLeft && React.cloneElement(iconLeft as React.ReactElement, { color: disabled ? backgroundColor : textColor, style: { width: "24px", height: "24px", marginRight: "8px" } })}
        {text}
        {iconRight && React.cloneElement(iconRight as React.ReactElement, { color: disabled ? backgroundColor : textColor, style: { width: "24px", height: "24px", marginLeft: "8px" } })}
      </AntButton>
    </div>
  );
};

export default ButtonComponent;
