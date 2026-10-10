
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import axios from "axios";
import "./MovieApp.css";

const MovieApp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  // Fetch movie genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          "https://api.themoviedb.org/3/genre/movie/list",
          {
            params: {
              api_key: API_KEY,
            },
          }
        );

        setGenres(response.data.genres);
      } catch (err) {
        setError("Unable to load genres.");
      }
    };

    fetchGenres();
  }, [API_KEY]);

  // Fetch movies or search results
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError("");

      try {
        let response;

        if (submittedQuery.trim()) {
          // Search movies
          response = await axios.get(
            "https://api.themoviedb.org/3/search/movie",
            {
              params: {
                api_key: API_KEY,
                query: submittedQuery,
                sort_by: sortBy,
                with_genres: selectedGenre || undefined,
              },
            }
          );

          // Filter search results by selected genre
          if (selectedGenre) {
            response.data.results = response.data.results.filter(
              (movie) => movie.genre_ids.includes(Number(selectedGenre))
            );
          }

          // Sort search results
          const sortFunctions = {
            "popularity.asc": (a, b) => a.popularity - b.popularity,
            "popularity.desc": (a, b) => b.popularity - a.popularity,
            "vote_average.asc": (a, b) => a.vote_average - b.vote_average,
            "vote_average.desc": (a, b) => b.vote_average - a.vote_average,
            "primary_release_date.asc": (a, b) =>
              (a.release_date || "").localeCompare(b.release_date || ""),
            "primary_release_date.desc": (a, b) =>
              (b.release_date || "").localeCompare(a.release_date || ""),
          };

          response.data.results.sort(sortFunctions[sortBy]);
        } else {
          // Discover movies
          response = await axios.get(
            "https://api.themoviedb.org/3/discover/movie",
            {
              params: {
                api_key: API_KEY,
                sort_by: sortBy,
                with_genres: selectedGenre || undefined,
              },
            }
          );
        }

        setMovies(response.data.results);
      } catch (err) {
        console.error("Movie error:", err);
        setError("Unable to load movies. Please check your API key.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    if (API_KEY) {
      fetchMovies();
    } else {
      setError("API key missing. Please add it to your .env file.");
    }
  }, [API_KEY, submittedQuery, sortBy, selectedGenre]);

  // Search form submit
  const handleInputSubmit = (e) => {
    e.preventDefault(); //ye page reload hone se rokta h 
    setSubmittedQuery(searchQuery.trim());//.trim ka kaam h spase ko remove karna string se
  };

  // Clear search and show all movies
  const handleClearSearch = () => {
    setSearchQuery("");
    setSubmittedQuery("");
  };

  return (
    <div className="app">
      <h1 className="h">MovieHouse 🎬</h1>

      {/* Search */}
      <form className="input-container" onSubmit={handleInputSubmit}>
        <input
          type="text"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button type="submit" aria-label="Search movies">
          <IoIosSearch className="search-icon" />
        </button>

        {submittedQuery && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        )}
      </form>

      {/* Filters */}
      <div className="movie-list">
        <label htmlFor="sort">Sort By:</label>

        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="popularity.desc">Popularity Descending</option>
          <option value="popularity.asc">Popularity Ascending</option>
          <option value="vote_average.desc">Rating Descending</option>
          <option value="vote_average.asc">Rating Ascending</option>
          <option value="primary_release_date.desc">
            Release Date Descending
          </option>
          <option value="primary_release_date.asc">
            Release Date Ascending
          </option>
        </select>

        <label htmlFor="genre">Genre:</label>

        <select
          id="genre"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">All Genres</option>

          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status messages */}
      {loading && <p className="message">Loading movies...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && movies.length === 0 && (
        <p className="message">No movies found.</p>
      )}

      {/* Movie cards */}
      <div className="movies">
        {movies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://placehold.co/300x450?text=No+Image"
              }
              alt={movie.title || "Movie poster"}
              loading="lazy"
            />

            <div className="movie-info">
              <h2>{movie.title}</h2>

              <p>
                ⭐ {Number(movie.vote_average || 0).toFixed(1)} / 10
              </p>

              <p>
                Release Date: {movie.release_date || "Not available"}
              </p>

              <p className="overview">
                {movie.overview || "No description available."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieApp;
