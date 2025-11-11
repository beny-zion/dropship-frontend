export const metadata = {
  title: 'מדיניות משלוחים | TORINO',
  description: 'מדיניות המשלוחים וההפצה שלנו',
};

export default function ShippingPage() {
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
                <h3 className="font-normal text-lg mb-2">משלוח רגיל (3-5 ימי עסקים)</h3>
                <p className="text-neutral-600 text-sm mb-2">
                  המשלוח הסטנדרטי שלנו מגיע תוך 3-5 ימי עסקים ממועד אישור ההזמנה.
                </p>
                <p className="text-sm">עלות: ₪25 | משלוח חינם בהזמנות מעל ₪200</p>
              </div>

              <div className="border border-neutral-200 p-6">
                <h3 className="font-normal text-lg mb-2">משלוח מהיר (1-2 ימי עסקים)</h3>
                <p className="text-neutral-600 text-sm mb-2">
                  לאלו שזקוקים למוצר בדחיפות, אנו מציעים משלוח מהיר תוך 1-2 ימי עסקים.
                </p>
                <p className="text-sm">עלות: ₪50</p>
              </div>

              <div className="border border-neutral-200 p-6">
                <h3 className="font-normal text-lg mb-2">איסוף עצמי</h3>
                <p className="text-neutral-600 text-sm mb-2">
                  ניתן לאסוף את ההזמנה במשרדינו לאחר קבלת הודעה על מוכנות ההזמנה.
                </p>
                <p className="text-sm">עלות: חינם</p>
              </div>
            </div>
          </section>

          {/* תהליך המשלוח */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">תהליך המשלוח</h2>
            <div className="space-y-6">
              {[
                { num: '1', title: 'אישור הזמנה', desc: 'לאחר ביצוע ההזמנה, תקבלו אישור בדוא"ל/SMS תוך מספר דקות.' },
                { num: '2', title: 'עיבוד ואריזה', desc: 'ההזמנה תעובד תוך 1-2 ימי עסקים. בשלב זה נארוז את המוצרים בקפידה.' },
                { num: '3', title: 'יציאה למשלוח', desc: 'תקבלו הודעה כולל מספר מעקב כאשר החבילה יוצאת למשלוח.' },
                { num: '4', title: 'קבלת המשלוח', desc: 'השליח ייצור קשר לתיאום זמן מסירה. במידה ואינכם נמצאים, יושאר פתק עם הוראות.' }
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
              <p>אנו משלחים לכל רחבי ישראל, כולל יישובים מרוחקים.</p>
              <p>עבור אזורים מרוחקים (כגון אילת, ערבה, הנגב הדרומי) עשוי להתווסף תוספת משלוח של ₪15-30.</p>
              <p>המשלוח מתבצע לכתובת שצוינה בהזמנה בלבד. במידה ונדרש שינוי כתובת, יש ליצור קשר לפני משלוח החבילה.</p>
            </div>
          </section>

          {/* מעקב */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">מעקב אחר משלוח</h2>
            <div className="space-y-4 text-neutral-700 text-sm">
              <p>כל משלוח כולל מספר מעקב (tracking number) שישלח אליכם בהודעה.</p>
              <p>ניתן לעקוב אחר המשלוח דרך אתר חברת השילוח או דרך עמוד "ההזמנות שלי" באתר.</p>
              <p>במקרה של עיכוב במשלוח, אנו נעדכן אתכם באופן פרואקטיבי.</p>
            </div>
          </section>

          {/* קבלת המשלוח */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">קבלת המשלוח</h2>
            <div className="space-y-4 text-neutral-700 text-sm">
              <p>בעת קבלת המשלוח, יש לבדוק את החבילה בפני השליח ולוודא שאין נזק חיצוני.</p>
              <p>במידה ויש נזק גלוי לאריזה, יש לסרב לקבלת המשלוח ולדווח לנו מיידית.</p>
              <p>לאחר חתימה על קבלת המשלוח, האחריות על המוצר עוברת אליכם.</p>
            </div>
          </section>

          {/* עלויות */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">עלויות משלוח</h2>
            <div className="border border-neutral-200">
              <div className="flex justify-between items-center p-4 border-b border-neutral-200">
                <span className="text-sm">משלוח רגיל</span>
                <span className="text-sm">₪25</span>
              </div>
              <div className="flex justify-between items-center p-4 border-b border-neutral-200">
                <span className="text-sm">משלוח מהיר</span>
                <span className="text-sm">₪50</span>
              </div>
              <div className="flex justify-between items-center p-4 border-b border-neutral-200">
                <span className="text-sm">תוספת אזור מרוחק</span>
                <span className="text-sm">₪15-30</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-neutral-50">
                <span className="text-sm font-normal">משלוח חינם</span>
                <span className="text-sm font-normal">בהזמנות מעל ₪200</span>
              </div>
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
