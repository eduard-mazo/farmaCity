const mongoose = require('mongoose');
const Admin = mongoose.mongo.Admin;

async function main() {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  const uri =
    'mongodb+srv://EASC_01:0KzQlxBvEk8yDmLV@thundersandbox-v0ydj.mongodb.net/luna?retryWrites=true&w=majority';

  try {
    // Connect to the MongoDB cluster
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected!!');
  } catch (e) {
    console.error(e);
  }
}

module.exports.main = main;
