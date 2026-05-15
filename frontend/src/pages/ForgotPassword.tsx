import { useForm } from "@tanstack/react-form"
import { Link } from "react-router"
import { toast } from "sonner"
import { forgotPasswordSchema } from "@/types/auth"
import { requestPasswordReset } from "@/lib/auth-client"
import { BrandLogo } from "@/components/brand-logo"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, Mail } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [lastEmail, setLastEmail] = useState("")
  const [isResending, setIsResending] = useState(false)

  const sendResetLink = async (email: string, successMessage = "Reset link sent") => {
    await requestPasswordReset(email)
    setLastEmail(email)
    setIsSubmitted(true)
    toast.success(successMessage)
  }

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onChange: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await sendResetLink(value.email)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not process request")
      }
    },
  })

  const handleResend = async () => {
    if (!lastEmail) return

    setIsResending(true)
    try {
      await sendResetLink(lastEmail, "Reset link resent")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend link")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-1/4 w-200 h-200 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-150 h-150 bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10 space-y-4">
          <Link to="/" className="hover:scale-[1.02] transition-transform">
            <BrandLogo imageClassName="h-14 w-auto"  />
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter font-heading">Recover Vault</h1>
            <p className="text-muted-foreground font-medium italic text-sm mt-1">Regain access to your identity.</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[40px] border border-zinc-200 dark:border-zinc-800 p-8 md:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.05)]">
          {!isSubmitted ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              <FieldGroup className="space-y-5">
                <form.Field name="email">
                  {(field) => (
                    <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                      <FieldLabel htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block ml-1">
                        Registered Email
                      </FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="identity@company.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 px-5 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 border-transparent focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                        required
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
                      Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading">Check your inbox</h3>
                <p className="text-sm text-muted-foreground">
                  Reset link sent to {lastEmail}. If it never lands, tap resend.
                </p>
              </div>
              <div className="grid gap-3">
                <Button
                  onClick={handleResend}
                  disabled={isResending}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11"
                >
                  {isResending ? <Loader2 className="animate-spin h-4 w-4" /> : "Resend Link"}
                </Button>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11"
                >
                  Back to recovery
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Remembered?{" "}
          <Link to="/login" className="text-foreground hover:text-primary transition-colors ml-2 underline underline-offset-8">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
