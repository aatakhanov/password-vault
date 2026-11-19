export type SupportedLanguage = 'uz' | 'ru' | 'en';
export type AppTheme = 'slate' | 'oled' | 'navy';

export interface Translations {
  appName: string;
  offlineBadge: string;
  copied: string;
  saved: string;
  deleted: string;
  restored: string;
  error: string;
  confirm: string;
  cancel: string;
  back: string;
  save: string;
  edit: string;
  delete: string;
  searchPlaceholder: string;
  
  // Tabs
  tabVault: string;
  tabGenerator: string;
  tabSettings: string;

  // Categories
  catAll: string;
  catSites: string;
  catCards: string;
  catWifi: string;
  catDocs: string;
  catNotes: string;

  // Setup & Unlock
  setupTitle: string;
  setupSubtitle: string;
  masterPasswordLabel: string;
  confirmPasswordLabel: string;
  setupBtn: string;
  unlockTitle: string;
  unlockSubtitle: string;
  unlockBtn: string;
  forgotPasswordLink: string;
  lockoutMsg: string;

  // Recovery Key
  recoveryTitle: string;
  recoverySubtitle: string;
  recoveryDisplayLabel: string;
  recoveryCopyBtn: string;
  recoveryDownloadBtn: string;
  recoveryEnterBtn: string;
  recoveryPromptTitle: string;
  recoveryPromptSubtitle: string;
  recoveryKeyInputLabel: string;
  newPasswordLabel: string;
  recoverySubmitBtn: string;

  // Vault Screen
  myPasswords: string;
  emptyTitle: string;
  emptySubtitle: string;
  txtExportBtn: string;
  trashBtn: string;
  auditBannerTitle: string;

  // Generator
  genTitle: string;
  genSubtitle: string;
  modeRandom: string;
  modePassphrase: string;
  modePin: string;
  genLength: string;
  genUpper: string;
  genLower: string;
  genNum: string;
  genSym: string;
  genWordsCount: string;
  genPinLength: string;
  genRefresh: string;
  genCopy: string;
  genSaveToVault: string;

  // 2FA / TOTP
  totpBadge: string;
  totpWidgetTitle: string;
  totpCopyBtn: string;
  totpSecretLabel: string;
  totpSecretHelper: string;

