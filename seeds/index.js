const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedhelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/camp", {
  useNewUrlParser: true,
  //useCreateIndex: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "61d1a5dc6fe24c2752f4656e",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatem mollitia nisi aspernatur hic deserunt repellendus voluptatum deleniti dolorum repudiandae sed repellat, ab, quia nobis quis corrupti tempore ratione, in ipsa!",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/hamad/image/upload/v1643107843/Campsite/tzlhhfvpjsgo6xsbidvp.png",
          filename: "Campsite/tzlhhfvpjsgo6xsbidvp",
        },
        {
          url: "https://res.cloudinary.com/hamad/image/upload/v1643107844/Campsite/hyjag9cmifnmopcgmvbk.jpg",
          filename: "Campsite/hyjag9cmifnmopcgmvbk",
        },
      ],
    });
    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close();
});
