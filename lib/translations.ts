// Translation strings for Daily Meds.
// Covers the four supported languages: English, Arabic, Spanish, French.
// Arabic uses RTL (right-to-left) text direction.
// Add new strings here as the app grows.

export type Language = "en" | "ar" | "es" | "fr";

export const LANGUAGES: { code: Language; label: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English",  flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "es", label: "Español",  flag: "🇪🇸", dir: "ltr" },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
];

export const translations = {
  // ── NAVIGATION ────────────────────────────────────────────────────────────
  nav: {
    library:   { en: "Library",   ar: "المكتبة",   es: "Biblioteca", fr: "Bibliothèque" },
    live:      { en: "Live",      ar: "مباشر",     es: "En Vivo",    fr: "En Direct" },
    pricing:   { en: "Pricing",   ar: "الأسعار",   es: "Precios",    fr: "Tarifs" },
    breathe:   { en: "Breathe",   ar: "تنفس",      es: "Respirar",   fr: "Respirer" },
    signIn:    { en: "Sign in",   ar: "تسجيل الدخول", es: "Iniciar sesión", fr: "Se connecter" },
    signUp:    { en: "Start free",ar: "ابدأ مجاناً", es: "Empezar gratis", fr: "Commencer" },
    profile:   { en: "Profile",   ar: "الملف الشخصي", es: "Perfil",   fr: "Profil" },
  },

  // ── HERO SECTION ──────────────────────────────────────────────────────────
  hero: {
    tagline:    { en: "Audio for emotional emergencies", ar: "صوت لحالات الطوارئ العاطفية", es: "Audio para emergencias emocionales", fr: "Audio pour urgences émotionnelles" },
    subTagline: { en: "Meditation for life's most awkward moments", ar: "تأمل للحظات الأصعب في حياتك", es: "Meditación para los momentos más difíciles", fr: "Méditation pour les moments les plus difficiles" },
    cta:        { en: "Start for free", ar: "ابدأ مجاناً", es: "Empezar gratis", fr: "Commencer gratuitement" },
    ctaSub:     { en: "No credit card needed", ar: "لا حاجة لبطاقة ائتمان", es: "Sin tarjeta de crédito", fr: "Sans carte bancaire" },
  },

  // ── MOOD CATEGORIES ───────────────────────────────────────────────────────
  moods: {
    "Hungover":       { en: "Hungover",       ar: "بعد السهرة",     es: "Resaca",         fr: "Gueule de bois" },
    "After The Sesh": { en: "After The Sesh", ar: "بعد الحفلة",     es: "Después de Fiesta", fr: "Après la Fête" },
    "On A Comedown":  { en: "On A Comedown",  ar: "في مرحلة التعافي", es: "En un Bajón",   fr: "En Descente" },
    "Feeling Empty":  { en: "Feeling Empty",  ar: "شعور بالفراغ",   es: "Vacío interior", fr: "Vide Intérieur" },
    "Can't Sleep":    { en: "Can't Sleep",    ar: "لا أستطيع النوم", es: "Sin Dormir",     fr: "Sans Sommeil" },
    "Anxious":        { en: "Anxious",        ar: "قلق",             es: "Ansioso",        fr: "Anxieux" },
    "Heartbroken":    { en: "Heartbroken",    ar: "قلب مكسور",      es: "Corazón Roto",   fr: "Cœur Brisé" },
    "Overwhelmed":    { en: "Overwhelmed",    ar: "مرهق",           es: "Agobiado",       fr: "Débordé" },
    "Low Energy":     { en: "Low Energy",     ar: "طاقة منخفضة",    es: "Sin Energía",    fr: "Énergie Basse" },
    "Morning Reset":  { en: "Morning Reset",  ar: "إعادة ضبط الصباح", es: "Reset Mañanero", fr: "Reset Matinal" },
    "Focus Mode":     { en: "Focus Mode",     ar: "وضع التركيز",    es: "Modo Enfoque",   fr: "Mode Concentration" },
  },

  // ── PRICING PAGE ──────────────────────────────────────────────────────────
  pricing: {
    heading:   { en: "Find your plan",      ar: "اختر خطتك",          es: "Elige tu plan",       fr: "Trouvez votre offre" },
    subheading:{ en: "Start free. Upgrade when you're ready.", ar: "ابدأ مجاناً. قم بالترقية عندما تكون مستعداً.", es: "Empieza gratis. Actualiza cuando quieras.", fr: "Commencez gratuitement. Passez à la version supérieure quand vous voulez." },
    monthly:   { en: "Monthly",   ar: "شهري",  es: "Mensual",  fr: "Mensuel" },
    annual:    { en: "Annual",    ar: "سنوي",  es: "Anual",    fr: "Annuel" },
    lifetime:  { en: "Lifetime",  ar: "مدى الحياة", es: "De por vida", fr: "À vie" },
    free:      { en: "Free",      ar: "مجاني", es: "Gratis",   fr: "Gratuit" },
    bestValue: { en: "Best value",ar: "أفضل قيمة", es: "Mejor precio", fr: "Meilleur prix" },
  },

  // ── SESSION PLAYER ────────────────────────────────────────────────────────
  session: {
    play:       { en: "Play",         ar: "تشغيل",      es: "Reproducir",  fr: "Lire" },
    pause:      { en: "Pause",        ar: "إيقاف",      es: "Pausar",      fr: "Pause" },
    free:       { en: "Free",         ar: "مجاني",      es: "Gratis",      fr: "Gratuit" },
    premium:    { en: "Premium",      ar: "مميز",       es: "Premium",     fr: "Premium" },
    addToList:  { en: "Save",         ar: "حفظ",        es: "Guardar",     fr: "Sauvegarder" },
    share:      { en: "Share",        ar: "مشاركة",     es: "Compartir",   fr: "Partager" },
    upgradeMsg: { en: "This is a premium session", ar: "هذه جلسة مميزة", es: "Esta es una sesión premium", fr: "C'est une session premium" },
    seePlans:   { en: "See plans",    ar: "عرض الخطط",  es: "Ver planes",  fr: "Voir les offres" },
  },

  // ── BREATHING TIMER ───────────────────────────────────────────────────────
  breathe: {
    title:      { en: "Breathing Timer", ar: "مؤقت التنفس", es: "Temporizador de Respiración", fr: "Minuteur de Respiration" },
    start:      { en: "Start Session",   ar: "ابدأ الجلسة", es: "Iniciar Sesión",              fr: "Démarrer la Session" },
    pause:      { en: "Pause",           ar: "إيقاف",       es: "Pausar",                      fr: "Pause" },
    resume:     { en: "Resume",          ar: "استئناف",     es: "Reanudar",                    fr: "Reprendre" },
    breatheIn:  { en: "Breathe in",      ar: "استنشق",      es: "Inhala",                      fr: "Inspirez" },
    breatheOut: { en: "Breathe out",     ar: "ازفر",        es: "Exhala",                      fr: "Expirez" },
    hold:       { en: "Hold",            ar: "احبس",        es: "Mantén",                      fr: "Retenez" },
    rest:       { en: "Rest",            ar: "استرح",       es: "Descansa",                    fr: "Repos" },
    done:       { en: "Done",            ar: "انتهى",       es: "Hecho",                       fr: "Terminé" },
  },

  // ── COMMON UI ─────────────────────────────────────────────────────────────
  common: {
    back:       { en: "Back",       ar: "رجوع",    es: "Volver",   fr: "Retour" },
    loading:    { en: "Loading…",   ar: "جار التحميل…", es: "Cargando…", fr: "Chargement…" },
    close:      { en: "Close",      ar: "إغلاق",   es: "Cerrar",   fr: "Fermer" },
    copy:       { en: "Copy",       ar: "نسخ",     es: "Copiar",   fr: "Copier" },
    copied:     { en: "Copied!",    ar: "تم النسخ!", es: "¡Copiado!", fr: "Copié !" },
    signOut:    { en: "Sign out",   ar: "تسجيل الخروج", es: "Cerrar sesión", fr: "Se déconnecter" },
    getStarted: { en: "Get started",ar: "ابدأ الآن", es: "Empezar",  fr: "Commencer" },
    learnMore:  { en: "Learn more", ar: "اعرف أكثر", es: "Saber más", fr: "En savoir plus" },
  },

  // ── FOOTER ────────────────────────────────────────────────────────────────
  footer: {
    tagline:   { en: "Audio for emotional emergencies.", ar: "صوت لحالات الطوارئ العاطفية.", es: "Audio para emergencias emocionales.", fr: "Audio pour urgences émotionnelles." },
    rights:    { en: "All rights reserved.", ar: "جميع الحقوق محفوظة.", es: "Todos los derechos reservados.", fr: "Tous droits réservés." },
    madeBy:    { en: "Made by Natalie Lauraine", ar: "من إنتاج ناتالي لورين", es: "Hecho por Natalie Lauraine", fr: "Fait par Natalie Lauraine" },
  },
} as const;

// Helper type — picks out the translation record for a given key path
export type TranslationKey = keyof typeof translations;
