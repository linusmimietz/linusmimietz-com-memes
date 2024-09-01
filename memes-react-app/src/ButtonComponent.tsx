import React from "react";
import { Button as AntButton } from "antd";

interface ButtonProps {
  text: string;
  textColor: string;
  backgroundColor: string;
  minWidth?: string;
  onClick: () => void;
  iconLeft?: string;
  iconRight?: string;
}

const ButtonComponent: React.FC<ButtonProps> = ({ text, textColor, backgroundColor, minWidth = "auto", onClick, iconLeft, iconRight }) => {
  return (
    <AntButton
      onClick={onClick}
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
      {iconLeft && <img src={iconLeft} alt="Icon Left" style={{ width: "24px", height: "24px", marginRight: "0px" }} />}
      {text}
      {iconRight && <img src={iconRight} alt="Icon Right" style={{ width: "24px", height: "24px", marginLeft: "0px" }} />}
    </AntButton>
  );
};

export default ButtonComponent;
