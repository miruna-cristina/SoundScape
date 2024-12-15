import React, { useState } from "react";
import { FaPlay, FaStar, FaRegStar } from "react-icons/fa";
import "./Songcard.css";
import "./Slider.css";

function SongCard({ song }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const generateGradient = () => {
    const { danceable = 0, energetic = 0, happy = 0 } = song.vibeMatch || {};
    const danceColor = `rgba(227, 18, 164, ${danceable / 100})`; // Pink
    const energyColor = `rgba(63, 81, 181, ${energetic / 100})`; // Blue
    const happyColor = `rgba(76, 175, 80, ${happy / 100})`; // Green

    return `linear-gradient(135deg, ${danceColor}, ${energyColor}, ${happyColor}, ${danceColor})`;
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevent flipping the card when play is clicked
    window.open(song.link, "_blank"); // Open the song's link in a new tab
  };

  return (
    <div className="song-card-container">
      <div
        className={`song-card ${isFlipped ? "flipped" : ""}`}
        onClick={handleCardClick}
      >
        {/* Front Side */}
        <div className="front-side">
          {/* Cover with Gradient */}
          <div
            className="song-cover"
            style={{ background: generateGradient() }}
          >
            {/* Play Button */}
            <div className="play-button" onClick={handlePlayClick}>
              <FaPlay />
            </div>
          </div>
          <h3 className="song-title">{song.title}</h3>
          <p className="song-artist">by {song.artist}</p>
          <div className="genre-subgenre-container">
          <div className="genre-subgenre-releaseyear-container">
          <div className="genre">
            <strong>Genre:</strong> {song.genre}
          </div>
          <div className="subgenre">
            <strong>Subgenre:</strong> {song.subgenre}
          </div>
          <div className="releaseyear">
            <strong>Year of release:</strong> {song.releaseYear}
          </div>
        </div>
        <div className="popularity-container">
        <p className="popularity-label">Popularity</p>
        <div className="popularity-stars">
            {Array.from({ length: 5 }).map((_, i) =>
              i < song.stars ? (
                <FaStar key={i} className="filled-star" />
              ) : (
                <FaRegStar key={i} className="empty-star" />
              )
            )}
          </div>
          </div>
        </div>
      </div>

        {/* Back Side */}
        <div className="back-side">
          <h3>Vibe Match</h3>
          <div>
            <h4>Danceable</h4>
            <input
              className="slider danceable-slider"
              type="range"
              min="0"
              max="100"
              value={song.vibeMatch?.danceable || 0}
              readOnly
              style={{
                background: `linear-gradient(to right, rgba(227, 18, 164, 1) ${
                  song.vibeMatch?.danceable || 0
                }%, rgba(255, 255, 255, 0.3) ${
                  song.vibeMatch?.danceable || 0
                }%)`,
              }}
            />
          </div>
          <div>
            <h4>Energetic</h4>
            <input
              className="slider energetic-slider"
              type="range"
              min="0"
              max="100"
              value={song.vibeMatch?.energetic || 0}
              readOnly
              style={{
                background: `linear-gradient(to right, rgba(63, 81, 181, 1) ${
                  song.vibeMatch?.energetic || 0
                }%, rgba(255, 255, 255, 0.3) ${
                  song.vibeMatch?.energetic || 0
                }%)`,
              }}
            />
          </div>
          <div>
            <h4>Happy</h4>
            <input
              className="slider happy-slider"
              type="range"
              min="0"
              max="100"
              value={song.vibeMatch?.happy || 0}
              readOnly
              style={{
                background: `linear-gradient(to right, rgba(76, 175, 80, 1) ${
                  song.vibeMatch?.happy || 0
                }%, rgba(255, 255, 255, 0.3) ${
                  song.vibeMatch?.happy || 0
                }%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SongCard;
