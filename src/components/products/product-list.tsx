"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { ProductForm } from "./product-form"
import { ProductItem } from "./product-item"
import { isAdmin } from "@/lib/permissions"

// Define types locally
interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface UserProduct {
  id: string;
  user: User;
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
  assignedUsers: UserProduct[];
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ProductList() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500);
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin(session)) return
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
    }
  }, [session]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (selectedCategory) params.append("category", selectedCategory);

    try {
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, [fetchCategories, fetchUsers]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDuplicate = async (product: Product) => {
    if (confirm(`Êtes-vous sûr de vouloir dupliquer le produit "${product.name}" ?`)) {
      try {
        const duplicatedProduct = {
          name: product.name,
          reference: product.reference,
          supplierRef: product.supplierRef,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId
        }

        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(duplicatedProduct),
        })

        if (response.ok) {
          fetchProducts() // Refetch product list
          alert(`Produit "${product.name}" dupliqué avec succès !`)
        } else {
          alert("Erreur lors de la duplication du produit")
        }
      } catch (error) {
        console.error("Erreur lors de la duplication:", error)
        alert("Erreur lors de la duplication du produit")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        const response = await fetch(`/api/products/${id}`, { method: "DELETE" })
        if (response.ok) {
          fetchProducts() // Refetch product list
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts() // Refetch product list
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center flex-wrap sm:justify-center">
          <input
            type="text"
            placeholder="Rechercher par nom, référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {isAdmin(session) && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Ajouter un produit
            </button>
          )}
        </div>

        <div className="text-right text-sm text-gray-600 mb-4">
          Affichage de {products.length} produit(s)
        </div>

        {showForm && isAdmin(session) && (
          <div className="mb-6 border-t pt-6">
            <ProductForm
              product={editingProduct}
              categories={categories}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200" style={{minWidth: '1000px'}}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Référence</th>
                {isAdmin(session) && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Réf. fournisseur</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Prix</th>
                {isAdmin(session) && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Utilisateur affecté</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin(session) ? 8 : 6} className="text-center py-4 text-gray-700">Chargement...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin(session) ? 8 : 6} className="text-center py-4 text-gray-500">Aucun produit trouvé</td>
                </tr>
              ) : (
                products.map((item) => (
                  <ProductItem
                    key={item.id}
                    product={item}
                    users={users}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onRefresh={fetchProducts}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
