// PPh Unifikasi
const tableBody = document.querySelector('#table-unifikasi tbody');
document.querySelector('#add-row').addEventListener('click', () => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" name="invoice"/></td>
    <td><input type="text" name="perusahaan"/></td>
    <td><input type="text" name="jenisPajak"/></td>
    <td><input type="number" name="tarif"/></td>
    <td><input type="number" name="dpp"/></td>
    <td>
      <select name="ppn">
        <option value="ya">Ya</option>
        <option value="tidak">Tidak</option>
      </select>
    </td>
    <td><button class="remove">Hapus</button></td>`;
  tableBody.appendChild(row);
  row.querySelector('.remove').addEventListener('click', () => row.remove());
});

document.querySelector('#hitung-unifikasi').addEventListener('click', () => {
  const rows = [...tableBody.querySelectorAll('tr')];
  let html = '<table><tr><th>#</th><th>Invoice</th><th>PPh</th><th>PPN</th><th>Jumlah</th></tr>';
  rows.forEach((r,i) => {
    const tarif = parseFloat(r.querySelector('input[name="tarif"]').value) || 0;
    const dpp = parseFloat(r.querySelector('input[name="dpp"]').value) || 0;
    const ppnFlag = r.querySelector('select[name="ppn"]').value === 'ya';
    const pph = dpp * tarif / 100;
    const ppn = ppnFlag ? dpp * 0.11 : 0;
    const total = dpp + pph + ppn;
    const invoice = r.querySelector('input[name="invoice"]').value;
    html += `<tr>
      <td>${i+1}</td>
      <td>${invoice}</td><td>${pph.toFixed(2)}</td><td>${ppn.toFixed(2)}</td><td>${total.toFixed(2)}</td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('hasil-unifikasi').innerHTML = html;
});

// PPh 21 TER (sangat sederhana)
document.querySelector('#hitung-pph21').addEventListener('click', () => {
  const form = document.getElementById('form-pph21');
  const gaji = parseFloat(form.gaji.value) || 0;
  const kategori = 'B'; // logic ditentukan berdasarkan status & tanggungan
  let tarif = 0.015; // misal kategori B
  const pph = gaji * tarif;
  document.getElementById('hasil-pph21').innerHTML = `
    <p>PPh 21 TER (kategori ${kategori}): <strong>${pph.toLocaleString('id-ID')}</strong></p>`;
});

// Donasi
document.getElementById('form-donasi').addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  alert(`Donasi Rp${parseInt(data.nominal).toLocaleString()} berhasil! Pesan: ${data.pesan}`);
});

// Format angka otomatis saat mengetik
function formatAngkaInput(input) {
  input.addEventListener('input', function (e) {
    let value = input.value.replace(/[^\d]/g, '');
    if (!value) return input.value = '';
    input.value = parseInt(value).toLocaleString('id-ID');
  });

  input.addEventListener('blur', function () {
    input.value = input.value.replace(/[^\d]/g, '');
  });

  input.addEventListener('focus', function () {
    let raw = input.value.replace(/[^\d]/g, '');
    input.value = raw;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[name="tarif"], input[name="dpp"], input[name="gaji"], input[name="iuranPensiun"]').forEach(input => {
    formatAngkaInput(input);
  });
  loadDataFromLocalStorage();
});

