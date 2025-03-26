/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control, FieldError } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface EmailFieldProps {
  control: Control<any, any>;
  errors?: FieldError;
}

const EmailField = ({ control, errors }: EmailFieldProps) => {
  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              placeholder="mail@example.com"
              {...field}
              className="placeholder-gray-400 focus:placeholder-transparent caret-current"
            />
          </FormControl>
          {errors && <FormMessage>{errors.message}</FormMessage>}
        </FormItem>
      )}
    />
  );
};

export default EmailField;
