import connectToDB from "@/lib/mongodb";
import User from "@/models/AdminUsers";

export async function GET() {
    try{
        await connectToDB();
        const users = await User.find({});
        return new Response(JSON.stringify(users));
    }catch(error){
        return new Response("Internal Server Error", {status: 500});
    }
}