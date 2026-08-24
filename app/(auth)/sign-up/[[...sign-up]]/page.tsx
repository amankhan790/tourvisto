"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpSchema, SignUpSchema } from "@/lib/schemas/authSchema";

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpSchema) => {
    if (!isLoaded || !signUp) return;
    setIsSubmitting(true);

    try {
      // 1. Create sign-up record with Clerk password-based authentication
      const result = await signUp.password({
        emailAddress: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        unsafeMetadata: {
          phone: values.phone,
        },
      });

      if (result.error) {
        handleClerkError(result.error);
        setIsSubmitting(false);
        return;
      }

      // 2. Finalize sign-up and redirect if registration was complete
      if (signUp.status === "complete") {
        const finalizeResult = await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });

        if (finalizeResult.error) {
          setError("root", {
            type: "server",
            message:
              finalizeResult.error.message || "Failed to finalize session.",
          });
        }
      } else {
        // If status is not complete (e.g. requires verification), but the user does not want verification
        setError("root", {
          type: "server",
          message:
            "Registration completed, but Clerk requires additional verification. Please check Clerk dashboard settings.",
        });
      }
    } catch (err: any) {
      console.error("SignUp error:", err);
      setError("root", {
        type: "server",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClerkError = (err: any) => {
    // Check for nested errors from Clerk API
    if (err.errors && Array.isArray(err.errors)) {
      err.errors.forEach((e: any) => {
        const field = e.meta?.paramName;
        if (field === "email_address") {
          setError("email", {
            type: "server",
            message: e.longMessage || e.message,
          });
        } else if (field === "password") {
          setError("password", {
            type: "server",
            message: e.longMessage || e.message,
          });
        } else if (field === "first_name") {
          setError("firstName", {
            type: "server",
            message: e.longMessage || e.message,
          });
        } else if (field === "last_name") {
          setError("lastName", {
            type: "server",
            message: e.longMessage || e.message,
          });
        } else if (field === "phone_number") {
          setError("phone", {
            type: "server",
            message: e.longMessage || e.message,
          });
        } else {
          setError("root", {
            type: "server",
            message: e.longMessage || e.message,
          });
        }
      });
    } else {
      setError("root", {
        type: "server",
        message: err.message || "Registration failed.",
      });
    }
  };

  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f14]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f14] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#0d0f14] to-emerald-950/30 p-4">
      {/* Visual background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-lg z-10">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Card subtle border glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-emerald-500/5 pointer-events-none rounded-3xl" />

          <div className="text-center mb-8 relative">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm">
              Join Tourvisto and start exploring the world
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 relative"
          >
            {/* First Name & Last Name Side-by-Side */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <input
                      type="text"
                      className={`w-full border bg-white/[0.02] border-white/[0.08] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-500 ${
                        errors.firstName
                          ? "border-rose-500/50 focus:border-rose-500/50"
                          : ""
                      }`}
                      placeholder="First name"
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>

              <div className="flex-1">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <input
                      type="text"
                      className={`w-full border bg-white/[0.02] border-white/[0.08] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-500 ${
                        errors.lastName
                          ? "border-rose-500/50 focus:border-rose-500/50"
                          : ""
                      }`}
                      placeholder="Last name"
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
            </div>

            {/* Error Message for Names */}
            {(errors.firstName || errors.lastName) && (
              <p className="text-brand-coral text-sm mt-1">
                {errors.firstName?.message || errors.lastName?.message}
              </p>
            )}

            {/* Phone Number Field */}
            <div>
              <Controller
                control={control}
                name="phone"
                render={({ field: { value, onChange, onBlur } }) => (
                  <input
                    type="tel"
                    className={`w-full border bg-white/[0.02] border-white/[0.08] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-500 ${
                      errors.phone
                        ? "border-rose-500/50 focus:border-rose-500/50"
                        : ""
                    }`}
                    placeholder="Phone number"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-brand-coral text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <input
                    type="email"
                    className={`w-full border bg-white/[0.02] border-white/[0.08] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-500 ${
                      errors.email
                        ? "border-rose-500/50 focus:border-rose-500/50"
                        : ""
                    }`}
                    placeholder="Email address"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.email && (
                <p className="text-brand-coral text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange, onBlur } }) => (
                  <input
                    type="password"
                    className={`w-full border bg-white/[0.02] border-white/[0.08] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-500 ${
                      errors.password
                        ? "border-rose-500/50 focus:border-rose-500/50"
                        : ""
                    }`}
                    placeholder="Password"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.password && (
                <p className="text-brand-coral text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* General Root Errors */}
            {errors.root && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-brand-coral rounded-xl p-3 text-sm">
                {errors.root.message}
              </div>
            )}

            {/* CAPTCHA mount point */}
            <div id="clerk-captcha" className="mt-2" />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/15"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
