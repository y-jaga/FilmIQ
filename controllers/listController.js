const {
  CuratedList,
  Watchlist,
  Movie,
  Wishlist,
  CuratedListItem,
} = require("../models");

const {
  createSlug,
  movieExistsInDB,
  fetchMovieAndCastDetails,
} = require("../utils");
const {
  validateCreateCuratedList,
  validateUpdateCuratedList,
  validateSaveMovie,
  validateSaveMovieToCuratedList,
} = require("../validation");

const createCuratedList = async (req, res) => {
  const errors = validateCreateCuratedList(req.body);
  if (errors.length !== 0) {
    return res.status(400).json({ errors });
  }

  try {
    const data = req.body;

    //create slug if not provided in request body
    if (!data.slug || data.slug.length === 0) {
      const slug = createSlug(data.name);
      data.slug = slug;
    }

    const response = await CuratedList.create(data);

    res.status(201).json({ message: "Curated list created successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const updateCuratedList = async (req, res) => {
  const id = parseInt(req.params.curatedListId);

  const errors = validateUpdateCuratedList(id, req.body);

  if (errors.length !== 0) {
    return res.status(400).json({ errors });
  }

  try {
    const data = req.body;
    const curatedList = await CuratedList.findOne({
      where: id,
    });

    if (!curatedList) {
      return res.status(404).json({ error: "curatedList not found." });
    }

    await curatedList.set(data);

    await curatedList.save();

    res.status(200).json({ message: "Curated list updated successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const saveMovieToWatchList = async (req, res) => {
  const { movieId } = req.body;
  const error = validateSaveMovie(movieId);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const isMovieFound = await movieExistsInDB(movieId);

    //if movie doesn't exists in db create a new entry in movies table
    let id;
    if (!isMovieFound) {
      const movieData = await fetchMovieAndCastDetails(movieId);
      const movie = await Movie.create(movieData);
      id = movie.id;
    }
    //if movie exists in db then search movie and take its 'id' to create watchlist
    else {
      const movie = await Movie.findOne({
        where: {
          tmdbId: movieId,
        },
      });
      id = movie.id;
    }

    const watchlist = await Watchlist.create({ movieId: id });

    res.status(201).json({ message: "Movie added to watchlist successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const saveMovieToWishList = async (req, res) => {
  const { movieId } = req.body;
  const error = validateSaveMovie(movieId);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const isMovieFound = await movieExistsInDB(movieId);

    //if movie doesn't exists in db create a new entry in movies table
    let id;
    if (!isMovieFound) {
      const movieData = await fetchMovieAndCastDetails(movieId);
      const movie = await Movie.create(movieData);
      id = movie.id;
    }
    //if movie exists in db then search movie and take its 'id' to create watchlist
    else {
      const movie = await Movie.findOne({
        where: {
          tmdbId: movieId,
        },
      });

      id = movie.id;
    }

    const wishList = await Wishlist.create({ movieId: id });

    res.status(201).json({ message: "Movie added to wishlist successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const saveMovieToCuratedList = async (req, res) => {
  const error = validateSaveMovieToCuratedList(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  try {
    const { movieId, curatedListId } = req.body;

    //check if curated lists exists in db or not
    const isCuratedList = await CuratedList.findOne({
      where: {
        id: curatedListId,
      },
    });

    if (!isCuratedList) {
      return res.status(404).json({ error: "curated list doesn't exists." });
    }

    //check if movie already exists in db
    const isMovieFound = await movieExistsInDB(movieId);

    //if movie doesn't exists in db create a new entry in movies table
    let movie;
    if (!isMovieFound) {
      const movieData = await fetchMovieAndCastDetails(movieId);
      movie = await Movie.create(movieData);
    }
    //if movie exists in db then search movie for taking its id
    else {
      movie = await Movie.findOne({
        where: {
          tmdbId: movieId,
        },
      });
    }

    //check if movie already exists in curatedListItems
    const doesMovieInCuratedListItems = await CuratedListItem.findOne({
      where: {
        movieId,
      },
    });

    //if movie doesn't exists in curatedListItem then create it
    if (!doesMovieInCuratedListItems) {
      await CuratedListItem.create({
        curatedListId,
        movieId: movie.id,
      });
    }

    res.status(201).json({
      message: "Movie added to curated list items successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCuratedList,
  updateCuratedList,
  saveMovieToWatchList,
  saveMovieToWishList,
  saveMovieToCuratedList,
};
