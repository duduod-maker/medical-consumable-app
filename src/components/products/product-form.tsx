"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { isAdmin } from "@/lib/permissions"

// Define types locally for now. These should be moved to a central types file.
interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  reference?: string | null;
  supplierRef?: string | null;
  description?: string | null;
  price: number;
  categoryId: string;
  category: Category;
}

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: "",
    reference: "",
    supplierRef: "",
    description: "",
    price: "",
    categoryId: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        reference: product.reference || "",
        supplierRef: product.supplierRef || "",
        description: product.description || "",
        price: product.price.toString(),
        categoryId: product.categoryId,
      })
    } else if (categories.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [product, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products"
      const method = product ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, price: parseFloat(formData.price) || 0 }),
      })

      if (response.ok) {
        onSuccess()
        if (!product) {
          setFormData({
            name: "",
            reference: "",
            supplierRef: "",
            description: "",
            price: "",
            categoryId: categories.length > 0 ? categories[0].id : "",
          })
        }
      } else {
        setError("Erreur lors de la sauvegarde du produit")
      }
    } catch (error) {
      setError("Erreur lors de la sauvegarde du produit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {product ? "Modifier le produit" : "Ajouter un produit"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom du produit *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Catégorie *
            </label>
            <select
              id="categoryId"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
              Référence
            </label>
            <input
              type="text"
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          {isAdmin(session) && (
            <div>
              <label htmlFor="supplierRef" className="block text-sm font-medium text-gray-700">
                Réf. fournisseur
              </label>
              <input
                type="text"
                id="supplierRef"
                value={formData.supplierRef}
                onChange={(e) => setFormData({ ...formData, supplierRef: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          )}


          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Prix (EUR) *
            </label>
            <input
              type="number"
              id="price"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              step="0.01"
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Sauvegarde..." : product ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  )
}
