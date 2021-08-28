const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

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

router.post("/", verifyToken, (req, res) => {
    jwt.verify(req.token, `secretkey`, (e, authData) => {
        if (e) {
            res.status(403);
            res.send({ message: "Authorization token is invalid!" });
        } else {
            const title = req.body.title;
            const description = req.body.description;
            const image = req.body.image;
            const author = authData.user.username;
            db.query(
                "INSERT INTO Uploads (title, description, image, author) VALUES (?, ?, ?, ?);", [title, description, image, author],
                (err, results) => {
                    if (err) {
                        console.log({ err })
                        res.status(400);
                        res.send({ message: "Failed to create post!" });
                    } else {
                        db.query(
                            "SELECT * FROM Uploads WHERE id = ?;",
                            results.insertId,
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
            db.query("SELECT * FROM Uploads", (err, results) => {
                if (err) {
                    console.log({ err })
                    res.status(400);
                    res.send({ message: "Failed to get posts!" });
                } else {
                    res.send({ posts: results });
                }
            });
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
                "SELECT * FROM Uploads WHERE author = ?;",
                userName,
                (err, results) => {
                    if (err) {
                        console.log({ err })
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

router.post("/like", (req, res) => {
    const userLiking = req.body.userLiking;
    const postId = req.body.postId;

    db.query(
        "INSERT INTO Likes (userLiking, postId) VALUES (?,?)", [userLiking, postId],
        (err, results) => {
            if (err) {
                console.log(err);
            }
            db.query(
                "UPDATE Uploads SET likes = likes + 1 WHERE id = ?",
                postId,
                (err2, results2) => {
                    res.send(results);
                }
            );
        }
    );
});

module.exports = router;