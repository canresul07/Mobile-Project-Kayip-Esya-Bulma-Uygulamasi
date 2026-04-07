# `API key not valid` / 400 — Google Cloud tarafı (KampüsBul)

Kod ve `.env` doğru olsa bile Google bazen **`API_KEY_INVALID`** döner. Sebep neredeyse her zaman **aynı Firebase projesine bağlı API anahtarının Google Cloud’da kısıtlanması** veya **Identity Toolkit API**’nin kapalı olmasıdır.

## 1. Identity Toolkit API açık mı?

1. [Google Cloud Console](https://console.cloud.google.com) → üstte **proje seç** (Firebase ile **aynı** proje, örn. `kampusbul`).
2. **APIs & Services** → **Library**.
3. Arama: **Identity Toolkit API** → **Enable**.

(Firebase Authentication bu API’yi kullanır.)

## 2. API anahtarı kısıtları (en sık neden)

1. **APIs & Services** → **Credentials**.
2. Listede **API keys** bölümünde, Firebase Console’daki **Web uygulaması `apiKey`** ile **aynı** anahtarı bul  
   (tamamını göremezsin; **Show key** veya Firebase’den kopyalayıp ilk karakterlerle eşleştir).
3. Anahtara tıkla:

### Application restrictions (Uygulama kısıtları)

- Geliştirme için geçici: **None** seç → **Save** → 1–2 dk bekle → uygulamada tekrar kayıt dene.
- Sonra güvenlik için: **HTTP referrers (web sitesi)** seç ve şunları ekle:
  - `http://localhost:*/*`
  - `http://127.0.0.1:*/*`
  - Expo web farklı port kullanıyorsa: `http://localhost:8081/*` vb.

**Not:** Sadece **Android uygulamaları** veya **iOS** ile kısıtlı anahtar, **tarayıcıdan** Identity Toolkit’e istek atamaz → 400 / geçersiz anahtar.

### API restrictions (API kısıtları)

- Test için: **Don’t restrict key** → **Save**.
- Kısıtlamak istersen: **Restrict key** → listeden en azından:
  - **Identity Toolkit API**
  - (Gerekirse) **Token Service API**, **Firebase Installations API**

Kaydet, birkaç dakika bekle, tekrar dene.

## 3. Firebase’de yetkili alanlar (web)

**Firebase Console** → **Authentication** → **Settings** → **Authorized domains**:

- `localhost` ve `127.0.0.1` genelde varsayılıdır; yoksa **Add domain** ile ekle.

## 4. Anahtarın doğru projeden olduğundan emin ol

**Firebase Console** → Project **Settings** (dişli) → **Your apps** → **Web** uygulaması → `firebaseConfig` içindeki **`apiKey`** ile `.env` içindeki `FIREBASE_API_KEY` / `EXPO_PUBLIC_FIREBASE_API_KEY` **aynı** olmalı (kopyala-yapıştır, tek harf bile fark etmesin).

---

Bu adımlardan sonra `npx expo start --clear` ile yeniden başlat; tarayıcıda **Ctrl+Shift+R** ile önbelleği temizle.
