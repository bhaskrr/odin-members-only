const asyncHandler = require('express-async-handler');
const passport = require('passport');

const Message = require('../models/message');

passport.authenticate('local');

exports.homepage = asyncHandler(async (req, res, next) => {
    const messages = await Message.find({}, "title time").exec();
    const user = req.user;
    res.render('homepage', { user: user, messages: messages });
})

// passport.authenticate('local');
exports.messages_get = (req, res, next) => {
    console.log(req.user);
    res.render('messageform', { title: "Create a message" });
}

exports.messages_post = async(req,res,next)=>{
    // console.log(req.user);
    const message = new Message ({
        title: req.body.title,
        text: req.body.text,
        author: req.user.username,
    })

    try{
        await message.save();

        if(req.user.admin){
            return res.redirect('/users/admin');
        }

        if(req.user.member){
            return res.redirect('/users/member');
        }

        res.rendirect('/homepage');
        
    } catch(err){
        console.log(err);
        res.render('messageform', { message: "Message could not be saved" });
    }
}