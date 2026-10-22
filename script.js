let saldo = 1000;
let sedangSpin = false;
let totalSpin = 0;
let totalHadiah = 0;
let bonusDiklaim = false;
let suaraAktif = false;
let riwayat = [];

const simbol = ["🍒", "🍋", "🍇", "⭐", "💎", "🔔"];

const saldoText = document.getElementById("saldo");
const hasilText = document.getElementById("hasil");
const pesanText = document.getElementById("pesan");
const spinButton = document.getElementById("spin");
const spinLabel = document.getElementById("spinLabel");
const bonusButton = document.getElementById("bonus");
const giftButton = document.getElementById("gift");
const totalSpinText = document.getElementById("totalSpin");
const totalHadiahText = document.getElementById("totalHadiah");
const historyBox = document.getElementById("history");
const historyCount = document.getElementById("historyCount");
const toast = document.getElementById("toast");
const soundButton = document.getElementById("soundBtn");

let toastTimer;
let audioContext;

function formatAngka(angka) {
  return angka.toLocaleString("id-ID");
}

function updateUI() {
  saldoText.textContent = formatAngka(saldo);
  totalSpinText.textContent = formatAngka(totalSpin);
  totalHadiahText.textContent = formatAngka(totalHadiah);

  document.getElementById("progressSpin").style.width =
    Math.min(totalSpin / 1 * 100, 100) + "%";

  document.getElementById("progressCoin").style.width =
    Math.min(saldo / 2000 * 100, 100) + "%";

  document.getElementById("progressTen").style.width =
    Math.min(totalSpin / 10 * 100, 100) + "%";

  spinButton.disabled = sedangSpin || saldo < 50;
  bonusButton.disabled = bonusDiklaim || sedangSpin;
  giftButton.disabled = bonusDiklaim || sedangSpin;

  if (bonusDiklaim) {
    bonusButton.textContent = "✓ BONUS SUDAH DIKLAIM";
    giftButton.textContent = "BONUS SUDAH DIKLAIM";
  } else {
    bonusButton.textContent = "🎁 KLAIM BONUS +500 KOIN";
    giftButton.textContent = "CLAIM GIFT +500";
  }

  renderHistory();
}

function renderHistory() {
  historyCount.textContent = riwayat.length + " / 5";

  if (riwayat.length === 0) {
    historyBox.innerHTML =
      '<p class="empty-history">Belum ada permainan.</p>';
    return;
  }

  historyBox.innerHTML = riwayat.map(item => `
    <div class="history-item">
      <span class="history-symbols">${item.simbol}</span>
      <span class="history-result">
        <strong>${item.hadiah > 0 ? "+" : ""}${item.hadiah} COINS</strong>
        ${item.label}
      </span>
    </div>
  `).join("");
}

function tampilkanToast(teks) {
  clearTimeout(toastTimer);
  toast.textContent = teks;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function bunyi(frekuensi = 440, durasi = 0.08) {
  if (!suaraAktif) return;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;

    if (!AudioCtx) return;

    if (!audioContext) audioContext = new AudioCtx();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frekuensi;
    gain.gain.value = 0.035;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + durasi
    );

    oscillator.stop(audioContext.currentTime + durasi);
  } catch (error) {
    console.log("Audio tidak tersedia.");
  }
}

function klaimBonus() {
  if (sedangSpin || bonusDiklaim) return;

  bonusDiklaim = true;
  saldo += 500;

  updateUI();
  bunyi(660, 0.2);
  tampilkanToast("Bonus +500 koin virtual berhasil diklaim!");

  pesanText.textContent = "Bonus virtual berhasil ditambahkan!";
}

function putarSpin() {
  if (sedangSpin) return;

  if (saldo < 50) {
    tampilkanToast("Koin virtual tidak cukup!");
    pesanText.textContent = "Klaim bonus virtual untuk menambah saldo.";
    return;
  }

  sedangSpin = true;
  saldo -= 50;
  totalSpin++;

  spinLabel.textContent = "SPINNING...";
  hasilText.classList.add("spinning");

  pesanText.textContent = "Simulasi sedang berjalan...";
  updateUI();
  bunyi(300, 0.1);

  let putaran = 0;

  const animasi = setInterval(() => {
    const simbolAcak = Array.from(
      { length: 3 },
      () => simbol[Math.floor(Math.random() * simbol.length)]
    );

    hasilText.innerHTML = simbolAcak
      .map(s => `<span>${s}</span>`)
      .join("");

    putaran++;
    bunyi(250 + putaran * 20, 0.035);

    if (putaran >= 15) {
      clearInterval(animasi);

      const hasil = Array.from(
        { length: 3 },
        () => simbol[Math.floor(Math.random() * simbol.length)]
      );

      let hadiah = 0;
      let label = "Tidak cocok";

      if (hasil[0] === hasil[1] && hasil[1] === hasil[2]) {
        hadiah = 200;
        label = "TRIPLE MATCH!";
      } else if (
        hasil[0] === hasil[1] ||
        hasil[1] === hasil[2] ||
        hasil[0] === hasil[2]
      ) {
        hadiah = 75;
        label = "DOUBLE MATCH";
      }

      saldo += hadiah;
      totalHadiah += hadiah;

      hasilText.innerHTML = hasil
        .map(s => `<span>${s}</span>`)
        .join("");

      hasilText.classList.remove("spinning");

      if (hadiah === 200) {
        pesanText.textContent = "✨ TRIPLE MATCH! +200 KOIN VIRTUAL";
        bunyi(880, 0.3);
        tampilkanToast("✨ Triple Match! +200 koin virtual");
      } else if (hadiah === 75) {
        pesanText.textContent = "⭐ DOUBLE MATCH! +75 KOIN VIRTUAL";
        bunyi(620, 0.2);
        tampilkanToast("Double Match! +75 koin virtual");
      } else {
        pesanText.textContent = "Belum cocok. Ini hanya simulasi!";
        bunyi(200, 0.1);
      }

      riwayat.unshift({
        simbol: hasil.join(" "),
        hadiah: hadiah,
        label: label
      });

      riwayat = riwayat.slice(0, 5);

      sedangSpin = false;
      spinLabel.textContent = "SPIN NOW";

      updateUI();
    }
  }, 100);
}

spinButton.addEventListener("click", putarSpin);
bonusButton.addEventListener("click", klaimBonus);
giftButton.addEventListener("click", klaimBonus);

soundButton.addEventListener("click", function () {
  suaraAktif = !suaraAktif;

  soundButton.textContent = suaraAktif ? "🔊 SOUND" : "🔇 SOUND";

  if (suaraAktif) {
    bunyi(600, 0.12);
    tampilkanToast("Efek suara diaktifkan!");
  } else {
    tampilkanToast("Efek suara dimatikan.");
  }
});

updateUI();