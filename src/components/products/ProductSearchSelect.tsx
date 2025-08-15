"use client"

import { useState, useEffect, useRef } from "react"

// Define types locally
interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  reference?: string | null;
  description?: string | null;
  stock: number;
  categoryId: string;
  category: Category;
}

interface ProductSearchSelectProps {
  products: Product[]
  onSelect: (product: Product) => void
  selectedProductId: string
}

export function ProductSearchSelect({ products, onSelect, selectedProductId }: ProductSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProducts(products)
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (p.reference && p.reference.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (p.description && p.description.toLowerCase().includes(lowerCaseSearchTerm))
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [wrapperRef])

  const handleSelect = (p: Product) => {
    onSelect(p)
    setSearchTerm(`${p.name} (${p.reference || 'N/A'})`)
    setIsOpen(false)
  }

  const getDisplayValue = () => {
    if (selectedProductId) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      if (selectedProduct) {
        return `${selectedProduct.name} (${selectedProduct.reference || 'N/A'})`;
      }
    }
    return searchTerm;
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={getDisplayValue()}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          onSelect({} as Product) // Clear selected product when typing
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
          {filteredProducts.length === 0 ? (
            <li className="px-3 py-2 text-gray-500">Aucun produit trouvé</li>
          ) : (
            filteredProducts.map(p => (
              <li
                key={p.id}
                onClick={() => handleSelect(p)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
              >
                {p.name} <span className="text-xs text-gray-500">({p.reference || 'N/A'}) - Stock: {p.stock}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}



