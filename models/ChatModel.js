const { default: mongoose } = require("mongoose");

const ChatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    }
}, {
    timestamps: true
})

ChatSchema.index({ participants: 1 }, { unique: true }); // Ensure unique pairs of participants


const Chat = mongoose.model("Chat", ChatSchema)
module.exports = Chat