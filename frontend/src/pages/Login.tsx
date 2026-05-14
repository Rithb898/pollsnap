import { useForm } from "@tanstack/react-form"
import { useNavigate, Link } from "react-router"
import { toast } from "sonner"
import { loginSchema } from "@/types/auth"
import { useAuthStore } from "@/store/auth-store"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await login(value.email, value.password)
        toast.success("Logged in successfully")
        navigate("/")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Login failed")
      }
    },
  })

  return (
    <div className="flex min-h-screen">
      {/* Visual Block */}
      <div className="hidden lg:flex w-1/2 bg-primary p-12 flex-col justify-between animate-in fade-in slide-in-from-left-4 duration-700">
        <div>
          <Link to="/" className="text-2xl font-bold font-heading">
            PollSnap.
          </Link>
        </div>
        <div>
          <h1 className="text-7xl font-heading font-black leading-[0.9] tracking-tight text-primary-foreground">
            POLL <br />
            FASTER <br />
            SNAP <br />
            HARDER.
          </h1>
        </div>
        <div className="text-sm font-medium text-primary-foreground/80">
          Sign in to your dashboard.
        </div>
      </div>

      {/* Form Block */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative animate-in fade-in slide-in-from-right-4 duration-700">
        <Link to="/" className="lg:hidden absolute top-8 left-8 text-xl font-bold font-heading">
          PollSnap.
        </Link>
        
        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-heading font-bold tracking-tight">Login</h2>
            <p className="text-lg text-muted-foreground">Access your creator dashboard.</p>
          </div>
          
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-8"
          >
            <FieldGroup className="space-y-6">
              <form.Field name="email">
                {(field) => (
                  <Field
                    data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  >
                    <FieldLabel htmlFor="email" className="font-heading text-sm uppercase tracking-wider font-bold">Email Address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-0 border-b-2 border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary text-xl h-12"
                    />
                    {field.state.meta.isTouched && !field.state.meta.isValid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <Field
                    data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  >
                    <FieldLabel htmlFor="password" className="font-heading text-sm uppercase tracking-wider font-bold">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="border-0 border-b-2 border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary text-xl h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {field.state.meta.isTouched && !field.state.meta.isValid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              </form.Field>

              <Button type="submit" disabled={isLoading} size="lg" className="w-full font-heading text-lg h-14 mt-4 uppercase tracking-widest hover:-translate-y-1 transition-transform">
                {isLoading && <Loader2 className="animate-spin mr-2" />}
                Sign in <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </FieldGroup>
          </form>

          <p className="text-center text-muted-foreground font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-foreground border-b-2 border-foreground hover:text-primary hover:border-primary transition-colors pb-1">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
