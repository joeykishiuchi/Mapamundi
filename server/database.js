// load .env data into process.env
//require('dotenv').config();

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('../lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Get a single user by user id 
const getUserById = function(user_id) {
  return db.query(`
  SELECT * 
  FROM users
  WHERE id = $1;
  `, [user_id])
  .then(res => res.rows[0])
  .catch(error => error);
}
  exports.getUserById = getUserById;

// Gets all markers for a particular map id
const getMarkersForMap = function(map_id) {
  return db.query(`
  SELECT * 
  FROM markers
  WHERE map_id = $1;
  `, [map_id])
  .then(res => res.rows)
  .catch(error => error);
}
  exports.getMarkersForMap = getMarkersForMap;

//Gets all favorited maps for a particular user id
const getAllUserFavoriteMaps = function(user_id) {
  return db.query(`
  SELECT maps.*, COUNT(favorites) AS liked 
  FROM maps
  JOIN favorites ON map_id = maps.id
  WHERE favorites.user_id = $1
  GROUP BY maps.id
  ORDER by maps.id;
  `, [user_id])
  .then(res => res.rows)
  .catch(error => error);
}
exports.getAllUserFavoriteMaps = getAllUserFavoriteMaps;

// Get all maps a user has created
const getAllUserMaps = function(user_id) {
  return db.query(`
  SELECT maps.*, COUNT(favorite) AS liked FROM maps
  JOIN users ON users.id = maps.creator_id
  LEFT JOIN (SELECT * FROM favorites WHERE user_id = $1) AS favorite ON map_id = maps.id
  WHERE users.id = $1
  GROUP BY maps.id
  ORDER BY maps.id;
  `, [user_id])
  .then(res => res.rows)
  .catch(error => error);
}
exports.getAllUserMaps = getAllUserMaps;

// Gets all maps that a user has contributed markers to
const getAllUserMarkers = function(user_id) {
  return db.query(`
  SELECT maps.id, maps.map_title, maps.description, COUNT(favorite) AS liked
  FROM maps
  LEFT JOIN (SELECT * FROM favorites WHERE user_id = $1) AS favorite ON map_id = maps.id
  JOIN markers ON markers.map_id = maps.id
  WHERE markers.creator_id = $1 AND maps.creator_id != $1
  GROUP BY maps.id;
  `, [user_id])
  .then(res => res.rows)
  .catch(error => error);
}
exports.getAllUserMarkers = getAllUserMarkers;

// Gets all existing maps
const getAllMapsInDatabase = function(user_id) {
  return db.query(`
  SELECT maps.*, COUNT(favorite) AS liked 
  FROM maps
  LEFT JOIN (SELECT * FROM favorites WHERE user_id = $1) AS favorite  ON map_id = maps.id
  GROUP BY maps.id ORDER BY maps.id;
  `,[user_id])
  .then(res => res.rows)
  .catch(error => error);
  }
exports.getAllMapsInDatabase = getAllMapsInDatabase;


// Adds a new marker to the database
const addMarker =  function(marker) {
  return db.query(`
  INSERT INTO markers
  (marker_title, description, image_url, longitude, latitude, map_id, creator_id) 
  VALUES($1, $2, $3, $4, $5, $6, $7) 
  RETURNING *;`,
  [marker.marker_title, marker.description, marker.image_url, marker.longitude, marker.latitude, marker.map_id, marker.creator_id])
  .then(res => res.rows)
  .catch(error => error);
}
exports.addMarker = addMarker;

// Adds new map to database
const addMap =  function(title, description, creator_id) {
  return db.query(`
  INSERT INTO maps
  (map_title, creator_id, description, zoom) 
  VALUES($1, $2, $3, $4) 
  RETURNING *;`,
  [title, creator_id, description, 12])
  .then(res => res.rows[0])
  .catch(error => error);
}
exports.addMap = addMap;

// Gets a single map for a particular map id
const getMapById =  function(map_id) {
  return db.query(`
  SELECT * 
  FROM maps 
  WHERE id = $1;
  `,[map_id] )
  .then(res => res.rows[0])
  .catch(error => error);
}
exports.getMapById = getMapById;

// Adds a favorited map given the user id and map id
const addFavorite = function(user_id, map_id) {
  return db.query(`
  INSERT INTO favorites
  (user_id, map_id) 
  VALUES($1, $2) 
  RETURNING *;`,
  [user_id, map_id])
  .then(res => res.rows[0])
  .catch(error => error);
}
exports.addFavorite = addFavorite;

// Removes a favorited map given the user id and map id
const removeFavorite = function(user_id, map_id) {
  return db.query(`
  DELETE FROM favorites
  WHERE user_id = $1 AND map_id = $2;
  `, [user_id, map_id])
  .then(res => res.rows[0])
  .catch(error => error);
}
exports.removeFavorite = removeFavorite;

// Gets a favorite if it exists, other wise returns nothing given a user id and map id
const checkFavorite = function(user_id, map_id) {
  return db.query(`
  SELECT *
  FROM favorites
  WHERE user_id = $1 AND map_id = $2;
  `, [ user_id, map_id ])
  .then(res => res.rows)
  .catch(error => error)
}
exports.checkFavorite = checkFavorite;

// Deletes map from database given a map id
const deleteMap = function(map_id){
  return db.query(`
  DELETE FROM maps
  WHERE id = $1;
  `, [map_id])
  .then(res => res.rows[0])
  .catch(error => error);
}
exports.deleteMap = deleteMap;

// Deletes a marker from the database given a marker id
const deleteMarker = function(marker_id){
  return db.query(`
  DELETE FROM markers
  WHERE id = $1;
  `, [marker_id])
  .then(res => res.rows[0])
  .catch(error => error);
}
exports.deleteMarker = deleteMarker;