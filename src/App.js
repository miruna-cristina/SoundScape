// App.js
import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import GenreMap from "./GenreMap";
import SongCard from "./Songcard";
import * as d3 from "d3";
import "./App.css";

function App() {
  const [geoData, setGeoData] = useState(null);
  const [genreData, setGenreData] = useState([]);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [subgenreData, setSubgenreData] = useState([]);
  const [view, setView] = useState({ type: "genres", genre: null, subgenre: null });
  const [processedGenres, setProcessedGenres] = useState([]);
  const delaunayRef = useRef(null);

  useEffect(() => {
    // Parse the CSV file and build genre data
    Papa.parse("/spotify_songs_with_links.csv", {
      download: true,
      header: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          console.error("No data found in the CSV file");
          return;
        }
  
        const validSongs = results.data.filter(song => song.track_name && song.playlist_genre && song.track_popularity);
  
        const genres = Array.from(
          d3.group(validSongs, (d) => d.playlist_genre),
          ([genre, songs]) => {
            const subgenres = Array.from(
              d3.group(songs, (d) => d.playlist_subgenre),
              ([subgenre, subgenreSongs]) => {
                const songsWithDetails = subgenreSongs.map((song) => {
                  const vibeMatch = {
                    danceable:
                      ((parseFloat(song.danceability) || 0) +
                        (parseFloat(song.tempo) / 200 || 0) +
                        (parseFloat(song.liveness) || 0)) /
                      3 *
                      100,
                    energetic:
                      ((parseFloat(song.energy) || 0) +
                        ((parseFloat(song.loudness) + 60) / 120 || 0)) /
                      2 *
                      100,
                    happy:
                      ((parseFloat(song.valence) || 0) +
                        (parseFloat(song.mode) || 0) +
                        (parseFloat(song.speechiness) || 0)) /
                      3 *
                      100,
                  };
  
                  // Safely calculate stars
                  const stars = Math.ceil((parseFloat(song.track_popularity) || 0) / 20);
  
                  // Safely extract release year
                  const releaseYear = song.track_album_release_date
                    ? song.track_album_release_date.split("-")[0]
                    : "Unknown Year";
  
                  return {
                    title: song.track_name || "Unknown Title",
                    artist: song.track_artist || "Unknown Artist",
                    genre: song.playlist_genre || "Unknown Genre",
                    subgenre: song.playlist_subgenre || "Unknown Subgenre",
                    vibeMatch,
                    link: song.link, // Use the link directly from the CSV
                    releaseYear, // Add release year
                    stars, // Add star rating
                  };
                });
  
                return {
                  name: subgenre,
                  songs: songsWithDetails,
                };
              }
            );
  
            return {
              name: genre,
              subgenres,
            };
          }
        );
  
        setGenreData(genres.filter((g) => g.name)); // Set processed genre data
      },
    });
  }, []);
  

  useEffect(() => {
    if (genreData.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const customColors = ["#231942", "#B388EB", "#DB2763", "#09BC8A", "#79A9D1", "#D5AC4E"];

    const processed = genreData.map((d, i) => ({
      name: d.name,
      x: (i % 3) * (width / 3) + width / 6,
      y: Math.floor(i / 3) * (height / 2) + height / 4,
      color: customColors[i % customColors.length],
      subgenres: d.subgenres,
    }));

    setProcessedGenres(processed);

    const delaunay = d3.Delaunay.from(
      processed,
      (d) => d.x,
      (d) => d.y
    );
    delaunayRef.current = delaunay;
  }, [genreData]);

  useEffect(() => {
    if (processedGenres.length === 0 || !delaunayRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const currentScale = transform.k;
    const scaleThreshold = 1.5;

    if (currentScale > scaleThreshold) {
      const [x, y] = transform.invert([width / 2, height / 2]);
      const index = delaunayRef.current.find(x, y);
      const focusedGenre = processedGenres[index];

      if (focusedGenre) {
        const radius = 130; // Distance from the main genre
        const newSubgenreData = focusedGenre.subgenres.map((sub, j) => {
          const angle = (j / focusedGenre.subgenres.length) * 2 * Math.PI; // Spread around a circle
          const subX = focusedGenre.x + radius * Math.cos(angle);
          const subY = focusedGenre.y + radius * Math.sin(angle);

          return {
            id: `${focusedGenre.name}-${sub.name}`,
            name: sub.name,
            x: subX,
            y: subY,
            songs: sub.songs,
            color: "#FFC300",
          };
        });

        setSubgenreData(newSubgenreData);
      }
    } else {
      setSubgenreData([]);
    }
  }, [transform, processedGenres]);

  const handleBack = () => setView({ type: "genres", genre: null, subgenre: null });

  const handleSubgenreSelect = (subgenre) => setView({ type: "songs", genre: subgenre.parent, subgenre });

  return (
    <div style={{ width: "100%", height: "100vh", background: "#1a1a2e", overflow: "hidden", position: "relative" }}>
    {/* Back Button Positioned Outside */}
    {view.type === "songs" && view.subgenre && (
      <button onClick={handleBack} className="back-button">
        Back
      </button>
    )}
      <GenreMap
        data={processedGenres}
        subgenreData={subgenreData}
        transform={transform}
        setTransform={setTransform}
        onSubgenreSelect={handleSubgenreSelect}
      />
      {view.type === "songs" && view.subgenre && (
        <div className="song-card-overlay">
          {view.subgenre.songs.map((song, index) => (
            <SongCard key={index} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
