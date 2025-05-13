const axiosInstance = require("../lib/axios.lib");
const { Movie } = require("../models");

const getActors = async (movieId) => {
  const actorDetails = await axiosInstance.get(`/movie/${movieId}/credits`);
  const casts = actorDetails.data.cast; //array
  const actors = casts.map((cast) => cast.name);

  return actors.slice(0, 5).join(", ");
};

const createSlug = (name) => {
  console.log("slug created");
  return name.toLowerCase().split(" ").join("-");
};

const movieExistsInDB = async (movieId) => {
  const isMovieFound = await Movie.findOne({
    where: {
      tmdbId: movieId,
    },
  });

  return isMovieFound ? true : false;
};

const fetchMovieAndCastDetails = async (tmdbId) => {
  //fetching movie details
  const movieDetails = await axiosInstance.get(`/movie/${tmdbId}`);

  //fetching actors details
  const actorDetails = await axiosInstance.get(`/movie/${tmdbId}/credits`);

  const {
    title,
    genres: genre,
    "": actors,
    release_date: releaseYear,
    vote_average: rating,
    overview: description,
  } = movieDetails.data;

  const movieData = {
    title,
    tmdbId,
    genre,
    actors,
    releaseYear,
    rating,
    description,
  };

  //Genre should be in Text Strings with separate by ,
  let genreArr = movieData.genre;
  let n = genreArr.length;

  movieData.genre = genreArr.reduce((acc, genre, index) => {
    if (index !== n - 1) {
      acc += genre.name + ", ";
    } else {
      acc += genre.name;
    }
    return acc;
  }, "");

  //fetching releaseYear
  movieData.releaseYear = parseInt(movieData.releaseYear.split("-")[0]);

  //fetching first 5 actors
  const castArr = actorDetails.data.cast;
  const casts = castArr.slice(0, 5);
  let castsLen = casts.length;

  movieData.actors = casts.reduce((acc, cast, index) => {
    if (index !== castsLen - 1) {
      acc += cast.name + ", ";
    } else {
      acc += cast.name;
    }

    return acc;
  }, "");

  return movieData;
};

module.exports = {
  getActors,
  createSlug,
  movieExistsInDB,
  fetchMovieAndCastDetails,
};
