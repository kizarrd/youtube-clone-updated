import User from "../models/User";

export const getJoin = (req, res) => res.render("Join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    console.log(req.body);
    const { name, username, email, password1, password2 } = req.body;
    const exists = await User.exists({ $or: [ { username }, { email }] });
    
    if(password1 !== password2){
        return res.render("join", {
            pageTitle: "Join", 
            errorMessage: "Passwords are different.",
        })
    }

    if(exists){
        return res.render("join", { 
            pageTitle: "Join", 
            errorMessage: "The username or email is already taken.",
        });
    }
    await User.create({
        name, username, email, password: password1,
    });
    return res.redirect("/login");
};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("delete User");
export const login = (req, res) => res.send("Log in");
export const logout = (req, res) => res.send("Log out");
export const see = (req, res) => res.send("See user");