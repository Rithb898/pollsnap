import { useForm } from "@tanstack/react-form"
import { Link, useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
import { resetPasswordSchema } from "@/types/auth"
import { authClient } from "@/lib/auth-client"
import { BrandLogo } from "@/components/brand-logo"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react"
import { motion } from "motion/react"
import { useMemo, useState } from "react"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get("token") || "", [searchParams])
  const error = searchParams.get("error")
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Missing reset token")
        return
      }

      try {
        const result = await authClient.resetPassword({
          newPassword: value.password,
          token,
        })

        if (result.error) {
          throw new Error(result.error.message || "Reset failed")
        }

        toast.success("Password updated")
        navigate("/login")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Reset failed")
      }
    },
  })

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-1/4 w-200 h-200 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-150 h-150 bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10 space-y-4">
          <Link to="/" className="hover:scale-[1.02] transition-transform">
            <BrandLogo imageClassName="h-14 w-auto" />
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter font-heading">Set New Key</h1>
            <p className="text-muted-foreground font-medium italic text-sm mt-1">Lock vault with fresh password.</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[40px] border border-zinc-200 dark:border-zinc-800 p-8 md:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.05)]">
          {!token || error === "INVALID_TOKEN" ? (
            <div className="space-y-6 text-center py-4">
              <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="h-8 w-8 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading">Reset link stale</h3>
                <p className="text-sm text-muted-foreground">
                  Token missing or expired. Request fresh reset link.
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                Back to recovery
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              <FieldGroup className="space-y-5">
                <form.Field name="password">
                  {(field) => (
                    <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                      <div className="flex justify-between items-center mb-1.5 px-1">
                        <FieldLabel htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">
                          New Password
                        </FieldLabel>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 px-5 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 border-transparent focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                      />
                      {field.state.meta.isTouched && !field.state.meta.isValid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )}
                </form.Field>

                <form.Field name="confirmPassword">
                  {(field) => (
                    <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                      <FieldLabel htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block ml-1">
                        Confirm Password
                      </FieldLabel>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 px-5 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 border-transparent focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                      />
                      {field.state.meta.isTouched && !field.state.meta.isValid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )}
                </form.Field>

                <Button
                  type="submit"
                  disabled={form.state.isSubmitting}
                  size="lg"
                  className="h-12 w-full rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-3"
                >
                  {form.state.isSubmitting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      Update Password <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}
        </div>

        <div className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Need a fresh link?{" "}
          <Link to="/forgot-password" className="text-foreground hover:text-primary transition-colors ml-2 underline underline-offset-8">
            Resend Request
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
