// בצד השרת, NEXT_PUBLIC_API_URL לא זמין, אז נשתמש ב-API_URL או localhost
const getApiUrl = () => {
  // בצד השרת (SSR)
  if (typeof window === 'undefined') {
    return process.env.API_URL || 'http://localhost:5000';
  }
  // בצד הלקוח
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

async function getShippingSettings() {
  try {
    const apiUrl = getApiUrl();
    // הסר /api אם כבר קיים ב-API_URL
    const baseUrl = apiUrl.replace(/\/api$/, '');
    const res = await fetch(`${baseUrl}/api/settings/shipping`, {
      cache: 'no-store', // תמיד קבל מידע עדכני
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch shipping settings: ${res.status}`);
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    // ערכי ברירת מחדל במקרה של שגיאה
    return {
      shipping: {
        flatRate: { ils: 49, usd: 15 },
        freeShipping: {
          enabled: false,
          threshold: { ils: 0, usd: 0 }
        }
      }
    };
  }
}

export const metadata = {
  title: 'מדיניות משלוחים | TORINO',
  description: 'מדיניות המשלוחים וההפצה שלנו - זמני אספקה, עלויות משלוח ותהליך המשלוח',
};

export default async function ShippingPage() {
  const settings = await getShippingSettings();
  const shippingCost = settings.shipping.flatRate.ils;
  const freeShippingEnabled = settings.shipping.freeShipping.enabled;
  const freeShippingThreshold = settings.shipping.freeShipping.threshold.ils;

  // Debug log
  console.log('Shipping Settings:', {
    shippingCost,
    freeShippingEnabled,
    freeShippingThreshold
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            מדיניות משלוחים
          </h1>
          <p className="text-neutral-600 font-light">
            עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-16 font-light">
          {/* זמני אספקה */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">זמני אספקה</h2>
            <div className="space-y-6">
              <div className="border border-neutral-200 p-6">
                <h3 className="font-normal text-lg mb-2">משלוח סטנדרטי (21-28 ימים)</h3>
                <p className="text-neutral-600 text-sm mb-2">
                  המשלוח הסטנדרטי שלנו מגיע תוך 21-28 ימים ממועד אישור ההזמנה.
                </p>
                <p className="text-sm">
                  עלות: ₪{shippingCost}
                  {freeShippingEnabled && freeShippingThreshold > 0 &&
                    ` | משלוח חינם בהזמנות מעל ₪${freeShippingThreshold}`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* תהליך המשלוח */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">תהליך המשלוח</h2>
            <div className="space-y-6">
              {[
                {
                  num: '1',
                  title: 'אישור הזמנה',
                  desc: 'לאחר ביצוע ההזמנה, תקבלו אישור בדוא"ל תוך מספר דקות.'
                },
                {
                  num: '2',
                  title: 'עיבוד ורכישה',
                  desc: 'ההזמנה תעובד ותירכש מהספק. בשלב זה נוודא את זמינות המוצרים.'
                },
                {
                  num: '3',
                  title: 'משלוח בינלאומי',
                  desc: 'המוצרים יישלחו אליכם ביבוא אישי. תקבלו עדכונים על התקדמות המשלוח.'
                },
                {
                  num: '4',
                  title: 'קבלת המשלוח',
                  desc: 'המשלוח יגיע עד לבית הלקוח. במקרים חריגים, המערכת שומרת לעצמה את הזכות לשלוח לנקודת מסירה באזור הלקוח.'
                }
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 border border-black flex items-center justify-center font-light text-sm">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-normal mb-1">{step.title}</h3>
                    <p className="text-sm text-neutral-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* אזורי חלוקה */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">אזורי חלוקה</h2>
            <div className="space-y-4 text-neutral-700 text-sm">
              <p>אנו משלחים לכל רחבי ישראל.</p>
              <p>המשלוח מגיע עד לבית הלקוח. במקרים חריגים, המערכת שומרת לעצמה את הזכות לשלוח את המשלוח עד לאזור הלקוח לנקודת מסירה.</p>
              <p>המשלוח מתבצע לכתובת שצוינה בהזמנה בלבד. במידה ונדרש שינוי כתובת, יש ליצור קשר לפני משלוח החבילה.</p>
            </div>
          </section>

          {/* מעקב */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">מעקב אחר משלוח</h2>
            <div className="space-y-4 text-neutral-700 text-sm">
              <p>אנו מעדכנים את לקוחותינו בצורה שוטפת על קצב ההתקדמות של המשלוח.</p>
              <p>ניתן לעקוב אחר סטטוס ההזמנה דרך עמוד "ההזמנות שלי" באתר.</p>
              <p>במקרה של עיכוב במשלוח, אנו נעדכן אתכם באופן פרואקטיבי.</p>
            </div>
          </section>

          {/* קבלת המשלוח */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">קבלת המשלוח</h2>
            <div className="space-y-4 text-neutral-700 text-sm">
              <p>בעת קבלת המשלוח, יש לבדוק את החבילה ולוודא שאין נזק חיצוני.</p>
              <p>במידה ויש נזק גלוי לאריזה, יש לסרב לקבלת המשלוח ולדווח לנו מיידית.</p>
              <p>לאחר קבלת המשלוח, האחריות על המוצר עוברת אליכם.</p>
              <p>כל משלוח כפוף למדיניות ההחזרות שלנו - 14 יום להחזרה או החלפה.</p>
            </div>
          </section>

          {/* עלויות */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">עלויות משלוח</h2>
            <div className="border border-neutral-200">
              <div className="flex justify-between items-center p-4 border-b border-neutral-200">
                <span className="text-sm">משלוח סטנדרטי (21-28 ימים)</span>
                <span className="text-sm">₪{shippingCost}</span>
              </div>
              {freeShippingEnabled && freeShippingThreshold > 0 && (
                <div className="flex justify-between items-center p-4 bg-neutral-50">
                  <span className="text-sm font-normal">משלוח חינם</span>
                  <span className="text-sm font-normal">בהזמנות מעל ₪{freeShippingThreshold}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-4">
              * המחירים כוללים מע"ם ומחושבים בזמן התשלום
            </p>
          </section>

          {/* הערות חשובות */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">הערות חשובות</h2>
            <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-4 text-sm text-neutral-700">
              <p className="flex items-start gap-2">
                <span className="text-lg">•</span>
                <span>זמני המשלוח הם אומדן ועשויים להשתנות בהתאם לנסיבות.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-lg">•</span>
                <span>המוצרים מגיעים ביבוא אישי והמשלוח כולל את כל העלויות הנדרשות.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-lg">•</span>
                <span>במקרים חריגים, המערכת שומרת לעצמה את הזכות לשלוח לנקודת מסירה באזור הלקוח.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-lg">•</span>
                <span>אנו מעדכנים את קצב ההתקדמות של המשלוח באופן שוטף.</span>
              </p>
            </div>
          </section>

          {/* יצירת קשר */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">יש שאלות?</h2>
            <p className="text-neutral-600 mb-4">לכל שאלה או בעיה הקשורה למשלוח, אנו כאן לעזור:</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-normal">דוא"ל:</span>
              <a href="mailto:torino900100@gmail.com" className="hover:opacity-70 transition-opacity">
                torino900100@gmail.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
