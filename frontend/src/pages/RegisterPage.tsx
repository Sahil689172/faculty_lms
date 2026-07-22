import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import { registerSchema, type RegisterFormValues } from "../validation/schemas";
import { Alert, Button, Field, Input } from "../components/ui";

export function RegisterPage() {
  const { register: registerFaculty } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);

    try {
      await registerFaculty(values.name, values.email, values.password);
      navigate("/", { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Failed to create account"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500">Register to manage your lessons</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? <Alert>{formError}</Alert> : null}

          <Field label="Name" error={errors.name?.message}>
            <Input type="text" autoComplete="name" {...register("name")} />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register("email")} />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <Input type="password" autoComplete="new-password" {...register("password")} />
          </Field>

          <Field label="Confirm Password" error={errors.confirmPassword?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
