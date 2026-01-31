describe("Alur Checkout E2E", () => {
  beforeEach(() => {
    cy.session(
      "loggedInUser_v7", // Ganti ke v7
      () => {
        cy.visit("http://localhost:3000/login");
        cy.get('input[type="email"]').type("test@example.com");
        cy.get('input[type="password"]').type("secret");
        cy.get('button[type="submit"]').click();

        cy.contains("Berhasil", { timeout: 10000 }).should("be.visible");
        cy.get(".swal2-confirm").click();
        cy.get("header").contains("Akun Saya").should("be.visible");
      },
      {
        cacheAcrossSpecs: true,
      }
    );
  });

  it("seharusnya berhasil login, tambah item, checkout, dan membuat pesanan", () => {
    // 1. Tambah item
    cy.visit("http://localhost:3000/");
    cy.contains("Whiskas Tuna 1.2kg")
      .parents(".bg-white")
      .within(() => {
        cy.get("button").contains("Masukan Keranjang").click();
      });
    cy.contains("Berhasil", { timeout: 10000 }).should("be.visible");
    cy.get(".swal2-confirm").click();

    // 2. Kunjungi Cart
    cy.visit("http://localhost:3000/cart");

    // --- FIX STABILITAS ---
    // Tunggu cart diload sempurna
    cy.contains("Whiskas Tuna 1.2kg", { timeout: 10000 }).should("be.visible");

    // Pastikan checkbox dicentang
    cy.get('input[type="checkbox"]').should("have.length.at.least", 1);
    cy.get('input[type="checkbox"]').eq(1).check({ force: true });

    // Tunggu sampai total harga update (indikator state React sinkron)
    cy.contains("Total Terpilih:")
      .parent()
      .find("div")
      .should("not.contain", "$0.00");

    // Tunggu sebentar (1 detik) untuk memastikan event loop React selesai
    // Ini teknik "kotor" tapi sangat ampuh untuk masalah flaky di CI/CD lambat
    cy.wait(1000);

    // Klik tombol checkout
    cy.get("button").contains("Proceed to Checkout").click();

    // 3. Verifikasi URL & Halaman Checkout
    // Gunakan timeout sangat panjang (30s) karena komputer Anda sedang load tinggi
    cy.url({ timeout: 30000 }).should("include", "/checkout");

    // Pastikan konten checkout muncul
    cy.contains("Ringkasan Belanja", { timeout: 30000 }).should("be.visible");
    cy.contains("Total").should("be.visible");

    // 4. Proses Order
    cy.get('input[value="BANK_TRANSFER"]').check();
    cy.get("button").contains("Buat Pesanan").click();

    // 5. Verifikasi Order Sukses
    cy.url({ timeout: 30000 }).should("include", "/order/");
    cy.contains("Detail Pesanan #", { timeout: 30000 }).should("be.visible");
    cy.contains("Menunggu Pembayaran").should("be.visible");
  });
});
