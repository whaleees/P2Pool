// app/layout.tsx
import CustomNavbar from '@/components/CustomNavbar'
import CustomFooter from '@/components/Custom-Footer'
import './globals.css'
export const metadata = { title: 'My App' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <CustomNavbar />
        {children}
        <CustomFooter />
      </body>
    </html>
  )
}
