import './globals.css'
import CustomNavbar from '@/components/CustomNavbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <CustomNavbar />
      <body>{children}</body>
    </html>
  )
}