  // Item Details & Create
  createTitle: string;
  editTitle: string;
  titleLabel: string;
  loginLabel: string;
  passwordLabel: string;
  urlLabel: string;
  cardNumberLabel: string;
  expiryLabel: string;
  cvvLabel: string;
  cardHolderLabel: string;
  wifiSsidLabel: string;
  wifiPasswordLabel: string;
  docNumberLabel: string;
  docTypeLabel: string;
  notesLabel: string;
  historyLabel: string;

  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  languageSelectTitle: string;
  themeSelectTitle: string;
  snapshotsTitle: string;
  snapshotsDesc: string;
  rollbackBtn: string;
  txtExportTitle: string;
  txtExportDesc: string;
  backupBtn: string;
  lockNowBtn: string;
  dangerZoneTitle: string;
  wipeBtn: string;
  wipeConfirmPrompt: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  uz: {
    appName: 'SecurePass',
    offlineBadge: '100% OFFLINE',
    copied: 'Nusxalandi!',
    saved: 'Saqlandi!',
    deleted: 'Chiqindi qutisiga ko\'chirildi!',
    restored: 'Omborga qaytarildi!',
    error: 'Xatolik yuz berdi',
    confirm: 'Tasdiqlash',
    cancel: 'Bekor qilish',
    back: 'Orqaga',
    save: 'Saqlash',
    edit: 'Tahrirlash',
    delete: 'O\'chirish',
    searchPlaceholder: '🔍 Qidiruv (nom, login, sayt)...',
    
    tabVault: 'Ombor',
    tabGenerator: 'Generator',
    tabSettings: 'Sozlamalar',

    catAll: 'Barchasi',
    catSites: '🌐 Saytlar',
    catCards: '💳 Kartalar',
    catWifi: '📶 Wi-Fi',
    catDocs: '🪪 Hujjatlar',
    catNotes: '📝 Eslatmalar',

    setupTitle: 'Master Parol O\'rnating',
    setupSubtitle: 'Barcha ma\'lumotlar faqat telefoningiz xotirasida AES-256 bilan shifrlanadi',
    masterPasswordLabel: 'Master Parol (kamida 8 ta belgi)',
    confirmPasswordLabel: 'Parolni Qayta Kiriting',
    setupBtn: '🚀 Omborni Faollashtirish',
    unlockTitle: 'SecurePass Qulflangan',
    unlockSubtitle: 'Omborga kirish uchun master parolni tering',
    unlockBtn: '🔓 Qulfdan Chiqarish',
    forgotPasswordLink: 'Parolni unutdingizmi? Favqulodda kalit bilan ochish',
    lockoutMsg: 'Xavfsizlik: 3 marta noto\'g\'ri terildi. Iltimos kuting: ',

    recoveryTitle: 'Favqulodda Tiklash Kaliti',
    recoverySubtitle: 'Agar master parolni unutsangiz, bu kalit orqali barcha parollarni 100% tiklay olasiz!',
    recoveryDisplayLabel: 'Sizning Favqulodda Kalitingiz:',
    recoveryCopyBtn: '📋 Kalitni Nusxalash',
    recoveryDownloadBtn: '📥 Tiklash Kitobini Yuklab Olish (.txt)',
    recoveryEnterBtn: '✅ Saqlab oldim, Ilovaga Kirish',
    recoveryPromptTitle: 'Parolni Qayta Tiklash',
    recoveryPromptSubtitle: 'Favqulodda kalitni kiriting va yangi master parol o\'rnating',
    recoveryKeyInputLabel: 'Favqulodda Tiklash Kaliti',
    newPasswordLabel: 'Yangi Master Parol',
    recoverySubmitBtn: '🔑 Qayta Tiklash va Kirish',

    myPasswords: 'Mening Parollarim',
    emptyTitle: 'Hozircha yozuvlar yo\'q',
    emptySubtitle: 'Yangi parol yoki bank kartasi qo\'shish uchun pastdagi "+" tugmasini bosing.',
    txtExportBtn: '📄 TXT Olish',
    trashBtn: '🗑️ Chiqindi',
    auditBannerTitle: '🛡️ Parollar Xavfsizlik Auditi',

    genTitle: 'Parol Generatori',
    genSubtitle: 'Xavfsiz tasodifiy parollar, so\'zlar va PIN-kodlar',
    modeRandom: '🔠 Murakkab',
    modePassphrase: '💬 So\'zli (Passphrase)',
    modePin: '🔢 PIN-kod',
    genLength: 'Uzunlik',
    genUpper: 'Katta harflar (A-Z)',
    genLower: 'Kichik harflar (a-z)',
    genNum: 'Raqamlar (0-9)',
    genSym: 'Maxsus belgilar (!@#$%^&*)',
    genWordsCount: 'So\'zlar soni',
    genPinLength: 'PIN Uzunligi',
    genRefresh: '🔄 Yangilash',
    genCopy: '📋 Nusxalash',
    genSaveToVault: '💾 Omborga Saqlash',

    totpBadge: '2FA',
    totpWidgetTitle: '🔢 2FA KODI (AUTHENTICATOR)',
    totpCopyBtn: '📋 2FA Kodini Nusxalash',
    totpSecretLabel: '🔢 2FA Maxfiy Kaliti (TOTP Secret - Ixtiyoriy)',
    totpSecretHelper: 'Google Authenticator o\'rniga shu yerga 2FA kalitini qo\'ysangiz, ilova o\'zi har 30 soniyada kodlarni hisoblab beradi.',

    createTitle: 'Yangi Yozuv Qo\'shish',
    editTitle: 'Yozuvni Tahrirlash',
    titleLabel: 'Nomi *',
    loginLabel: 'Login / Email',
    passwordLabel: 'Parol',
    urlLabel: 'Sayt URL',
    cardNumberLabel: 'Karta Raqami',
    expiryLabel: 'Muddati (MM/YY)',
    cvvLabel: 'CVV / CVC',
    cardHolderLabel: 'Karta Egasi',
    wifiSsidLabel: 'Wi-Fi Nomi (SSID)',
    wifiPasswordLabel: 'Wi-Fi Paroli',
    docNumberLabel: 'Hujjat Seriya va Raqami',
    docTypeLabel: 'Hujjat Turi',
    notesLabel: 'Maxfiy Izoh / Eslatma',
    historyLabel: 'Eski Parollar Tarixi',

    settingsTitle: 'Sozlamalar va Zaxira',
    settingsSubtitle: 'Ko\'p qatlamli xotira, til va tashqi ko\'rinish',
    languageSelectTitle: '🌐 Ilova Tili (Language / Язык)',
    themeSelectTitle: '🎨 Mavzu va Ranglar (Theme)',
    snapshotsTitle: '🕒 Avtomatik Tiklash Nuqtalari (Snapshots)',
    snapshotsDesc: 'Har bir o\'zgarishda saqlanib boruvchi nuqtalar. Kerak bo\'lsa orqaga qaytishingiz mumkin.',
    rollbackBtn: 'Qaytish ⏪',
    txtExportTitle: '📄 Parollarni .TXT Faylga Yuklab Olish',
    txtExportDesc: 'Barcha parollar va 2FA kodlarini ochiq matn (.txt) formatida xotiraga saqlash.',
    backupBtn: '🔒 Shifrlangan Backup Faylini Yuklab Olish (.json)',
    lockNowBtn: '🔐 Omborni Hoziroq Qulflash',
    dangerZoneTitle: 'Xavfli Hudud',
    wipeBtn: '🗑️ Barcha Ma\'lumotlarni Tozalash',
    wipeConfirmPrompt: 'DIQQAT: Barcha parollar butunlay yo\'q qilinadi!\nTasdiqlash uchun \'OCHIRISH\' so\'zini yozing:',
  },

