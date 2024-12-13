const express = require("express")
const User = require("../models/UserModel")
const { RegisterUser, LoginUser, GetUsers, AddUser, DeleteUser, UpdateUser, GetUser, CreateChat, GetMessages, ExportData, ImportData } = require("../controllers/UserController")

const router = express.Router()

router.get("/", async function (req, res) {
    res.send("hii")
})

router.post("/register", RegisterUser)
router.get("/users", GetUsers)
router.post("/login", LoginUser)
router.post("/addUser", AddUser)
router.delete("/deleteUser/:id", DeleteUser)
router.get("/getUser/:id", GetUser)
router.put("/updateUser/:id", UpdateUser)
router.post("/chat", CreateChat)
router.get("/messages", GetMessages)
router.get("/export-users", ExportData)
router.post("/import-users", ImportData); // Make sure this matches the frontend URL








module.exports = { router }