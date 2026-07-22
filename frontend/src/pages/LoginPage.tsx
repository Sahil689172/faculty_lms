import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import { loginSchema, type LoginFormValues } from "../validation/schemas";
import { Alert, Button, Input } from "../components/ui";
import { AuthShell } from "../components/AuthShell";
import { PasswordInput } from "../components/PasswordInput";

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
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your lessons"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          >
            Create Account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? <Alert>{formError}</Alert> : null}

        <div data-auth-field>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div data-auth-field>
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div data-auth-field className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-white/20 dark:bg-white/5"
            />
            Remember me
          </label>
          <button
            type="button"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          >
            Forgot password?
          </button>
        </div>

        <div data-auth-field>
          <Button type="submit" fullWidth loading={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
