const express = require('express');
const router  = express.Router();


  module.exports = (db) => {

    
    router.get("/profile", (req, res) => {
      res.render("urls_profile");
    });
    return router;
  };

