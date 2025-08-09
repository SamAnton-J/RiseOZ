const { Producer } = require('../../models/producer')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

// Use process.env configured at server entry; do not override path here
if (!process.env.JWT_SECRET) {
    dotenv.config();
}
const secretKey = process.env.JWT_SECRET;

const producerSignup = async (req, res) => {
    const { username, password, email, linkedInUrl = '', walletAddress = '', companyWebsite = '' } = req.body;
    const producer = await Producer.findOne({ $or: [{ username }, { email }] });
    // console.log(req.body);
    if (producer) {
        return res.status(400).json({ message: "Username Or Email already in use" });
    }
    else {
        const hashPassword = await bcrypt.hash(password, 10);
        const newProducer = new Producer({
            username,
            password: hashPassword,
            email,
            linkedInUrl,
            walletAddress,
            companyWebsite,
        })
        await newProducer.save();
        const token = jwt.sign({ userId: newProducer.id, username, role: 'PRODUCER' }, secretKey, { expiresIn: '1h' });
        return res.status(201).json({ message: "Producer Account created successfully", token: token });
    }
}

const producerLogin = async (req, res) => {
    const { username, password } = req.body;
    const producer = await Producer.findOne({ username });
    if (!producer) {
        console.log("less go");
        return res.status(404).json({ message: "Incorrect Credentials, Not found" });
    }
    console.log("Wait what??")
    const isPasswordValid = await bcrypt.compare(password, producer.password);
    if (isPasswordValid) {
        const token = jwt.sign({ userId: producer.id, username, role: producer.role }, secretKey, { expiresIn: '1h' });
        return res.json({ role: producer.role, token });
    }
    else {
        return res.json({ message: "Incorrect Credentials" });
    }
}

module.exports = {
    producerSignup,
    producerLogin,
}