import React, { useState } from 'react';
import './App.css';

/*
  PUBLIC_INTERFACE
  Main ThumbGrabber App component.
  - Lets user input a YouTube URL.
  - Validates and extracts video ID.
  - Calls YouTube Data API (with provided API key) to get the thumbnail.
  - Renders thumbnail and download button.
*/
function App() {
  // State
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Provided API key from prompt
  const YT_API_KEY = "AIzaSyDeUqxgpzrSQHBPh1JhxaQhFpE7UQYAZq0";

  // Extract YouTube video ID from a valid URL
  // PUBLIC_INTERFACE
  function extractVideoId(youtubeUrl) {
    /** 
     * Extract the YouTube video ID from various possible YouTube URL formats.
     * Returns '' if invalid/unmatched.
     */
    if (!youtubeUrl) return '';
    // Covers youtu.be/VIDEOID, youtube.com/watch?v=VIDEOID, embed, shorts, etc.
    const exp =
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:\S*&)?v=|embed\/|v\/|shorts\/|user\/\S+|c\/\S+|.+#v=))([a-zA-Z0-9_-]{11})/;
    const match = youtubeUrl.match(exp);
    // Direct check for v= in query string (for full URLs too)
    let id = '';
    if (match && match[1]) {
      id = match[1];
    } else {
      // Try just ?v= scenario
      const urlObj = (() => { try { return new URL(youtubeUrl); } catch { return null; } })();
      if (urlObj && urlObj.searchParams.get('v')) {
        id = urlObj.searchParams.get('v');
      }
    }
    if (id && id.length === 11) return id;
    return '';
  }

  // PUBLIC_INTERFACE
  async function fetchThumbnail(videoId) {
    /**
     * Uses YouTube Data API v3 videos.list
     * https://developers.google.com/youtube/v3/docs/videos/list
     * API key is from prompt.
     * Returns the high-quality thumbnail URL, or empty string on error.
     */
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YT_API_KEY}&id=${videoId}&part=snippet`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (
        data &&
        data.items &&
        data.items.length > 0 &&
        data.items[0].snippet &&
        data.items[0].snippet.thumbnails
      ) {
        // Preferred order: maxres, standard, high, medium, default
        const thumbs = data.items[0].snippet.thumbnails;
        return (
          thumbs.maxres?.url ||
          thumbs.standard?.url ||
          thumbs.high?.url ||
          thumbs.medium?.url ||
          thumbs.default?.url ||
          ''
        );
      } else {
        return '';
      }
    } catch (error) {
      return '';
    }
  }

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    /**
     * Handles user clicking "Fetch Thumbnail" or submitting form.
     */
    e.preventDefault();
    setError('');
    setThumbnailUrl('');
    setVideoId('');
    setLoading(true);

    // Validate and extract video ID
    const id = extractVideoId(url.trim());
    if (!id) {
      setLoading(false);
      setError('Please enter a valid YouTube video URL.');
      return;
    }
    setVideoId(id);

    // Fetch thumbnail from YouTube API
    const thumb = await fetchThumbnail(id);
    if (thumb) {
      setThumbnailUrl(thumb);
    } else {
      setError('Could not fetch the thumbnail for this video. It may be private, deleted, or your API quota is exceeded.');
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  function handleDownload() {
    /**
     * Triggers the download of the fetched thumbnail.
     */
    if (!thumbnailUrl) return;
    const link = document.createElement('a');
    link.href = thumbnailUrl;
    link.download = `youtube_thumbnail_${videoId || 'video'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar" style={{ background: "#1E90FF" }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span
                className="logo-symbol"
                style={{ color: '#FF6347', marginRight: 4 }}
              >*</span>{" "}
              ThumbGrabber
            </div>
            <button className="btn" style={{ background: "#FF6347" }}>by KAVIA AI</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <div className="container">
          <div className="hero" style={{ minHeight: "70vh" }}>
            <div className="subtitle">Fetch & download any YouTube video thumbnail</div>
            <h1 className="title" style={{ color: "#1E90FF" }}>YouTube Thumbnail Grabber</h1>
            <div className="description" style={{ color: "#444", fontWeight: 400 }}>
              Paste the URL of any YouTube video.<br />
              Instantly grab its high-quality thumbnail!
            </div>

            <form
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: "100%",
                maxWidth: 450,
                margin: "0 auto"
              }}
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <input
                type="text"
                className="input"
                placeholder="Enter YouTube URL..."
                value={url}
                style={{
                  padding: "14px 14px",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  outline: "none"
                }}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                required
              />
              <button
                className="btn btn-large"
                style={{ background: "#1E90FF", width: "100%" }}
                type="submit"
                disabled={loading}
              >
                {loading ? "Fetching..." : "Fetch Thumbnail"}
              </button>
            </form>
            {error && (
              <div style={{ color: "#FF6347", paddingTop: 10 }}>
                {error}
              </div>
            )}
            {thumbnailUrl && (
              <div style={{ marginTop: 32 }}>
                <img
                  src={thumbnailUrl}
                  alt="YouTube Thumbnail"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 350,
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.13)"
                  }}
                />
                <div>
                  <button
                    className="btn"
                    style={{ background: "#FF6347", marginTop: 18, width: 180 }}
                    onClick={handleDownload}
                  >
                    Download Thumbnail
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
