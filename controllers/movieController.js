const { Op, where, fn, col } = require("sequelize");
const axiosInstance = require("../lib/axios.lib.js");
const {
  Watchlist,
  Movie,
  Wishlist,
  CuratedListItem,
  Review,
} = require("../models/index.js");

const {
  validateSearchMovie,
  validateReviewAndRating,
  validateSortByRatingOrReleaseYear,
} = require("../validation/index.js");

const { getActors } = require("../utils/index.js");

const searchMovie = async (req, res) => {
  const error = validateSearchMovie(req.query.query);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const searchQuery = req.query.query;

    const response = await axiosInstance.get("/search/movie", {
      params: {
        query: searchQuery,
      },
    });

    const movies = response.data.results;

    if (movies.length === 0) {
      return res.status(404).json({ error: "No movies found." });
    }

    const movieData = await Promise.all(
      movies.map(async (movie) => {
        const {
          original_title: title,
          id: tmdbId,
          vote_average: rating,
          overview: description,
        } = movie;

        const genre = movie.genre_ids.join(", ");
        const releaseYear = movie.release_date.split("-")[0];
        const actors = await getActors(tmdbId); //returning an array of promises, therefore wrap the map function inside promise.all.

        return {
          title,
          tmdbId,
          genre,
          actors,
          releaseYear,
          rating,
          description,
        };
      })
    );

    res.status(200).json({ movies: movieData });
  } catch (error) {
    console.log(error);
    if (
      error.response.status === 401 &&
      error.response.data.status_message ===
        "Invalid API key: You must be granted a valid key."
    ) {
      return res
        .status(401)
        .json({ error: "Invalid API key: You must be granted a valid key." });
    }
    if (
      error.response.status === 404 &&
      error.response.data.status_message ===
        "The resource you requested could not be found."
    ) {
      return res
        .status(404)
        .json({ error: "The resource you requested could not be found." });
    }
    res.status(500).json({ error: error.message });
  }
};

const addReviewAndRatingToMovies = async (req, res) => {
  const { rating, reviewText } = req.body;
  const errors = validateReviewAndRating(rating, reviewText);
  if (errors.length !== 0) {
    return res.status(400).json({ errors });
  }

  try {
    const movieId = parseInt(req.params.movieId);

    //check if movie exists in db or not
    const isMovie = await Movie.findOne({
      where: {
        id: movieId,
      },
    });

    if (!isMovie) {
      return res.status(404).json({ error: "movie doesn't exists." });
    }

    const review = await Review.create({ movieId, rating, reviewText });

    res.status(201).json({ message: "review created successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const searchByGenreAndActor = async (req, res) => {
  try {
    const { genre, actor } = req.query;

    //iLike for case insestive searching only for postgres
    const movies = await Movie.findAll({
      where: {
        [Op.and]: [
          where(fn("LOWER", col("genre")), {
            [Op.like]: `%${genre.toLowerCase()}%`,
          }),
          where(fn("LOWER", col("actors")), {
            [Op.like]: `%${actor.toLowerCase()}%`,
          }),
        ],
      },
    });

    if (movies.length === 0) {
      return res.status(404).json({ error: "No movies found." });
    }

    res.status(200).json(movies);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const sortByRatingOrReleaseYear = async (req, res) => {
  const errors = validateSortByRatingOrReleaseYear(req.query);
  if (errors.length !== 0) {
    return res.status(400).json({ errors });
  }

  try {
    const { list, sortBy, order } = req.query;

    let movieList;
    if (list.toLowerCase() === "watchlist") {
      movieList = await Watchlist.findAll();
    } else if (list.toLowerCase() === "wishlist") {
      movieList = await Wishlist.findAll();
    } else {
      movieList = await CuratedListItem.findAll();
    }

    if (movieList.length === 0) {
      return res.status(404).json({ error: "No movies found." });
    }

    const movies = await Promise.all(
      movieList.map(async (movieObj) => {
        const movie = await Movie.findOne({
          where: {
            id: movieObj.movieId,
          },
        });
        return movie;
      })
    );

    movies.sort((movie1, movie2) => {
      if (sortBy === "rating") {
        return order.toLowerCase() === "asc"
          ? movie1.rating - movie2.rating
          : movie2.rating - movie1.rating;
      } else {
        return order.toLowerCase() === "asc"
          ? movie1.releaseYear - movie2.releaseYear
          : movie2.releaseYear - movie1.releaseYear;
      }
    });

    res.status(200).json({ movies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTop5Movies = async (req, res) => {
  try {
    const movies = await Movie.findAll({
      order: [["rating", "desc"]],
      limit: 5,
    });

    if (movies.length === 0) {
      return res.status(404).json({ error: "No movies found." });
    }

    const top5Movies = movies.map((movie) => {
      const { title, rating, description } = movie;
      const count = description.split(" ").length;
      const review = {
        text: description,
        wordCount: count,
      };
      return { title, rating, review };
    });

    res.status(200).json(top5Movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  searchMovie,
  addReviewAndRatingToMovies,
  searchByGenreAndActor,
  sortByRatingOrReleaseYear,
  getTop5Movies,
};
