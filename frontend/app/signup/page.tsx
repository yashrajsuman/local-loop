"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Moon, Sun } from "lucide-react"
import { signIn } from "next-auth/react"

export default function SignupPage() {

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await signup(name, email, password)
      toast({
        title: "Account created",
        description: "Your account has been created successfully",
      })
      router.push("/")
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Signup failed",
        description: "There was an error creating your account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8 min-h-screen bg-background">
      <div className="mx-auto max-w-2xl bg-card p-8 rounded-lg shadow-sm border">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create an Account</h1>
          <p className="text-muted-foreground">Enter your information to create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2 text-center">
              Account Information
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground order-2 sm:order-1">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto order-1 sm:order-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </div>
          </div>
        </form>

        {/* Social Login Section */}
        {(googleClientId || githubClientId) && (
          <div className="my-6 border-t border-gray-200 dark:border-gray-600 pt-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">Or continue with</p>
            <div className="flex justify-center gap-4">
              {googleClientId && (
                <Button
                  variant="outline"
                  onClick={() => signIn("google")}
                  className="flex items-center gap-2"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Google
                </Button>
              )}
              {githubClientId && (
                <Button
                  variant="outline"
                  onClick={() => signIn("github")}
                  className="flex items-center gap-2"
                >
                  <img
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    alt="GitHub"
                    className="w-5 h-5 bg-white rounded-full"
                  />
                  GitHub
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
