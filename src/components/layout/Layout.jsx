import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />

      <div
        className="min-h-screen text-white"
        style={{
          backgroundImage: "url('/public/img/Univers.jpg')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {children}
      </div>

      <Footer />
    </div>
  )
}