// Validasi dan Perhitungan PPh Unifikasi
function hitungUnifikasi() {
  const rows = document.querySelectorAll('#table-unifikasi tbody tr');
  let totalPPh = 0;
  let totalPPN = 0;
  let valid = true;

  rows.forEach((row, index) => {
    const tarifInput = row.querySelector('input[name="tarif"]');
    const dppInput = row.querySelector('input[name="dpp"]');
    const tarif = parseFloat(tarifInput.value.replace(/[^\d]/g, ''));
    const dpp = parseFloat(dppInput.value.replace(/[^\d]/g, ''));
    const ppn = row.querySelector('select[name="ppn"]').value;

    tarifInput.classList.remove("input-error");
    dppInput.classList.remove("input-error");

    if (isNaN(tarif) || tarif < 0) {
      tarifInput.classList.add("input-error");
      valid = false;
    }
    if (isNaN(dpp) || dpp < 0) {
      dppInput.classList.add("input-error");
      valid = false;
    }
  });

  if (!valid) {
    alert("Terdapat input tidak valid. Silakan periksa kolom berwarna merah.");
    return;
  }

  rows.forEach(row => {
    const tarif = parseFloat(row.querySelector('input[name="tarif"]').value.replace(/[^\d]/g, ''));
    const dpp = parseFloat(row.querySelector('input[name="dpp"]').value.replace(/[^\d]/g, ''));
    const ppn = row.querySelector('select[name="ppn"]').value;

    const pph = dpp * (tarif / 100);
    const ppnAmount = ppn === 'Include' ? dpp * 0.11 : 0;

    totalPPh += pph;
    totalPPN += ppnAmount;
  });

  const hasilDiv = document.getElementById('hasil-unifikasi');
  hasilDiv.innerHTML = `<p>Total PPh: Rp ${totalPPh.toLocaleString()}</p>
                        <p>Total PPN: Rp ${totalPPN.toLocaleString()}</p>`;

  saveDataToLocalStorage();
}

document.getElementById('hitung-unifikasi').addEventListener('click', hitungUnifikasi);

// Reset data Unifikasi
function resetUnifikasi() {
  const rows = document.querySelectorAll('#table-unifikasi tbody tr');
  rows.forEach(row => {
    row.querySelectorAll('input').forEach(input => input.value = '');
    row.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
  });
  document.getElementById('hasil-unifikasi').innerHTML = '';
  localStorage.removeItem('unifikasiData');
}

const resetUnifikasiBtn = document.createElement("button");
resetUnifikasiBtn.textContent = "Reset Data Unifikasi";
resetUnifikasiBtn.type = "button";
resetUnifikasiBtn.addEventListener("click", resetUnifikasi);
document.getElementById("unifikasi-section").appendChild(resetUnifikasiBtn);

// Simpan dan Load LocalStorage Unifikasi
function saveDataToLocalStorage() {
  const rows = document.querySelectorAll('#table-unifikasi tbody tr');
  const data = [];
  rows.forEach(row => {
    data.push({
      invoice: row.querySelector('input[name="invoice"]').value,
      perusahaan: row.querySelector('input[name="perusahaan"]').value,
      jenisPajak: row.querySelector('input[name="jenisPajak"]').value,
      tarif: row.querySelector('input[name="tarif"]').value,
      dpp: row.querySelector('input[name="dpp"]').value,
      ppn: row.querySelector('select[name="ppn"]').value,
    });
  });
  localStorage.setItem('unifikasiData', JSON.stringify(data));
}

function loadDataFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('unifikasiData'));
  if (!data) return;

  const rows = document.querySelectorAll('#table-unifikasi tbody tr');
  rows.forEach((row, index) => {
    if (!data[index]) return;
    row.querySelector('input[name="invoice"]').value = data[index].invoice;
    row.querySelector('input[name="perusahaan"]').value = data[index].perusahaan;
    row.querySelector('input[name="jenisPajak"]').value = data[index].jenisPajak;
    row.querySelector('input[name="tarif"]').value = data[index].tarif;
    row.querySelector('input[name="dpp"]').value = data[index].dpp;
    row.querySelector('select[name="ppn"]').value = data[index].ppn;
  });
}

