const db = require("../models/index");
const { sequelize } = db;
const { Movie, CuratedList, Watchlist } = sequelize.models;

const {
  searchMovie,
  addReviewAndRatingToMovies,
  searchByGenreAndActor,
  sortByRatingOrReleaseYear,
  getTop5Movies,
} = require("../controllers/movieController.js");

const {
  createCuratedList,
  updateCuratedList,
  saveMovieToWatchList,
  saveMovieToWishList,
  saveMovieToCuratedList,
} = require("../controllers/listController.js");

const {
  getActors,
  movieExistsInDB,
  fetchMovieAndCastDetails,
} = require("../utils/index.js");

const axiosInstance = require("../lib/axios.lib");

jest.mock("../lib/axios.lib", () => ({
  ...jest.requireActual("../lib/axios.lib"),
  get: jest.fn(),
}));

jest.mock("../utils/index.js", () => ({
  ...jest.requireActual("../utils/index.js"),
  getActors: jest.fn(),
  movieExistsInDB: jest.fn(),
  fetchMovieAndCastDetails: jest.fn(),
}));

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Movie Curator controller functions tests", () => {
  afterEach(async () => {
    await sequelize.sync({ force: true });

    await Movie.create({
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.368,
      description:
        "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets",
    });

    await CuratedList.create({
      name: "sample",
      slug: "sample",
      description: "sample description",
    });

    await Watchlist.create({
      id: 1,
      movieId: 1,
    });

    jest.clearAllMocks();
  });

  it("GET /api/search/movie, should search for movies from TMDB API based on user-provided search term.", async () => {
    const mockActors =
      "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page";

    const axiosMockResponse = {
      data: {
        results: [
          {
            original_title: "Inception",
            id: 27205,
            genre_ids: [28, 878, 12],
            release_date: "2010-07-15",
            vote_average: 8.368,
            overview:
              "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets.",
          },
        ],
      },
    };

    const moviesMockResponse = {
      movies: [
        {
          actors: mockActors,
          description:
            "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets.",
          genre: "28, 878, 12",
          rating: 8.368,
          releaseYear: "2010",
          title: "Inception",
          tmdbId: 27205,
        },
      ],
    };

    axiosInstance.get.mockResolvedValue(axiosMockResponse);

    getActors.mockResolvedValue(mockActors);

    const req = { query: { query: "Inception" } };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await searchMovie(req, res);

    expect(axiosInstance.get).toHaveBeenCalledWith("/search/movie", {
      params: {
        query: "Inception",
      },
    });

    expect(await getActors(27205)).toEqual(mockActors);

    expect(res.json).toHaveBeenCalledWith(moviesMockResponse);
  });

  it("POST /api/curated-lists, should create curated list", async () => {
    const mockResponse = {
      message: "Curated list created successfully.",
    };

    const req = {
      body: {
        name: "Horror Movies",
        description: "A collection of the best horror films.",
        slug: "horror-movies",
      },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await createCuratedList(req, res);

    expect(res.json).toHaveBeenCalledWith(mockResponse);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("PUT /api/curated-lists/:curatedListId, should update curatedList", async () => {
    const mockResponse = {
      message: "Curated list updated successfully.",
    };

    const req = {
      params: { curatedListId: 1 },
      body: { name: "Updated List Name", description: "Updated description." },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await updateCuratedList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("POST /api/movies/watchlist, should save movies to watchList if movie do not exists", async () => {
    const mockMovieDataResponse = {
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.368,
      description:
        "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets",
    };

    const req = {
      body: { movieId: 27205 },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    movieExistsInDB.mockResolvedValue(false);

    fetchMovieAndCastDetails.mockResolvedValue(mockMovieDataResponse);

    await saveMovieToWatchList(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      message: "Movie added to watchlist successfully.",
    });
  });

  it("POST /api/movies/watchlist, should save movies to watchList if movie exists in db", async () => {
    const req = {
      body: { movieId: 27205 },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    movieExistsInDB.mockResolvedValue(true);

    await saveMovieToWatchList(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      message: "Movie added to watchlist successfully.",
    });
  });

  it("POST /api/movies/wishlist, should save movies to wishlist if movie do not exists in db", async () => {
    const mockMovieDataResponse = {
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.368,
      description:
        "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets",
    };

    const req = {
      body: { movieId: 27205 },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    movieExistsInDB.mockResolvedValue(false);

    fetchMovieAndCastDetails.mockResolvedValue(mockMovieDataResponse);

    await saveMovieToWishList(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      message: "Movie added to wishlist successfully.",
    });
  });

  it("POST /api/movies/wishlist, should save movies to wishlist if movie exists in db", async () => {
    const req = {
      body: {
        movieId: 27205,
      },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    movieExistsInDB.mockResolvedValue(true);

    await saveMovieToWishList(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      message: "Movie added to wishlist successfully.",
    });
  });

  it("POST /api/movies/curated-list, should save movies in CuratedList if movie doesn't exists in db", async () => {
    const mockMovieDataResponse = {
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.368,
      description:
        "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets",
    };

    const req = {
      body: {
        movieId: 27205,
        curatedListId: 1,
      },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    movieExistsInDB.mockResolvedValue(false);

    fetchMovieAndCastDetails.mockResolvedValue(mockMovieDataResponse);

    await saveMovieToCuratedList(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      message: "Movie added to curated list items successfully.",
    });
  });

  it("POST /api/movies/curated-list, should save movies in CuratedList if movie exists in db", async () => {
    const req = {
      body: {
        movieId: 27205,
        curatedListId: 1,
      },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    movieExistsInDB.mockResolvedValue(true);

    await saveMovieToCuratedList(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      message: "Movie added to curated list items successfully.",
    });
  });

  it("POST /api/movies/:movieId/reviews, should add reviews and ratings to movies.", async () => {
    const req = {
      params: {
        movieId: 1,
      },
      body: {
        rating: 4.5,
        reviewText: "Great movie with a brilliant plot.",
      },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await addReviewAndRatingToMovies(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      message: "review created successfully.",
    });
  });

  it("POST /api/movies/:movieId/reviews, should throw validation error for rating and reviewText.", async () => {
    const req = {
      params: {
        movieId: 1,
      },
      body: {
        rating: 41,
      },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await addReviewAndRatingToMovies(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      errors: [
        "rating is required must be a float between 0 and 10.",
        "reviewText is required and should have maximum 500 characters.",
      ],
    });
  });

  it("GET /api/movies/searchByGenreAndActor, should search movie by genre and actor", async () => {
    const mockResponse = [
      //check at least mentioned field (from id - description) present in array object
      expect.objectContaining({
        id: 1,
        title: "Inception",
        tmdbId: 27205,
        genre: "Action, Science Fiction, Adventure",
        actors:
          "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page",
        releaseYear: 2010,
        rating: 8.368,
        description:
          "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    ];

    const req = {
      query: {
        genre: "Action",
        actor: "Leonardo DiCaprio",
      },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await searchByGenreAndActor(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("GET /api/movies/sort, should sort movies in their lists by rating or year of release.", async () => {
    await Movie.create({
      title: "Thor: Love and Thunder",
      tmdbId: 616037,
      genre: "Fantasy, Action, Comedy",
      actors:
        "Chris Hemsworth, Natalie Portman, Christian Bale, Tessa Thompson, Russell Crowe",
      releaseYear: 2022,
      rating: 6.4,
      description:
        "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets",
    });

    await Watchlist.create({ id: 2, movieId: 2 });

    const mockResponse = {
      movies: [
        expect.objectContaining({
          id: 2,
          title: "Thor: Love and Thunder",
          tmdbId: 616037,
          genre: "Fantasy, Action, Comedy",
          actors:
            "Chris Hemsworth, Natalie Portman, Christian Bale, Tessa Thompson, Russell Crowe",
          releaseYear: 2022,
          rating: 6.4,
          description:
            "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        expect.objectContaining({
          id: 1,
          title: "Inception",
          tmdbId: 27205,
          genre: "Action, Science Fiction, Adventure",
          actors:
            "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page",
          releaseYear: 2010,
          rating: 8.368,
          description:
            "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      ],
    };

    const req = {
      query: {
        list: "watchlist",
        sortBy: "rating",
        order: "ASC",
      },
    };

    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await sortByRatingOrReleaseYear(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("GET /api/movies/top5, get the top 5 movies by rating and display their detailed reviews", async () => {
    const mockResponse = [
      {
        title: "Inception",
        rating: 8.368,
        review: {
          text: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets",
          wordCount: 15,
        },
      },
    ];

    const req = {};
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await getTop5Movies(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });
});
