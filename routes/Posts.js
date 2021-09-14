const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const upload = require("../multer");
const cloudinary = require("../cloudinary");

const db = require("../config/db");

const verifyToken = (req, res, next) => {
  // FORMAT OF TOKEN
  // Authorization: Bearer <access_token>
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader && bearerHeader.includes("Bearer ")) {
    const token = bearerHeader.split(" ")[1];
    req.token = token;
    next();
  } else {
    res.status(403);
    res.send({ message: "Authorization token is missing or invalid!" });
  }
};

router.post("/", [verifyToken, upload.single("image")], (req, res) => {
  jwt.verify(req.token, `secretkey`, async (e, authData) => {
    if (e) {
      res.status(403);
      res.send({ message: "Authorization token is invalid!" });
    } else {
      const uploader = async (path) => {
        return await cloudinary.uploads(path, "social-media-uit");
      };
      const file = req.file;
      const path = file.path;
      const { url } = await uploader(path);
      fs.unlinkSync(path);
      const title = req.body.title;
      const description = req.body.description;
      const image = url;
      const author = authData.user.username;
      db.query(
        "INSERT INTO Uploads (title, description, image, author) VALUES (?, ?, ?, ?);",
        [title, description, image, author],
        (err, results) => {
          if (err) {
            console.log({ err });
            res.status(400);
            res.send({ message: "Failed to create post!" });
          } else {
            db.query(
              `SELECT
                    uploads.id
                    , uploads.title
                    , uploads.image
                    , uploads.description
                    , uploads.author
                    , COUNT(likes.id) AS totalLikes
                    , (SELECT CASE WHEN 
                        COUNT(*) > 0 
                        THEN true
                        ELSE false 
                        END AS BOOL
                        FROM likes
                        WHERE userLiking = ? AND postId = uploads.id) AS isLiked
                FROM
                    likes
                    RIGHT JOIN uploads 
                        ON (likes.postId = uploads.id)
                WHERE uploads.id = ?
                GROUP BY uploads.id
                ORDER BY uploads.id DESC;`,
              [authData.user.username, results.insertId],
              (postError, post) => {
                if (postError) {
                  console.log({ postError });
                } else {
                  res.send({
                    message: "Post created successfully",
                    post: post[0],
                  });
                }
              }
            );
          }
        }
      );
    }
  });
});

router.get("/", verifyToken, (req, res) => {
  jwt.verify(req.token, `secretkey`, (e, authData) => {
    if (e) {
      res.status(403);
      res.send({ message: "Authorization token is invalid!" });
    } else {
      db.query(
        `SELECT
            uploads.id
            , uploads.title
            , uploads.image
            , uploads.description
            , uploads.author
            , COUNT(likes.id) AS totalLikes
            , (SELECT CASE WHEN 
                COUNT(*) > 0 
                THEN true
                ELSE false 
                END AS BOOL
                FROM likes
                WHERE userLiking = ? AND postId = uploads.id) AS isLiked
        FROM
            likes
            RIGHT JOIN uploads 
                ON (likes.postId = uploads.id)
        GROUP BY uploads.id
        ORDER BY uploads.id DESC;`,
        authData.user.username,
        (err, results) => {
          if (err) {
            console.log({ err });
            res.status(400);
            res.send({ message: "Failed to get posts!" });
          } else {
            res.send({ posts: results });
          }
        }
      );
    }
  });
});

router.get("/byUser/:username", verifyToken, (req, res) => {
  jwt.verify(req.token, `secretkey`, (e, authData) => {
    if (e) {
      res.status(403);
      res.send({ message: "Authorization token is invalid!" });
    } else {
      const userName = req.params.username;
      db.query(
        `SELECT
            uploads.id
            , uploads.title
            , uploads.image
            , uploads.description
            , uploads.author
            , COUNT(likes.id) AS totalLikes
            , (SELECT CASE WHEN 
                COUNT(*) > 0 
                THEN true
                ELSE false 
                END AS BOOL
                FROM likes
                WHERE userLiking = ? AND postId = uploads.id) AS isLiked
        FROM
            likes
            RIGHT JOIN uploads 
                ON (likes.postId = uploads.id)
        WHERE uploads.author = ?
        GROUP BY uploads.id
        ORDER BY uploads.id DESC;`,
        [authData.user.username, userName],
        (err, results) => {
          if (err) {
            console.log({ err });
            res.status(400);
            res.send({ message: "Failed to get posts!" });
          } else {
            res.send({ posts: results });
          }
        }
      );
    }
  });
});

router.post("/like", verifyToken, (req, res) => {
  jwt.verify(req.token, `secretkey`, (e, authData) => {
    if (e) {
      res.status(403);
      res.send({ message: "Authorization token is invalid!" });
    } else {
      const userLiking = authData.user.username;
      const postId = req.body.postId;

      db.query(
        `SELECT
            uploads.id
            , uploads.title
            , uploads.image
            , uploads.description
            , uploads.author
            , COUNT(likes.id) AS totalLikes
            , (SELECT CASE WHEN 
                COUNT(*) > 0 
                THEN true
                ELSE false 
                END AS BOOL
                FROM likes
                WHERE userLiking = ? AND postId = uploads.id) AS isLiked
        FROM
            likes
            RIGHT JOIN uploads 
                ON (likes.postId = uploads.id)
        WHERE uploads.author = ? AND uploads.id = ?
        GROUP BY uploads.id
        ORDER BY uploads.id DESC;`,
        [userLiking, userLiking, postId],
        (postErr, posts) => {
          if (postErr || !posts) {
            console.log(postErr);
            res.status(400);
            res.send({ message: "Something went wrong!" });
          }
          if (posts.length && posts[0].isLiked) {
            db.query(
              "DELETE FROM likes WHERE userLiking = ? AND postId = ?",
              [userLiking, postId],
              (err, results2) => {
                if (err) {
                  console.log(err);
                  res.status(400);
                  res.send({ message: "Failed to unlike post!" });
                }
                res.send({
                  message: "Post unliked successfully",
                  isLiked: false,
                  totalLikes: posts[0].totalLikes - 1,
                });
              }
            );
          } else {
            db.query(
              "INSERT INTO Likes (userLiking, postId) VALUES (?,?)",
              [userLiking, postId],
              (err, results2) => {
                if (err) {
                  console.log(err);
                  res.status(400);
                  res.send({ message: "Failed to like post!" });
                }
                res.send({
                  message: "Post liked successfully",
                  isLiked: true,
                  totalLikes: posts[0].totalLikes + 1,
                });
              }
            );
          }
        }
      );
    }
  });
});

module.exports = router;
