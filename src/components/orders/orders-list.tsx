"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { isAdmin } from "@/lib/permissions"

// Define types locally
interface Order {
  id: string
  status: "PENDING" | "IN_PREPARATION" | "DELIVERED"
  notes?: string | null
  createdAt: string
  user: {
    id: string
    name?: string | null
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    product: {
      id: string
      name: string
      reference?: string | null
      price: number; // Added price
    } | null
  }>
}

const STATUS_LABELS: { [key in Order['status']]: string } = {
  PENDING: "En attente",
  IN_PREPARATION: "En préparation",
  DELIVERED: "Livrée",
}

const STATUS_COLORS: { [key in Order['status']]: string } = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PREPARATION: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
}

export function OrdersList() {
  const { data: session, status } = useSession() // Get status from useSession
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editableNotes, setEditableNotes] = useState<{ [key: string]: string }>({});

  // Add this useEffect for debugging
  useEffect(() => {
    if (status === "loading") {
      console.log("Session status: Loading...");
    } else if (status === "authenticated") {
      console.log("Session status: Authenticated");
      console.log("Session user role:", session?.user?.role);
      console.log("isAdmin(session):", isAdmin(session));
    } else {
      console.log("Session status: Unauthenticated");
    }
  }, [status, session]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleNotesChange = (orderId: string, newNotes: string) => {
    setEditableNotes(prev => ({ ...prev, [orderId]: newNotes }));
  };

  const handleSaveNotes = async (orderId: string) => {
    const notesToSave = editableNotes[orderId];
    if (notesToSave === undefined) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesToSave }),
      });

      if (response.ok) {
        setOrders(prevOrders => prevOrders.map(order =>
          order.id === orderId ? { ...order, notes: notesToSave } : order
        ));
        setEditableNotes(prev => {
          const newState = { ...prev };
          delete newState[orderId];
          return newState;
        });
      } else {
        alert("Erreur lors de la sauvegarde des notes");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des notes:", error);
      alert("Erreur lors de la sauvegarde des notes");
    }
  };

  const updateStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) fetchOrders()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      try {
        const response = await fetch(`/api/orders/${orderId}`, { method: "DELETE" })
        if (response.ok) fetchOrders()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const orderTotalPrice = order.items.reduce((total, item) => {
      return total + (item.product ? item.product.price * item.quantity : 0)
    }, 0)

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Commande #${order.id.substring(0, 6)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
            .notes { margin-top: 20px; padding: 10px; background-color: #f9f9f9; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Commande #${order.id.substring(0, 6)}</h1>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
            <p>Statut: ${STATUS_LABELS[order.status]}</p>
          </div>
          
          <div class="order-info">
            <h3>Informations client:</h3>
            <p><strong>Nom:</strong> ${order.user.name || order.user.email}</p>
          </div>

          <h3>Détail des articles:</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Référence</th>
                <th>Quantité</th>
                <th>Prix Unitaire</th>
                <th>Total Ligne</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product?.name || 'Produit non trouvé'}</td>
                  <td>${item.product?.reference || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>${item.product?.price ? item.product.price.toFixed(2) + ' €' : 'N/A'}</td>
                  <td>${item.product?.price ? (item.product.price * item.quantity).toFixed(2) + ' €' : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total Commande: ${orderTotalPrice.toFixed(2)} €</p>
          </div>

          ${order.notes ? `
            <div class="notes">
              <h3>Notes:</h3>
              <p>${order.notes}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  if (status === "loading") { // Add this loading check
    return <div className="text-center py-4">Chargement de la session...</div>;
  }

  if (loading) {
    return <div className="text-center py-4">Chargement des commandes...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Commandes ({orders.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {orders.map((order) => {
          const orderTotalPrice = order.items.reduce((total, item) => {
            return total + (item.product ? item.product.price * item.quantity : 0);
          }, 0);

          return (
            <div key={order.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-sm text-gray-500">
                      Commande #{order.id.substring(0, 6)}... du {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  {isAdmin(session) && (
                    <div className="mt-1 text-sm text-gray-600">
                      Par: {order.user.name || order.user.email}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {isAdmin(session) && (
                    <>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as Order["status"])}
                        className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900"
                      >
                        <option value="PENDING">En attente</option>
                        <option value="IN_PREPARATION">En préparation</option>
                        <option value="DELIVERED">Livrée</option>
                      </select>
                      <button 
                        onClick={() => printOrder(order)} 
                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        Imprimer
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteOrder(order.id)} className="text-red-600 hover:text-red-800 text-sm">
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantité</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix Unitaire</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Ligne</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {order.items.map((item) => (
                              <tr key={item.id}>
                                  <td className="px-4 py-2 text-sm text-gray-900">{item.product?.name || 'Produit non trouvé'}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500">{item.product?.reference || 'N/A'}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500 text-right">{item.quantity}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500 text-right">{item.product?.price ? item.product.price.toFixed(2) + ' €' : 'N/A'}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500 text-right">{item.product?.price ? (item.product.price * item.quantity).toFixed(2) + ' €' : 'N/A'}</td>
                              </tr>
                          ))}
                          <tr>
                              <td colSpan={4} className="px-4 py-2 text-sm font-bold text-gray-900 text-right">Total Commande:</td>
                              <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">{orderTotalPrice.toFixed(2)} €</td>
                          </tr>
                      </tbody>
                  </table>
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded">
              <label htmlFor={`notes-${order.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Notes:
              </label>
              <textarea
                id={`notes-${order.id}`}
                rows={2}
                value={editableNotes[order.id] !== undefined ? editableNotes[order.id] : order.notes || ""}
                onChange={(e) => handleNotesChange(order.id, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                disabled={!(isAdmin(session) || session?.user?.id === order.user.id)}
              />
              {(isAdmin(session) || session?.user?.id === order.user.id) && editableNotes[order.id] !== undefined && editableNotes[order.id] !== (order.notes || "") && (
                <button
                  onClick={() => handleSaveNotes(order.id)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Sauvegarder les notes
                </button>
              )}
            </div>
          </div>
          )
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune commande trouvée
        </div>
      )}
    </div>
  )
}