// Validasi dan Perhitungan PPh 21 TER
function hitungPPh21() {
  const form = document.getElementById('form-pph21');
  const gajiInput = form.gaji;
  const iuranInput = form.iuranPensiun;
  const gaji = parseFloat(gajiInput.value.replace(/[^\d]/g, ''));
  const iuran = parseFloat(iuranInput.value.replace(/[^\d]/g, ''));

  gajiInput.classList.remove("input-error");
  iuranInput.classList.remove("input-error");

  if (isNaN(gaji) || gaji < 0) {
    gajiInput.classList.add("input-error");
  }
  if (isNaN(iuran) || iuran < 0) {
    iuranInput.classList.add("input-error");
  }
  if (gajiInput.classList.contains("input-error") || iuranInput.classList.contains("input-error")) {
    alert("Gaji dan Iuran Pensiun harus berupa angka positif. Periksa kolom yang berwarna merah.");
    return;
  }

  const penghasilanNetto = gaji - iuran;
  const ptkp = 54000000; // PTKP default setahun untuk WP TK/0
  let pkp = penghasilanNetto * 12 - ptkp;
  pkp = pkp > 0 ? pkp : 0;

  // Tarif progresif lapisan pertama
  const pph21 = pkp <= 60000000 ? pkp * 0.05 : (60000000 * 0.05 + (pkp - 60000000) * 0.15);

  const hasil = document.getElementById('hasil-pph21');
  hasil.innerHTML = `<p>Penghasilan Neto Bulanan: Rp ${penghasilanNetto.toLocaleString()}</p>
                     <p>PKP Setahun: Rp ${pkp.toLocaleString()}</p>
                     <p>PPh 21 Terutang: Rp ${pph21.toLocaleString()}</p>`;
}

document.getElementById('hitung-pph21').addEventListener('click', hitungPPh21);

// Reset data PPh 21 TER
function resetPPh21() {
  const form = document.getElementById('form-pph21');
  form.gaji.value = '';
  form.iuranPensiun.value = '';
  document.getElementById('hasil-pph21').innerHTML = '';
}

const resetPPh21Btn = document.createElement("button");
resetPPh21Btn.textContent = "Reset Data PPh 21";
resetPPh21Btn.type = "button";
resetPPh21Btn.addEventListener("click", resetPPh21);
document.getElementById("form-pph21").appendChild(resetPPh21Btn);

// Tambah style highlight input-error
const style = document.createElement('style');
style.innerHTML = `
  .input-error {
    border: 2px solid red !important;
    background-color: #ffe5e5;
  }
`;
document.head.appendChild(style);

// Ekspor PDF untuk PPh Unifikasi
function exportUnifikasiToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const rows = document.querySelectorAll('#table-unifikasi tbody tr');

  doc.setFontSize(16);
  doc.text("Laporan PPh Unifikasi", 20, 20);
  doc.setFontSize(10);

  let y = 30;
  doc.text("No | Invoice | Perusahaan | Jenis Pajak | Tarif(%) | DPP | PPN", 10, y);
  y += 10;

  rows.forEach((row, index) => {
    const invoice = row.querySelector('input[name="invoice"]').value;
    const perusahaan = row.querySelector('input[name="perusahaan"]').value;
    const jenisPajak = row.querySelector('input[name="jenisPajak"]').value;
    const tarif = row.querySelector('input[name="tarif"]').value;
    const dpp = row.querySelector('input[name="dpp"]').value;
    const ppn = row.querySelector('select[name="ppn"]').value;

    const line = `${index + 1} | ${invoice} | ${perusahaan} | ${jenisPajak} | ${tarif} | ${dpp} | ${ppn}`;
    doc.text(line, 10, y);
    y += 10;
  });

  doc.save("pph_unifikasi.pdf");
}

const exportBtn = document.createElement("button");
exportBtn.textContent = "Export PDF Unifikasi";
exportBtn.type = "button";
exportBtn.addEventListener("click", exportUnifikasiToPDF);
document.getElementById("unifikasi-section").appendChild(exportBtn);

