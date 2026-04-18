# KampüsBul — Firebase Eksiksiz Kurulum Rehberi

Bu doküman, **KampüsBul** React Native (Expo) projesinin Firebase tarafını uçtan uca tamamlaman için adım adım talimatları içerir. Uygulama şu Firebase ürünlerini kullanır:

| Ürün | Kullanım amacı |
|------|----------------|
| **Authentication** | E-posta / şifre ile kayıt ve giriş |
| **Cloud Firestore** | Kullanıcı profilleri (`users`), ilanlar (`items`) |
| **Cloud Storage** | İlan fotoğrafları (`items/...`) |

Kendi sunucun (Node, SQL vb.) yok; backend **Firebase** üzerinden çalışır.

---

## 0. Ön koşullar

- Google hesabı
- Bu repoda `kampusbul` klasöründe projenin açık olması
- `.env` dosyasında şu anahtarların doldurulması gerektiğini bil:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

---

## 1. Firebase projesi oluşturma

1. Tarayıcıda [Firebase Console](https://console.firebase.google.com) aç.
2. **Add project** / **Proje ekle** seç.
3. Proje adını gir (ör. `kampusbul`).
4. Google Analytics’i isteğe bağlı aç veya kapat; uygulama için zorunlu değil.
5. **Create project** ile bitir.

---

## 2. Web uygulaması kaydı ve yapılandırma nesnesi

Uygulama React Native olsa da Firebase, yapılandırma için genelde **Web app** kaydı kullanılır (JS SDK ile uyumlu).

1. Proje özetinde **</>** (Web) simgesine tıkla veya **Project settings** (dişli) → **Your apps** → **Add app** → **Web**.
2. Uygulama takma adı ver (ör. `kampusbul-web`).
3. **Firebase Hosting** şimdilik işaretleme zorunlu değil; **Register app** ile devam et.
4. Ekranda görünen **firebaseConfig** nesnesindeki değerleri kopyala. Örnek yapı:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...firebaseapp.com",
  projectId: "...",
  storageBucket: "...appspot.com",
  messagingSenderId: "...",
  appId: "...",
};
```

Bu alanlar birebir `.env` ile eşleşir:

| firebaseConfig alanı | .env değişkeni |
|----------------------|----------------|
| `apiKey` | `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `EXPO_PUBLIC_FIREBASE_APP_ID` |

---

## 3. `.env` dosyasını doldurma

