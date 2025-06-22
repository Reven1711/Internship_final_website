// Test file to verify duplicate checking logic
const existingProducts = ["Boric Acid", "Acetic Acid", "Sulfuric Acid"];

function checkDuplicate(newProductName) {
  const productExists = existingProducts.some(
    (existingProduct) =>
      existingProduct.toLowerCase() === newProductName.toLowerCase()
  );

  console.log(
    `Checking "${newProductName}" against existing products:`,
    existingProducts
  );
  console.log(`Result: ${productExists ? "DUPLICATE FOUND" : "No duplicate"}`);

  return productExists;
}

// Test cases
console.log("=== Testing Duplicate Check Logic ===");
console.log("Existing products:", existingProducts);
console.log("");

checkDuplicate("boric acid");
checkDuplicate("Boric Acid");
checkDuplicate("BORIC ACID");
checkDuplicate("acetic acid");
checkDuplicate("Hydrochloric Acid");
checkDuplicate("sulfuric acid");
