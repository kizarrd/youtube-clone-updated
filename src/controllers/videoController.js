const fakeUser = {
    username: "Nicolas",
    loggedIn: false
};

export const trending = (req, res) => res.render("home", {pageTitle: "Home", fakeUser: fakeUser});
export const see = (req, res) => res.render("watch");
export const edit = (req, res) => res.render("edit");
export const upload = (req, res) => res.send("Video Upload")
export const remove = (req, res) => res.render("remove");
export const search = (req, res) => res.send("Search Videos");
