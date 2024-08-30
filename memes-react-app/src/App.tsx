import React, { useEffect, useState } from "react";
import "./App.css";
import "./assets/fonts/fontfaces.css";
import { Button, Progress, Spin, Alert, ConfigProvider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Meme, getMemes, likeMeme } from "./api";

function App() {
  var [memes, setMemes] = useState<Meme[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  var [currentMemeIndex, setCurrentMemeIndex] = useState(0);
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

            <div className="control-container">
              <Progress percent={Math.round(((currentMemeIndex + 1) / memes.length) * 100)} status={"normal"} />
              {/* <Alert message="No more than 10 likes. Sorry!" type="error" showIcon closable /> */}
              <div className="button-group">
                <Button onClick={() => setCurrentMemeIndex(currentMemeIndex === 0 ? currentMemeIndex : (currentMemeIndex - 1 + memes.length) % memes.length)} disabled={currentMemeIndex === 0}>
                  Back
                </Button>
                <Button danger type={memes[currentMemeIndex].selfliked ? "primary" : undefined} onClick={() => likeMeme(memes[currentMemeIndex], setMemes, memes, currentMemeIndex)}>
                  {memes[currentMemeIndex].totalLikes} Likes
                </Button>
                <Button onClick={() => setCurrentMemeIndex((currentMemeIndex + 1) % memes.length)}>Next</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
