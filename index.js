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


const bodyParser = require('body-parser');
const spawn = require("child_process").spawn;


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
                let emailCheck = await User.findOne(query);
                console.log(req.body.uemail);
                console.log("HELLO");
                console.log(emailCheck);
                if (emailCheck != null) {
                    console.log("Email Taken")
                    res.status(205).json(userData);
                } else {
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
                    if (answer == user.uanswer) {
                        res.status(200).json(user);
                    }
                    else {
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
                //console.log(data);
                res.status(200).json(data);
            } catch (error) {
                res.status(500).json(error.message)
            }

        });

        // Endpoint to update the last viewed recipe
        app.post('/api/updateLastViewed', async (req, res) => {
            const { userId, lastViewedRecipes } = req.body;

            if (!userId || !lastViewedRecipes) {
                return res.status(400).send('User ID and last viewed recipes are required.');
            }

            try {
                const user = await User.findByIdAndUpdate(userId, {
                    $set: {
                        lastViewedRecipes: lastViewedRecipes
                    }
                });
                console.log(user);
                res.status(200).send('Last viewed recipes updated successfully.');
                
            } catch (error) {
                console.error('Error updating last viewed recipes:', error);
                res.status(500).send(error.message);
            }
        });

        app.post('/api/getLastViewedRecipes', async (req, res) => {
            //console.log(req.body);
            const { userId } = req.body;
            //console.log(userId);
          
            if (!userId) {
                console.log('User ID is required.')
              return res.status(400).send('User ID is required.');
            }
          
            try {
              // Convert the userId to a valid ObjectId
              const validUserId = new mongoose.Types.ObjectId(userId);
              //console.log(validUserId);
              const user = await User.findById(validUserId);
              //console.log(user);
          
              if (!user) {
                console.log('User not found.');
                return res.status(404).send('User not found.');
              }
          
              res.status(200).json({ lastViewedRecipes: user.lastViewedRecipes || [] });
            } catch (error) {
              console.error('Error fetching last viewed recipes:', error);
              res.status(500).send(error.message);
            }
          });

          //recommend RECIPES PYTHON
          app.post('/api/recommended_recipes', (req, res) => {
            // Extract userId from the request body
            const { userId } = req.body;
          
            //console.log(userId);
            // Check if userId is provided
            if (!userId) {
              return res.status(400).json({ error: 'UserId is required' });
            }
          
            // Spawn a child process to run the Python script
            const pythonProcess = spawn('python', ['./recommended_recipes.py', userId]);
          
            // Collect data from script
            let dataString = '';
            pythonProcess.stdout.on('data', function(data) {
              dataString += data.toString();
            });
          
            // Handle script completion
            pythonProcess.on('close', (code) => {
              //console.log(`Child process closed with code ${code}`);
              if (code !== 0) {
                return res.status(500).json({ error: 'Failed to generate recommendations' });
              }
          
              // Parse the Python script's output and send as JSON
              try {
                const recommendations = JSON.parse(dataString.trim());
                //console.log(recommendations);
                res.json(recommendations);
              } catch (error) {
                console.error('Failed to parse recommendations:', error);
                res.status(500).json({ error: 'Failed to parse recommendations' });
              }
            });
          
            // Handle errors in the Python script
            pythonProcess.stderr.on('data', (data) => {
                console.error(`Error from Python script: ${data.toString()}`);
              console.error(`stderr: ${data}`);
            });
          
            pythonProcess.on('error', (error) => {
                console.log(`Raw output from Python script: ${dataString}`);
              console.error(`Failed to start subprocess: ${error}`);
              res.status(500).json({ error: 'Failed to start subprocess' });
            });
          });

        //pythoncodetosearch
        app.post('/api/search_recipes', (req, res) => {
            const ingredients = req.body.ingredients;
            const pythonProcess = spawn('python', ['./ingredientSearch.py', ingredients]);
            let dataString = '';
            //console.log(pythonProcess);

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            console.log(dataString);

            pythonProcess.on('error', (error) => {
                console.error(`Error executing Python script: ${error}`);
                res.status(500).send("Error executing Python script");
            });

            pythonProcess.on('close', (code) => {
                console.log(`Python script exited with code ${code}`);
                const output = JSON.parse(dataString);  // Parse the output string as JSON
                //console.log(output.recommended_recipes);  // Access the recommended recipes
                res.json(output);  // Send the output as JSON
            });
        });


        //savecart
        app.post("/api/saveUserCart", async (req, res) => {
            const { userId, ucart } = req.body;
            if (!userId || !ucart) {
              return res.status(400).send("Missing userId or cart data.");
            }
            try {
              const user = await User.findById(userId);
              if (!user) {
                return res.status(404).send("User not found.");
              }
              user.ucart = ucart; // Update the user's cart
              await user.save(); // Save the updated user document
              console.log(user);
              res.send("Cart updated successfully.");
            } catch (error) {
              console.error(error);
              res.status(500).send("An error occurred while updating the cart.");
            }
          });

        //fetch cart
        app.get("/api/getUserCart/:userId", async (req, res) => {
            const { userId } = req.params;
            try {
              const user = await User.findById(userId, "ucart"); // Select only the ucart field
              if (!user) {
                return res.status(404).send("User not found.");
              }
          
              res.json(user.ucart); // Send the user's cart data
            } catch (error) {
              console.error(error);
              res.status(500).send("An error occurred while fetching the cart.");
            }
          });


        //get main_ingredients
        app.post("/api/get_maining", async (req, res) => {

            try {
                let data = await MainIng.find();
                res.status(200).json(data);
                //console.log(data);

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
                //console.log(data);

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
                //console.log(recipeData);
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