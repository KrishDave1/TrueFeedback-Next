/** @format */

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});


// This GET route is used to check if the username is unique.We are already checking for this when the user is signing up but we want to show to user while they are typing the username if it is unique or not.
export async function GET(request: Request) {
  if (request.method !== "GET") {
    return Response.json(
      {
        success: false,
        message: "Method not allowed",
      },
      {
        status: 405,
      }
    );
  }
  
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"), // Get the username from the query parameter
    };
    // validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log(result); //TODO remove this
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid username",
        },
        {
          status: 400,
        }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking username ", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      {
        status: 500,
      }
    );
  }
}
