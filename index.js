const express = require("express");
const mongoose = require("mongoose");
const User = require("./user");
const Order = require("./order");
const MainIng = require("./mainingredient");
const Question = require("./security_questions");
const Recipes = require("./recipe");
const Ingredient = require("./ingredients");
const Rating = require("./ratings");
const Allergen = require("./allergen");
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
                    console.log("Everything is ok")
                    var ingredients = await fetchUserCartIngredients(user._id);
                    console.log(ingredients);
                    res.status(401).json({ user: user, ingredients: ingredients });
                } else {
                    //console.log("Password is not ok")
                    res.status(402).json(user);
                }

            } catch (error) {
                res.status(500).json(error.message)
            }

        })

        // Fetch user by ID
        app.get('/api/user/:id', async (req, res) => {
            try {
                const user = await User.findById(req.params.id);
                if (!user) {
                    return res.status(404).send('User not found');
                }
                res.send(user);
            } catch (error) {
                res.status(500).send('Error fetching user');
            }
        });

        //update user id
        app.patch('/api/user/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const updateData = req.body;

                // Option to ensure the document is returned after update and that validators run
                const options = { new: true, runValidators: true };

                const user = await User.findByIdAndUpdate(id, updateData, options);

                if (!user) {
                    return res.status(404).send('User not found');
                }

                res.send(user);
            } catch (error) {
                res.status(400).send('Error updating user: ' + error.message);
            }
        });

        // create a new order
        app.post('/api/orders', async (req, res) => {
            const { userId, items } = req.body;
            console.log(req.body);
            try {
                // Create and save the new order
                const newOrder = new Order({ userId, items });
                const savedOrder = await newOrder.save();

                // Optionally, update the user document with the new order ID
                // You might want to push the order ID into an array of orders for the user
                await User.findByIdAndUpdate(userId, {
                    $push: { uorder: savedOrder._id }
                });
                console.log("bro");
                res.status(201).json(savedOrder);
            } catch (error) {
                console.log('here' + error.message);
                res.status(400).send('Error creating order: ' + error.message);
            }
        });

        // Fetch recipe by ID
        app.get('/api/single_recipes/:id', async (req, res) => {
            try {
                const recipe = await Recipes.findById(req.params.id);
                if (!recipe) {
                    return recipe.status(404).send('Recipe not found');
                }
                res.send(recipe);
            } catch (error) {
                res.status(500).send('Error fetching Recipe');
            }
        });

        //get orders
        app.get('/api/get_orders', async (req, res) => {
            try {
                const orders = await Order.find(); // Fetch all orders
                res.json(orders);
            } catch (error) {
                res.status(500).send("Error fetching orders: " + error.message);
            }
        });

        //update orders
        app.put('/api/update_orders/:orderId/status', async (req, res) => {
            const { orderId } = req.params;
            const { status } = req.body;

            try {
                const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
                if (!order) {
                    return res.status(404).send("Order not found.");
                }
                res.json(order);
            } catch (error) {
                res.status(500).send("Error updating order status: " + error.message);
            }
        });

        //fetch orders by user ID
        app.get('/api/userOrders/:userId', async (req, res) => {
            try {
                const { userId } = req.params;
                const user = await User.findById(userId);
                if (!user) {
                    return res.status(404).send('User not found');
                }

                // Fetch orders based on the order IDs in user.uorder
                const orders = await Order.find({
                    '_id': { $in: user.uorder }
                });

                res.json(orders);
            } catch (error) {
                res.status(500).send('Error fetching orders: ' + error.message);
            }
        });

        // POST endpoint for submitting a recipe rating
        app.post('/api/add_ratings', async (req, res) => {
            try {
                const { recipeId, userId, rating, review } = req.body;
                // Validate input, ensure required fields are provided
                if (!recipeId || !userId || rating === undefined) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                // Create and save the new rating
                const newRating = new Rating({ recipeId, userId, rating, review });
                await newRating.save();
                // save in user 
                await User.findByIdAndUpdate(userId, { $push: { uratings: newRating._id } });

                res.status(201).json(newRating);

            } catch (error) {
                res.status(500).json({ message: 'Error saving recipe rating', error: error.message });
            }
        });

        // fetch ratings as per recipe
        app.get('/api/get_ratings', async (req, res) => {
            try {
              const { recipeId } = req.query; // Assuming you pass recipeId as a query parameter
                console.log(recipeId);
              if (!recipeId) {
                return res.status(400).json({ message: 'Recipe ID is required' });
              }
          
              const ratings = await Rating.find({ recipeId }).populate('userId', 'uname'); // Assuming 'userId' references a User model with a 'username' field
              console.log(ratings);
              res.status(200).json(ratings);
            } catch (error) {
              console.error('Failed to fetch ratings:', error);
              res.status(500).json({ message: 'Failed to fetch ratings', error: error.message });
            }
          });

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
            pythonProcess.stdout.on('data', function (data) {
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

        //get ingredients detailed
        app.post('/api/get_ingredient_details', async (req, res) => {
            const { ingredientName } = req.body;
            console.log(ingredientName);
            if (!ingredientName) {
                return res.status(400).send({ message: 'Ingredient name is required.' });
            }

            try {
                // Adjusted to match your schema field 'iname' for ingredient name
                const ingredient = await Ingredient.findOne({ iname: ingredientName });
                console.log(ingredient);

                if (!ingredient) {
                    return res.status(404).send({ message: 'Ingredient not found.' });
                }

                // Adjust the response as necessary, based on what details you want to send back
                res.status(200).send({
                    _id: ingredient.id,
                    iname: ingredient.iname,
                    iimage: ingredient.iimage,
                    istock: ingredient.istock,
                    iprice: ingredient.iprice,
                });
            } catch (error) {
                console.error('Error fetching ingredient details:', error);
                res.status(500).send({ message: 'Error fetching ingredient details.' });
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

    // Add Ingredient
    app.post('/api/add_ingredient', async (req, res) => {
        const { _id, ...ingredientData } = req.body; 
        try {
          const ingredient = new Ingredient(ingredientData);
          await ingredient.save();
          res.status(201).json({
            message: "Ingredient added successfully",
            ingredient: ingredient
          });
        } catch (error) {
          console.error('Error adding ingredient:', error);
          res.status(400).send({
            message: "Error adding ingredient",
            error: error.message
          });
        }
      });
  
  // Update Ingredient
  app.patch('/api/update_ingredient/:id', async (req, res) => {
    try {
      const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!ingredient) {
        return res.status(404).send();
      }
      res.send(ingredient);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Delete Ingredient
  app.delete('/api/delete_ingredient/:id', async (req, res) => {
    try {
      const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
      if (!ingredient) {
        return res.status(404).send();
      }
      res.send(ingredient);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  //ANALYSE RECIPES
  app.post('/api/analyze-recipes', async (req, res) => {
    try {
        console.log("HERE");
      await analyzeAndUpdateRecipes(); // This function is defined in the previous example
      res.status(200).send('Re-analysis of recipes completed successfully.');
    } catch (error) {
      console.error('Failed to re-analyze recipes:', error);
      res.status(500).send('Error re-analyzing recipes');
    }
  });

  async function getAllergensMap() {
    const allergens = await Allergen.find();
    const allergenMap = new Map();
  
    allergens.forEach(allergen => {
      allergen.ingredients.forEach(ingredient => {
        if (!allergenMap.has(ingredient)) {
          allergenMap.set(ingredient, []);
        }
        allergenMap.get(ingredient).push(allergen.allergen);
      });
    });
  
    return allergenMap;
  }
  
  async function analyzeAndUpdateRecipes() {
    const allergenMap = await getAllergensMap();
    const recipes = await Recipes.find();
  
    const updatePromises = recipes.map(async (recipe) => {
      const currentAllergens = new Set(recipe.allergens || []);
  
      recipe.ringredients.forEach(ingredientObj => {
        const ingredientName = ingredientObj.ingredientName;
        if (allergenMap.has(ingredientName)) {
          allergenMap.get(ingredientName).forEach(allergen => {
            currentAllergens.add(allergen);
          });
        }
      });
  
      // Only update the database if new allergens are identified
      if (recipe.allergens?.length !== currentAllergens.size) {
        return Recipes.updateOne({ _id: recipe._id }, { $set: { allergens: Array.from(currentAllergens) } });
      }
    });
  
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    console.log('Allergy analysis and updates completed.');
  }
  
  
  
  // API endpoint to fetch all allergens
app.get('/api/get_allergens', async (req, res) => {
    try {
      const allergens = await Allergen.find({});
      res.status(200).json(allergens);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update uCart
app.post('/api/updateCart', async (req, res) => {
    const { userId, ucart } = req.body; // cartItems is an array of { id: ingredientId, qty: quantity }
    console.log(userId, ucart);
    try {
      await User.findByIdAndUpdate(userId, { $set: { ucart: ucart } });
      console.log("HELLO");
      res.json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
    console.log(error);
      res.status(500).json({ success: false, message: "Error updating cart" });
    }
  });
  
  // Fetch Cart Contents
  app.get('/api/getCart/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
      const ingredientIds = user.ucart.map(item => item.id);
      // Assuming you have a model called Ingredient to fetch ingredient details
      const ingredients = await Ingredient.find({ '_id': { $in: ingredientIds } });
  
      // Merge quantity information
      const cartContents = ingredients.map(ingredient => {
        const quantity = user.ucart.find(item => item.id === ingredient._id.toString()).qty;
        return { ...ingredient._doc, quantity };
      });
  
      res.json({ success: true, cartContents });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching cart contents" });
    }
  });

  async function fetchUserCartIngredients(userId) {
    try {
      const user = await User.findById(userId).exec();
      if (!user || !user.ucart) {
        return []; // Return empty array if user or cart not found
      }
      const ingredientIds = user.ucart.map(cartItem => cartItem.id);
      const ingredients = await Ingredient.find({ '_id': { $in: ingredientIds } }).exec();

      return ingredients; // Returns the fetched ingredients
    } catch (error) {
      console.error('Error fetching cart ingredients:', error);
      return []; // Return empty array in case of error
    }
  }
  
  


// mongodb+srv://<abiali>:<csgo5253>@foodsavvy.6erqsvj.mongodb.net/?retryWrites=true&w=majority