  ru: {
    appName: 'SecurePass',
    offlineBadge: '100% ОФЛАЙН',
    copied: 'Скопировано!',
    saved: 'Сохранено!',
    deleted: 'Перемещено в корзину!',
    restored: 'Восстановлено!',
    error: 'Произошла ошибка',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    back: 'Назад',
    save: 'Сохранить',
    edit: 'Редактировать',
    delete: 'Удалить',
    searchPlaceholder: '🔍 Поиск (название, логин, сайт)...',

    tabVault: 'Хранилище',
    tabGenerator: 'Генератор',
    tabSettings: 'Настройки',

    catAll: 'Все',
    catSites: '🌐 Сайты',
    catCards: '💳 Карты',
    catWifi: '📶 Wi-Fi',
    catDocs: '🪪 Документы',
    catNotes: '📝 Заметки',

    setupTitle: 'Создайте Мастер-Пароль',
    setupSubtitle: 'Все данные шифруются по стандарту AES-256 только в памяти телефона',
    masterPasswordLabel: 'Мастер-пароль (не менее 8 символов)',
    confirmPasswordLabel: 'Повторите пароль',
    setupBtn: '🚀 Активировать Хранилище',
    unlockTitle: 'SecurePass Заблокирован',
    unlockSubtitle: 'Введите мастер-пароль для доступа к хранилищу',
    unlockBtn: '🔓 Разблокировать',
    forgotPasswordLink: 'Забыли пароль? Восстановить ключом',
    lockoutMsg: 'Безопасность: 3 неверные попытки. Подождите: ',

    recoveryTitle: 'Экстренный Ключ Восстановления',
    recoverySubtitle: 'Если вы забудете мастер-пароль, этот ключ восстановит 100% данных!',
    recoveryDisplayLabel: 'Ваш Экстренный Ключ:',
    recoveryCopyBtn: '📋 Скопировать Ключ',
    recoveryDownloadBtn: '📥 Скачать Инструкцию (.txt)',
    recoveryEnterBtn: '✅ Сохранил, Войти в Приложение',
    recoveryPromptTitle: 'Сброс и Восстановление',
    recoveryPromptSubtitle: 'Введите экстренный ключ и задайте новый мастер-пароль',
    recoveryKeyInputLabel: 'Ключ Восстановления',
    newPasswordLabel: 'Новый Мастер-Пароль',
    recoverySubmitBtn: '🔑 Восстановить Доступ',

    myPasswords: 'Мои Пароли',
    emptyTitle: 'Записей пока нет',
    emptySubtitle: 'Нажмите кнопку "+" внизу, чтобы добавить пароль или карту.',
    txtExportBtn: '📄 Экспорт в TXT',
    trashBtn: '🗑️ Корзина',
    auditBannerTitle: '🛡️ Аудит Безопасности Паролей',

    genTitle: 'Генератор Паролей',
    genSubtitle: 'Надежные случайные пароли, фразы и PIN-коды',
    modeRandom: '🔠 Сложный',
    modePassphrase: '💬 Кодовые слова',
    modePin: '🔢 PIN-код',
    genLength: 'Длина',
    genUpper: 'Прописные буквы (A-Z)',
    genLower: 'Строчные буквы (a-z)',
    genNum: 'Цифры (0-9)',
    genSym: 'Спецсимволы (!@#$%^&*)',
    genWordsCount: 'Количество слов',
    genPinLength: 'Длина PIN',
    genRefresh: '🔄 Обновить',
    genCopy: '📋 Скопировать',
    genSaveToVault: '💾 Сохранить в Хранилище',

    totpBadge: '2FA',
    totpWidgetTitle: '🔢 2FA КОД (AUTHENTICATOR)',
    totpCopyBtn: '📋 Скопировать 2FA Код',
    totpSecretLabel: '🔢 Секретный 2FA Ключ (TOTP - Необязательно)',
    totpSecretHelper: 'Замените Google Authenticator — введите ключ сюда, и коды будут генерироваться каждые 30 секунд.',

    createTitle: 'Новая Запись',
    editTitle: 'Редактирование Записи',
    titleLabel: 'Название *',
    loginLabel: 'Логин / Email',
    passwordLabel: 'Пароль',
    urlLabel: 'Адрес Сайта',
    cardNumberLabel: 'Номер Карты',
    expiryLabel: 'Срок Действия (ММ/ГГ)',
    cvvLabel: 'CVV / CVC',
    cardHolderLabel: 'Имя Владельца',
    wifiSsidLabel: 'Имя Сети Wi-Fi (SSID)',
    wifiPasswordLabel: 'Пароль Wi-Fi',
    docNumberLabel: 'Серия и Номер Документа',
    docTypeLabel: 'Тип Документа',
    notesLabel: 'Секретная Заметка',
    historyLabel: 'История Предыдущих Паролей',

    settingsTitle: 'Настройки и Резерв',
    settingsSubtitle: 'Многоуровневая защита, язык и внешний вид',
    languageSelectTitle: '🌐 Язык Приложения (Language / Til)',
    themeSelectTitle: '🎨 Цветовая Тема (Theme)',
    snapshotsTitle: '🕒 Точки Авто-Восстановления (Snapshots)',
    snapshotsDesc: 'Сохраняются при каждом изменении. Можно откатиться назад в любой момент.',
    rollbackBtn: 'Откатить ⏪',
    txtExportTitle: '📄 Скачать Все Пароли в .TXT',
    txtExportDesc: 'Сохранение всех записей и 2FA кодов в виде читаемого текстового файла.',
    backupBtn: '🔒 Скачать Зашифрованный Бэкап (.json)',
    lockNowBtn: '🔐 Заблокировать Сейчас',
    dangerZoneTitle: 'Опасная Зона',
    wipeBtn: '🗑️ Полное Удаление Всех Данных',
    wipeConfirmPrompt: 'ВНИМАНИЕ: Все данные будут стёрты безвозвратно!\nДля подтверждения введите слово \'УДАЛИТЬ\':',
  },

