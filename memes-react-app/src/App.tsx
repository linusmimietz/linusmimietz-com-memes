import React, { useEffect, useState } from "react";
import "./App.css";
import "./assets/fonts/fontfaces.css";
import { Button, Progress, Spin, Alert, Result, ConfigProvider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import ReactPlayer from "react-player";
import { Meme, getMemes, likeMeme } from "./api";
import ButtonComponent from "./ButtonComponent";
import ConfettiAnimation from "./assets/animations/confetti-1.json";
import { BackIcon } from "./assets/images/Back";
import { ShuffleIcon } from "./assets/images/Shuffle";
import ColorThief from "colorthief";

function App() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [imageBackgroundColor, setImageBackgroundColor] = useState("");
  const myTotalLikes = memes.reduce((acc, meme) => acc + meme.myLikes, 0);

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
        if (color) setImageBackgroundColor(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`);
        console.log("Dominant color of the image: ", color);
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
          <div>
            {currentMemeIndex === memes.length ? (
              <Result
                status="success"
                title="You've reached the end"
                subTitle={`In total you've viewed ${memes.length} memes and awarded ${myTotalLikes} like${myTotalLikes === 1 ? "" : "s"}. Got any more awesome memes to share? Contact me!`}
                extra={[
                  <Button type="primary" key="restart" onClick={() => setCurrentMemeIndex(0)}>
                    Restart
                  </Button>,
                  <Button key="reload" onClick={() => window.open("https://www.linkedin.com/in/linusmimietz/", "_blank")}>
                    Message via LinkedIn
                  </Button>,
                ]}
              />
            ) : (
              <div className="meme-container">
                <div className="media-container">
                  {memes[currentMemeIndex].isVideo ? (
                    <div className="meme-video" onMouseEnter={() => setShowVideoControls(true)} onMouseLeave={() => setShowVideoControls(false)}>
                      <Spin spinning={videoLoading} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} delay={500}>
                        <ReactPlayer className="react-player" url={memes[currentMemeIndex].url} loop={true} controls={showVideoControls} playing={memes[currentMemeIndex].isVideo} width="100%" height="100%" onStart={() => setVideoLoading(false)} style={{ opacity: videoLoading ? 0 : 1 }} />
                      </Spin>
                    </div>
                  ) : (
                    <div className="meme-image" style={{ backgroundColor: imageBackgroundColor || undefined }}>
                      <Spin spinning={imageLoading} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} delay={500}>
                        <img src={memes[currentMemeIndex].url} alt="meme" crossOrigin="anonymous" onLoad={imageOnLoad} style={{ opacity: imageLoading ? 0 : 1, width: "100%" }} />
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
                      minWidth="124px"
                      onClick={() => likeMeme(memes[currentMemeIndex], setMemes, memes, currentMemeIndex)}
                      disabled={memes[currentMemeIndex].myLikes >= 50}
                      lottieAnimation={ConfettiAnimation}
                    />
                    <ButtonComponent text="Next Random Meme" textColor="#FFFFFF" backgroundColor="#303030" onClick={() => setCurrentMemeIndex(currentMemeIndex + 1)} iconRight={<ShuffleIcon color="#FFFFFF" />} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
