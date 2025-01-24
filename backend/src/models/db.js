import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongo_url = process.env.MONGO_DB_URL;

mongoose
  .connect(mongo_url)
  .then(() => {
    console.log('Database Connected!');
  })
  .catch((error) => {
    console.error(`Mongo DB Connection Error - ${error}`);
  });
