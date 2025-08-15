"use client"

import { useState, useEffect } from "react"

export function EmailSettings() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSetting() {
      try {
        const response = await fetch("/api/settings/email_notifications")
        if (response.ok) {
          const data = await response.json()
          setIsEnabled(data.value === "true")
        }
      } catch (error) {
        console.error("Erreur lors du chargement du paramètre email:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSetting()
  }, [])

  const handleToggle = async () => {
    const newValue = !isEnabled
    setIsEnabled(newValue)
    try {
      await fetch("/api/settings/email_notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: newValue.toString() }),
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paramètre email:", error)
      // Revert the state if the API call fails
      setIsEnabled(!newValue)
    }
  }

  if (loading) {
    return <div>Chargement des paramètres email...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Paramètres Email</h2>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Activer les notifications par email pour les nouvelles commandes</p>
        <button
          onClick={handleToggle}
          className={`${isEnabled ? "bg-blue-600" : "bg-gray-200"} relative inline-flex items-center h-6 rounded-full w-11`}
        >
          <span
            className={`${isEnabled ? "translate-x-6" : "translate-x-1"} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
          />
        </button>
      </div>
    </div>
  )
}
