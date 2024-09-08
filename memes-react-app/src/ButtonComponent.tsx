import React, { useState } from "react";
import { Button as AntButton } from "antd";
import Lottie from "react-lottie-player";

interface ButtonProps {
  text: string;
  textColor: string;
  backgroundColor: string;
  minWidth?: string;
  onClick: () => void;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  lottieAnimation?: object;
  disabled?: boolean;
  autoDisableOnclick?: boolean;
  zIndex?: number;
}

const ButtonComponent: React.FC<ButtonProps> = ({ text, textColor, backgroundColor, minWidth = "auto", onClick, iconLeft, iconRight, lottieAnimation, disabled = false, autoDisableOnclick = true, zIndex = 0 }) => {
  const [animations, setAnimations] = useState<Array<{ id: number; isAnimating: boolean; rotation: number }>>([]);

  const handleButtonClick = () => {
    if (autoDisableOnclick && disabled) {
      return;
    }
    onClick();
    if (!disabled) {
      const newRotation = animations.length === 0 ? 0 : Math.random() * 360;
      setAnimations((prev) => [...prev, { id: Date.now(), isAnimating: true, rotation: newRotation }]);
    }
  };

  const handleAnimationComplete = (id: number) => {
    setAnimations((prev) => prev.filter((animation) => animation.id !== id));
  };

  const darkenColor = (color: string, percent: number) => {
    const f = parseInt(color.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = percent < 0 ? percent * -1 : percent;
    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;
    const newColor = "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    return newColor;
  };

  const buttonStyle = {
    color: disabled ? darkenColor(backgroundColor, -0.3) : textColor,
    backgroundColor: disabled ? "#F2F2F2" : backgroundColor,
    borderColor: disabled ? darkenColor(backgroundColor, -0.3) : "transparent",
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
  };

  return (
    <div style={{ position: "relative", display: "inline-block", zIndex }}>
      {lottieAnimation && (
        <div>
          {animations.map(
            (animation) =>
              animation.isAnimating && (
                <Lottie
                  key={animation.id}
                  animationData={lottieAnimation}
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
        </div>
      )}
      <AntButton onClick={handleButtonClick} style={{ ...buttonStyle, zIndex: zIndex + 1 }} className="custom-button" disabled={autoDisableOnclick ? disabled : false}>
        {iconLeft && React.cloneElement(iconLeft as React.ReactElement, { color: disabled ? darkenColor(backgroundColor, -0.3) : textColor, style: { width: "24px", height: "24px", marginRight: "8px" } })}
        {text}
        {iconRight && React.cloneElement(iconRight as React.ReactElement, { color: disabled ? darkenColor(backgroundColor, -0.3) : textColor, style: { width: "24px", height: "24px", marginLeft: "8px" } })}
      </AntButton>
    </div>
  );
};

export default ButtonComponent;
