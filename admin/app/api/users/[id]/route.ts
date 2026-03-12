import connectToDB from "@/lib/mongodb";
import User from "@/models/AdminUsers";

export async function GET(request: Request, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;
    try{
        await connectToDB();
        const user = await User.findById(id);
        return new Response(JSON.stringify(user));
    }catch(error){
        console.log(error);
        return new Response("Did not find user", {status: 500});
    }
}

export async function PUT(request: Request, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;
    try{
        await connectToDB();
        const user = await User.findByIdAndUpdate(id, await request.json());
        return new Response(JSON.stringify(user));
    }catch(error){
        console.log(error);
        return new Response("Did not find user", {status: 500});
    }
}

export async function DELETE(request: Request, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;
    try{
        await connectToDB();
        const user = await User.findByIdAndDelete(id);
        return new Response(JSON.stringify(user));
    }catch(error){
        console.log(error);
        return new Response("Did not find user", {status: 500});
    }
}
