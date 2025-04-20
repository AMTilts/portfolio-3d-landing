import Link from "next/link"

export default function Navigation() {
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <div className="w-full">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          MP
        </Link>

        <ul className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className="text-white hover:text-yellow-400 transition-colors">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
