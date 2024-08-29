import React, { useEffect, useState } from 'react';
import './App.css';
import './assets/fonts/fontfaces.css';
import { Button, ConfigProvider } from 'antd';
import { Meme, getMemes } from './api';



function App() {
  const [memes, setMemes] = useState<Meme[]>([]);
  useEffect(() => {
    getMemes().then((memes) => setMemes(memes));
  }, []);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);

  return (
    <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#303030',
        colorTextBase: '#303030',
        borderRadius: 4,
        fontFamily: 'Sequel Sans Body'
      },
    }}
  >
      <div className="container">
          <div className="meme-image">
            <img src={memes[currentMemeIndex].url} alt="meme" />
          </div>
          <div className="control-container">
            <Button onClick={() => setCurrentMemeIndex((currentMemeIndex - 1 + memes.length) % memes.length)}>Back</Button>
            <Button onClick={() => memes[currentMemeIndex].like()}>{memes[currentMemeIndex].likes} Likes</Button>
            <Button onClick={() => setCurrentMemeIndex((currentMemeIndex + 1) % memes.length)}>Next</Button>
          </div>
      </div>
  </ConfigProvider>
  );
}

export default App;
