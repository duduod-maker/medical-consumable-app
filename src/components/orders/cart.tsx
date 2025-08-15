"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext";

export function Cart() {
  const { cartItems, removeFromCart, clearCart, updateItemQuantity } = useCart();
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const submitOrder = async () => {
    if (cartItems.length === 0) return;

    setLoading(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
          notes,
        }),
      })

      if (response.ok) {
        clearCart()
        setNotes("")
        alert("Commande soumise avec succès!")
        // Optionally, redirect or refresh the page
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la soumission de la commande: ${errorData.error}`)
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la soumission de la commande:", error);
      alert("Erreur lors de la soumission de la commande")
    } finally {
      setLoading(false)
    }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Panier de commande
      </h2>

      {cartItems.length === 0 ? (
        <p className="text-sm text-gray-500">Votre panier est vide.</p>
      ) : (
        <>
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Produits dans le panier ({totalItems})
            </h3>
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div
                  key={item.productId || index}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.productInfo}
                    </div>
                    <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-600 mr-2">Qté:</p>
                        <input 
                            type="number"
                            value={item.quantity}
                            min={1}
                            onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value, 10))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-gray-900"
                        />
                        <p className="text-sm text-gray-600 ml-2">({item.price.toFixed(2)} €/unité)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId!)}
                    className="text-red-600 hover:text-red-800 text-sm ml-2"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-right">
            <p className="text-lg font-bold text-gray-900">Total: {totalPrice.toFixed(2)} €</p>
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (optionnel)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Informations complémentaires pour la commande..."
            />
          </div>

          <button
            onClick={submitOrder}
            disabled={loading}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Passer la commande"}
          </button>
        </>
      )}
    </div>
  )
}
