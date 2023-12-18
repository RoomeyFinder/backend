const mongoose = require("mongoose")

module.exports.connectDB = async function(){
  await mongoose.connect(
    process.env.CONNECTION_STRING.replace("<password>", process.env.DB_PASSWORD).replace("<db>", "test")
  );
}

module.exports.dropDBAndDisconnect = async function(){
  await mongoose.connection.dropDatabase("test")
  await mongoose.connection.close();
}

module.exports.dropCollection = async function(collection){
  await mongoose.connection.dropCollection(collection)
}