const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const UserController = require("../Controllers/user")


const db = require("../config/db");

router.post("/regsiter",UserController.createUser)

// router.post("/register", (req, res) => {
//     const email = req.body.email;
//     const username = req.body.username;
//     const password = req.body.password;
//     db.query(
//         "INSERT INTO Users (email, username, password) VALUES (?, ?, ?);", [email || username, username, password],
//         (err, results) => {
//             if (err) {
//                 if (err.sqlMessage && err.sqlMessage.includes("Duplicate entry")) {
//                     res.status(409);
//                     res.send({ message: "Username or email already exist!" });
//                 } else {
//                     res.status(400);
//                     res.send({ message: "Failed to create user!" });
//                 }
//             } else {
//                 res.send({
//                     message: "User created successfully",
//                     userId: results.insertId,
//                 });
//             }
//         }
//     );
// });

router.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    db.query(
        "SELECT * FROM Users WHERE username = ? and password = ?", [username, password],
        (err, results) => {
            if (err) {
                res.status(400);
                res.send({ message: "Login failed!" });
            } else if (results.length > 0) {
                jwt.sign({ user: results[0] }, `secretkey`, { expiresIn: '24h' }, (e, token) => {
                    if (e) {
                        res.status(400);
                        res.send({ message: "Login failed!" });
                    } else {
                        res.json({
                            token,
                            loggedIn: true,
                            user: {
                                id: results[0].id,
                                username,
                                email: results[0].email,
                            },
                        });
                    }
                });
            } else {
                res.status(401);
                res.json({ loggedIn: false, message: "Invalid username or password!" });
            }
        }
    );
});

// router.get("/all", (req, res) => {
//     db.query("SELECT username FROM Users", (err, results) => {
//         if (err) {
//             console.log(err);
//             res.json(err);
//         }
//         if (results.length > 0) {
//             res.json({ count: results.length, users: results });
//         } else {
//             res.json({ message: "No Users" });
//         }
//     });
// });

router.get("/all", UserController.getUsers)

router.get("/getUser/:id", UserController.getUser )

router.put("/update", UserController.updateUser)

router.delete("/delete/:id", UserController.deleteUser)

module.exports = router;