import mongoose from "mongoose";

type MongooseModule = typeof mongoose;

declare global {
    var mongoose:
        | {
              conn: null | MongooseModule;
              promise: null | Promise<MongooseModule>;
          }
        | undefined;
}

const DATABASE_URL = process.env.MONGODB_URI;

if (!DATABASE_URL) {
    throw new Error(
        "Please define the DATABASE_URL environment variable inside .env.local",
    );
}

let cached = global.mongoose;

async function connectToDB() {
    if (!cached) {
        cached = global.mongoose = { conn: null, promise: null };
    }
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose
            .connect(DATABASE_URL!, opts)
            .then((mongoose) => {
                return mongoose;
            });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDB;
