import './App.css';

import React, { useState } from "react";

const MovieApp = () => {
  const dummyMovie = {
    title: "No movie to show",
    plot: "",
    poster: "https://as1.ftcdn.net/v2/jpg/03/95/42/94/1000_F_395429472_LNyOoV7eRXm76HIIBBHOciyHEtiwS1Ed.jpg",
    imdb: { rating: 0 },
    languages: [""],
    countries: [""],
    score: 0
  };

  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("Vector");
  const [showOptions, setShowOptions] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState("");

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
    setShowCode(false);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setShowOptions(false);
    setShowCode(false);
  };

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    setShowOptions((prevShow) => !prevShow);
  };

  const updateCode = (e) => {
    e.preventDefault();
    if (showCode) {
      setShowCode(false);
      return;
    }

    let currCode;

    if (selectedOption === 'Vector') {
      currCode = `
  // getEmbeddings function can leverage OpenAI API or something similar

  {
    "$search": {
      "index": "default",
      "knnBeta": {
        "vector": getEmbeddings("${searchQuery}"),
        "path": "plot_embedding",
        "k": 5
      }
    }
  }`;
    }
    else {
      currCode = `
  {
    "$search": {
      "index": "default",
      "text": {
        "query": "${searchQuery}",
        "path": "plot"
      }
    }
  }`;
    }

    setCode(currCode);
    setShowCode(true);
  }

  const handleSubmit = (e) => {
    setMovies([]);
    e.preventDefault();
    fetchMovies();
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(
        `https://ap-south-1.aws.data.mongodb-api.com/app/vector-vkqrr/endpoint/findMovie?m=${selectedOption}&s=${encodeURIComponent(searchQuery)}`
      );

      const similarMovies = (await response.json()).results;

      if (Array.isArray(similarMovies)) {
        if (similarMovies.length > 0) {
          setMovies(similarMovies);
        }
        else {
          dummyMovie.plot = 'Try again with a different search query';
          setMovies([dummyMovie]);
        }
      }
      else {
        dummyMovie.plot = 'This could be due to exceeded rate limit. Please try again after some time.';
        setMovies([dummyMovie]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  return (
    <div>
      <div className='powered'>
        <div className='flexDiv'></div>
        <img height={24} src="https://mongodb.com/favicon.ico"></img>
        <p className='powered-text'><em>Powered by MongoDB Atlas Vector Search</em></p>
        <div className='flexDiv'></div>
      </div>
      <h1 className='subject'>What's that movie where...</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Enter plot here..."
        />
        <div className="dropdown">
          <button className="dropdown-button submit-button" disabled={searchQuery.trim() === ''} type="submit">
            {selectedOption === "Standard" ? "Standard Search" : "Vector Search"}
          </button>
          <button className="dropdown-button arrow" onClick={handleDropdownToggle}>▼</button>
          <button className="dropdown-button code-button" onClick={updateCode}>{showCode ? `{-}` : `{+}`}</button>
          {showOptions && (
            <div className="dropdown-content">
              <button onClick={() => handleOptionChange("Standard")}>Standard Search</button>
              <button onClick={() => handleOptionChange("Vector")}>Vector Search</button>
            </div>
          )}
        </div>
      </form>
      {
        showCode &&
        <div className='container'>
          <div className='flexDiv'></div>
          <iframe className='chart' width="480" height="360" src="https://charts.mongodb.com/charts-ajayraghav-qlztg/embed/charts?id=64bbc28b-48a7-459b-8129-70f16c33e921&maxDataAge=300&theme=dark&autoRefresh=true"></iframe>
          <div className='code'>
            <pre>
              <code>{code}</code>
            </pre>
          </div>
          <div className='flexDiv'></div>
        </div>
      }
      <div className="movies">
        {movies.map((movie) => (
          <div key={movie._id} className="movie">
            <div className='rating'>
              <h2 className='title'>{movie.title}</h2>
              <p>{(movie.imdb || { rating: 0 }).rating || "N/A"}</p>
            </div>
            <h4 className='year'>{movie.year || 'Unknown'} | {(movie.countries || [""])[0]} | {(movie.languages || [""])[0]}</h4>
            <h5><em>Search score: {movie.score}</em></h5>
            <p className='plot'>{movie.fullplot || movie.plot}</p>
            <img src={movie.poster || "https://as1.ftcdn.net/v2/jpg/03/95/42/94/1000_F_395429472_LNyOoV7eRXm76HIIBBHOciyHEtiwS1Ed.jpg"} alt={`${movie.title} Poster`} onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = "https://as1.ftcdn.net/v2/jpg/03/95/42/94/1000_F_395429472_LNyOoV7eRXm76HIIBBHOciyHEtiwS1Ed.jpg";
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieApp;
