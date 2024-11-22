/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Bibek Poudel
*  Student ID: 157056227
*  Date: 2024/11/19
********************************************************************************/

const express = require("express");
const legoData = require("./modules/legoSets");
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const { Theme, Set, getAllThemes, addSet ,getSetByNum,editSet,deleteSet } = require('./modules/legoSets');


require('pg'); 
const Sequelize = require('sequelize');


app.use(express.static(__dirname + '/public'));

// app.set('views', __dirname + '/views');


app.set("views", __dirname + "/views");
app.set("view engine", "ejs");



legoData.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to initialize lego data: ", error);
});
// console.log('Lego Data:', legoData.getAllSets());

// Convert legoSets to an array of values
// const legoSets = JSON.parse(JSON.stringify(legoData)); // Convert JSON to array format


// app.get("*", (req, res) => {
//   res.status(404).render("404", { message: "The page you are looking for does not exist." });
// });

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, '/views/home.html'));
    res.render("home",{ page: '/' });
  });
  
  app.get('/about', (req, res) => {
    // res.sendFile(path.join(__dirname, '/views/about.html'));
    res.render("about",{ page: '/about' });
  });
  
//   app.get('/lego/sets', async(req, res) => {
//    // Should output `true` if it's an array
   
//     await res.render('sets', { sets: legoData.getAllSets() });
   
// });
app.get('/lego/sets', async (req, res) => {
  try {
    const theme = req.query.theme;
      let legoDatas = await legoData.getAllSets(); // Await the Promise to get the actual data
      // console.log('Lego Data:', legoDatas); // Log the actual data
       // Filter the sets based on the theme if provided
    if (theme) {
      legoDatas = legoDatas.filter(set => set.theme === theme);
  }
      res.render('sets', { sets: legoDatas}); // Pass the data to your EJS template
  } catch (error) {
      console.error('Error fetching Lego data:', error); // Log any errors
      res.status(500).send('Internal Server Error'); // Handle error response
  }
});

// app.get('/lego/addSet', (req, res) => {
//   Theme.findAll()
//       .then((themes) => {
//           res.render('addSet', { themes });
//       })
//       .catch((err) => {
//           res.status(500).send('Error fetching themes: ' + err);
//       });
// });

app.get('/lego/addSet', async (req, res) => {
  try {
      const themes = await getAllThemes();
      res.render('addSet', { themes });
  } catch (err) {
      res.render('500', { message: `Unable to load themes: ${err.message}` });
  }
});

app.get('/lego/editSet/:num', async (req, res) => {
  const setNum = req.params.num;

  try {
      const set = await getSetByNum(setNum);
      const themes = await getAllThemes();

      res.render('editSet', { set, themes });
  } catch (err) {
      res.status(404).render('404', { message: `Error retrieving data: ${err.message}` });
  }
});

app.post('/lego/editSet', async (req, res) => {
  const { set_num, ...setData } = req.body;

  try {
      await editSet(set_num, setData);
      res.redirect('/lego/sets');
  } catch (err) {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.errors[0].message}` });
  }
});

app.get('/lego/deleteSet/:num', async (req, res) => {
  const setNum = req.params.num;

  try {
      await deleteSet(setNum);
      res.redirect('/lego/sets');
  } catch (err) {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
  }
});



// app.post('/lego/addSet', (req, res) => {
//   const { name, year, num_parts, img_url, theme_id, set_num } = req.body;

//   Set.create({
//       name,
//       year,
//       num_parts,
//       img_url,
//       theme_id,
//       set_num,
//   })
//       .then(() => {
//           res.redirect('/lego'); // Redirect to the main LEGO page or wherever appropriate
//       })
//       .catch((err) => {
//           res.status(500).send('Error adding set: ' + err);
//       });
// });

app.post('/lego/addSet', async (req, res) => {
  try {
      await addSet(req.body);
      res.redirect('/lego/sets');
  } catch (err) {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.errors[0].message}` });
  }
});


//   app.get('/lego/sets', async(req, res) => {
//     const theme = req.query.theme;
// const data = await legoData.getAllSets();
// console.log(data);
    
//     try {
//         if (theme) {
//             const filteredSets = data.filter(set => set.theme.toLowerCase() === theme.toLowerCase());
//             if (filteredSets.length > 0) {
//                 res.json(filteredSets);
//             } else {
//                 res.status(404).send(`No Lego sets found for theme: ${theme}`);
//             }
//         } else {
//             res.json(data);
//         }
//     } catch (error) {
//         res.status(404).send('Error fetching Lego sets');
//     }
   
// });



// app.get('/lego/sets/:set_num', async(req, res) => {
//     const setNum = req.params.set_num;
//     const data = await legoData.getAllSets(); 

//     try {
//         const set = data.find(s => s.set_num === setNum);
//         if (set) {
//             res.json(set);
//         } else {
//             res.status(404).send(`Lego set with number ${setNum} not found.`);
//         }
//     } catch (error) {
//         res.status(404).send('Error fetching Lego set');
//     }
// });




app.get("/lego/sets/:set_num", async (req, res) => {

  const setNum = req.params.set_num;
 
  try {
    const data = await legoData.getAllSets(); 
    const legoset = data.find(s => s.set_num === setNum); // Assuming getLegoSet is your function to fetch the Lego set
      if (legoset) {
          res.render("set", { set: legoset });
      } else {
          res.status(404).send("Set not found");
      }
  } catch (error) {
      console.error("Error fetching Lego set:", error);
      res.status(500).send("Error fetching Lego set");
  }
});


  

  app.get('/lego/sets/:id', async(req, res) => {
    const data = await legoData.getSetByNum();
    const set = data.find(set => set.set_num === req.params.id);
    if (set) {
      res.json(set);
    } else {
      res.status(404).send('Lego set not found');
    }
  });
  
  // app.use((req, res) => {
  //   res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
  // });
  app.get("*", (req, res) => {
  res.status(404).render("404", { message: "The page you are looking for does not exist." });
});


  

// app.get("/", (req, res) => {
//     res.send("Assignment 2: Bibek Poudel - 157056227");
// });

// app.get("/lego/sets", (req, res) => {
//     legoData.getAllSets().then((sets) => {
//         res.json(sets);
//     }).catch((error) => {
//         res.status(500).send(error);
//     });
// });


// app.get("/lego/sets/num-demo", (req, res) => {
//     legoData.getSetByNum("71002-5").then((set) => { 
//         res.json(set);
//     }).catch((error) => {
//         res.status(500).send(error);
//     });
// });


// app.get("/lego/sets/theme-demo", (req, res) => {
//     legoData.getSetsByTheme("Holiday").then((sets) => { 
//         res.json(sets);
//     }).catch((error) => {
//         res.status(500).send(error);
//     });
// });


app.get("/files", (req, res) => {
    const directoryPath = path.join(__dirname, "data"); 

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send("Unable to scan directory: " + err);
        }

        
        res.json(files);
    });
});
