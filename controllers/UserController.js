const jwt = require("jsonwebtoken")
const User = require("../models/UserModel")
const bcrypt = require("bcrypt");
const Chat = require("../models/ChatModel");
const Message = require("../models/MessageModel");
const json2csv = require('json2csv').parse;

async function RegisterUser(req, res) {
    const { email, name, password, mobileNo } = req.body
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const existingMobile = await User.findOne({ mobileNo });
        if (existingMobile) {
            return res.status(400).json({ message: "Mobile number already exists" });
        }


        const newUser = new User({
            name,
            email,
            mobileNo,
            password
        })

        await newUser.save()
        res.status(201).json({ message: "User Registered", user: newUser })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });

    }
}

async function LoginUser(req, res) {
    const { emailOrPhone, password } = req.body;

    // Validation for required fields
    if (!emailOrPhone || !password) {
        return res.status(400).json({ message: "Email/Phone and Password are required" });
    }

    try {
        // Determine if input is an email or phone number
        const isEmail = emailOrPhone.includes("@");
        const user = await User.findOne(
            isEmail ? { email: emailOrPhone } : { mobileNo: emailOrPhone }
        );

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send response
        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


async function GetUsers(req, res) {
    try {
        const users = await User.find()
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}



async function AddUser(req, res) {
    const { email, name, password, mobileNo, profileImage } = req.body
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const existingMobile = await User.findOne({ mobileNo });
        if (existingMobile) {
            return res.status(400).json({ message: "Mobile number already exists" });
        }


        const newUser = new User({
            name,
            email,
            mobileNo,
            password,
            profileImage,

        })

        await newUser.save()
        res.status(201).json({ message: "User Created", user: newUser })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });

    }
}



async function DeleteUser(req, res) {
    const userId = req.params.id
    try {
        const existingUser = await User.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(400).json({ message: "User Do Not Exists" });
        }
        await User.deleteOne({ _id: userId })
        res.status(200).json({ message: "User deleted" })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });

    }
}


async function GetUser(req, res) {
    const userId = req.params.id
    try {
        const existingUser = await User.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(400).json({ message: "User Do Not Exists" });
        }
        res.status(200).json({ user: existingUser })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });

    }
}



async function UpdateUser(req, res) {
    const userId = req.params.id
    const { email, name, mobileNo, profileImage, isMediaAllowed } = req.body

    try {
        const existingUser = await User.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(400).json({ message: "User Do Not Exists" });
        }
        const updatedUser = await User.updateOne({ _id: userId }, { email, name, mobileNo, profileImage, isMediaAllowed })
        res.status(200).json({ message: "User Updated", "UpdatedUser": updatedUser })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


const CreateChat = async (req, res) => {
    const { sender, receiver, type, content } = req.body

    if (!sender || !receiver) {
        return res.status(400).json({ error: 'Sender, receiver, and content are required.' });
    }


    try {
        let chat = await Chat.findOne({ participants: { $all: [sender, receiver] } });

        if (!chat) {
            chat = new Chat({ participants: [sender, receiver] });
            await chat.save();
        }

        let message = null;
        if (content) {
            message = new Message({
                chatId: chat._id,
                sender,
                receiver,
                content,
                type,
            });
            await message.save();

            chat.lastMessage = message._id;
            chat.updatedAt = Date.now();
            await chat.save();
        }

        // Respond with the created/updated chat and optional message
        res.status(200).json({
            chat,
            message: message || null,
            info: content ? 'Chat and message created' : 'Chat created without messages',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const GetMessages = async (req, res) => {
    const { chatId } = req.query;

    if (!chatId) {
        return res.status(400).json({ error: 'Chat Id is required.' });
    }

    try {
        const messages = await Message.find({
            chatId: chatId
        }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const ExportData = async (req, res) => {
    try {
        const users = await User.find()
        const usersJson = users.map(user => ({
            name: user.name,
            email: user.email,
            mobileNo: user.mobileNo,
            isAdmin: user.isAdmin,
            isMediaAllowed: user.isMediaAllowed,
            profileImage: user.profileImage

        }));

        const csv = json2csv(usersJson);

        // Send CSV file as response
        res.header('Content-Type', 'text/csv');
        res.attachment('users.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).send('Error exporting user data');
    }

};


const ImportData = async (req, res) => {
    try {
        const data = req.body.data.map(item => ({
            ...item,
            isAdmin: item.isAdmin === "TRUE", // Convert string to boolean
            isMediaAllowed: item.isMediaAllowed === "TRUE" // Convert string to boolean
        }));

        const savedData = await User.insertMany(data);
        res.status(200).json({ message: "Data imported successfully!", savedData });
    } catch (error) {
        console.error("Error importing data:", error);
        res.status(500).send('Error exporting user data');
    }
};



module.exports = { RegisterUser, LoginUser, GetUsers, AddUser, DeleteUser, UpdateUser, GetUser, CreateChat, GetMessages, ExportData, ImportData }

