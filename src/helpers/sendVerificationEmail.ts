import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

//! This code is not used in the project. It is just a reference to show how to send verification email using resend. You require a valid domain to be able to send mail to other mails using resend.

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: email,
          subject: "Verification Code",
          react: VerificationEmail({ username, otp: verifyCode }),
        });
        return {
          success: true,
          message: "Verification email sent successfully",
        };
    }
    catch (emailError) {
        console.error("Error sending verification email", emailError);
        return {
            success: false,
            message: "Error sending verification email"
        };
    }
}