import React, { useEffect, useState } from "react";
import "./App.css";
import "./assets/fonts/fontfaces.css";
import { Button, Progress, Spin, Alert, Result, ConfigProvider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import ReactPlayer from "react-player";
import { Meme, getMemes, likeMeme } from "./api";
import ButtonComponent from "./ButtonComponent";
import BackIcon from "./assets/images/Back.svg";
import ShuffleIcon from "./assets/images/Shuffle.svg";

function App() {
  var [memes, setMemes] = useState<Meme[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  var [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  var myTotalLikes = memes.reduce((acc, meme) => acc + meme.myLikes, 0);
  useEffect(() => {
    getMemes().then((memes) => setMemes(memes));
  }, []);
  useEffect(() => {
    setImageLoading(true);
  }, [currentMemeIndex]);

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
                subTitle={`In total you've viewed ${memes.length} memes and awared ${myTotalLikes} like${myTotalLikes === 1 ? "" : "s"}. Got any more awesome memes to share? Contact me!`}
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
              <div>
                {memes[currentMemeIndex].isVideo ? (
                  <div className="meme-video">
                    <ReactPlayer className="react-player" url={memes[currentMemeIndex].url} loop={true} controls={true} playing={memes[currentMemeIndex].isVideo} width="100%" height="100%" />
                  </div>
                ) : (
                  <div className="meme-image">
                    <Spin spinning={imageLoading} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} delay={500}>
                      <img
                        src={memes[currentMemeIndex].url}
                        alt="meme"
                        onLoad={() => {
                          setImageLoading(false);
                        }}
                        style={{ opacity: imageLoading ? 0 : 100, width: "100%" }}
                      />
                    </Spin>
                  </div>
                )}
                <div className="control-container">
                  <Progress percent={Math.round(((currentMemeIndex + 1) / memes.length) * 100)} status={"normal"} />
                  {/* <Alert message="No more than 10 likes. Sorry!" type="error" showIcon closable /> */}
                  <div className="button-group">
                    <ButtonComponent text="Back to Previous" textColor="#000000" backgroundColor="#DADADA" onClick={() => setCurrentMemeIndex(currentMemeIndex === 0 ? currentMemeIndex : (currentMemeIndex - 1 + memes.length) % memes.length)} iconLeft={BackIcon} />
                    <ButtonComponent
                      text={`${memes[currentMemeIndex].totalLikes} Like${memes[currentMemeIndex].selfliked ? "d" : "s"}`}
                      textColor={memes[currentMemeIndex].selfliked ? "#FFFFFF" : "#F52257"}
                      backgroundColor={memes[currentMemeIndex].selfliked ? "#FF4D4F" : "#FFD9E2"}
                      minWidth="112px"
                      onClick={() => likeMeme(memes[currentMemeIndex], setMemes, memes, currentMemeIndex)}
                      lottieAnimation={"./assets/animations/confetti-1.json"}
                    />
                    <ButtonComponent text="Next Random Meme" textColor="#FFFFFF" backgroundColor="#303030" onClick={() => setCurrentMemeIndex(currentMemeIndex + 1)} iconRight={ShuffleIcon} />
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
