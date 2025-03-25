"use server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function signupUser(formData: FormData) {
  const email = formData.get("useremail") as string;
  const password = formData.get("password") as string;
  const password2 = formData.get("password2") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;

  if (password !== password2) {
    return { error: "Passwords do not match" };
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
        username: username,
      },
    });

    console.log("Created user: ", user);
    return { message: `User ${email} signed up successfully!` };
  } catch (error: any) {
    console.error("Error signing up user:", error);
    return { error: `Error signing up user: ${error.message}` };
  } finally {
    await prisma.$disconnect();
  }
}
