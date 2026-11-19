# 🛡️ SecurePass — 100% Offline Mobil Parollar Menejeri va 2FA Authenticator

> **MUHIM MAXFIYLIK KAFOLATI:**  
> Ushbu ilova **faqat va faqat telefoningizning ichki xotirasiga** tayanadi.  
> Unda tashqi server, cloud-sinxronizatsiya, telemetriya yoki tahliliy kuzatuv umuman yo'q.  
> `android.permission.INTERNET` ruxsati qat'iyan bloklangan — ilova hatto samolyot rejimida (offline) to'liq ishlaydi.

---

## 🌟 To'liq Imkoniyatlar:

### 1. 🌐 Ko'p Tillilik (Multi-Language):
* 🇺🇿 **O'zbekcha** (To'liq ona tilimizda)
* 🇷🇺 **Русский** (Полная русская локализация)
* 🇬🇧 **English** (Full international English support)
* *Ilova tili bir bosishda Sozlamalar yoki birinchi kirish ekranida o'zgartiriladi.*

### 2. 🎨 Zamonaviy Mavzular (Themes):
* 🌑 **Dark Slate** (Klassik qulay tungi interfeys)
* ⬛ **OLED Pure Black** (Haqiqiy chuqur qora rang — AMOLED ekranlarda batareyani maksimal darajada tejaydi)
* 🌌 **Midnight Navy** (Hashamatli to'q ko'k ranglar palitrasi)

### 3. 🔢 2FA / TOTP Authenticator (Google Authenticator O'rniga — 100% Offline):
* Xalqaro **RFC 6238** standarti asosida ishlaydi (Google, Telegram, Binance, Steam, Instagram, GitHub bilan 100% bir xil).
* Har 30 soniyada o'zgaruvchi 6 xonali kod va jonli doira taymeri.

### 4. 🛡️ Yo'qolmas Xotira (Data Loss Prevention):
* 🗑️ **Chiqindi Qutisi (Trash):** O'chirilgan yozuvlar yo'qolmaydi, bitta tugma bilan qayta tiklanadi.
* 🕒 **Avto-Tiklash Nuqtalari (Snapshots):** Oxirgi 15 ta o'zgarish holatiga orqaga qaytish (Rollback ⏪) imkoniyati.
* 🔑 **Favqulodda Tiklash Kaliti:** Master parol unutilsa ham, 24 belgili maxsus kalit orqali barcha parollarni 100% qayta tiklash.
* 🛑 **Xavfsiz Tozalash:** Tasodifan o'chib ketishini oldini oluvchi tasdiq so'zi.

### 5. 📄 .TXT va .JSON Eksport:
* Barcha parollarni bir bosishda tushunarli `.txt` fayli sifatida yuklab olish.
* Shifrlangan `.json` zaxira nusxasi.

---

## 📱 Qanday Sinab Ko'rish Mumkin?

### 1-Usul: Hoziroq Brauzerda Ochish (O'rnatishsiz)
Papkadagi **`index.html`** faylini ikki marta bosing va oching.
- Unda smartfon qobig'ida 3 ta til, 3 ta rangli mavzu, 2FA kodi va barcha himoya funksiyalari to'liq ishlaydi.

---

## 📦 Eng Oxirgi Qadam: Android APK Chiqarish (Build APK)

Loyihada **EAS Build** va **Android konfiguratsiyasi** to'liq sozlangan (`eas.json` va `app.json`).

### 1-Yo'l: EAS Cloud orqali APK yaratish (Eng osoni)
Terminalda quyidagi buyruqni bering:
```bash
# EAS CLI o'rnatish (agar o'rnatilmagan bo'lsa)
npm install -g eas-cli

# APK yig'ish buyrug'i
npm run build:apk:cloud
```
*Tizim avtomatik ravishda tayyor `.apk` faylini yig'ib, telefoningizga yuklab olish havolasini beradi.*

### 2-Yo'l: Kompyuteringizning o'zida lokal APK yig'ish (Android SDK bilan)
```bash
npm run build:apk
```

### 3-Yo'l: Expo Go orqali telefonda darhol sinash
```bash
npm install
npx expo start
```
Telefoningizdagi **Expo Go** ilovasi orqali QR-kodni skaner qiling.
