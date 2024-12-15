import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import InfiniteScroll from 'react-infinite-scroll-component';
import SongCard from './Songcard';

async function fetchLastFmTrackDetails(artist, trackName) {
  const API_KEY = "0df024a5eb8e647a56078f3007121513"; // Your Last.fm API key
  
  if (!artist || !trackName) {
    console.warn("Skipping due to missing artist or track name:", { artist, trackName });
    return { cover: "https://via.placeholder.com/150?text=No+Cover" };
  }

  const cleanedTrackName = trackName
    .replace(/[\(\)\[\]\{\}\-]/g, "") // Remove parentheses, brackets, dashes
    .replace(/\s+/g, " ") // Normalize multiple spaces
    .replace(/feat\./gi, "ft") // Normalize "feat." to "ft"
    .toLowerCase()
    .trim();

  const cleanedArtist = artist
    .replace(/\s+/g, " ") // Normalize spaces
    .toLowerCase()
    .trim();

  console.log(`Fetching Last.fm details for: Artist: ${cleanedArtist}, Track: ${cleanedTrackName}`);

  const url = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(
    cleanedArtist
  )}&track=${encodeURIComponent(cleanedTrackName)}&format=json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Last.fm API error: ${response.status}`);
      return { cover: "https://via.placeholder.com/150?text=No+Cover+Found" };
    }

    const data = await response.json();

    // Track-level cover
    if (data?.track?.album?.image?.[2]?.["#text"]) {
      return { cover: data.track.album.image[2]["#text"] };
    }

    // Backup: Album-level cover
    console.warn(`No track-level cover found for ${cleanedArtist} - ${cleanedTrackName}, trying album-level search.`);
    const albumUrl = `http://ws.audioscrobbler.com/2.0/?method=album.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(
      cleanedArtist
    )}&album=${encodeURIComponent(data?.track?.album?.title || "")}&format=json`;

    const albumResponse = await fetch(albumUrl);
    const albumData = await albumResponse.json();

    if (albumData?.album?.image?.[2]?.["#text"]) {
      return { cover: albumData.album.image[2]["#text"] };
    }

    return { cover: "https://via.placeholder.com/150?text=No+Cover+Found" };
  } catch (error) {
    console.error("Error fetching track details from Last.fm:", error);
    return { cover: "https://via.placeholder.com/150?text=Error" };
  }
}


function App() {
  const [songs, setSongs] = useState([]); // Full dataset
  const [displayedSongs, setDisplayedSongs] = useState([]); // Songs displayed on the screen
  const [hasMore, setHasMore] = useState(true); // Whether more songs can be loaded
  const SONGS_PER_BATCH = 20; // Number of songs to load per scroll

  useEffect(() => {
    // Parse CSV and fetch Spotify details
    Papa.parse('/spotify_songs.csv', {
      download: true,
      header: true,
      complete: async (results) => {
        console.log("Parsed CSV data:", results.data); // Debug log for parsed data

        // Process each row in the CSV
        const parsedSongs = await Promise.all(
          results.data.map(async (row) => {
            const trackDetails = await fetchSpotifyTrackDetails(row.track_id);

            return {
              title: row.track_name || "Unknown Title",
              artist: row.track_artist || "Unknown Artist",
              genre: row.playlist_genre || "Unknown Genre",
              subgenre: row.playlist_subgenre || "Unknown Subgenre",
              cover: `https://via.placeholder.com/150?text=${row.track_name || "No Image"}`,
              audioPreview: trackDetails?.previewUrl || null,
              spotifyUrl: trackDetails?.spotifyUrl || null,
              vibeMatch: {
                danceable: row.danceability
                  ? ((2 * parseFloat(row.danceability) + parseFloat(row.tempo) / 200 + parseFloat(row.liveness)) / 4) * 100
                  : 0,
                energetic: row.energy
                  ? ((2 * parseFloat(row.energy) + (parseFloat(row.loudness) + 60) / 120 + parseFloat(row.acousticness)) / 4) * 100
                  : 0,
                happy: row.valence
                  ? ((parseFloat(row.valence) + parseFloat(row.mode) + parseFloat(row.speechiness)) / 3) * 100
                  : 0,
              },
            };
          })
        );

        // Log the processed songs for debugging
        console.log("Processed Songs:", parsedSongs);

        // Initialize the state with the first batch of songs
        setSongs(parsedSongs.filter((song) => song !== null)); // Filter out invalid rows
        setDisplayedSongs(parsedSongs.slice(0, SONGS_PER_BATCH));
      },
    });
  }, []);

  // Function to load more songs
  const fetchMoreSongs = () => {
    if (displayedSongs.length >= songs.length) {
      setHasMore(false); // Stop loading when all songs are displayed
      return;
    }

    const nextBatch = songs.slice(
      displayedSongs.length,
      displayedSongs.length + SONGS_PER_BATCH
    );
    setDisplayedSongs((prev) => [...prev, ...nextBatch]); // Append the next batch
  };

  return (
    <InfiniteScroll
      dataLength={displayedSongs.length} // Length of currently displayed songs
      next={fetchMoreSongs} // Function to fetch more data
      hasMore={hasMore} // Whether there's more data to load
      loader={<h4>Loading more songs...</h4>} // Loading indicator
      endMessage={<p>No more songs to display.</p>} // End message
    >
      {displayedSongs.map((song, index) => (
        <SongCard key={index} song={song} />
      ))}
    </InfiniteScroll>
  );
}

export default App;
