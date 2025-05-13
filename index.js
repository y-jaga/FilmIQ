const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const {
  searchMovie,
  createCuratedList,
  updateCuratedList,
  saveMovieToWatchList,
  saveMovieToWishList,
  saveMovieToCuratedList,
  addReviewAndRatingToMovies,
  searchByGenreAndActor,
  sortByRatingOrReleaseYear,
  getTop5Movies,
} = require("./controllers/movieController");

const app = express();
app.use(cors());
app.use(express.json());

//To search for movies from TMDB API based on user-provided search term.
app.get("/api/search/movie", searchMovie);

//To create curatedList
app.post("/api/curated-lists", createCuratedList);

//To update curatedList
app.put("/api/curated-lists/:curatedListId", updateCuratedList);

//To save Movies in Watchlist
app.post("/api/movies/watchlist", saveMovieToWatchList);

//To save Movies in Wishlist
app.post("/api/movies/wishlist", saveMovieToWishList);

//To save Movies in CuratedList
app.post("/api/movies/curated-list", saveMovieToCuratedList);

//To adding reviews and ratings to Movies
app.post("/api/movies/:movieId/reviews", addReviewAndRatingToMovies);

//Search movie by genre and actor
app.get("/api/movies/searchByGenreAndActor", searchByGenreAndActor);

//Sorting for the Watchlist, Wishlist, and CuratedLists by rating or year of release.
app.get("/api/movies/sort", sortByRatingOrReleaseYear);

//To get the top 5 movies based on ratings
app.get("/api/movies/top5", getTop5Movies);

if (process.env.NODE_ENV !== "test") {
  sequelize
    .authenticate()
    .then(() => console.log("Database successfully connected!"))
    .catch((error) => console.error(error.message));
}

module.exports = app;
