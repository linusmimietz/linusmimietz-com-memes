import React, { useEffect, useState } from "react";
import "./App.css";
import "./assets/fonts/fontfaces.css";
import { Progress, Spin, Alert, ConfigProvider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import ReactPlayer from "react-player";
import { Meme, getMemes, likeMeme } from "./api";
import ButtonComponent from "./ButtonComponent";
import ConfettiAnimation from "./assets/animations/confetti-1.json";
import { BackIcon } from "./assets/images/Back";
import { ShuffleIcon } from "./assets/images/Shuffle";
import { SuccessIllustration } from "./assets/images/Success-Illustration";
import ColorThief from "colorthief";
import { parseToHsla, hsla } from "color2k";

function App() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [imageBackgroundColor, setImageBackgroundColor] = useState("");
  const myTotalLikes = memes.reduce((acc, meme) => acc + meme.myLikes, 0);
  const [showMaxLikesAlert, setShowMaxLikesAlert] = useState(false);

  useEffect(() => {
    getMemes().then((memes) => setMemes(memes));
  }, []);

  useEffect(() => {
    setImageLoading(true);
    setVideoLoading(true);
    if (memes[currentMemeIndex] && memes[currentMemeIndex].isVideo) {
      setImageBackgroundColor("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMemeIndex]);

  function imageOnLoad(event: any) {
    setImageLoading(false);
    const img = event.target;
    if (img.complete) {
      const colorThief = new ColorThief();
      try {
        const color = colorThief.getColor(img);
        if (color) {
          const [r, g, b] = color;
          const rgbColor = `rgb(${r},${g},${b})`;
          const [h, s, , a] = parseToHsla(rgbColor);
          const adjustedColor = hsla(h, s, 0.9, a); // Set lightness to 90%
          setImageBackgroundColor(adjustedColor);
        }
      } catch (error) {
        console.error("Error getting color from image: ", error);
      }
    }
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#303030",
          colorTextBase: "#303030",
          borderRadius: 4,
          fontFamily: "Sequel Sans Body",
        },
      }}
    >
      <div className="container">
        {memes.length > 0 && (
          <>
            {currentMemeIndex === memes.length ? (
              <div className="success-container">
                <SuccessIllustration color="#23C65F" width="148" height="148" />
                <div className="success-message">
                  <h1>You've reached the end</h1>
                  <p style={{ color: "rgba(0, 0, 0, 0.6)" }}>
                    In total you viewed {memes.length} memes and awarded {myTotalLikes} like{myTotalLikes === 1 ? "" : "s"}.
                  </p>
                </div>
                <ButtonComponent text="Restart" textColor="#000000" backgroundColor="#DADADA" onClick={() => setCurrentMemeIndex(0)} />
              </div>
            ) : (
              <div className="content-container">
                <div className="media-container" style={{ backgroundColor: imageBackgroundColor || "#e6e6e6" }}>
                  {memes[currentMemeIndex].isVideo ? (
                    <div className="meme-video" onMouseEnter={() => setShowVideoControls(true)} onMouseLeave={() => setShowVideoControls(false)}>
                      <Spin spinning={videoLoading} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} delay={500}>
                        <ReactPlayer className="react-player" url={memes[currentMemeIndex].url} loop={true} controls={showVideoControls} playing={memes[currentMemeIndex].isVideo} width="100%" height="100%" onStart={() => setVideoLoading(false)} style={{ opacity: videoLoading ? 0 : 1 }} />
                      </Spin>
                    </div>
                  ) : (
                    <div className="meme-image">
                      <Spin spinning={imageLoading} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} delay={500}>
                        <img src={memes[currentMemeIndex].url} alt="meme" crossOrigin="anonymous" onLoad={imageOnLoad} style={{ opacity: imageLoading ? 0 : 1 }} />
                      </Spin>
                    </div>
                  )}
                </div>
                <div className="control-container">
                  <div className="progress-bar-container">
                    <Progress percent={Math.round(((currentMemeIndex + 1) / memes.length) * 99)} status={"normal"} strokeColor={"#303030"} trailColor={"#E6E6E6"} />
                  </div>
                  <div className="button-group">
                    <ButtonComponent
                      text="Back to Previous"
                      textColor="#000000"
                      backgroundColor="#DADADA"
                      zIndex={1}
                      onClick={() => setCurrentMemeIndex(currentMemeIndex === 0 ? currentMemeIndex : (currentMemeIndex - 1 + memes.length) % memes.length)}
                      iconLeft={<BackIcon color="#000000" />}
                      disabled={currentMemeIndex === 0}
                    />
                    <ButtonComponent
                      text={`${memes[currentMemeIndex].totalLikes} Like${memes[currentMemeIndex].selfliked ? "d" : memes[currentMemeIndex].totalLikes === 1 ? "" : "s"}`}
                      textColor={memes[currentMemeIndex].selfliked ? "#FFFFFF" : "#F52257"}
                      backgroundColor={memes[currentMemeIndex].selfliked ? "#FF4D4F" : "#FFD9E2"}
                      minWidth="126px"
                      onClick={() => {
                        if (memes[currentMemeIndex].myLikes >= 50) {
                          console.log("max likes");
                          setShowMaxLikesAlert(true);
                          setTimeout(() => setShowMaxLikesAlert(false), 5000);
                        } else {
                          likeMeme(memes[currentMemeIndex], setMemes, memes, currentMemeIndex);
                        }
                      }}
                      disabled={memes[currentMemeIndex].myLikes >= 50}
                      autoDisableOnclick={false}
                      lottieAnimation={ConfettiAnimation}
                    />
                    <ButtonComponent text="Next Random Meme" textColor="#FFFFFF" backgroundColor="#303030" onClick={() => setCurrentMemeIndex(currentMemeIndex + 1)} iconRight={<ShuffleIcon color="#FFFFFF" />} />
                  </div>
                  {showMaxLikesAlert && (
                    <Alert
                      message="You've already given 50 likes"
                      type="error"
                      showIcon
                      style={{
                        position: "absolute",
                        top: "18px",
                        left: "50%",
                        width: "max-content",
                        transform: "translateX(-50%)",
                        zIndex: 1000,
                        opacity: showMaxLikesAlert ? 1 : 0,
                        transition: "opacity 0.5s ease-in-out",
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
