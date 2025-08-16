"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"

export default function HelpPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [manualContent, setManualContent] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }

    // Charger le contenu du manuel
    fetch('/MANUEL_UTILISATION.md')
      .then(response => response.text())
      .then(content => setManualContent(content))
      .catch(error => console.error('Erreur lors du chargement du manuel:', error))
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Fonction pour convertir le markdown en HTML basique
  const parseMarkdown = (text: string) => {
    return text
      // Titres
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-300 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
      
      // Gras et italique
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
      
      // Code inline
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-900">$1</code>')
      
      // Liens de table des matières
      .replace(/^\d+\. \[(.*?)\]\(#.*?\)/gim, '<li class="ml-4 mb-2 text-gray-800 font-medium">$1</li>')
      
      // Listes normales
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-gray-800">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-2 text-gray-800 list-decimal">$1</li>')
      
      // Paragraphes
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-800 leading-relaxed">')
      
      // Tableaux (simplifiés)
      .replace(/\|/g, '</td><td class="border border-gray-400 px-3 py-2 text-gray-800">')
      .replace(/^(.*?)$/gim, (match) => {
        if (match.includes('</td><td')) {
          return '<tr><td class="border border-gray-400 px-3 py-2 text-gray-800">' + match + '</td></tr>'
        }
        return match
      })
  }

  const htmlContent = parseMarkdown(manualContent)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900">Manuel d'Utilisation</h1>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 no-print"
            >
              Imprimer
            </button>
          </div>
          
          <div className="prose max-w-none">
            <div 
              className="manual-content text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: `<div class="mb-4 text-gray-800">${htmlContent}</div>` }}
            />
          </div>
        </div>
      </main>
      
      <style jsx>{`
        .manual-content {
          color: #374151;
          line-height: 1.7;
        }
        .manual-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          background-color: white;
        }
        .manual-content th {
          background-color: #f9fafb;
          font-weight: bold;
          border: 1px solid #9ca3af;
          padding: 0.75rem;
          text-align: left;
          color: #111827;
        }
        .manual-content td {
          border: 1px solid #9ca3af;
          padding: 0.75rem;
          color: #374151;
        }
        .manual-content li {
          color: #374151 !important;
          margin-bottom: 0.5rem;
        }
        .manual-content p {
          color: #374151 !important;
          margin-bottom: 1rem;
        }
        .manual-content ul, .manual-content ol {
          margin: 1rem 0;
        }
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}