# 🐛 ZKLogin Debug Guide

## ✅ Son Güncelleme - Secret Key Sorunu Düzeltildi!

**Sorun**: "Wrong secretKey size. Expected 32 bytes, got 70."
**Neden**: `keypair.getSecretKey()` 64 byte döndürüyordu, ama Ed25519 32 byte bekliyor
**Çözüm**: `keypair.export().privateKey` kullanıldı (doğru 32-byte base64 format)

### 🔧 Yapılan Değişiklikler:
- ✅ `keypair.getSecretKey()` → `keypair.export().privateKey` değiştirildi
- ✅ Base64 string formatı doğru kullanılıyor
- ✅ `fromSecretKey()` doğrudan base64 string kabul ediyor

## 🚀 Şimdi Ne Yapmalısın:

### 1. Cache'i Temizle (ÖNEMLİ!)
Eski hatalı veriler hala localStorage'da olabilir. Temizlemek için:

**Yöntem 1 - Console Script (Önerilen):**
1. Browser console'u aç (F12)
2. `clear-zklogin-cache.js` dosyasının içeriğini kopyala
3. Console'a yapıştır ve Enter'a bas

**Yöntem 2 - Manuel:**
Console'da şunu çalıştır:
```javascript
localStorage.removeItem('zklogin_session');
sessionStorage.removeItem('zklogin_ephemeral');
console.log('✅ Cache temizlendi!');
```

### 2. Sayfayı Hard Refresh Yap
- Windows/Linux: **Ctrl + F5** veya **Ctrl + Shift + R**
- Mac: **Cmd + Shift + R**

### 3. Tekrar Dene
- "Login with Google" butonuna tıkla
- Console loglarını izle
- Artık çalışacak! 🎉

## Sorun Giderildi! ✅

Aşağıdaki sorunlar düzeltildi:
- ✅ Buffer kullanımı kaldırıldı (tarayıcıda çalışmıyordu)
- ✅ Ephemeral key serialization düzeltildi
- ✅ Console logları eklendi
- ✅ Error handling iyileştirildi

## Test Etmek İçin:

1. **Tarayıcıyı aç ve console'u aç** (F12 veya Sağ tık > Inspect > Console)

2. **"Login with Google" butonuna tıkla**

3. **Console'da şunları göreceksin:**
   ```
   [ZKLogin] loginWithGoogle called
   [ZKLogin] Google Client ID found: ...
   [ZKLogin] Ephemeral keypair generated
   [ZKLogin] Ephemeral data generated: ...
   [ZKLogin] Nonce generated: ...
   [ZKLogin] Ephemeral data stored in sessionStorage
   [ZKLogin] Redirecting to: https://accounts.google.com/...
   ```

4. **Google OAuth'tan sonra `/auth/callback` sayfasına yönleneceksin**

5. **Console'da şunları göreceksin:**
   ```
   [AuthCallback] Starting OAuth callback processing...
   [AuthCallback] ID Token extracted: YES
   [AuthCallback] Calling handleCallback...
   [ZKLogin] handleCallback called
   [ZKLogin] Ephemeral data from session: FOUND
   [ZKLogin] Ephemeral data parsed: ...
   [ZKLogin] Keypair recreated successfully
   [ZKLogin] JWT decoded: ...
   [ZKLogin] Generating salt for user: ...
   [ZKLogin] Salt generated: ...
   [ZKLogin] Deriving ZK address...
   [ZKLogin] ZK Address derived: 0x...
   [ZKLogin] Account object created: ...
   [ZKLogin] Session saved to localStorage
   [ZKLogin] Ephemeral data cleared from sessionStorage
   [AuthCallback] Success! Redirecting to passport...
   ```

6. **Passport sayfasına yönleneceksin ve navbar'da profil bilgilerin görünecek**

## Hata Mesajlarını Kontrol Et:

Eğer bir hata olursa, console'da şunları arayın:
- `[ZKLogin] Callback error:` - ZKLogin context hatası
- `[AuthCallback] OAuth callback error:` - Callback sayfası hatası
- Kırmızı error mesajları

## localStorage'ı Kontrol Et:

Console'da şunu çalıştır:
```javascript
// ZKLogin session'ını gör
JSON.parse(localStorage.getItem('zklogin_session'))

// sessionStorage'ı kontrol et (login sırasında)
JSON.parse(sessionStorage.getItem('zklogin_ephemeral'))
```

## Eğer Hala Çalışmıyorsa:

1. **Cache'i temizle:**
   ```javascript
   // Console'da çalıştır
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Sayfayı yenile** (Ctrl+F5)

3. **Tekrar dene**

## Bilinen Sorunlar:

- ❌ Eğer OAuth redirect sırasında sessionStorage silinirse, "No ephemeral data found" hatası alırsın
  - **Çözüm**: localStorage'ı temizle ve tekrar dene

- ❌ JWT token geçersizse, "Invalid JWT token" hatası alırsın
  - **Çözüm**: Google OAuth'u tekrar dene

- ❌ Salt generation hata verirse
  - **Çözüm**: Console'da hatayı kontrol et

## Başarılı Login Sonrası:

Navbar'da şunları göreceksin:
- ✅ Profil resmin
- ✅ Wallet adresin (0x1234...5678 formatında)
- ✅ Email adresin
- ✅ Logout butonu

---

**Şimdi dene ve console loglarını gözlemle! 🚀**
