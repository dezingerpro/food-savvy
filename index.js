const express = require("express");
const mongoose = require("mongoose");
const User = require("./user");
const MainIng = require("./mainingredient");
const Question = require("./security_questions");
const Recipes = require("./recipe");
const Ingredient = require("./ingredients");
const app = express();
const userData = [];

app.listen(2000, () => {
    console.log("Conected to server at 2000");
})

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//hi
// connect to mongoose
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://abiali:abiali5253@foodsavvy.6erqsvj.mongodb.net/foodsavvy",)
    .then(() => {

        console.log('Connected Successfully');

        //post API for user registration
        app.post("/api/add_user", async (req, res) => {
            console.log("Result", req.body);
            try {
                //check if email taken
                let query = { uemail: req.body.uemail };
                console.log(query);
                console.log(req.body);
                let emailCheck = await User.findOne(query);
                console.log(emailCheck);
                if (emailCheck.uemail == req.body.uemail) {
                    console.log("Email Taken")
                    res.status(205).json(userData);
                }else{
                    const userData = await User.create(req.body);
                    res.status(200).json(userData);
                }
            } catch (error) {
                console.log(error);
                res.status(400).json({
                    'status': error.message
                })
            }
        })

        //post api for user login
        app.post("/api/get_user", async (req, res) => {

            try {
                console.log("Result", req.body);
                let email = req.body.uemail;
                let pass = req.body.upass;
                let query = { uemail: req.body.uemail };
                //console.log(query);
                let user = await User.findOne(query);
                if (user == null) {
                    //console.log("Email not found");
                    res.status(403).json(user);
                }
                else if (pass == user.upass) {
                    //console.log("Everything is ok")
                    res.status(401).json(user);
                } else {
                    //console.log("Password is not ok")
                    res.status(402).json(user);
                }

            } catch (error) {
                res.status(500).json(error.message)
            }

        })

        //forgot password
        app.post("/api/forgot_password", async (req, res) => {

            try {
                let email = req.body.uemail;
                let query = { uemail: email };
                let user = await User.findOne(query);
                if (user == null) {
                    //console.log("Email not found");
                    res.status(205).json(user);
                }
                else {
                    //console.log("Found")
                    res.status(200).json(user);
                    //console.log(res.json(user));
                }

            } catch (error) {
                res.status(500).json(error.message)
            }

        })

        //get question
        app.post("/api/get_question", async (req, res) => {

            try {
                let data = await Question.find();
                res.status(200).json(data);
                console.log(data);

            } catch (error) {
                res.status(500).json(error.message)
            }

        });

        //check answer
        app.post("/api/check_answer", async (req, res) => {

            try {
                let email = req.body.uemail;
                let answer = req.body.uanswer;
                let query = { uemail: email };
                let user = await User.findOne(query);
                if (user == null) {
                    res.status(400);
                }
                else {
                    console.log(answer);
                    console.log(user.uanswer);
                    if(answer==user.uanswer){
                        res.status(200).json(user);
                    }
                    else{
                        res.status(205);
                    }
                }

            } catch (error) {
                res.status(500).json(error.message)
            }

        });


        //update Password
        app.patch("/api/update_password", async (req, res) => {
            try {
                const updatedData = req.body; // Retrieve the updated data from the request body
                console.log(updatedData);
                // Update the recipe using findByIdAndUpdate method
                const data = await User.findOneAndUpdate(
                    { uemail: req.body.uemail },
                    { upass: req.body.upass },
                    { new: true }
                );

                if (!data) {
                    return res.status(404).json({ message: "User not found" });
                }

                res.status(200).json(data); // Send the updated recipe as a response
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        //get all recipes
        app.post("/api/get_allrecipe", async (req, res) => {

            try {
                let data = await Recipes.find();
                res.status(200).json(data);
                console.log(data);

            } catch (error) {
                res.status(500).json(error.message)
            }

        });

        //get main_ingredients
        app.post("/api/get_maining", async (req, res) => {

            try {
                let data = await MainIng.find();
                res.status(200).json(data);
                console.log(data);

            } catch (error) {
                res.status(500).json(error.message)
            }

        });

        //get ingredients
        app.post("/api/get_ingredients", async (req, res) => {

            try {
                let data = await Ingredient.find();
                res.status(200).json(data);
                //print(res.json(data));
                console.log(data);

            } catch (error) {
                res.status(500).json(error.message)
            }

        });

        //add recipes
        app.post("/api/add_recipe", async (req, res) => {
            console.log("Result", req.body);
            try {
                req.body.ringredients = JSON.parse(req.body.ringredients);
                const recipeData = await Recipes.create(req.body);
                console.log(recipeData);
                res.status(200).json(recipeData);
            } catch (error) {
                console.log(error);
                res.status(400).json({
                    'status': error.message
                })
            }
        })

        //update recipes
        app.put("/api/update_recipe", async (req, res) => {
            try {
                const id = req.body._id; // Retrieve the _id from the URL parameters
                req.body.ringredients = JSON.parse(req.body.ringredients);
                const updatedData = req.body; // Retrieve the updated data from the request body

                // Update the recipe using findByIdAndUpdate method
                const data = await Recipes.findByIdAndUpdate(id, updatedData, { new: true });

                if (!data) {
                    return res.status(404).json({ message: "Recipe not found" });
                }

                res.status(200).json(data); // Send the updated recipe as a response
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        //delete recipes
        app.post("/api/delete_recipe/:id", async (req, res) => {
            try {
                console.log(req.params.id)
                const id = req.params.id;
                const data = await Recipes.findByIdAndDelete(id);

                if (!data) {
                    return res.status(404).json({ message: "Recipe not found" });
                }

                res.status(200); // Send the updated recipe as a response
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }

    ).catch((err) => {
        console.error(err);
    });


// mongodb+srv://<abiali>:<csgo5253>@foodsavvy.6erqsvj.mongodb.net/?retryWrites=true&w=majority