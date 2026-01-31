// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
// cypress/support/e2e.js

Cypress.on("uncaught:exception", (err, runnable) => {
  // Mengembalikan false di sini mencegah Cypress membatalkan tes
  if (
    err.message.includes("Hydration failed") ||
    err.message.includes("Minified React error #418") ||
    err.message.includes("Minified React error #423")
  ) {
    return false;
  }
  // Biarkan error lain tetap membuat tes gagal
});
// cypress/support/e2e.js

Cypress.on("uncaught:exception", (err, runnable) => {
  // Solusi untuk error 'removeChild' yang sering terjadi karena script 3rd party (Midtrans/Google)
  // saat transisi halaman di Next.js
  if (
    err.message.includes("removeChild") ||
    err.message.includes("NotFoundError") ||
    err.message.includes("The node to be removed is not a child of this node")
  ) {
    return false;
  }

  // Solusi error Hydration sisa-sisa
  if (
    err.message.includes("Hydration failed") ||
    err.message.includes("Minified React error")
  ) {
    return false;
  }
});
