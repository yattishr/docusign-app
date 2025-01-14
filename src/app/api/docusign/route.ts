import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const { userId } = await auth();
    console.log(`Logging userId: ${userId}`);
    
    if (!userId) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
    
    const params = req.nextUrl.searchParams;
    const auth_code = params.get("code");
    console.log(`Logging status: ${auth_code}`);

    if (!auth_code) return NextResponse.json({ message: "Failed to obtain Authorization Code" },{ status: 400 });
    
}