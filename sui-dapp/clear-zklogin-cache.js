// ZKLogin Cache Temizleme Script
// Bu scripti browser console'da çalıştırın

console.log('🧹 ZKLogin cache temizleniyor...');

// localStorage'dan zklogin_session'ı sil
const zkSession = localStorage.getItem('zklogin_session');
if (zkSession) {
  localStorage.removeItem('zklogin_session');
  console.log('✅ localStorage zklogin_session silindi');
} else {
  console.log('ℹ️ localStorage zklogin_session bulunamadı');
}

// sessionStorage'dan zklogin_ephemeral'ı sil
const zkEphemeral = sessionStorage.getItem('zklogin_ephemeral');
if (zkEphemeral) {
  sessionStorage.removeItem('zklogin_ephemeral');
  console.log('✅ sessionStorage zklogin_ephemeral silindi');
} else {
  console.log('ℹ️ sessionStorage zklogin_ephemeral bulunamadı');
}

console.log('✨ Cache temizlendi! Şimdi sayfayı yenile ve tekrar dene.');
console.log('👉 Ctrl+F5 veya Cmd+Shift+R ile hard refresh yap');
