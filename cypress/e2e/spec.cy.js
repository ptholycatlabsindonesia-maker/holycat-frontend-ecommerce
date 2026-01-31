describe("Alur Autentikasi Pengguna", () => {
  it("seharusnya berhasil login dan menampilkan header yang benar", () => {
    // 1. Kunjungi halaman login
    cy.visit("http://localhost:3000/login");

    // 2. Isi form
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').type("secret");

    // 3. Klik tombol login
    cy.get('button[type="submit"]').click();

    // 4. Klik tombol "OK" pada notifikasi
    cy.get(".swal2-confirm").click();

    // 5. [LANGKAH KUNCI] Tunggu hingga placeholder loading di header menghilang.
    // Ini memastikan bahwa proses autentikasi di sisi klien sudah selesai.
    cy.get("header .animate-pulse").should("not.exist");

    // 6. Sekarang, kita bisa dengan aman memverifikasi bahwa "Akun Saya" sudah tampil.
    cy.get("header").contains("Akun Saya").should("be.visible");
  });
});
