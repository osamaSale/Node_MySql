const express = require("express");
const { upload } = require("../connection/upload")
const { getUserList, getIdUser, createUser, _deleteUser, editUser, login, search } = require("../controller/users");
const router = express.Router();

// Router Users

router.get("/users", getUserList);
router.get("/users/:id", getIdUser);
router.post("/users", upload.single("fileImage"), createUser);
router.put("/users/:id", upload.single("fileImage"), editUser);
router.delete("/users/:id", _deleteUser);
router.post("/login", login);
router.get("/search/:name", search);
module.exports = router;