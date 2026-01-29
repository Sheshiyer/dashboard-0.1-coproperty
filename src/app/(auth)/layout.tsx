export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Co.Property
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to your account
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}
