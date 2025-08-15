"use client"

import { useState } from "react";
import { useSession } from "next-auth/react"
import { isAdmin } from "@/lib/permissions"
import { useCart } from "@/context/CartContext";

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

interface ProductItemProps {
  product: Product
  users: User[]
  onEdit: (product: Product) => void
  onDuplicate: (product: Product) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}

export function ProductItem({ product, users, onEdit, onDuplicate, onDelete, onRefresh }: ProductItemProps) {
  const { data: session } = useSession()
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleAddToCart = () => {
    if (quantity > 0) {
      addToCart({
        productId: product.id,
        quantity: quantity,
        productInfo: `${product.name} (${product.reference})`,
        price: product.price, // Pass price to cart
      });
      alert(`${quantity} x ${product.name} a été ajouté au panier.`);
      setQuantity(1); // Reset quantity after adding
    } else {
      alert("Veuillez entrer une quantité valide.");
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId) return;

    try {
      const response = await fetch(`/api/products/${product.id}/assign-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: selectedUserId })
      });

      if (response.ok) {
        setSelectedUserId("");
        onRefresh();
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de l'affectation");
      }
    } catch (error) {
      console.error("Erreur lors de l'affectation:", error);
      alert("Erreur lors de l'affectation");
    }
  };

  const handleUnassignUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/products/${product.id}/assign-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert("Erreur lors de la désaffectation");
      }
    } catch (error) {
      console.error("Erreur lors de la désaffectation:", error);
      alert("Erreur lors de la désaffectation");
    }
  };

  return (
    <tr>
      <td className="px-4 py-4 text-sm font-medium text-gray-900 w-40">
        {product.name}
      </td>
      <td className="px-4 py-4 text-sm text-gray-500 w-28">
        {product.category.name}
      </td>
      <td className="px-4 py-4 text-sm text-gray-500 w-28">
        {product.reference || "-"}
      </td>
      {isAdmin(session) && (
        <td className="px-4 py-4 text-sm text-gray-500 w-32">
          {product.supplierRef || "-"}
        </td>
      )}
      <td className="px-4 py-4 text-sm text-gray-500 w-48">
        {product.description || "-"}
      </td>
      <td className="px-4 py-4 text-sm text-gray-500 w-20">
        {product.price.toFixed(2)} €
      </td>
      {isAdmin(session) && (
        <td className="px-4 py-4 text-sm text-gray-500 w-48">
          <div className="space-y-2">
            {/* Utilisateur affecté (un seul) */}
            {product.assignedUsers.length > 0 ? (
              <div className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded text-xs">
                <span>{product.assignedUsers[0].user.name || product.assignedUsers[0].user.email}</span>
                <button
                  onClick={() => handleUnassignUser(product.assignedUsers[0].user.id)}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-900 flex-1"
                >
                  <option value="">Affecter à...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignUser}
                  disabled={!selectedUserId}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </td>
      )}
      <td className="px-4 py-4 text-sm font-medium w-20">
        <div className="flex flex-col gap-1">
          {/* Add to cart action */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-12 px-1 py-1 border border-gray-300 rounded text-xs bg-white text-gray-900"
            />
            <button
              onClick={handleAddToCart}
              className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 px-2 py-1 rounded text-xs"
            >
              Panier
            </button>
          </div>

          {/* Admin actions */}
          {isAdmin(session) && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(product)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 px-2 py-1 rounded text-xs"
                title="Modifier"
              >
                Mod
              </button>
              <button
                onClick={() => onDuplicate(product)}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300 px-2 py-1 rounded text-xs"
                title="Dupliquer"
              >
                Dup
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 px-2 py-1 rounded text-xs"
                title="Supprimer"
              >
                Sup
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
