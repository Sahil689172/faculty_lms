import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import { loginSchema, type LoginFormValues } from "../validation/schemas";
import { Alert, Button, Field, Input } from "../components/ui";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    try {
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Invalid email or password"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Faculty LMS</h1>
          <p className="text-sm text-slate-500">Sign in to manage your lessons</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? <Alert>{formError}</Alert> : null}

          <Field label="Email" error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register("email")} />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <Input type="password" autoComplete="current-password" {...register("password")} />
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
