"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import EmailField from "../input-fields/EmailField";
import PasswordField from "../input-fields/PasswordField";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Form } from "../ui/form";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/use-toast";

const FormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
});

type FormValues = z.infer<typeof FormSchema>;

const SignInForm = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await signIn(values);

      if (!response || !response.user) {
        throw new Error("Invalid server response");
      }

      toast({
        title: "Sign-in successful",
        description: `Welcome back, ${response.user.firstName}!`,
      });
    } catch (error: unknown) {
      console.error("Sign-in error:", error);

      let errorMessage = "Sign-in failed. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Sign-in failed",
        description: errorMessage,
        variant: "destructive",
      });

      form.setError("password", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          Sign In
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <EmailField
              control={form.control}
              errors={form.formState.errors.email}
            />
            <PasswordField
              control={form.control}
              name="password"
              errors={form.formState.errors.password}
            />
            <Button
              className="w-full mt-4"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        <div className="flex justify-between mt-4 text-sm text-gray-600">
          <span>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="hover:underline text-blue-500">
              Create Account
            </Link>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignInForm;
