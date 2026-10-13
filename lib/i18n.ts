// Storefront copy in English and Arabic.
// Arabic is written as commercial copy for a jewelry house, not a literal
// translation. Keep both languages in step when editing.

export type Lang = "en" | "ar";

export const LANG_COOKIE = "napd-lang";

export const dict = {
  en: {
    // header / nav
    "announce.warranty": "1 Year Warranty on Every Piece",
    "announce.silver": "Imported Sterling Silver 925",
    "announce.whatsapp": "Order Directly on WhatsApp",
    "nav.necklaces": "Necklaces",
    "nav.earrings": "Earrings",
    "nav.bracelets": "Bracelets",
    "nav.rings": "Rings",
    "nav.orders": "Orders",
    "nav.dashboard": "Owner Dashboard",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.account": "Account",
    "nav.cart": "Cart",
    "nav.menu": "Menu",
    "lang.switch": "عربي",
    "lang.switchLabel": "التصفح بالعربية",

    // footer
    "footer.contact": "Contact Us",
    "footer.about": "About Us",
    "footer.faqs": "FAQs",
    "footer.shipping": "Shipping Policy",
    "footer.exchange": "Exchange Policy",
    "footer.privacy": "Privacy Policy",
    "footer.rights": "© 2026 NAPD Jewels. All rights reserved.",
    "footer.silver": "Sterling Silver 925",

    // hero
    "hero.sr": "An exceptional piece, for exceptional taste.",
    "hero.side": "NAPD Jewels · Sterling Silver 925",
    "hero.sub":
      "Sterling silver 925 and moissanite, hand-picked for the moments she will remember.",
    "hero.shop": "Shop the collection",
    "hero.whatsapp": "WhatsApp",
    "hero.scroll": "Scroll",
    "hero.scrollLabel": "Scroll to the collection",
    "hero.featured": "Featured pieces",
    "hero.show": "Show",
    "hero.view": "View",
    "hero.edit": "The Moissanite Edit",

    // moissanite edit
    "edit.before": "The Moissanite",
    "edit.flourish": "Edit",
    "edit.after": "",
    "edit.body":
      "A stone with more fire than a diamond, set in sterling silver. Made to be noticed across the room.",
    "edit.cta": "View the edit",

    // collections
    "col.before": "Shop by",
    "col.flourish": "collection",
    "col.after": "",
    "col.explore": "Explore",
    "cat.RINGS": "Rings",
    "cat.CHAINS": "Necklaces",
    "cat.NECKLACES": "Necklaces",
    "cat.BRACELETS": "Bracelets",
    "cat.EARRINGS": "Earrings",
    "cat.MOISSANITE": "Moissanite",
    "cat.MOISSANITE_EDIT": "The Moissanite Edit",
    "cat.SETS": "Sets",
    "cat.PANDORA": "Pandora",
    "sections.viewAll": "View All",
    "banner.sets.eyebrow": "Matching pieces, one look",
    "banner.sets.title": "The Sets",
    "banner.moissanite.eyebrow": "More fire than a diamond",
    "banner.moissanite.title": "Moissanite",
    "banner.pandora.eyebrow": "Charms in 925 silver",
    "banner.pandora.title": "Charms",
    "banner.discover": "Discover",
    "sections.eyebrow": "The Collections",
    "occasion.days": "Days",
    "occasion.hours": "Hours",
    "occasion.minutes": "Minutes",
    "occasion.seconds": "Seconds",
    "occasion.until": "Until",
    "occasion.edit": "The Edit",
    "occasion.editTitle": "Chosen for",
    "occasion.giftTitle": "Giving it as a gift?",
    "occasion.giftBody": "Every order arrives in the NAPD box and bag, ready to give. Tell us on WhatsApp who it is for, and we will help you choose.",
    "occasion.giftCta": "Ask about a gift",
    "occasion.giftWa": "Hello, I'd like this piece as a gift:",
    "occasion.promiseBox": "In the NAPD gift box",
    "occasion.promiseWarranty": "One-year warranty",
    "occasion.promiseHelp": "Help choosing on WhatsApp",
    "occasion.cartNote": "Every order arrives in the NAPD gift box, ready to give.",

    // promises
    "promise.warranty.title": "One-year warranty",
    "promise.warranty.body": "Every piece is covered for a full year from the day it is yours.",
    "promise.silver.title": "Sterling silver 925",
    "promise.silver.body": "Imported 925 silver and moissanite, checked piece by piece.",
    "promise.personal.title": "Ordered personally",
    "promise.personal.body": "Message us on WhatsApp and a real person helps you choose.",
    "promise.before": "Looking for",
    "promise.flourish": "the one?",
    "promise.after": "",
    "promise.cta": "Ask us on WhatsApp",

    // seasonal occasion
    "occasion.today": "Today",
    "occasion.shop": "Shop the gifts",
    "occasion.whatsapp": "Order on WhatsApp",
    "occasion.waText": "Hello, I'd like a gift for",
    "occasion.discover": "Discover",

    // category page
    "catpage.back": "Back Home",
    "catpage.emptyTitle": "New pieces are on their way",
    "catpage.emptyBody":
      "This collection is being restocked. Message us on WhatsApp and we will tell you what is available right now.",
    "catpage.ask": "Ask on WhatsApp",

    // product page
    "pdp.home": "Home",
    "pdp.goneTitle": "This piece is no longer available",
    "pdp.goneBody":
      "It may have sold out. Browse the collection or ask us on WhatsApp for something similar.",
    "pdp.browse": "Browse the collection",
    "pdp.ask": "Ask on WhatsApp",
    "pdp.showImage": "Show image",
    "pdp.outOfStock": "Out of stock",
    "pdp.inStock": "In stock, ready to ship",
    "pdp.ringSize": "Ring size",
    "pdp.chooseSize": "Please choose a size",
    "pdp.quantity": "Quantity",
    "pdp.decrease": "Decrease quantity",
    "pdp.increase": "Increase quantity",
    "pdp.order": "Order on WhatsApp",
    "pdp.addToCart": "Add to cart",
    "pdp.note": "Your WhatsApp message will include this piece, size and quantity.",
    "pdp.p.warranty": "1-year warranty",
    "pdp.p.silver": "Sterling silver 925",
    "pdp.p.delivery": "Delivery available",
    "pdp.p.exchange": "Easy exchange",
    "pdp.details": "Details",
    "param.zircon_grade": "Zircon grade",
    "param.main_stone_size": "Main stone size",
    "param.main_stone_shape": "Main stone shape",
    "param.main_stone_cut": "Main stone cut",
    "param.plating_color": "Plating color",
    "param.main_stone_carat": "Main stone carat",

    // whatsapp order message
    "wa.hello": "Hello, I would like to order:",
    "wa.piece": "Piece",
    "wa.size": "Size",
    "wa.price": "Price",
    "wa.before": "before discount",
    "wa.discount": "discount",
    "wa.qty": "Quantity",
    "wa.link": "Link",

    // cart
    "cart.title": "Your Cart",
    "cart.empty": "Your cart is empty.",
    "cart.continue": "Continue Shopping",
    "cart.remove": "Remove",
    "cart.subtotal": "Subtotal",
    "cart.checkout": "Proceed to Checkout",
  },

  ar: {
    "announce.warranty": "ضمان لمدة عام على كل قطعة",
    "announce.silver": "فضة إسترلينية عيار 925 مستوردة",
    "announce.whatsapp": "اطلب مباشرة عبر واتساب",
    "nav.necklaces": "قلائد",
    "nav.earrings": "أقراط",
    "nav.bracelets": "أساور",
    "nav.rings": "خواتم",
    "nav.orders": "الطلبات",
    "nav.dashboard": "لوحة التحكم",
    "nav.login": "تسجيل الدخول",
    "nav.logout": "تسجيل الخروج",
    "nav.account": "حسابي",
    "nav.cart": "السلة",
    "nav.menu": "القائمة",
    "lang.switch": "EN",
    "lang.switchLabel": "Browse in English",

    "footer.contact": "تواصل معنا",
    "footer.about": "من نحن",
    "footer.faqs": "الأسئلة الشائعة",
    "footer.shipping": "سياسة الشحن",
    "footer.exchange": "سياسة الاستبدال",
    "footer.privacy": "سياسة الخصوصية",
    "footer.rights": "© 2026 NAPD Jewels. جميع الحقوق محفوظة.",
    "footer.silver": "فضة إسترلينية عيار 925",

    "hero.sr": "قطعة استثنائية لذوقٍ استثنائي.",
    "hero.side": "NAPD Jewels · فضة إسترلينية عيار 925",
    "hero.sub": "فضة إسترلينية عيار 925 وأحجار مويسانيت، ننتقيها بعناية للحظاتٍ لا تُنسى.",
    "hero.shop": "تسوّق التشكيلة",
    "hero.whatsapp": "واتساب",
    "hero.scroll": "اكتشف",
    "hero.scrollLabel": "انتقل إلى التشكيلة",
    "hero.featured": "قطع مختارة",
    "hero.show": "اعرض",
    "hero.view": "شاهد",
    "hero.edit": "تشكيلة المويسانيت",

    "edit.before": "تشكيلة",
    "edit.flourish": "المويسانيت",
    "edit.after": "",
    "edit.body": "حجرٌ يفوق الألماس بريقاً، يتألّق على الفضة الإسترلينية. صُمّم ليخطف الأنظار.",
    "edit.cta": "شاهد التشكيلة",

    "col.before": "اكتشف",
    "col.flourish": "مجموعاتنا",
    "col.after": "",
    "col.explore": "اكتشف",
    "cat.RINGS": "خواتم",
    "cat.CHAINS": "قلائد",
    "cat.NECKLACES": "قلائد",
    "cat.BRACELETS": "أساور",
    "cat.EARRINGS": "أقراط",
    "cat.MOISSANITE": "مويسانيت",
    "cat.MOISSANITE_EDIT": "تشكيلة المويسانيت",
    "cat.SETS": "أطقم",
    "cat.PANDORA": "باندورا",
    "sections.viewAll": "عرض الكل",
    "banner.sets.eyebrow": "قطع متناسقة بإطلالة وحدة",
    "banner.sets.title": "الأطقم",
    "banner.moissanite.eyebrow": "لمعة أقوى من الألماس",
    "banner.moissanite.title": "مويسانيت",
    "banner.pandora.eyebrow": "تشارمز من فضة 925",
    "banner.pandora.title": "تشارمز",
    "banner.discover": "اكتشف",
    "sections.eyebrow": "التشكيلات",
    "occasion.days": "يوم",
    "occasion.hours": "ساعة",
    "occasion.minutes": "دقيقة",
    "occasion.seconds": "ثانية",
    "occasion.until": "على",
    "occasion.edit": "مختارات",
    "occasion.editTitle": "مختارات",
    "occasion.giftTitle": "بدك تهديها؟",
    "occasion.giftBody": "كل طلبية بتوصل بعلبة وكيس نبض، جاهزة للإهداء. احكيلنا عالواتساب لمين الهدية ومنساعدك تختار.",
    "occasion.giftCta": "اسأل عن هدية",
    "occasion.giftWa": "مرحباً، بدي هاي القطعة كهدية:",
    "occasion.promiseBox": "بعلبة نبض للهدايا",
    "occasion.promiseWarranty": "كفالة سنة كاملة",
    "occasion.promiseHelp": "منساعدك تختار عالواتساب",
    "occasion.cartNote": "كل طلبية بتوصل بعلبة نبض، جاهزة للإهداء.",

    "promise.warranty.title": "ضمان لمدة عام",
    "promise.warranty.body": "كل قطعة مضمونة لعامٍ كامل من يوم استلامها.",
    "promise.silver.title": "فضة إسترلينية عيار 925",
    "promise.silver.body": "فضة إسترلينية مستوردة وأحجار مويسانيت، نفحص كل قطعة بعناية قبل أن تصلك.",
    "promise.personal.title": "خدمة شخصية",
    "promise.personal.body": "راسلنا على واتساب، وسيساعدك فريقنا في اختيار القطعة المناسبة.",
    "promise.before": "تبحث عن",
    "promise.flourish": "الهدية المثالية؟",
    "promise.after": "",
    "promise.cta": "راسلنا على واتساب",

    // seasonal occasion
    "occasion.today": "اليوم",
    "occasion.shop": "تسوّق الهدايا",
    "occasion.whatsapp": "اطلب عبر واتساب",
    "occasion.waText": "مرحباً، بدي هدية لـ",
    "occasion.discover": "اكتشف",

    "catpage.back": "الرئيسية",
    "catpage.emptyTitle": "قطع جديدة في الطريق",
    "catpage.emptyBody": "نعمل على تجديد هذه التشكيلة. راسلنا على واتساب لنخبرك بما هو متوفر الآن.",
    "catpage.ask": "اسألنا على واتساب",

    "pdp.home": "الرئيسية",
    "pdp.goneTitle": "هذه القطعة لم تعد متوفرة",
    "pdp.goneBody": "ربما نفدت الكمية. تصفّح التشكيلة أو اسألنا على واتساب عن قطعة مشابهة.",
    "pdp.browse": "تصفّح التشكيلة",
    "pdp.ask": "اسألنا على واتساب",
    "pdp.showImage": "اعرض الصورة",
    "pdp.outOfStock": "نفدت الكمية",
    "pdp.inStock": "متوفر وجاهز للشحن",
    "pdp.ringSize": "مقاس الخاتم",
    "pdp.chooseSize": "يرجى اختيار المقاس",
    "pdp.quantity": "الكمية",
    "pdp.decrease": "إنقاص الكمية",
    "pdp.increase": "زيادة الكمية",
    "pdp.order": "اطلب عبر واتساب",
    "pdp.addToCart": "أضف إلى السلة",
    "pdp.note": "ستتضمن رسالة واتساب القطعة والمقاس والكمية.",
    "pdp.p.warranty": "ضمان لمدة عام",
    "pdp.p.silver": "فضة إسترلينية عيار 925",
    "pdp.p.delivery": "التوصيل متاح",
    "pdp.p.exchange": "استبدال سهل",
    "pdp.details": "التفاصيل",
    "param.zircon_grade": "درجة الزركون",
    "param.main_stone_size": "حجم الحجر الرئيسي",
    "param.main_stone_shape": "شكل الحجر الرئيسي",
    "param.main_stone_cut": "قَصّة الحجر الرئيسي",
    "param.plating_color": "لون الطلاء",
    "param.main_stone_carat": "قيراط الحجر الرئيسي",

    "wa.hello": "مرحباً، أودّ طلب:",
    "wa.piece": "القطعة",
    "wa.size": "المقاس",
    "wa.price": "السعر",
    "wa.before": "قبل الخصم",
    "wa.discount": "خصم",
    "wa.qty": "الكمية",
    "wa.link": "رابط القطعة",

    "cart.title": "سلة التسوق",
    "cart.empty": "سلتك فارغة حالياً.",
    "cart.continue": "متابعة التسوق",
    "cart.remove": "إزالة",
    "cart.subtotal": "المجموع",
    "cart.checkout": "إتمام الطلب",
  },
} as const;