  en: {
    appName: 'SecurePass',
    offlineBadge: '100% OFFLINE',
    copied: 'Copied to clipboard!',
    saved: 'Saved successfully!',
    deleted: 'Moved to Trash!',
    restored: 'Restored to Vault!',
    error: 'An error occurred',
    confirm: 'Confirm',
    cancel: 'Cancel',
    back: 'Back',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    searchPlaceholder: '🔍 Search (title, username, url)...',

    tabVault: 'Vault',
    tabGenerator: 'Generator',
    tabSettings: 'Settings',

    catAll: 'All',
    catSites: '🌐 Logins',
    catCards: '💳 Cards',
    catWifi: '📶 Wi-Fi',
    catDocs: '🪪 ID Docs',
    catNotes: '📝 Notes',

    setupTitle: 'Set Master Password',
    setupSubtitle: 'All credentials are encrypted locally with AES-256 in phone memory',
    masterPasswordLabel: 'Master Password (min 8 characters)',
    confirmPasswordLabel: 'Confirm Password',
    setupBtn: '🚀 Initialize Vault',
    unlockTitle: 'SecurePass Locked',
    unlockSubtitle: 'Enter master password to access your encrypted vault',
    unlockBtn: '🔓 Unlock Vault',
    forgotPasswordLink: 'Forgot password? Recover with emergency key',
    lockoutMsg: 'Security lock: 3 failed attempts. Please wait: ',

    recoveryTitle: 'Emergency Recovery Key',
    recoverySubtitle: 'If you ever forget your master password, this key recovers 100% of your data!',
    recoveryDisplayLabel: 'Your Emergency Key:',
    recoveryCopyBtn: '📋 Copy Key',
    recoveryDownloadBtn: '📥 Download Recovery Kit (.txt)',
    recoveryEnterBtn: '✅ Saved Key, Enter Vault',
    recoveryPromptTitle: 'Reset & Recovery',
    recoveryPromptSubtitle: 'Enter your emergency recovery key and set a new master password',
    recoveryKeyInputLabel: 'Emergency Recovery Key',
    newPasswordLabel: 'New Master Password',
    recoverySubmitBtn: '🔑 Recover & Unlock',

    myPasswords: 'My Passwords',
    emptyTitle: 'No items found',
    emptySubtitle: 'Tap the "+" button below to add your first password or card.',
    txtExportBtn: '📄 Export TXT',
    trashBtn: '🗑️ Trash',
    auditBannerTitle: '🛡️ Password Health Audit',

    genTitle: 'Password Generator',
    genSubtitle: 'Cryptographically secure random passwords, passphrases and PINs',
    modeRandom: '🔠 Complex',
    modePassphrase: '💬 Passphrase',
    modePin: '🔢 PIN Code',
    genLength: 'Length',
    genUpper: 'Uppercase (A-Z)',
    genLower: 'Lowercase (a-z)',
    genNum: 'Numbers (0-9)',
    genSym: 'Special symbols (!@#$%^&*)',
    genWordsCount: 'Word count',
    genPinLength: 'PIN Length',
    genRefresh: '🔄 Regenerate',
    genCopy: '📋 Copy',
    genSaveToVault: '💾 Save to Vault',

    totpBadge: '2FA',
    totpWidgetTitle: '🔢 2FA CODE (AUTHENTICATOR)',
    totpCopyBtn: '📋 Copy 2FA Code',
    totpSecretLabel: '🔢 2FA Secret Key (TOTP - Optional)',
    totpSecretHelper: 'Replaces Google Authenticator — enter secret key to generate 30s rotating codes.',

    createTitle: 'New Item',
    editTitle: 'Edit Item',
    titleLabel: 'Title *',
    loginLabel: 'Username / Email',
    passwordLabel: 'Password',
    urlLabel: 'Website URL',
    cardNumberLabel: 'Card Number',
    expiryLabel: 'Expiry Date (MM/YY)',
    cvvLabel: 'CVV / CVC',
    cardHolderLabel: 'Cardholder Name',
    wifiSsidLabel: 'Wi-Fi Network Name (SSID)',
    wifiPasswordLabel: 'Wi-Fi Password',
    docNumberLabel: 'Document Number',
    docTypeLabel: 'Document Type',
    notesLabel: 'Secure Notes',
    historyLabel: 'Password History',

    settingsTitle: 'Settings & Redundancy',
    settingsSubtitle: 'Multi-layer storage, language and themes',
    languageSelectTitle: '🌐 Language / Til / Язык',
    themeSelectTitle: '🎨 Theme & Palette',
    snapshotsTitle: '🕒 Auto-Snapshots (Restore Points)',
    snapshotsDesc: 'Automatically created on every change. Roll back anytime if needed.',
    rollbackBtn: 'Rollback ⏪',
    txtExportTitle: '📄 Export All Passwords as .TXT',
    txtExportDesc: 'Exports all credentials and 2FA keys into a plain text file.',
    backupBtn: '🔒 Download Encrypted Backup (.json)',
    lockNowBtn: '🔐 Lock Vault Now',
    dangerZoneTitle: 'Danger Zone',
    wipeBtn: '🗑️ Factory Reset & Wipe Data',
    wipeConfirmPrompt: 'WARNING: All passwords will be wiped permanently!\nType \'DELETE\' to confirm:',
  }
};
