import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {children}
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize demo data on page load
              if (typeof window !== 'undefined') {
                const users = localStorage.getItem('users');
                if (!users) {
                  const demoUsers = [
                    {
                      id: 'admin123',
                      email: 'admin@school.com',
                      name: 'School Administrator',
                      role: 'admin'
                    },
                    {
                      id: 'student123',
                      email: 'student@school.com',
                      name: 'John Doe',
                      role: 'student',
                      studentId: 'STU001'
                    }
                  ];
                  localStorage.setItem('users', JSON.stringify(demoUsers));
                }
                
                const schoolLocation = localStorage.getItem('schoolLocation');
                if (!schoolLocation) {
                  localStorage.setItem('schoolLocation', JSON.stringify({
                    latitude: -6.2088,
                    longitude: 106.8456,
                    radius: 100
                  }));
                }
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
