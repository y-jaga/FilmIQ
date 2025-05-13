function validateSearchMovie(query) {
  if (!query || query.length === 0) {
    return "query parameter is required.";
  }
  return null;
}

function validateCreateCuratedList(data) {
  const errors = [];

  if (!data.name || data.name.length === 0) {
    errors.push("name is required.");
  }
  if (!data.description || data.description.length === 0) {
    errors.push("description is required");
  }

  return errors;
}

function validateUpdateCuratedList(id, updateData) {
  const errors = [];
  if (!id) {
    errors.push("id is required.");
  }

  if (!updateData.name && !updateData.description && !updateData.slug) {
    errors.push("request body is empty.");
  }

  return errors;
}

function validateSaveMovie(movieId) {
  if (!movieId) {
    return "movieId is required in request body and should be a number.";
  }

  return null;
}

function validateSaveMovieToCuratedList(data) {
  if (!data.movieId || typeof data.movieId !== "number") {
    return "movieId is required in request body and should be a number.";
  }
  if (!data.curatedListId || typeof data.curatedListId !== "number") {
    return "curatedListId is required and should be a number.";
  }

  return null;
}

function validateReviewAndRating(rating, reviewText) {
  const errors = [];

  if (!rating || Number.isInteger(rating) || rating < 0.0 || rating > 10.0) {
    errors.push("rating is required must be a float between 0 and 10.");
  }

  if (!reviewText || reviewText.length > 500) {
    errors.push(
      "reviewText is required and should have maximum 500 characters."
    );
  }

  return errors;
}

function validateSortByRatingOrReleaseYear(data) {
  const errors = [];

  if (
    !data.list ||
    (data.list !== "watchlist" &&
      data.list !== "wishlist" &&
      data.list !== "curatedlist")
  ) {
    errors.push(
      "list query param is required and must be watchlist, wishlist or curatedlist."
    );
  }

  if (
    !data.sortBy ||
    (data.sortBy !== "rating" && data.sortBy !== "releaseYear")
  ) {
    errors.push(
      "sortBy query param is required and must be either rating or releaseYear."
    );
  }

  if (
    !data.order ||
    (data.order.toLowerCase() !== "asc" && data.order.toLowerCase() !== "desc")
  ) {
    errors.push(
      "order query param is required and must be either ASC or DESC."
    );
  }

  return errors;
}

module.exports = {
  validateSearchMovie,
  validateCreateCuratedList,
  validateUpdateCuratedList,
  validateSaveMovie,
  validateSaveMovieToCuratedList,
  validateReviewAndRating,
  validateSortByRatingOrReleaseYear,
};
