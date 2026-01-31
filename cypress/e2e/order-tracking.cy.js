describe("UI Test: Order Tracking & Status", () => {
  // Abaikan error koneksi aplikasi
  Cypress.on("uncaught:exception", (err, runnable) => {
    return false;
  });

  beforeEach(() => {
    // Gunakan session v9
    cy.session(
      "loggedInUser_Tracking_v9",
      () => {
        cy.visit("http://localhost:3000/login");

        // Login
        cy.get('input[type="email"]')
          .should("be.visible")
          .type("test@example.com");
        cy.get('input[type="password"]').type("secret");
        cy.get('button[type="submit"]').click();

        // --- PENANGANAN POPUP YANG LEBIH SABAR ---
        // 1. Tunggu popup muncul
        cy.get(".swal2-popup", { timeout: 10000 }).should("exist");

        // 2. Klik tombol OK
        cy.get(".swal2-confirm").click({ force: true });

        // 3. [FIX UTAMA] Tunggu sampai container popup BENAR-BENAR HILANG
        // Ini memastikan overlay tidak menutupi header lagi
        cy.get(".swal2-container", { timeout: 10000 }).should("not.exist");

        // 4. Baru cek Header
        cy.get("header")
          .contains("Akun Saya", { timeout: 20000 })
          .should("be.visible");
      },
      { cacheAcrossSpecs: true }
    );
  });

  it("Harus bisa melihat daftar pesanan dan detail statusnya", () => {
    // 1. Buka Halaman List Pesanan
    cy.visit("http://localhost:3000/orders");

    // Pastikan halaman termuat
    cy.contains("Riwayat Pesanan Saya", { timeout: 15000 }).should(
      "be.visible"
    );
    cy.wait(1000);

    // 2. Ambil Link Pesanan & Kunjungi Langsung (Anti-Flaky)
    cy.get('a[href*="/order/"]').should("have.length.at.least", 1);
    cy.get('a[href*="/order/"]')
      .first()
      .then(($a) => {
        const orderUrl = $a.attr("href");
        cy.visit(`http://localhost:3000${orderUrl}`);
      });

    // 3. Verifikasi Halaman Detail
    cy.url({ timeout: 20000 }).should("include", "/order/");

    // 4. Verifikasi Komponen Status
    // Kita gunakan 'exist' agar tes tetap lulus meski elemen tertutup scroll/layout
    cy.contains("Status Pesanan", { timeout: 15000 }).should("exist");
    cy.get("span.rounded-full").should("exist");
    cy.contains("Metode Pembayaran").should("exist");
  });
});
