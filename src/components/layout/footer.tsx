import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          {/* Placeholder for company logo */}
          <img src="/next.svg" alt="Company Logo" className="h-10 mr-4" />
          <span className="text-lg font-bold">SAINT JEAN MEDIAL</span>
        </div>
        <div className="text-center md:text-right">
          <p className="text-sm">8-10 rue Octavie Coudreau 17400 Saint Jean d'Angély</p>
          <p className="text-sm">Téléphone: 05.46.32.18.99</p>
          <p className="text-sm">Email: saint-jean-medical@perso.alliadis.net</p>
        </div>
      </div>
    </footer>
  );
}