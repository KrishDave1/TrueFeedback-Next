/** @format */

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "User is not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const user = await UserModel.aggregate([ // aggregate is used to first split the array and then sort it and then group it back.The problem is that the messages are stored in an array,but it might be a problem in case of large number of messages or doing pagination, so we split the array to make muliple json objects and then sort them and then group them back.
      {
        $match: { _id: userId },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $group: {
          _id: "$_id",
          messages: {
            $push: "$messages",
          },
        },
      },
    ]);

    // console.log("User", user)
    if (!user || user.length === 0) {
      if (!user) {
        return Response.json(
          {
            success: false,
            message: "User is not found.Please try again.",
          },
          {
            status: 404,
          }
        );
      }
      return Response.json(
        {
          success: true,
          message: "User has no messages",
        },
        {
          status: 200,
        }
      );
    } else {
      return Response.json(
        {
          success: true,
          messages: user[0].messages,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.log("An unexpected error occurred:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
