function hitungPajak() {
  const pajak = 1000000 * 0.11;
  document.getElementById("output").innerText = `PPN 11%: Rp ${pajak.toLocaleString("id-ID")}`;
}
