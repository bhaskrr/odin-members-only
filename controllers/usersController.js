const asyncHandler = require('express-async-handler');
const passport = require('passport');

const User = require('../models/user');
const Message = require('../models/message');


exports.member = asyncHandler(async(req,res,next)=>{
    const messages = await Message.find({}).exec();
    res.render('member', {messages: messages});
})

exports.memberform_get = asyncHandler(async (req, res, next) => {
    res.render('memberform', { title: "Be a member" });
});

passport.authenticate('local');
exports.memberform_post = async (req, res, next) => {

    if (req.body.membercode === process.env.MEMBER_CODE) {
        // console.log(req.user);
        const userId = req.user.id; // Assuming the user ID is stored in the session

        if (!userId) {
            // Handle case where user ID is not found in session
            return res.render('memberform', { message: 'User id can not be retrieved' });
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(userId, { member: true });

            if (!updatedUser) {
                // Handle case where user with the ID is not found
                return res.render('memberform', { message: 'User not found' });
            }

            
            return res.redirect('/users/member');
        } catch (error) {
            console.error(error); // Log the error for debugging
            return res.render('memberform', { message: 'An error occurred' }); // Generic error message for user
        }
    } else {
        return res.render('memberform', { message: 'Incorrect member code' });
    }
}

exports.admin_get = asyncHandler(async(req,res,next)=>{
    const messages = await Message.find({}).populate('author').exec();
    if(!messages){
        return res.render('admin', {message: "Unable to retrieve messages!"})
    }
    res.render('admin', {messages : messages})
})


passport.authenticate('local');
exports.adminform_get = asyncHandler(async(req,res,next)=>{
    res.render('adminform', {title: "Be an admin!"});
})


passport.authenticate('local');
exports.adminform_post = async (req, res, next) => {

    if (req.body.admincode == process.env.ADMIN_CODE) {
        const userId = req.user.id;
        if (!userId) {
            // Handle case where user ID is not found in session
            return res.render('adminform', { message: 'User id can not be retrieved' });
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(userId, { admin: true });

            if (!updatedUser) {
                // Handle case where user with the ID is not found
                return res.render('adminform', { message: 'User not found' });
            }
            return res.redirect("/users/admin");
        } catch (err) {
            console.error(err); // Log the error for debugging
            return res.render('adminform', { message: 'An error occurred' }); // Generic error message for user
        }
    }

    else {
        return res.render("adminform", { message: "Incorrect admin code" });
    }
}