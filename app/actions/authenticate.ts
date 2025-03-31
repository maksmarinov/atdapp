"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import {
  verifyPwd,
  createSession,
  createUser,
  deleteSession,
} from "../lib/auth";
import { getUserByEmail } from "../lib/utils";

const SignUpSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password needs to be at least 8 chars long" }),
    password2: z.string().min(1, { message: "Please confirm your password" }),
    name: z.string().min(3, { message: "Please enter your first name" }),
    username: z.string().min(1, { message: "Please enter a username" }),
  })
  .refine((data) => data.password === data.password2, {
    message: "Password don't match",
    path: ["password2"],
  });
const SignInSchema = z.object({
  password: z.string().min(8, { message: "Please enter your password" }),
  email: z.string().min(1, { message: "Please enter your email" }),
});

export type SignUpSchema = z.infer<typeof SignUpSchema>;
export type SignInSchema = z.infer<typeof SignInSchema>;

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
};

export async function signIn(formData: FormData): Promise<ActionResponse> {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    const validDataRes = SignInSchema.safeParse(data);
    if (!validDataRes.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validDataRes.error.flatten().fieldErrors,
      };
    }
    const user = await getUserByEmail(data.email);
    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
        errors: {
          email: ["Invalid email or password"],
        },
      };
    }
    const isPwdValid = await verifyPwd(data.password, user.password);
    if (!isPwdValid) {
      return {
        success: false,
        message: "Invalid email or password",
        errors: {
          email: ["Invalid email or password"],
        },
      };
    }
    await createSession(user.username);
    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      message: "An error occurred while signing in",
      error: "Failed to sign in",
    };
  }
}

export async function signUp(formData: FormData): Promise<ActionResponse> {
  try {
    const data = {
      username: formData.get("username") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      password2: formData.get("password2") as string,
    };

    const validationResult = SignUpSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
        errors: {
          email: ["User with this email already exists"],
        },
      };
    }

    // Create new user
    const user = await createUser(
      data.email,
      data.password,
      data.username,
      data.name
    );
    if (!user) {
      return {
        success: false,
        message: "Failed to create user",
        error: "Failed to create user",
      };
    }

    await createSession(user.username);

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      message: "An error occurred while creating your account",
      error: "Failed to create account",
    };
  }
}

export async function signOut(): Promise<void> {
  try {
    await deleteSession();
  } catch (error) {
    console.error("Sign out error:", error);
    throw new Error("Failed to sign out");
  } finally {
    redirect("/");
  }
}
