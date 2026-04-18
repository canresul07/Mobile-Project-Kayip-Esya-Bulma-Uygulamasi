# 🚀 Detaylı KampüsBul Kurulum Kılavuzu

Bu kılavuz, KampüsBul projesini sıfırdan kurmak isteyen geliştiriciler için her adımı görsel/metinsel olarak açıklar.

## 1. Başlangıç ve Çevresel Değişkenler
Projenin çalışması için `.env` dosyasına ihtiyacı vardır.
1. Ana dizindeki `.env.example` dosyasını kopyalayın ve adını `.env` yapın.
2. Aşağıdaki servisleri kurdukça bu dosyayı doldurun.

---

## 2. Firebase Kurulumu (Veritabanı ve Auth)
Firebase, uygulamanın beynidir. Ücretsiz ("Spark") planı yeterlidir.

1. **Proje Oluşturma:** [Firebase Console](https://console.firebase.google.com/)'a gidin. **"Add Project"** diyerek projenizi oluşturun.
2. **Authentication Aktif Etme:**
    - Sol menüden **Build > Authentication**'a gidin.
    - **"Get Started"** butonuna basın.
    - **"Sign-in method"** sekmesinden **"Email/Password"** seçeneğini bulun ve "Enable" yaparak kaydedin.
    - (İsteğe bağlı) **Settings > Authorized domains** kısmına `localhost` ve `127.0.0.1`'in ekli olduğundan emin olun.
3. **Firestore Database Aktif Etme:**
    - Sol menüden **Build > Firestore Database**'e gidin.
    - **"Create database"** butonuna basın.
    - Konum seçin ve **"Start in test mode"** (veya kuralları `allow read, write: if true;` yapacak şekilde) başlatın.
4. **API Anahtarlarını Almak:**
    - Sol üstteki **Project Settings (Dişli çark) > General** sekmesine gidin.
    - **"Your apps"** bölümünden **Web (</>)** ikonuna tıklayın.
    - Uygulamanıza bir isim verin.
    - Ekrana gelen `firebaseConfig` objesi içindeki değerleri `.env` dosyanızdaki karşılıklarına kopyalayın.

---

## 3. Cloudinary Kurulumu (Görsel Yükleme)
Uygulamada eşya fotoğraflarını saklamak için kullanılır.

1. [Cloudinary](https://cloudinary.com/signup) üzerinden ücretsiz bir hesap açın.
2. **Cloud Name:** Dashboard ekranındaki "Cloud Name" bilgisini kopyalayıp `.env` dosyasına yazın.
3. **Unsigned Upload Preset Oluşturma (KRİTİK):**
    - Sağ üstteki **Settings (Dişli ikon)** butonuna tıklayın.
    - Sol menüden **Upload** sekmesine tıklayın.
    - Sayfayı aşağı kaydırıp **"Upload presets"** bölümünü bulun.
    - **"Add upload preset"** butonuna basın.
    - Çıkan ekranda **"Signing Mode"** değerini mutlaka **"Unsigned"** olarak değiştirin. (Varsayılan olarak "Signed" gelir ve bu durumda yükleme hatası alırsınız).
    - Oluşturduğunuz preset'e bir isim verin (veya varsayılanı kullanın) ve bu ismi `.env` dosyasındaki `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` alanına yazın.
    - Kaydetmeyi unutmayın.

---

## 4. Google Cloud Console (Hata Gidermeleri)
Giriş yaparken `API key not valid` hatası alıyorsanız oradaki API anahtarının yetkilerini açmanız gerekir.

1. [Google Cloud Console](https://console.cloud.google.com/)'a Firebase ile aynı hesapla giriş yapın ve projenizi seçin.
2. **Identity Toolkit API Etkinleştirme:**
    - Üstteki arama çubuğuna **"Identity Toolkit API"** yazın.
    - Çıkan sonuca girin ve **"Enable"** (Etkinleştir) deyin. (Genelde kapalı geldiği için Firebase Auth hata verir).
3. **API Anahtarı Kısıtlamaları:**
    - **APIs & Services > Credentials** sekmesine gidin.
    - Firebase tarafından oluşturulmuş olan API anahtarınıza tıklayın.
    - **"API restrictions"** bölümünde ya "Don't restrict key" seçili olsun ya da kısıtlayacaksanız yukarıdaki "Identity Toolkit"i listeye ekleyin.

---

## 5. Uygulamayı Çalıştırma
Terminale dönün ve şu komutları sırayla çalıştırın:

```bash
# Bağımlılıkları kurun
npm install

# Önbelleği temizleyerek projeyi başlatın
npx expo start -c
```

Telefonunuzda **Expo Go** uygulaması yüklü ise terminaldeki QR kodu okutarak uygulamayı anında test edebilirsiniz.