// Ekspor ke Excel untuk PPh Unifikasi
function exportUnifikasiToExcel() {
  const rows = document.querySelectorAll('#table-unifikasi tbody tr');
  let csv = "No,Invoice,Perusahaan,Jenis Pajak,Tarif(%),DPP,PPN\n";
  rows.forEach((row, index) => {
    const invoice = row.querySelector('input[name="invoice"]').value;
    const perusahaan = row.querySelector('input[name="perusahaan"]').value;
    const jenisPajak = row.querySelector('input[name="jenisPajak"]').value;
    const tarif = row.querySelector('input[name="tarif"]').value;
    const dpp = row.querySelector('input[name="dpp"]').value;
    const ppn = row.querySelector('select[name="ppn"]').value;
    csv += `${index + 1},${invoice},${perusahaan},${jenisPajak},${tarif},${dpp},${ppn}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "pph_unifikasi.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const exportExcelBtn = document.createElement("button");
exportExcelBtn.textContent = "Export Excel Unifikasi";
exportExcelBtn.type = "button";
exportExcelBtn.addEventListener("click", exportUnifikasiToExcel);
document.getElementById("unifikasi-section").appendChild(exportExcelBtn);

// Ekspor Excel untuk PPh 21
function exportPPh21ToExcel() {
  const gaji = document.getElementById('form-pph21').gaji.value;
  const iuran = document.getElementById('form-pph21').iuranPensiun.value;
  const hasil = document.getElementById('hasil-pph21').innerText.split('\n');

  let csv = "Gaji,Iuran Pensiun,Penghasilan Neto,PKP,PPh 21\n";
  csv += `${gaji},${iuran},${hasil[0]?.split(':')[1]?.trim()},${hasil[1]?.split(':')[1]?.trim()},${hasil[2]?.split(':')[1]?.trim()}\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "pph21.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const exportExcel21Btn = document.createElement("button");
exportExcel21Btn.textContent = "Export Excel PPh 21";
exportExcel21Btn.type = "button";
exportExcel21Btn.addEventListener("click", exportPPh21ToExcel);
document.getElementById("form-pph21").appendChild(exportExcel21Btn);

// Ekspor PDF untuk PPh 21 dengan tampilan rapi
function exportPPh21ToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const gaji = document.getElementById('form-pph21').gaji.value;
  const iuran = document.getElementById('form-pph21').iuranPensiun.value;
  const hasil = document.getElementById('hasil-pph21').innerText.split('\n');

  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text("Laporan Perhitungan PPh 21", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(0);
  let y = 40;
  const marginLeft = 25;

  doc.text("Data Input:", marginLeft, y);
  y += 10;
  doc.text(`- Gaji: Rp ${Number(gaji).toLocaleString("id-ID")}`, marginLeft, y);
  y += 8;
  doc.text(`- Iuran Pensiun: Rp ${Number(iuran).toLocaleString("id-ID")}`, marginLeft, y);

  y += 15;
  doc.text("Hasil Perhitungan:", marginLeft, y);
  y += 10;
  hasil.forEach((line, index) => {
    doc.text(`- ${line}`, marginLeft, y + index * 8);
  });

  doc.save("pph21.pdf");
}

const exportPDF21Btn = document.createElement("button");
exportPDF21Btn.textContent = "Export PDF PPh 21";
exportPDF21Btn.type = "button";
exportPDF21Btn.addEventListener("click", exportPPh21ToPDF);
document.getElementById("form-pph21").appendChild(exportPDF21Btn);

// Fitur cetak langsung ke printer untuk PPh 21
function printPPh21() {
  const gaji = document.getElementById('form-pph21').gaji.value;
  const iuran = document.getElementById('form-pph21').iuranPensiun.value;
  const hasil = document.getElementById('hasil-pph21').innerText.split('\n');

  let printContent = '<h2>Laporan Perhitungan PPh 21</h2>';
  printContent += `<p><strong>Gaji:</strong> Rp ${Number(gaji).toLocaleString("id-ID")}</p>`;
  printContent += `<p><strong>Iuran Pensiun:</strong> Rp ${Number(iuran).toLocaleString("id-ID")}</p>`;
  printContent += '<h3>Hasil Perhitungan:</h3>';
  printContent += '<ul>';
  hasil.forEach(line => {
    printContent += `<li>${line}</li>`;
  });
  printContent += '</ul>';

  const win = window.open('', '', 'width=800,height=600');
  win.document.write('<html><head><title>Cetak PPh 21</title></head><body>');
  win.document.write(printContent);
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}

const printBtn = document.createElement("button");
printBtn.textContent = "Cetak PPh 21";
printBtn.type = "button";
printBtn.addEventListener("click", printPPh21);
document.getElementById("form-pph21").appendChild(printBtn);
