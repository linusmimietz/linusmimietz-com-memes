import React, { useEffect, useState, useRef } from "react";
import { Alert, ConfigProvider, Progress, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import ReactPlayer from "react-player";
import ColorThief from "colorthief";
import { hsla, parseToHsla } from "color2k";

import { Meme, getMemes, likeMeme } from "./api";
import ButtonComponent from "./ButtonComponent";
import { BackIcon } from "./assets/images/Back";
import { ShuffleIcon } from "./assets/images/Shuffle";
import { SuccessIllustration } from "./assets/images/Success-Illustration";
import ConfettiAnimation from "./assets/animations/confetti-1.json";

import "./App.css";
import "./animation.css";
import "./assets/fonts/fontfaces.css";

function App() {
  const [currentMemeIndex, setCurrentMemeIndex] = useState<number>(() => {
    const cachedIndex = localStorage.getItem("currentMemeIndex");
    return cachedIndex ? parseInt(cachedIndex, 10) : 0;
  });
  const [memes, setMemes] = useState<Meme[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [imageBackgroundColor, setImageBackgroundColor] = useState("");
  const myTotalLikes = memes.reduce((acc, meme) => acc + meme.myLikes, 0);
  const [showMaxLikesAlert, setShowMaxLikesAlert] = useState(false);
  const [alertTimeoutId, setAlertTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const likeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    initializeMemes();
  }, []);

  useEffect(() => {
    if (memes.length > 0) {
      localStorage.setItem("cachedMemes", JSON.stringify(memes));
    }
  }, [memes]);

  useEffect(() => {
    localStorage.setItem("currentMemeIndex", currentMemeIndex.toString());
  }, [currentMemeIndex]);

  useEffect(() => {
    setImageLoading(true);
    setVideoLoading(true);
    setShowMaxLikesAlert(false);
    if (alertTimeoutId) {
      clearTimeout(alertTimeoutId);
      setAlertTimeoutId(null);
    }
    if (memes.length > 0 && currentMemeIndex < memes.length && memes[currentMemeIndex].isVideo) {
      setImageBackgroundColor("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMemeIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        if (memes.length > 0 && currentMemeIndex < memes.length) {
          setCurrentMemeIndex(currentMemeIndex + 1);
        }
      } else if (event.key === "ArrowLeft") {
        if (memes.length > 0 && currentMemeIndex > 0 && currentMemeIndex < memes.length) {
          setCurrentMemeIndex(currentMemeIndex - 1);
        }
      } else if (event.key === "l" || event.key === "L") {
        if (memes.length > 0 && currentMemeIndex < memes.length) {
          triggerLikeButtonClick();
        }
      } else if ((event.key === "r" || event.key === "R") && currentMemeIndex === memes.length) {
        restartApp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMemeIndex, memes]);

  const initializeMemes = async () => {
    const cachedMemes = localStorage.getItem("cachedMemes");
    if (cachedMemes) {
      const cachedMemesData = JSON.parse(cachedMemes);
      const fetchedMemes = await getMemes();
      const fetchedMemesMap = new Map(fetchedMemes.map((meme) => [meme.id, meme]));
      const mergedMemes = cachedMemesData
        .filter((cachedMeme: Meme) => fetchedMemesMap.has(cachedMeme.id))
        .map((cachedMeme: Meme) => {
          const fetchedMeme = fetchedMemesMap.get(cachedMeme.id);
          fetchedMemesMap.delete(cachedMeme.id);
          return {
            ...fetchedMeme,
            selfliked: cachedMeme.selfliked,
            myLikes: cachedMeme.myLikes,
          };
        });
      mergedMemes.push(...Array.from(fetchedMemesMap.values()));
      // we more accurately initiate the index here because now the memes are loaded
      const cachedIndex = localStorage.getItem("currentMemeIndex");
      let index = cachedIndex ? parseInt(cachedIndex, 10) : 0;
      if (index < mergedMemes.length) {
        for (let i = index; i >= 0; i--) {
          if (!mergedMemes[i].isVideo) {
            index = i;
            break;
          }
        }
      } else {
        index = mergedMemes.length;
      }
      setCurrentMemeIndex(index);
      setMemes(mergedMemes);
    } else {
      setMemes(await getMemes());
    }
  };

  function restartApp() {
    localStorage.removeItem("cachedMemes");
    localStorage.removeItem("currentMemeIndex");
    setMemes([]);
    setCurrentMemeIndex(0);
    initializeMemes();
  }

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

  const handleLikeClick = () => {
    if (memes[currentMemeIndex].myLikes >= 10) {
      if (!alertTimeoutId) {
        setShowMaxLikesAlert(true);
        const timeoutId = setTimeout(() => {
          setShowMaxLikesAlert(false);
          setAlertTimeoutId(null);
        }, 5000);
        setAlertTimeoutId(timeoutId);
      }
    } else {
      likeMeme(memes, currentMemeIndex);
      const updatedMemes = memes.map((m, idx) => (idx === currentMemeIndex ? { ...m, totalLikes: m.totalLikes + 1, selfliked: true, myLikes: m.myLikes + 1 } : m));
      setMemes(updatedMemes);
    }
  };

  const triggerLikeButtonClick = () => {
    if (likeButtonRef.current) {
      likeButtonRef.current.click();
    }
  };

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
                <ButtonComponent text="Restart" textColor="#000000" backgroundColor="#DADADA" onClick={() => restartApp()} />
              </div>
            ) : (
              <div className="content-container">
                <div className="media-container" style={{ backgroundColor: imageBackgroundColor || "#e6e6e6" }}>
                  <TransitionGroup className="transition-group">
                    <CSSTransition key={currentMemeIndex} timeout={50} classNames="fade">
                      <div className="meme-content">
                        {memes[currentMemeIndex].isVideo ? (
                          <div className="meme-video" onMouseEnter={() => setShowVideoControls(true)} onMouseLeave={() => setShowVideoControls(false)}>
                            <Spin spinning={videoLoading} indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} delay={500}>
                              <ReactPlayer
                                className="react-player"
                                url={memes[currentMemeIndex].url}
                                loop={true}
                                playsinline={true}
                                controls={showVideoControls}
                                playing={memes[currentMemeIndex].isVideo}
                                width="100%"
                                height="100%"
                                onStart={() => setVideoLoading(false)}
                                style={{ opacity: videoLoading ? 0 : 1 }}
                              />
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
                    </CSSTransition>
                  </TransitionGroup>
                </div>
                <div className="control-container">
                  <div className="progress-bar-container">
                    <Progress percent={Math.round(((currentMemeIndex + 1) / memes.length) * 99)} status={"normal"} strokeColor={"#303030"} trailColor={"#E0E0E0"} />
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
                      ref={likeButtonRef}
                      text={`${memes[currentMemeIndex].totalLikes} Like${memes[currentMemeIndex].selfliked ? "d" : memes[currentMemeIndex].totalLikes === 1 ? "" : "s"}`}
                      textColor={memes[currentMemeIndex].selfliked ? "#FFFFFF" : "#F52257"}
                      backgroundColor={memes[currentMemeIndex].selfliked ? "#FF4D4F" : "#FFD9E2"}
                      minWidth="126px"
                      onClick={handleLikeClick}
                      disabled={memes[currentMemeIndex].myLikes >= 10}
                      autoDisableOnclick={false}
                      lottieAnimation={ConfettiAnimation}
                    />
                    <ButtonComponent text="Next Random Meme" textColor="#FFFFFF" backgroundColor="#303030" onClick={() => setCurrentMemeIndex(currentMemeIndex + 1)} iconRight={<ShuffleIcon color="#FFFFFF" />} />
                  </div>
                  {showMaxLikesAlert && (
                    <Alert
                      message="You've reached the limit of 10 likes"
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
