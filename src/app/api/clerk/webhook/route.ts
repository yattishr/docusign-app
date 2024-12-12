"use server"
import { db } from "@/server/db";

export const POST = async (req: Request) => {
  try {
    console.log("---- Inside Clerk webhook ---")
    const { data } = await req.json();
    console.log("--- Clerk webhook initiated...---", data);

    const emailAddress = data.email_addresses[0].email_address;
    const firstName = data.first_name;
    const lastName = data.last_name;
    const imageUrl = data.image_url;
    const id = data.id;

    // Log the data to ensure it's correctly parsed
    console.log("Parsed Data: ", {emailAddress, firstName, lastName, imageUrl, id });

    await db.user.create({
      data: {
        id: id,
        emailAddress,
        firstName,
        lastName,
        imageUrl,
      },
    });
    
    // debugger; // halt code execution for testing user creation.

    return new Response("Webhook received", { status: 200 });
  } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Internal Server Error", { status: 500 });
  }

  
};
