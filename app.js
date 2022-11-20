const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());
let db = null;
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "./moviesData.db");

const initiazeDBandServer = async () => {
  try {
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
    db = await open({ filename: dbpath, driver: sqlite3.Database });
  } catch (e) {
    console.log(`DBerror ${e.message}`);
    process.exit(1);
  }
};
initiazeDBandServer();

// list of all movie names in the movie table---------------------------1
app.get("/movies/", async (request, response) => {
  const sqlListQuery = `SELECT movie_name FROM movie;`;
  const listOfmovies = await db.all(sqlListQuery);
  let list = [];

  console.log(listOfmovies);
  for (i of listOfmovies) {
    list.push({ movieName: i.movie_name });
  }
  response.send(list);
});

// Creates a new movie in the movie table.------------------------------2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const QueryForNewMovieCreation = `insert into movie ("director_id","movie_name","lead_actor")values(
        ${directorId},"${movieName}","${leadActor}"
    );`;
  db.run(QueryForNewMovieCreation);
  response.send("Movie Successfully Added");
  //   console.log("movie added");
});

//get movie based on the movie ID --------------------------------------3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //   console.log(movieId);
  const movieONmovie_idQuery = `select movie_id as movieId,
  director_id as directorId,movie_name as movieName,
  lead_actor as leadActor from movie where movie_id=${movieId};`;
  const movie = await db.get(movieONmovie_idQuery);
  response.send(movie);
  console.log(movie);
});

// Updates the details of a movie in the movie table based on the movie ID
//  --------------------------------------------------4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updatemovieQuery = `update movie set director_id=${directorId},movie_name=
  "${movieName}",lead_actor="${leadActor}" where movie_id=${movieId};`;
  const re = await db.run(updatemovieQuery);
  response.send("Movie Details Updated");
});

// Deletes a movie from the movie table based on the movie ID-----------5
app.delete("/movies/:movieId/", async (request, response) => {
  //   console.log("delete");
  const { movieId } = request.params;
  //   console.log(movieId);
  const deleteQuery = `delete from movie where movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
  //   console.log("Movie Removed");
});

// list of all directors in the director table:-------------------------6
app.get("/directors/", async (request, response) => {
  const directorsListQuery = `select movie.director_id as directorId,director_name as directorName
   from movie join director on movie.director_id=director.director_id group by movie.director_id;`;
  const directorsList = await db.all(directorsListQuery);
  response.send(directorsList);
  console.log(directorsList);
});

// list of all movie names directed by a specific director--------------7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesList = `select movie_name as movieName from movie
  where director_id=${directorId};`;
  const moviesList = await db.all(getMoviesList);
  response.send(moviesList);
  console.log(moviesList);
});
