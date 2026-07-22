import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import { registerSchema, type RegisterFormValues } from "../validation/schemas";
import { Alert, Button, Input } from "../components/ui";
import { AuthShell } from "../components/AuthShell";
import { PasswordInput } from "../components/PasswordInput";
import { PasswordStrength } from "../components/PasswordStrength";

export function RegisterPage() {
  const { register: registerFaculty } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch("password") ?? "";

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
    <AuthShell
      title="Create your account"
      subtitle="Start managing your lessons in minutes"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          >
            Login
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? <Alert>{formError}</Alert> : null}

        <div data-auth-field>
          <Input
            label="Full name"
            type="text"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div data-auth-field>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div data-auth-field className="space-y-2">
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={passwordValue} />
        </div>

        <div data-auth-field>
          <PasswordInput
            label="Confirm password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        <div data-auth-field>
          <Button type="submit" fullWidth loading={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
