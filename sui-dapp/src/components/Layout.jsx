import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const Layout = ({ children }) => (
  <div className="min-h-screen bg-background font-mono selection:bg-primary selection:text-primary-foreground flex flex-col">
    <Navbar />
    <main className="flex-1 container py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {children}
    </main>
    <Footer />
  </div>
)

export default Layout
