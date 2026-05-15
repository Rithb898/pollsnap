import { useForm } from "@tanstack/react-form"
import { useNavigate, Link } from "react-router"
import { toast } from "sonner"
import { registerSchema } from "@/types/auth"
import { useAuthStore } from "@/store/auth-store"
import { BrandLogo } from "@/components/brand-logo"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight } from "lucide-react"
import { useState } from "react"
import { motion } from "motion/react"

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await register(value.name, value.email, value.password)
        toast.success("Identity established")
        navigate("/dashboard")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Creation failed")
      }
    },
  })

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10 space-y-4">
          <Link to="/" className="hover:scale-[1.02] transition-transform">
            <BrandLogo imageClassName="h-14 w-auto" showText={false} />
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter font-heading">Create Identity</h1>
            <p className="text-muted-foreground font-medium italic text-sm mt-1">Join the PollSnap movement.</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[40px] border border-zinc-200 dark:border-zinc-800 p-8 md:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.05)]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            <FieldGroup className="space-y-5">
              <form.Field name="name">
                {(field) => (
                  <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                    <FieldLabel htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block ml-1">Full Name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="John Universe"
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

              <form.Field name="email">
                {(field) => (
                  <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                    <FieldLabel htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block ml-1">Email Address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
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

              <form.Field name="password">
                {(field) => (
                  <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                    <div className="flex justify-between items-center mb-1.5 px-1">
                      <FieldLabel htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Secret Key</FieldLabel>
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

              <Button type="submit" disabled={isLoading} size="lg" className="h-12 w-full rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-3">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <>Establish Identity <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </FieldGroup>
          </form>
        </div>

        <div className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Already a member?{" "}
          <Link to="/login" className="text-foreground hover:text-primary transition-colors ml-2 underline underline-offset-8">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
