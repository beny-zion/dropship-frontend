export const metadata = {
  title: 'אודות | TORINO',
  description: 'קצת עלינו - החברה, הערכים והחזון שלנו',
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-20 md:py-32 max-w-5xl">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8">
            אודות TORINO
          </h1>
          <p className="text-xl md:text-2xl font-light leading-relaxed text-neutral-600 max-w-3xl">
            ברוכים הבאים ל-TORINO - חנות האינטרנט המובילה למוצרים איכותיים ביבוא אישי בישראל.
            אנו מאמינים שקנייה אונליין צריכה להיות פשוטה, נוחה ואמינה.
          </p>
        </div>
      </section>

      {/* מי אנחנו */}
      <section className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-light tracking-widest uppercase text-neutral-500 mb-6">
                מי אנחנו
              </h2>
              <h3 className="text-3xl md:text-4xl font-light leading-tight mb-8">
                חברה ישראלית <br />למסחר אלקטרוני<br />ויבוא אישי
              </h3>
            </div>
            <div className="space-y-6">
              <p className="text-lg font-light leading-relaxed text-neutral-700">
                TORINO היא חברה ישראלית המתמחה במסחר אלקטרוני ויבוא אישי. אנו מציעים מגוון רחב של מוצרים
                איכותיים במחירים תחרותיים, תוך שמירה על שירות אישי ומקצועי.
              </p>
              <p className="text-lg font-light leading-relaxed text-neutral-700">
                הקמנו את החברה מתוך רצון לאפשר לכל אחד ואחת בישראל לקנות מוצרים איכותיים באופן מקוון,
                בצורה נוחה, מהירה ובטוחה - מבלי לצאת מהבית.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* החזון */}
      <section className="bg-black text-white border-b border-neutral-800">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl">
          <div className="max-w-3xl">
            <h2 className="text-sm font-light tracking-widest uppercase text-neutral-400 mb-6">
              החזון שלנו
            </h2>
            <p className="text-3xl md:text-4xl font-light leading-tight">
              להיות החנות האונליין המועדפת בישראל למוצרים איכותיים ביבוא אישי
            </p>
            <p className="text-lg font-light leading-relaxed text-neutral-400 mt-8">
              אנו שואפים ליצור חוויית קנייה מושלמת שמשלבת מגוון רחב, מחירים הוגנים, משלוח מהיר ושירות לקוחות מעולה.
              המטרה שלנו היא שכל לקוח ירגיש מרוצה ובטוח ברכישה שלו.
            </p>
          </div>
        </div>
      </section>

      {/* הערכים */}
      <section className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl">
          <h2 className="text-sm font-light tracking-widest uppercase text-neutral-500 mb-12">
            הערכים שלנו
          </h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="border-t border-neutral-200 pt-8">
              <h3 className="text-2xl font-light mb-4">איכות מעל הכל</h3>
              <p className="text-neutral-600 font-light leading-relaxed">
                אנו בוחרים בקפידה כל מוצר שאנו מציעים, ומוודאים שהוא עומד בסטנדרטים הגבוהים ביותר של איכות ואמינות.
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-8">
              <h3 className="text-2xl font-light mb-4">שקיפות ואמינות</h3>
              <p className="text-neutral-600 font-light leading-relaxed">
                אנו מאמינים בשקיפות מלאה - מחירים ברורים, תנאים ברורים, ללא הפתעות. מה שאתם רואים זה מה שאתם מקבלים.
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-8">
              <h3 className="text-2xl font-light mb-4">מהירות ויעילות</h3>
              <p className="text-neutral-600 font-light leading-relaxed">
                זמנכם יקר לנו. אנו מתחייבים למשלוחים מהירים, תגובות מהירות לפניות ועיבוד הזמנות יעיל.
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-8">
              <h3 className="text-2xl font-light mb-4">שירות אישי</h3>
              <p className="text-neutral-600 font-light leading-relaxed">
                כל לקוח הוא חשוב לנו. אנו מעניקים שירות אישי ומקצועי, ונעשה הכל כדי שתהיו מרוצים מהחוויה.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* מה אנחנו מציעים */}
      <section className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl">
          <h2 className="text-sm font-light tracking-widest uppercase text-neutral-500 mb-12">
            מה אנחנו מציעים
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="h-px bg-black w-12 mb-6"></div>
              <h3 className="text-xl font-light mb-3">מגוון רחב של מוצרים</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                מאלקטרוניקה ועד לבית וגן, מאביזרי אופנה ועד למוצרי ספורט - אנו מציעים מגוון עצום של מוצרים איכותיים.
              </p>
            </div>

            <div>
              <div className="h-px bg-black w-12 mb-6"></div>
              <h3 className="text-xl font-light mb-3">מחירים תחרותיים</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                הודות למודל היבוא האישי, אנו יכולים להציע מחירים מעולים ומבצעים קבועים.
              </p>
            </div>

            <div>
              <div className="h-px bg-black w-12 mb-6"></div>
              <h3 className="text-xl font-light mb-3">משלוח מהיר</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                משלוחים תוך 3-5 ימי עסקים לכל רחבי ישראל, עם אפשרות למשלוח מהיר תוך 1-2 ימים.
              </p>
            </div>

            <div>
              <div className="h-px bg-black w-12 mb-6"></div>
              <h3 className="text-xl font-light mb-3">תשלום מאובטח</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                כל העסקאות מוצפנות ומאובטחות. אנו משתמשים בטכנולוגיות האבטחה המתקדמות ביותר.
              </p>
            </div>

            <div>
              <div className="h-px bg-black w-12 mb-6"></div>
              <h3 className="text-xl font-light mb-3">החזרות קלות</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                14 יום להחזרה או החלפה, ללא שאלות. שביעות רצונכם חשובה לנו מעל הכל.
              </p>
            </div>

            <div>
              <div className="h-px bg-black w-12 mb-6"></div>
              <h3 className="text-xl font-light mb-3">תמיכה מקצועית</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                צוות התמיכה שלנו זמין לעזור לכם בכל שאלה או בעיה, בטלפון, דוא״ל או צ׳אט.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* למה לבחור בנו */}
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl">
          <h2 className="text-sm font-light tracking-widest uppercase text-neutral-500 mb-12">
            למה לבחור בנו
          </h2>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
            <div className="flex items-start gap-4">
              <div className="text-xl">✓</div>
              <div>
                <span className="font-light"><strong className="font-normal">ניסיון מוכח:</strong> אנו פועלים בשוק הישראלי ומכירים את הצרכים המקומיים</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-xl">✓</div>
              <div>
                <span className="font-light"><strong className="font-normal">אמינות:</strong> אלפי לקוחות מרוצים שחוזרים לקנות שוב ושוב</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-xl">✓</div>
              <div>
                <span className="font-light"><strong className="font-normal">חדשנות:</strong> אנו מעדכנים כל הזמן את המלאי עם המוצרים החדשים והטרנדיים ביותר</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-xl">✓</div>
              <div>
                <span className="font-light"><strong className="font-normal">זמינות:</strong> האתר פועל 24/7, ואנחנו זמינים לתמיכה בימים ובשעות העבודה</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-xl">✓</div>
              <div>
                <span className="font-light"><strong className="font-normal">התחייבות:</strong> אנו מתחייבים לשביעות רצונכם המלאה או החזר כספי</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* המחויבות שלנו */}
      <section className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-5xl">
          <h2 className="text-sm font-light tracking-widest uppercase text-neutral-500 mb-12">
            המחויבות שלנו אליכם
          </h2>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            <div>
              <h3 className="text-xl font-light mb-3">שביעות רצון מובטחת</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                אם לא מרוצים - נחזיר את כספכם, ללא התנצלויות
              </p>
            </div>

            <div>
              <h3 className="text-xl font-light mb-3">תגובה תוך 24 שעות</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                כל פנייה תענה תוך יום עסקים אחד
              </p>
            </div>

            <div>
              <h3 className="text-xl font-light mb-3">הגנה מלאה על הפרטיות</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                המידע שלכם מאובטח ולעולם לא יימסר לצד שלישי
              </p>
            </div>

            <div>
              <h3 className="text-xl font-light mb-3">אחריות סביבתית</h3>
              <p className="text-sm font-light text-neutral-600 leading-relaxed">
                אנו משתדלים להפחית פסולת אריזה ולפעול באחריות סביבתית
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white">
        <div className="container mx-auto px-4 py-20 md:py-32 max-w-5xl text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6">
            הצטרפו למשפחת TORINO
          </h2>
          <p className="text-lg font-light text-neutral-400 mb-12 max-w-2xl mx-auto">
            אלפי לקוחות כבר נהנים מהשירות שלנו.<br />
            הגיע הזמן שגם אתם תחוו את ההבדל.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="px-8 py-4 bg-white text-black text-sm font-light tracking-wide hover:bg-neutral-100 transition-colors"
            >
              התחל לקנות עכשיו
            </a>
            <a
              href="/register"
              className="px-8 py-4 border border-white text-white text-sm font-light tracking-wide hover:bg-white hover:text-black transition-colors"
            >
              הירשם חינם
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-neutral-200">
        <div className="container mx-auto px-4 py-20 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-light tracking-widest uppercase text-neutral-500 mb-6">
                יצירת קשר
              </h2>
              <h3 className="text-3xl font-light mb-8">
                רוצים לדעת עוד?
              </h3>
              <p className="font-light text-neutral-600 leading-relaxed">
                יש לכם שאלות? רוצים להציע שיתוף פעולה? נשמח לשמוע מכם!
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-light tracking-widest uppercase text-neutral-500 mb-2">דוא״ל</p>
                <a href="mailto:torino900100@gmail.com" className="text-xl font-light hover:text-neutral-600 transition-colors">
                  torino900100@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Message */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="container mx-auto px-4 py-16 max-w-5xl text-center">
          <p className="text-2xl font-light mb-2">
            תודה שבחרתם ב-TORINO
          </p>
          <p className="text-sm font-light text-neutral-600">
            אנו מצפים לשרת אתכם ולהיות חלק מחוויית הקנייה המושלמת שלכם
          </p>
        </div>
      </section>
    </div>
  );
}
