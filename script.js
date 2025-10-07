// NAVIGASI
(function(){
  const navBtns = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPage = btn.dataset.page;
      
      navBtns.forEach(b => b.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(targetPage).classList.add('active');
      
      if(targetPage === 'page3') updateStats();
    });
  });
})();

// PAGE 1: PEMBAGI OTOMATIS
(function(){
  const $=id=>document.getElementById(id);
  const fmt=n=>isNaN(n)?'Rp0':'Rp'+Number(n).toLocaleString('id-ID');
  const key='pembagiAuto_v1';

  function formatInput(input){
    input.addEventListener('input',()=>{
      let val=input.value.replace(/\D/g,'');
      if(!val){input.value='';return;}
      input.dataset.value=val;
      input.value=Number(val).toLocaleString('id-ID');
    });
  }
  formatInput($('pemasukan'));
  formatInput($('modalBahan'));

  function loadHistory(){ try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):[];}catch(e){return []} }
  function saveHistory(arr){ localStorage.setItem(key,JSON.stringify(arr)); }
  function renderHistory(){
    const tbody=document.querySelector('#historyTable tbody'); 
    tbody.innerHTML='';
    const hist = loadHistory();
    if(hist.length === 0){
      tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px"><i class="fas fa-inbox" style="font-size:2rem;opacity:0.3;display:block;margin-bottom:12px"></i>Belum ada riwayat transaksi</td></tr>';
      return;
    }
    hist.slice().reverse().forEach(r=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${r.tgl}</td><td>${fmt(r.pemasukan)}</td><td>${fmt(r.modal)}</td><td>${fmt(r.tabungan)}</td><td>${fmt(r.jajan)}</td><td>${fmt(r.tambahan)}</td>`;
      tbody.appendChild(tr);
    });
  }

  function showAlert(msg, type='info'){
    const pesan = $('pesan');
    const icons = {info: 'fa-info-circle', success: 'fa-check-circle', error: 'fa-exclamation-circle'};
    pesan.innerHTML = `<div class="alert ${type}"><i class="fas ${icons[type]}"></i> ${msg}</div>`;
    setTimeout(()=>pesan.innerHTML='',5000);
  }

  function hitung(){
    const pemasukan=Number($('pemasukan').dataset.value||0);
    const modalBahan=Number($('modalBahan').dataset.value||0);
    if(pemasukan<=0){showAlert('Silakan isi total pemasukan terlebih dahulu','error');return;}
    if(modalBahan>pemasukan){showAlert('Modal tidak boleh lebih besar dari pemasukan!','error');return;}
    $('pesan').innerHTML='';

    const laba=pemasukan-modalBahan;
    const tabungan=Math.round(laba*0.30);
    const jajan=Math.round(laba*0.10);
    const tambahan=laba-(tabungan+jajan);

    $('balikModal').textContent=fmt(modalBahan);
    $('tabungan').textContent=fmt(tabungan);
    $('jajan').textContent=fmt(jajan);
    $('tambahanModal').textContent=fmt(tambahan);
    $('hasilArea').style.display='block';

    return {pemasukan,modal:modalBahan,tabungan,jajan,tambahan};
  }

  function simpan(){
    const res=hitung(); if(!res)return;
    const hist=loadHistory();
    hist.push({tgl:new Date().toLocaleString('id-ID'),...res});
    saveHistory(hist); 
    renderHistory();
    showAlert('Data berhasil disimpan ke riwayat!','success');
  }

  $('hitungBtn').addEventListener('click',hitung);
  $('simpanBtn').addEventListener('click',simpan);
  $('resetBtn').addEventListener('click',()=>{
    if(confirm('Yakin ingin menghapus semua data riwayat?')){
      localStorage.removeItem(key); 
      renderHistory(); 
      $('hasilArea').style.display='none'; 
      showAlert('Data berhasil direset','info');
    }
  });

  renderHistory();
})();

// PAGE 2: HITUNG MODAL BAHAN
(function(){
  const $ = id => document.getElementById(id);
  const fmt = n => isNaN(n) ? 'Rp0' : 'Rp' + Number(n).toLocaleString('id-ID');
  const fmtUnit = (n, unit) => isNaN(n) ? `0 ${unit}` : `${Number(n).toLocaleString('id-ID')} ${unit}`;

  function formatNumber(str) {
    const clean = str.replace(/[^0-9]/g, '');
    if (!clean) return '';
    return Number(clean).toLocaleString('id-ID');
  }

  function cleanNumber(str) {
    return Number(str.replace(/[^0-9]/g, '')) || 0;
  }

  function konversiUnit(total, unitTotal, unitProduk) {
    let totalKonv = total;
    if (unitTotal === 'meter' && unitProduk === 'cm') totalKonv = total * 100;
    else if (unitTotal === 'liter' && unitProduk === 'ml') totalKonv = total * 1000;
    else if (unitTotal === 'kg' && unitProduk === 'gram') totalKonv = total * 1000;
    else if (unitTotal !== unitProduk) {
      showAlert('Unit tidak kompatibel! Gunakan meter→cm, liter→ml, kg→gram, atau pcs→pcs.', 'error');
      throw new Error('Unit tidak kompatibel');
    }
    return totalKonv;
  }

  function addFormatListener(inputId) {
    $(inputId).addEventListener('input', (e) => {
      const cursorPos = e.target.selectionStart;
      const value = e.target.value;
      const formatted = formatNumber(value);
      e.target.value = formatted;
      e.target.dataset.value = cleanNumber(formatted);
      e.target.setSelectionRange(cursorPos, cursorPos);
    });
  }

  addFormatListener('totalBahan');
  addFormatListener('hargaTotal');
  addFormatListener('kebutuhanProduk');
  addFormatListener('biayaTambahan');

  function showAlert(msg, type = 'info') {
    const pesan = $('pesan2');
    const icons = {info: 'fa-info-circle', success: 'fa-check-circle', error: 'fa-exclamation-circle'};
    pesan.innerHTML = `<div class="alert ${type}"><i class="fas ${icons[type]}"></i> ${msg}</div>`;
    setTimeout(() => pesan.innerHTML = '', 5000);
  }

  function hitung() {
    try {
      const totalBahan = cleanNumber($('totalBahan').value);
      const hargaTotal = cleanNumber($('hargaTotal').value);
      const kebutuhan = cleanNumber($('kebutuhanProduk').value);
      const biayaTambahan = cleanNumber($('biayaTambahan').value);
      const unitTotal = $('unitTotal').value;
      const unitProduk = $('unitProduk').value;

      if (totalBahan <= 0 || hargaTotal <= 0 || kebutuhan <= 0) {
        showAlert('Isi semua input bahan dengan angka lebih dari 0!', 'error');
        return;
      }

      const totalKonv = konversiUnit(totalBahan, unitTotal, unitProduk);
      const hargaPerUnit = hargaTotal / totalKonv;
      const modalPerProduk = (hargaPerUnit * kebutuhan) + biayaTambahan;
      const sisaBahan = totalKonv - kebutuhan;

      $('modalPerProduk').textContent = fmt(Math.round(modalPerProduk));
      $('sisaBahan').textContent = fmtUnit(Math.round(sisaBahan), unitProduk);
      $('hasilArea2').style.display = 'block';

      showAlert('Perhitungan modal berhasil!', 'success');
    } catch (e) {
      console.error(e);
    }
  }

  function resetForm() {
    $('namaBahan').value = '';
    $('totalBahan').value = '';
    $('totalBahan').dataset.value = '';
    $('hargaTotal').value = '';
    $('hargaTotal').dataset.value = '';
    $('kebutuhanProduk').value = '';
    $('kebutuhanProduk').dataset.value = '';
    $('biayaTambahan').value = '';
    $('biayaTambahan').dataset.value = '';
    $('unitTotal').value = 'meter';
    $('unitProduk').value = 'cm';
    $('hasilArea2').style.display = 'none';
    showAlert('Form telah direset!', 'info');
  }

  $('hitungBtn2').addEventListener('click', hitung);
  $('resetBtn2').addEventListener('click', resetForm);
})();

// PAGE 3: STATISTIK & LAPORAN
function updateStats() {
  const $ = id => document.getElementById(id);
  const fmt = n => isNaN(n) ? 'Rp0' : 'Rp' + Number(n).toLocaleString('id-ID');
  const key = 'pembagiAuto_v1';

  function loadHistory() {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  const history = loadHistory();
  const emptyStats = $('emptyStats');
  const statsArea = $('statsArea');

  if (history.length === 0) {
    emptyStats.style.display = 'block';
    statsArea.style.display = 'none';
    return;
  }

  emptyStats.style.display = 'none';
  statsArea.style.display = 'grid';

  const totalPemasukan = history.reduce((sum, item) => sum + item.pemasukan, 0);
  const totalModal = history.reduce((sum, item) => sum + item.modal, 0);
  const totalTabungan = history.reduce((sum, item) => sum + item.tabungan, 0);
  const totalJajan = history.reduce((sum, item) => sum + item.jajan, 0);
  const totalTransaksi = history.length;

  $('totalPemasukan').textContent = fmt(totalPemasukan);
  $('totalModal').textContent = fmt(totalModal);
  $('totalTabungan').textContent = fmt(totalTabungan);
  $('totalJajan').textContent = fmt(totalJajan);
  $('totalTransaksi').textContent = totalTransaksi.toLocaleString('id-ID');
}

if (document.querySelector('.nav-btn[data-page="page3"]').classList.contains('active')) {
  updateStats();
}
