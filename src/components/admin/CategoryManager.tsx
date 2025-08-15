"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { isAdmin } from "@/lib/permissions"

interface Category {
  id: string
  name: string
}

export function CategoryManager() {
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [error, setError] = useState("")

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        setError("Erreur lors du chargement des catégories")
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
      setError("Erreur lors du chargement des catégories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!newCategoryName.trim()) {
      setError("Le nom de la catégorie ne peut pas être vide.")
      return
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      })

      if (response.ok) {
        setNewCategoryName("")
        fetchCategories()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors de l'ajout de la catégorie")
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error)
      setError("Erreur lors de l'ajout de la catégorie")
    }
  }

  const handleEditClick = (category: Category) => {
    setEditingCategory(category)
    setEditCategoryName(category.name)
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!editingCategory || !editCategoryName.trim()) {
      setError("Le nom de la catégorie ne peut pas être vide.")
      return
    }

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCategoryName }),
      })

      if (response.ok) {
        setEditingCategory(null)
        setEditCategoryName("")
        fetchCategories()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors de la mise à jour de la catégorie")
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la catégorie:", error)
      setError("Erreur lors de la mise à jour de la catégorie")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    setError("")
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        const response = await fetch(`/api/categories/${id}`, { method: "DELETE" })

        if (response.ok) {
          fetchCategories()
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Erreur lors de la suppression de la catégorie")
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie:", error)
        setError("Erreur lors de la suppression de la catégorie")
      }
    }
  }

  if (!isAdmin(session)) {
    return <p>Accès refusé.</p>
  }

  if (loading) {
    return <div className="text-center py-4">Chargement des catégories...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Gestion des catégories</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleAddCategory} className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Nouvelle catégorie"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ajouter
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Aucune catégorie trouvée.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingCategory?.id === category.id ? (
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingCategory?.id === category.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleUpdateCategory}
                          className="text-green-600 hover:text-green-900"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
