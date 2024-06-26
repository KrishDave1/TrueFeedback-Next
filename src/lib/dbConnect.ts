/** @format */

import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number; // '?' means it is optional
};

const connection: ConnectionObject = {}; // Just a reminder the Typescript object syntax is connection is name and ConnectionObject is type written after colon.

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    // As Next.js is edge computing, it is possible that the connection is already established so we check if it is already connected
    console.log("Already connected to the database");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {}); // 
    connection.isConnected = db.connections[0].readyState; //db is a mongoose connection object and connections is an array of connections. We are checking the state of the first connection in the array.
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database", error);
    process.exit(1);
  }
}

export default dbConnect;