1. Proje kökünde `kampusbul/.env` dosyasını aç.
2. Placeholder’ları (`BURAYA_YAZ` vb.) silip Firebase’den kopyaladığın değerleri yapıştır.
3. **Tırnak kullanma** (çoğu araçta gerekmez):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=proje-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=proje-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=proje-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef
```

4. `.env` dosyasını **asla** public repoya commit etme; `.gitignore` içinde kalsın.

5. Değişiklikten sonra Metro’yu **tamamen kapatıp** yeniden başlat:

```bash
cd kampusbul
npx expo start --clear
```

`react-native-dotenv` kullanıldığı için ortam değişkenleri bundler yeniden başlamadan güncellenmeyebilir.

---

## 4. Authentication (E-posta / şifre)

1. Sol menüden **Build** → **Authentication** aç.
2. **Get started**.
3. **Sign-in method** sekmesinde **Email/Password** satırına tıkla.
4. **Enable** aç, **Save**.

Bu olmadan `createUserWithEmailAndPassword` ve `signInWithEmailAndPassword` çalışmaz.

**Not:** E-posta doğrulama veya şifre sıfırlama bu projede kodlanmış değild; sadece temel e-posta/şifre girişi vardır.

---

## 5. Cloud Firestore

### 5.1 Veritabanını oluşturma

1. **Build** → **Firestore Database**.
2. **Create database**.
3. Konum seç (ör. `europe-west1` — Türkiye’ye yakın bölgeler tercih edilebilir).
4. **Production mode** veya **Test mode** ile başlayabilirsin.  
   - **Test mode:** 30 gün geniş okuma/yazma (geliştirme için kolay).  
   - **Production mode:** Sonra kuralları mutlaka aşağıdaki gibi güncelle.

### 5.2 Koleksiyonlar (otomatik oluşur)

Kod tarafında elle koleksiyon oluşturman gerekmez; ilk kayıt/ilan ile belgeler oluşur:

| Koleksiyon | Belge ID | İçerik (özet) |
|------------|----------|----------------|
| `users` | Firebase Auth `uid` | `name`, `email`, `studentId`, `department`, `createdAt` |
| `items` | Otomatik ID | `title`, `description`, `category`, `type`, `location`, `ownerId`, `timestamp`, `isResolved`, `imageUrl`, vb. |

### 5.3 Firestore güvenlik kuralları

**Build** → **Firestore Database** → **Rules** sekmesine aşağıyı yapıştır (rehberle uyumlu):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.ownerId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

- **Herkes** ilanları okuyabilir (`read: true`).
- **Giriş yapmış** kullanıcı ilan oluşturabilir.
- **Güncelleme/silme** sadece ilan sahibi (`ownerId`).
- **Kullanıcı belgesi** sadece kendi `uid` yolu altında okunup yazılabilir.

**Publish** ile yayınla.

### 5.4 Bileşik indeksler (Composite indexes)

Uygulama şu sorguları kullanır; ilk çalıştırmada Firestore **hata linki** verebilir — linke tıklayıp indeksi oluşturabilirsin. Aşağıdakileri **Build** → **Firestore** → **Indexes** üzerinden de elle ekleyebilirsin.

**Koleksiyon:** `items`

1. **Kayıp / Bulunan filtreli liste ve canlı dinleme** (`subscribeToItems` — `LOST` veya `FOUND`):
   - Alanlar:
     - `type` — **Ascending**
     - `isResolved` — **Ascending**
     - `timestamp` — **Descending**
   - Sorgu türü: **Collection**

2. **Profil — kullanıcının ilanları** (`getUserItems`):
   - Alanlar:
     - `ownerId` — **Ascending**
     - `timestamp` — **Descending**

3. **Tüm ilanlar — son 50** (`orderBy timestamp desc`, filtre yok): Genelde tek alan indeksi yeterlidir; eksikse konsol yine link verir.

4. **İstatistik sayıları** (`getStats`): `type` + `isResolved` ile eşitlik filtreleri; indeks gerekiyorsa hata mesajındaki linki kullan.

**Pratik ipucu:** Uygulamayı çalıştır, ana sayfayı ve profili aç; kırmızı hata veya log’da **index URL** çıkarsa tıkla → **Create index** → birkaç dakika bekle.

---

## 6. Görseller (Cloudinary — Firebase Storage kullanılmıyor)

Bu projede ilan fotoğrafları **Firebase Storage’a değil**, **Cloudinary** REST API (unsigned upload preset) ile yüklenir. Firebase konsolunda **Storage** açmana gerek yok.

Kurulum adımları için projedeki **`CLOUDINARY_KURULUM.md`** dosyasına bak. `.env` içinde `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` ve `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` tanımlanmalıdır.

### 6.1 (İsteğe bağlı) Expo — galeri izni

Fotoğraf seçimi için `app.json` içinde `expo-image-picker` eklentisi eklenebilir (Expo dokümantasyonu ile uyumlu):

```json
{
  "expo": {
    "plugins": [
      "expo-font",
      "@react-native-community/datetimepicker",
      [
        "expo-image-picker",
        {
          "photosPermission": "Eşya fotoğrafı seçmek için galeri izni gerekli."
        }
      ]
    ]
  }
}
```

Değişiklikten sonra native özellikler için gerekirse `npx expo prebuild` veya EAS build senaryosu geçerli olur; Expo Go’da çoğu zaman mevcut izin akışı yeterlidir.

---

## 7. Kontrol listesi (hepsi tamam mı?)

- [ ] Firebase projesi oluşturuldu.
- [ ] Web app kaydı yapıldı, `firebaseConfig` alındı.
- [ ] `kampusbul/.env` altı alan **gerçek değerlerle** dolduruldu (Firebase + Cloudinary `EXPO_PUBLIC_*`).
- [ ] Authentication → **Email/Password** etkin.
- [ ] Firestore oluşturuldu ve **Rules** yayınlandı.
- [ ] **Cloudinary** unsigned preset ve `.env` değişkenleri (`CLOUDINARY_KURULUM.md`).
- [ ] Gerekli **Firestore indeksleri** oluşturuldu (konsol linki veya elle).
- [ ] Metro `npx expo start --clear` ile yeniden başlatıldı.

---

## 8. Beklenen davranış (test)

1. Uygulamada **Kayıt ol** → başarılı olunca otomatik giriş ve ana ekran.
2. **İlan ekle** → Firestore’da `items` altında yeni belge; fotoğraf varsa `imageUrl` Cloudinary adresi olmalı.
3. **Profil** → Firestore’da `users/{uid}` belgesi.

Firebase Console’da **Authentication** → Users listesinde kullanıcı görünmeli.

---

## 9. Sık sorunlar

| Belirti | Olası neden |
|---------|-------------|
| `Bir hata oluştu.` / genel hata | `.env` boş veya yanlış; Metro cache |
| `auth/invalid-api-key` | API key yanlış kopyalandı |
| `permission-denied` (Firestore) | Kurallar yanlış veya yayınlanmadı |
| İlan listesi boş / hata | İndeks eksik — konsoldaki index linkine tıkla |
| Kayıt olurken hata, Auth’ta kullanıcı yok | E-posta/şifre yöntemi kapalı |
| Kayıt olurken Auth’ta kullanıcı var ama uygulama hata veriyor | `setDoc(users)` Firestore kuralları veya ağ |

---

## 10. Üretim öncesi güvenlik notları

- Firestore **test mode** ile kalırsa süre dolunca veya herkese açık kurallar risk oluşturur; yukarıdaki kurallara geç.
- API anahtarı istemcide görünür; güvenlik **kurallar** ve **Auth** ile sağlanır.
- İleride **App Check**, rate limiting ve admin SDK ile sunucu tarafı doğrulama düşünülebilir.

---

## 11. İlgili proje dosyaları

| Dosya | Açıklama |
|-------|----------|
| `kampusbul/.env` | Firebase + Cloudinary yapılandırması (gizli) |
| `kampusbul/babel.config.js` | `@env` ile `.env` okuma |
| `kampusbul/src/firebase/config.js` | Firebase başlatma, Auth persistence |
| `kampusbul/src/firebase/auth.js` | Kayıt, giriş, `users` yazımı |
| `kampusbul/src/firebase/firestore.js` | `items` sorguları |
| `kampusbul/src/firebase/storage.js` | Cloudinary ile fotoğraf yükleme |

Bu adımlar tamamlandığında Firebase tarafı KampüsBul uygulaması için **eksiksiz** sayılır.