export type DictKey = keyof (typeof dict)["en"];

export function translate(lang: Lang, key: DictKey): string {
  return (dict[lang] as Record<string, string>)[key] ?? dict.en[key];
}

/** "1 piece / 2 pieces" with Arabic plural forms. */
export function piecesLabel(lang: Lang, n: number) {
  if (lang === "en") return `${n} ${n === 1 ? "piece" : "pieces"}`;
  if (n === 1) return "قطعة واحدة";
  if (n === 2) return "قطعتان";
  if (n >= 3 && n <= 10) return `${n} قطع`;
  return `${n} قطعة`;
}

/** "12 days to go" with Arabic plural forms. */
export function daysLeftLabel(lang: Lang, n: number) {
  if (lang === "en") return n === 1 ? "1 day to go" : `${n} days to go`;
  if (n === 1) return "باقي يوم واحد";
  if (n === 2) return "باقي يومان";
  if (n >= 3 && n <= 10) return `باقي ${n} أيام`;
  return `باقي ${n} يوماً`;
}

/**
 * Low-stock line on the product page. The owner prefers "almost sold out" to
 * showing the exact count ("last piece"), so the number is not shown.
 */
export function onlyLeftLabel(lang: Lang, _n: number) {
  return lang === "en" ? "Almost sold out" : "قارب على النفاد";
}

export function detectLang(cookieValue?: string | null, acceptLanguage?: string | null): Lang {
  if (cookieValue === "ar" || cookieValue === "en") return cookieValue;
  const first = (acceptLanguage || "").split(",")[0]?.trim().toLowerCase() || "";
  return first.startsWith("ar") ? "ar" : "en";
}
