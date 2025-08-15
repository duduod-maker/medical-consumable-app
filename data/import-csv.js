const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importCSV() {
  try {
    console.log('🚀 Début de l\'import CSV...');
    
    // Lire le fichier CSV
    const csvContent = fs.readFileSync('./data/produits.csv', 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
    }

    // Parser l'en-tête
    const headers = lines[0].split(';').map(h => h.trim());
    console.log('📋 Colonnes détectées:', headers);

    let successCount = 0;
    let errorCount = 0;

    // Traiter chaque ligne
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';').map(v => v.trim());
      
      if (values.length !== headers.length) {
        console.error(`❌ Ligne ${i + 1}: Nombre de colonnes incorrect`);
        errorCount++;
        continue;
      }

      // Créer un objet avec les données
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || null;
      });

      try {
        // Validation
        if (!rowData.name) {
          console.error(`❌ Ligne ${i + 1}: Le nom du produit est requis`);
          errorCount++;
          continue;
        }

        if (!rowData.categoryId) {
          console.error(`❌ Ligne ${i + 1}: L'ID de catégorie est requis`);
          errorCount++;
          continue;
        }

        // Vérifier que la catégorie existe
        const categoryExists = await prisma.category.findUnique({
          where: { id: rowData.categoryId }
        });

        if (!categoryExists) {
          console.error(`❌ Ligne ${i + 1}: Catégorie avec l'ID "${rowData.categoryId}" introuvable`);
          errorCount++;
          continue;
        }

        // Créer le produit
        const product = await prisma.product.create({
          data: {
            name: rowData.name,
            reference: rowData.reference || null,
            supplierRef: rowData.supplierRef || null,
            description: rowData.description || null,
            price: rowData.price ? parseFloat(rowData.price) : 0.0,
            categoryId: rowData.categoryId,
          }
        });

        console.log(`✅ Ligne ${i + 1}: Produit "${product.name}" créé avec succès`);
        successCount++;

      } catch (error) {
        console.error(`❌ Ligne ${i + 1}: Erreur lors de la création -`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Résumé de l\'import:');
    console.log(`✅ Produits créés avec succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log('🎉 Import terminé !');

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Lancer l'import
importCSV();