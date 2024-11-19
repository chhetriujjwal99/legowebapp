// const setData = require("../data/setData");
// const themeData = require("../data/themeData");
require('dotenv').config();
const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
const sequelize = new Sequelize(
    process.env.PGDATABASE, 
    process.env.PGUSER, 
    process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  });
  
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch((err) => {
      console.log('Unable to connect to the database:', err);
    });



//Model creation
    const Theme = sequelize.define('Theme', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: Sequelize.STRING,
    }, {
        timestamps: false, // Disable createdAt and updatedAt fields
    });
    
    const Set = sequelize.define('Set', {
        set_num: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        name: Sequelize.STRING,
        year: Sequelize.INTEGER,
        num_parts: Sequelize.INTEGER,
        theme_id: Sequelize.INTEGER,
        img_url: Sequelize.STRING,
    }, {
        timestamps: false,
    });
    
    // Create the association between `Set` and `Theme`
    Set.belongsTo(Theme, { foreignKey: 'theme_id' });
    


    // sequelize
    // .sync()
    // .then(async () => {
    //     try {
    //         await Theme.bulkCreate(themeData);
    //         await Set.bulkCreate(setData);
    //         console.log("-----");
    //         console.log("data inserted successfully");
    //     } catch (err) {
    //         console.log("-----");
    //         console.log(err.message);
    //         // If foreign key errors occur, review themeData and setData to ensure consistency
    //     }
    //     process.exit();
    // })
    // .catch((err) => {
    //     console.log('Unable to connect to the database:', err);
    // });








// let sets = [];

// function initialize() {
//     return new Promise((resolve, reject) => {
//         try {
//             sets = setData.map(set => {
//                 const theme = themeData.find(theme => theme.id === set.theme_id)?.name || "Unknown";
//                 return { ...set, theme };
//             });
//             resolve();
//         } catch (error) {
//             reject("Failed to initialize sets data.");
//         }
//     });
// }



function initialize() {
    return sequelize.sync()
        .then(() => {
            console.log("Database synced successfully.");
        })
        .catch((err) => {
            return Promise.reject("Unable to sync the database: " + err);
        });
}


// function getAllSets() {
//     return new Promise((resolve, reject) => {
//         if (sets.length > 0) {
//             resolve(sets);
//         } else {
//             reject("No sets available.");
//         }
//     });
// }


function getAllSets() {
    return Set.findAll({ include: [Theme] })
        .then((sets) => {
            return Promise.resolve(sets);
        })
        .catch((err) => {
            return Promise.reject("Unable to fetch sets: " + err);
        });
}


// function getSetByNum(setNum) {
//     return new Promise((resolve, reject) => {
//         const foundSet = sets.find(set => set.set_num === setNum);
//         if (foundSet) {
//             resolve(foundSet);
//         } else {
//             reject(`Set with number ${setNum} not found.`);
//         }
//     });
// }

// function getSetByNum(setNum) {
//     return Set.findAll({ 
//         include: [Theme], 
//         where: { set_num: setNum } 
//     })
//     .then((sets) => {
//         if (sets.length > 0) {
//             return Promise.resolve(sets[0]); // Return the first element
//         } else {
//             return Promise.reject("Unable to find requested set");
//         }
//     })
//     .catch((err) => {
//         return Promise.reject("Error fetching set: " + err);
//     });
// }




// function getSetsByTheme(theme) {
//     return new Promise((resolve, reject) => {
//         const filteredSets = sets.filter(set => set.theme.toLowerCase().includes(theme.toLowerCase()));
//         if (filteredSets.length > 0) {
//             resolve(filteredSets);
//         } else {
//             reject(`No sets found for theme containing "${theme}".`);
//         }
//     });
// }
function getSetsByTheme(theme) {
    return Set.findAll({
        include: [Theme],
        where: {
            '$Theme.name$': {
                [Sequelize.Op.iLike]: `%${theme}%` // Case-insensitive search
            }
        }
    })
    .then((sets) => {
        if (sets.length > 0) {
            return Promise.resolve(sets);
        } else {
            return Promise.reject("Unable to find requested sets");
        }
    })
    .catch((err) => {
        return Promise.reject("Error fetching sets: " + err);
    });
}







module.exports = { initialize, getAllSets, getSetsByTheme,sequelize, Theme, Set  };

module.exports.getAllThemes = () => {
    return Theme.findAll()
        .then((themes) => themes)
        .catch((err) => {
            throw new Error(`Unable to retrieve themes: ${err.message}`);
        });
};

module.exports.addSet = (setData) => {
    return Set.create(setData)
        .then(() => {})
        .catch((err) => {
            throw new Error(err.errors[0].message);
        });
};

module.exports.getSetByNum = (setNum) => {
    return Set.findOne({ where: { set_num: setNum } })
        .then((set) => {
            if (set) return set;
            else throw new Error('Set not found');
        })
        .catch((err) => {
            throw new Error(`Unable to retrieve set: ${err.message}`);
        });
};

module.exports.editSet = (set_num, setData) => {
    return Set.update(setData, { where: { set_num } })
        .then(() => {})
        .catch((err) => {
            throw new Error(err.errors[0].message);
        });
};

module.exports.deleteSet = (set_num) => {
    return Set.destroy({ where: { set_num } })
        .then((deleted) => {
            if (deleted) {
                return; // Resolve successfully if deletion was successful
            } else {
                throw new Error('Set not found or already deleted');
            }
        })
        .catch((err) => {
            throw new Error(err.message || 'Error deleting the set');
        });
};
