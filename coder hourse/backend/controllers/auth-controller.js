const otpService = require('../services/otp-service');
const hashservice = require('../services/hash-service');
const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dtos')

class AuthController {
    async sendOtp(req, res) {
        //logic
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: "phone field is required" });
        }

        const otp = await otpService.generateOtp();
        const ttl = 1000 * 60 * 2;
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`;
        const hash = hashservice.hashOtp(data);

        // Send otp 
        try {
            // await otpService.sendBySms(phone, otp);
            return res.json({
                hash: `${hash}.${expires}`,
                phone,
                otp
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "message sending failed" });
        }
    }

    async verifyOtp(req, res) {
        //log
        const { otp, hash, phone } = req.body;

        if (!otp || !hash || !phone) {
            return res.status(400).json({ message: "all fields are required" });
        }

        const [hashedOtp, expires] = hash.split('.');


        if (Date.now() > +expires) {
            return res.status(400).json({ message: "otp expired" });
        }

        const data = `${phone}.${otp}.${expires}`;
        console.log(expires, "expires");
        const isValid = otpService.verifyOtp(hashedOtp, data);

        if (!isValid) {
            return res.status(400).json({ message: "invalid otp" });
        }

        let user;

        try {
            user = await userService.findUser({ phone });

            if (!user) {
                user = await userService.createUser({ phone });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'DB Error' });
        }

        const { accessToken, refreshToken } = tokenService.generateToken({
            _id: user._id,
            activated: false
        });
        const userDto = new UserDto(user)
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });
        return res.json({ accessToken, user: userDto });
    }
}

module.exports = new AuthController();
