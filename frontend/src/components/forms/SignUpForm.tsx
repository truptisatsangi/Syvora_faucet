"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useToast } from "../../hooks/use-toast";
import { credentialsSignIn } from "../../lib/server-actions/auth";
import SocialLogin from "../buttons/SocialLogin";
import EmailField from "../input-fields/EmailField";
import PasswordField from "../input-fields/PasswordField";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Form } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const SignUpFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .email("Invalid email")
    .endsWith("@qodeleaf.com", "Email must end with @qodeleaf.com"),
  password: z.string().min(8, "Password must have at least 8 characters"),
});

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const response = await credentialsSignIn(
        values.email,
        values.password,
        'signup',
        values.firstName,
        values.lastName,
      );
      if (response.success) {
        toast({
          title: "Sign-up successful",
          description: "Your account has been created successfully.",
          variant: "default",
          duration: 4000,
        });
        router.push("/borrow");
      }
    } catch (err) {
      console.error("Sign-up error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-20">
      <Card className="w-full max-w-lg mx-auto px-2">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold">
            Sign Up
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
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...form.register("firstName")}
                  placeholder="Enter your First Name"
                />
                {form.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...form.register("lastName")}
                  placeholder="Enter your Last Name"
                />
                {form.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
              <Button
                className="w-full mt-6"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border py-4">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <SocialLogin />
          <div className="text-center text-sm pt-4">
            Already have an account?{" "}
            <Link href="/signin" className="hover:underline text-blue-500">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpForm;
