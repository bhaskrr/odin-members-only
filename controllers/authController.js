const asyncHandler = require("express-async-handler");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');


passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false, { message: "Incorrect username" });
            };

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: "Incorrect password" })
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }

    })
)

passport.serializeUser((user, done) => {
    // console.log(user.id);
    done(null, user.id);
});

passport.deserializeUser(asyncHandler(async (id, done) => {
    const user = await User.findById(id);
    // console.log(user);
    done(null, user);
}))


exports.signup_get = asyncHandler(async (req, res, next) => {
    res.render('signupform', { title: "Sign Up" })
})

exports.signup_post = [
    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Username must be at least 1 character long!")
        .escape()
        .withMessage('Username must be specified!')
        .custom(async (name) => {
            const user = await User.findOne({ username: name });
            if (user) {
                throw new Error("Username already in use!");
            }
        }),
    body('firstname')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Firstname should be at least 1 character long!')
        .escape()
        .withMessage("First name must be specified!")
        .custom(value => {
            const hasNumbers = /\d/.test(value);
            if (hasNumbers) {
                throw new Error("Firstname can not contain numbers")
            }
            return true;
        })
        .isAlphanumeric()
        .withMessage('First name has non-alphanumeric characters!'),
    body('lastname')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Lastname must be at least 1 character long!')
        .escape()
        .withMessage('Last name must be specified!')
        .custom(value => {
            const hasNumbers = /\d/.test(value);
            if (hasNumbers) {
                throw new Error("Lastname can not contain numbers")
            }
            return true;
        })
        .isAlphanumeric()
        .withMessage('Last name contains non-alphanumeric characters!'),
    body('password')
        .isLength({ min: 4 })
        .withMessage('Password should be atleast 4 characters long!'),
    body('passwordConfirmation')
        .custom((value, { req }) => {
            if (req.body.password !== value) {
                throw new Error("Passwords do not match!")
            }
            return true;
        }),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: hashedPassword,
        })

        //check for errors
        if (!errors.isEmpty()) {
            const errorsTosend = {};

            const usernameErr = errors.array().filter(error => error.path == "username");
            errorsTosend.usernameErr = usernameErr;

            const firstnameErr = errors.array().filter(error => error.path == "firstname");
            errorsTosend.firstnameErr = firstnameErr;

            const lastnameErr = errors.array().filter(error => error.path == "lastname");
            errorsTosend.lastnameErr = lastnameErr;

            const passwordErr = errors.array().filter(error => error.path == "password");
            errorsTosend.passwordErr = passwordErr;

            const confirmationErr = errors.array().filter(error => error.path == "passwordConfirmation");
            errorsTosend.confirmationErr = confirmationErr;

            // console.log(errors.array());
            // console.log(errorsTosend);
            res.render('signupform', {
                title: 'Sign Up',
                errors: errorsTosend,
            })
        }
        else {
            await user.save();
            res.render("login", { title: "Log in" });
        }
    })
]

exports.login_get = asyncHandler(async (req, res, next) => {
    res.render('login', { title: "Log in" })
})


exports.login_post = asyncHandler(async (req, res, next) => {
    // passport.authenticate('local', { successRedirect: '/homepage', failureRedirect: '/auth/login' });
    passport.authenticate('local', (err, user) => {
        if (err) { return next(err); } // Pass errors to middleware

        if (!user) {
            // Handle failed login (invalid credentials)
            return res.render('login', { error: "Invalid credentials"});
        }

        // Login successful (user object contains details)
        req.logIn(user, (loginErr) => { // Establish login session (modify if needed)
            if (loginErr) { return next(loginErr); }

            if (user.admin) { return res.redirect('/users/admin') }

            if (user.member) { return res.redirect('/users/member') };

            // Redirect or perform actions after successful login
            return res.redirect('/homepage'); // Or redirect
        });
    })(req, res, next); // Call passport.authenticate with proper arguments
});

// exports.member_get = asyncHandler(async (req, res, next) => {
//     res.render('memberform', { title: "Be a member" });
// });

// passport.authenticate('local');
// exports.member_post = async (req, res, next) => {

//     if (req.body.membercode === process.env.MEMBER_CODE) {
//         console.log(req.user);
//         const userId = req.user.id; // Assuming the user ID is stored in the session

//         if (!userId) {
//             // Handle case where user ID is not found in session
//             return res.render('error', { message: 'User id can not be retrieved' });
//         }

//         try {
//             const updatedUser = await User.findByIdAndUpdate(userId, { member: true });

//             if (!updatedUser) {
//                 // Handle case where user with the ID is not found
//                 return res.render('error', { message: 'User not found' });
//             }

//             return res.render('member');
//         } catch (error) {
//             console.error(error); // Log the error for debugging
//             return res.render('error', { message: 'An error occurred' }); // Generic error message for user
//         }
//     } else {
//         return res.render('error', { message: 'Incorrect member code' });
//     }
// }

// exports.admin_get = asyncHandler(async (req, res, next) => {
//     res.render('adminform', { title: "Be an admin" });
// });

// passport.authenticate('local');
// exports.admin_post = async (req, res, next) => {

//     if (req.body.admincode == process.env.ADMIN_CODE) {
//         const userId = req.user.id;
//         if (!userId) {
//             // Handle case where user ID is not found in session
//             return res.render('error', { message: 'User id can not be retrieved' });
//         }

//         try {
//             const updatedUser = await User.findByIdAndUpdate(userId, { admin: true });

//             if (!updatedUser) {
//                 // Handle case where user with the ID is not found
//                 return res.render('error', { message: 'User not found' });
//             }
//             return res.render("admin");
//         } catch (err) {
//             console.error(error); // Log the error for debugging
//             return res.render('error', { message: 'An error occurred' }); // Generic error message for user
//         }
//     }

//     else {
//         return res.render("error", { message: "Incorrect admin code" });
//     }
// }