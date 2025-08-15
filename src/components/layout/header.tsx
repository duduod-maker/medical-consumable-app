"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { data: session } = useSession()
  const pathname = usePathname();

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`;
  };

  return (
    <header className={`bg-white shadow ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Consommables Médicaux
              </h1>
            </div>
            <nav className="ml-6 flex space-x-8">
              <Link
                href="/"
                className={getLinkClasses("/")}
              >
                Produits
              </Link>
              <Link
                href="/orders"
                className={getLinkClasses("/orders")}
              >
                Commandes
              </Link>
              {session?.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={getLinkClasses("/admin")}
                >
                  Administration
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">
              {session?.user.name || session?.user.email}
              {session?.user.role === "ADMIN" && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}