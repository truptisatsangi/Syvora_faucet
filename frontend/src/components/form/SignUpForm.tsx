'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import EmailField from '../input-fields/EmailField';
import PasswordField from '../input-fields/PasswordField';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Form } from '../ui/form';

const SignUpFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must have more than 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Confirm Password is required')
    .min(8, 'Confirm Password must have more than 8 characters')
    .refine((val) => val === '', {
      message: 'Passwords must match',
    }),
});

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

const SignUpForm = () => {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    // Handle sign-up logic
    console.log(values);
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-20">
      <Card className="w-full max-w-full mx-auto px-2">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <EmailField
                control={form.control}
                errors={form.formState.errors.email}
              />

              <PasswordField
                control={form.control}
                name="password"
                errors={form.formState.errors.password}
              />

              <PasswordField
                control={form.control}
                name="confirmPassword"
                errors={form.formState.errors.confirmPassword}
              />

              <Button className="w-full mt-6" type="submit">
                Sign Up
              </Button>
            </form>
          </Form>

          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>
              Already have an account?{' '}
              <Link href="/signin" className="hover:underline text-blue-500">
                Sign In
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpForm;
