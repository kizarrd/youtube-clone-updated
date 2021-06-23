import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => res.render("Join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    const { name, username, email, password1, password2, location } = req.body;
    const exists = await User.exists({ $or: [ { username }, { email }] });
    
    if(password1 !== password2){
        return res.status(400).render("join", {
            pageTitle: "Join", 
            errorMessage: "Passwords are different.",
        })
    }

    if(exists){
        return res.status(400).render("join", { 
            pageTitle: "Join", 
            errorMessage: "The username or email is already taken.",
        });
    }
    try {
        await User.create({
            name, username, email, password: password1, location,
        });
        return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", { 
            pageTitle: "Join",
            errorMessage: error._message,
        });
    }
};
export const getLogin = (req, res) => 
    res.render("login", { pageTitle: "Log in" } );

export const postLogin = async (req, res) => {
    const { username, password1 } = req.body;
    const user = await User.findOne({username, socialOnly: false });
    if(!user){
        return res.status(400).render("login", {
            pageTitle: "Log in",
            errorMessage: "An account with this username does not exist.",
        });
    }

    const ok = await bcrypt.compare(password1, user.password);
    if(!ok){
        return res.status(400).render("login", {
            pageTitle: "Log in",
            errorMessage: "Wrong password",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await ( 
        await fetch(finalUrl, {
            method: "POST",
            headers:{
                Accept: "application/json",
            },
        })
    ).json();
    if("access_token" in tokenRequest ){
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailData = await(
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj){
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if(!user){
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name,
                username: userData.login,
                email: userData.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            })
        }
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");
    }else{
        return res.redirect("/login");
    }
};
export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
    const { 
        session: {
            user: { _id, avatarUrl },
        },
        body: {
            name, email, username, location
        },
        file,
    } = req;
    console.log(file);
    const updatedUser = await User.findByIdAndUpdate( 
        _id, {
            avatarUrl: file ? file.path : avatarUrl,
            name, email, username, location,
        },
        { new: true }
    );
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
};
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};

export const getChangePassword = (req, res) => {
    if(req.session.user.socialOnly){
        return res.redirect("/");
    }
    return res.render("users/change-password", { pageTitle: "Change Password" });
}
export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: { _id, password },
        },
        body: {
            oldPassword,
            newPassword,
            newPasswordConfirmation
        }
    } = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword, user.password);
    if(!ok){
        return res.status(400).render(
            "users/change-password", { 
                pageTitle:  "Change Password", 
                errorMessage: "The old password does not match",
            });
    }

    if(newPassword !== newPasswordConfirmation){
        return res.status(400).render(
            "users/change-password", { 
                pageTitle:  "Change Password", 
                errorMessage: "Unsuccessful password confirmation",
            });
    }

    user.password = newPassword;
    await user.save();
    req.session.user.password = user.password;
    return res.redirect("/users/logout");
}

export const see = (req, res) => res.send("See user");