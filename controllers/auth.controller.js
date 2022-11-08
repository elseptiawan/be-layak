var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var { User } = require('../models');

exports.login = async(req, res) => {
    try {
        const user = await User.findOne({
            where:{
                email: req.body.email
            },
            include : ['company']
        });
        const match = await bcrypt.compareSync(req.body.password, user.password);
        if(!match) return res.status(400).json({success: 'false', message: 'wrong password'});
        const userId = user.id;
        const nama = user.nama;
        const email = user.email;

        const token = jwt.sign({userId, nama, email}, process.env.API_SECRET, {
            expiresIn: '86400s'
        });
        
        res.json({success: 'true', data: user, token: token});
    } catch (error) {
        res.status(400).json({success: 'false', message: 'wrong email'});
    }
}

exports.logout = async(req, res) => {
    try {
        const userSchema = await User.findOne({
            where:{
                email: req.body.email
            }
        });
        userSchema.token = null;
        await userSchema.save();
        res.status(200).json({
            success: 'true', 
            message: 'Logout successful',
            data: {}
        });
    } catch (error) {
        res.status(400).json({success: 'false', message: 'logout failed'});
    }
}

exports.forgotPassword = async(req, res) => {
    try {
        const user = await User.findOne({
            where:{
                email: req.body.email
            }
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                status: 'error'
            });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({validateBeforeSave: false});
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset/${resetToken}`;
        const message = `You are receiving this email because you have requested the reset of a password. Please access the following link to reset your password: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email and your password will remain unchanged.`;
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });
            res.status(200).json({
                success: 'true',
                message: 'Reset token has been sent to your email',
                data: {}
            });
        } catch(error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({validateBeforeSave: false});
            return next(new ErrorResponse('Email could not be sent', 500));
        }
    } catch(error) {
        res.status(400).json({success: 'false', message: 'Email not found'});
    }
}

exports.resetPassword = async(req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

        const user = await User.findOne({
            where:{
                email: req.body.email,
                resetPasswordToken: resetPasswordToken,
                resetPasswordExpire: {
                    [Op.gt]: Date.now()
                }
            }
        });

        if(!user) {
            return res.status(400).json({
                success: 'false', 
                message: 'Invalid Token',
                data: {}
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: 'true',
            message: 'Password reset successful',
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: 'false', 
            message: 'Reset password failed'
        });
    }
}