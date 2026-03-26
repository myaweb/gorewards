import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background gradient effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] glow-teal" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "glass-premium border-primary/20 shadow-2xl",
            headerTitle: "text-gradient",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "glass border-primary/20 hover:border-primary/40 transition-all",
            formButtonPrimary: "bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]",
            footerActionLink: "text-primary hover:text-primary/80",
            formFieldInput: "glass border-primary/20 focus:border-primary/50",
            identityPreviewEditButton: "text-primary hover:text-primary/80",
          }
        }}
      />
    </div>
  )
}
