const mongoose = require("mongoose")
const ConnectDB = () => {
    const URI = process.env.MONGODB_URI

    if (!URI) {
        console.log("DB Uri is Not Found")
    }
    mongoose.connect(URI).then(() => {
        console.log("Database Connected")
    }).catch((err) => {
        console.log("Error Happed in Connecting a MongoDB: ", err)
    })
}

module.exports = {
    ConnectDB
}