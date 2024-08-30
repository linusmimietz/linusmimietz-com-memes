import React, { useEffect, useState } from "react";
import "./App.css";
import "./assets/fonts/fontfaces.css";
import { Button, Progress, ConfigProvider } from "antd";
import { Meme, getMemes, likeMeme } from "./api";

function App() {
  var [memes, setMemes] = useState<Meme[]>([]);
  useEffect(() => {
    getMemes().then((memes) => setMemes(memes));
  }, []);
  var [currentMemeIndex, setCurrentMemeIndex] = useState(0);

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
              <img src={memes[currentMemeIndex].url} alt="meme" />
            </div>

            <div className="control-container">
              <Progress percent={((currentMemeIndex + 1) / memes.length) * 100} />
              <div className="button-group">
                <Button onClick={() => setCurrentMemeIndex(currentMemeIndex === 0 ? currentMemeIndex : (currentMemeIndex - 1 + memes.length) % memes.length)} disabled={currentMemeIndex === 0}>
                  Back
                </Button>
                <Button danger type={memes[currentMemeIndex].selfliked ? "primary" : undefined} onClick={() => likeMeme(memes[currentMemeIndex], setMemes, memes, currentMemeIndex)}>
                  {memes[currentMemeIndex].likes} Likes
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
