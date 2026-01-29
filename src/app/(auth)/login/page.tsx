"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Simplified login page for API key authentication.
 * 
 * In the new architecture, authentication is handled via API key.
 * This page provides a simple form to store the API key in local storage
 * for use with the Workers API.
 */
export default function LoginPage() {
    const [apiKey, setApiKey] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // Store API key in local storage
            localStorage.setItem("api_key", apiKey)

            // Verify the key by making a test request
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_WORKERS_URL || 'http://localhost:8787'}/api/health`,
                {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`
                    }
                }
            )

            if (response.ok) {
                router.push("/")
                router.refresh()
            } else {
                setError("Invalid API key. Please try again.")
                localStorage.removeItem("api_key")
            }
        } catch (err) {
            console.error("Login error:", err)
            setError("Unable to connect to the server. Please try again.")
            localStorage.removeItem("api_key")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Co.Property Dashboard
                    </CardTitle>
                    <CardDescription>
                        Enter your API key to access the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="api-key">API Key</Label>
                            <Input
                                id="api-key"
                                type="password"
                                placeholder="Enter your API key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Authenticating..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
