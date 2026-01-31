describe("Tugas 20: UI Test Admin Order Management", () => {
  Cypress.on("uncaught:exception", () => false);

  beforeEach(() => {
    cy.session("admin_session", () => {
      cy.visit("http://localhost:3000/login");
      cy.get('input[type="email"]')
        .should("be.visible")
        .type("test@example.com"); // Admin
      cy.get('input[type="password"]').type("secret");
      cy.get('button[type="submit"]').click();

      // Tunggu login & handle popup
      cy.wait(2000);
      cy.get("body").then(($body) => {
        if ($body.find(".swal2-confirm").length > 0) {
          cy.get(".swal2-confirm").click({ force: true });
        }
      });
      cy.get("header").contains("Akun Saya").should("be.visible");
    });
  });

  it("Admin harus bisa mengelola pesanan (Ganti Status)", () => {
    // 1. Kunjungi Dashboard Admin
    cy.visit("http://localhost:3000/admin");

    // Cek apakah halaman admin bisa diakses
    cy.contains("Dashboard Overview", { timeout: 10000 }).should("exist");

    // 2. Klik tombol "Kelola Pesanan" untuk akses halaman orders
    cy.get("a, button").contains("Kelola Pesanan").click({ force: true });
    cy.url({ timeout: 10000 }).should("include", "/admin/orders");

    // 3. Tunggu halaman orders dimuat
    cy.get("h1", { timeout: 10000 }).should("contain", "Admin: Kelola Pesanan");

    // 4. Tunggu sampai ada minimal satu row dengan select dropdown
    cy.get("table tbody tr", { timeout: 10000 }).first().should("be.visible");

    // 5. Verifikasi bahwa ada select dropdown untuk mengubah status
    cy.get("table tbody tr")
      .first()
      .find("select")
      .should("exist")
      .should("be.visible");

    // 6. Ubah status pada baris pertama ke status yang berbeda
    // Cek current status dulu, lalu ubah ke status berbeda
    cy.get("table tbody tr")
      .first()
      .find("select")
      .then(($select) => {
        const currentStatus = $select.val();
        let newStatus = "Dikemas"; // Default ubah ke Dikemas

        // Jika sudah Dikemas, ubah ke Dikirim
        if (currentStatus === "Dikemas") {
          newStatus = "Dikirim";
        }

        cy.wrap($select).select(newStatus, { force: true });
      });

    // 7. Jika status yang dipilih adalah "Dikirim", akan muncul modal
    // Tunggu modal atau response sukses
    cy.get(".swal2-popup").then(($modal) => {
      if ($modal.length > 0) {
        // Modal muncul, isi form jika ada
        cy.get("#swal-input-courier", { timeout: 2000 }).then(($courier) => {
          if ($courier.length > 0) {
            cy.get("#swal-input-courier").type("JNE");
            cy.get("#swal-input-tracking").type("123456789");
            cy.get(".swal2-confirm").click({ force: true });
          }
        });

        // Tunggu response sukses
        cy.wait(1000);
      }
    });

    // 8. Verifikasi halaman masih di admin/orders
    cy.url().should("include", "/admin/orders");

    // 9. Verifikasi table masih ada dengan orders
    cy.get("table tbody tr", { timeout: 5000 }).should(
      "have.length.greaterThan",
      0
    );
  });
});
