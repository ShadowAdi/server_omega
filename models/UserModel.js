const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt")
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    mobileNo: {
        required: true,
        type: String,
        unique: true,
    },
    profileImage: {
        type: String,
    },
    provider: {
        type: String,
        enum: ['email', 'google'],
        default: 'email',
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isMediaAllowed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

const adminEmails = ["shadowshukla76@gmail.com"];

UserSchema.pre("save", function (next) {
    if (adminEmails.includes(this.email)) {
        this.isAdmin = true;
    }
    next();
});



const User = mongoose.model("User", UserSchema)
module.exports = User