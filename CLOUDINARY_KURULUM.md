# KampüsBul — Cloudinary (görsel yükleme) kurulumu

İlan fotoğrafları **Firebase Storage yerine Cloudinary** üzerinden yüklenir (unsigned upload preset).

## 1. Hesap ve Cloud name

1. [Cloudinary](https://cloudinary.com) ile giriş yap veya kayıt ol.
2. Dashboard’da **Account Details** veya üst bölümde **Cloud name** değerini kopyala (küçük harf, örn. `dxxxxx`).

## 2. Unsigned upload preset

1. **Settings** (dişli) → **Upload** sekmesi (veya **Media Library** → **Upload** ayarları).
2. **Upload presets** bölümünde **Add upload preset**.
3. **Signing mode:** **Unsigned** seç (istemci tarafından doğrudan yükleme için).
4. İsteğe bağlı: **Folder** (örn. `kampusbul/items`) veya **Use filename** ayarları.
5. Preseti **Save** et ve **preset adını** not al (örn. `kampusbul_unsigned`).

> **Güvenlik:** Unsigned preset herkesin yüklemesine izin verir; üretimde [upload restrictions](https://cloudinary.com/documentation/upload_presets) (format, boyut) ve klasör sınırları önerilir.

## 3. `.env` değişkenleri

`kampusbul/.env` içine (Firebase satırlarının altına) ekle:

```env
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=buraya_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=buraya_preset_adi
```

Metro’yu yeniden başlat: `npx expo start --clear`

## 4. Doğrulama

- Uygulamada **İlan ekle** → fotoğraf seç → yayınla.
- Cloudinary **Media Library**’de görsel görünmeli; Firestore `items` belgesinde `imageUrl` alanı Cloudinary `https://res.cloudinary.com/...` adresi olmalı.

## 5. Sorun giderme

| Sorun | Çözüm |
|--------|--------|
| `Cloudinary yapılandırması eksik` | `.env` dolu mu, `EXPO_PUBLIC_` önekleri doğru mu |
| `Invalid preset` / 400 | Preset adı ve **Unsigned** modu kontrol et |
| Yükleme 401/403 | Cloud name veya preset yanlış |

Kod: `src/firebase/storage.js` → `uploadImageToCloudinary`
