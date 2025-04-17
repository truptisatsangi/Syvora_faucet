"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useToast } from "../../hooks/use-toast";
import { credentialsSignIn } from "../../lib/server-actions/auth";
import SocialLogin from "../buttons/SocialLogin";
import EmailField from "../input-fields/EmailField";
import PasswordField from "../input-fields/PasswordField";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Form } from "../ui/form";

const FormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
});

type FormValues = z.infer<typeof FormSchema>;

const SignInForm = () => {
  const router = useRouter();

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
      const result = await credentialsSignIn(
        values.email.toLowerCase(),
        values.password,
        'signin'
      );

      if (!result.success) {
        toast({
          title: "Sign-in failed",
          description: result.error || "Authentication failed.",
          variant: "destructive",
        });

        form.setError("password", {
          type: "manual",
          message: result.error || "Authentication failed.",
        });

        return;
      }

      toast({
        title: "Sign-in successful",
        description: "Welcome back!",
      });

      router.push(result.redirectUrl || '/');
    } catch (error: unknown) {
      console.error("Sign-in error:", error);

      toast({
        title: "Sign-in failed",
        description:
          error instanceof Error
            ? error.message
            : "Sign-in failed. Please try again.",
        variant: "destructive",
      });

      form.setError("password", {
        type: "manual",
        message:
          error instanceof Error
            ? error.message
            : "Sign-in failed. Please try again.",
      });
    }
  };

  return (
    <div className="bg-transparent">
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 grid-cols-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <fieldset
                disabled={form.formState.isSubmitting}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your Syvora Inc account
                  </p>
                </div>

                <EmailField
                  control={form.control}
                  errors={form.formState.errors.email}
                />
                <PasswordField
                  control={form.control}
                  name="password"
                  errors={form.formState.errors.password}
                />

                <Button type="submit" className="w-full">
                  {form.formState.isSubmitting ? "Logging in..." : "Login"}
                </Button>

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <SocialLogin />

                <p className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </Link>
                </p>
              </fieldset>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs mt-2 text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
};

export default SignInForm;
