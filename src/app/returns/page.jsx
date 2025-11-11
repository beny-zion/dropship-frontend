export const metadata = {
  title: 'מדיניות החזרות והחלפות | TORINO',
  description: 'מדיניות ההחזרות, ההחלפות וביטול עסקאות',
};

export default function ReturnsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            מדיניות החזרות והחלפות
          </h1>
          <p className="text-neutral-600 font-light">
            עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-16 font-light">
          {/* זכות ביטול */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">זכות הביטול - 14 יום</h2>
            <div className="space-y-4 text-neutral-700">
              <p>
                על פי חוק הגנת הצרכן, יש לך זכות לבטל עסקה תוך <strong className="font-normal">14 יום מיום קבלת המוצר</strong>, ללא צורך למסור סיבה ובלי קנסות.
              </p>
              <div className="border border-neutral-200 p-6 mt-6">
                <p className="font-normal mb-3">תנאים:</p>
                <ul className="space-y-2 text-sm">
                  <li>• המוצר חייב להיות באריזתו המקורית ובמצב תקין</li>
                  <li>• המוצר לא נפתח, לא שומש ולא ניזוק</li>
                  <li>• יש לצרף את כל האביזרים והמסמכים שהגיעו עם המוצר</li>
                </ul>
              </div>
            </div>
          </section>

          {/* תהליך ביטול */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">כיצד לבטל עסקה?</h2>
            <div className="space-y-6">
              {[
                { num: '1', title: 'צור קשר', desc: 'פנה אלינו בדוא"ל torino900100@gmail.com עם מספר ההזמנה שלך.' },
                { num: '2', title: 'קבל אישור', desc: 'נשלח לך אישור על הביטול ופרטי החזרה (כתובת, תווית משלוח אם רלוונטי).' },
                { num: '3', title: 'ארוז את המוצר', desc: 'ארוז את המוצר באריזה המקורית עם כל האביזרים והמסמכים.' },
                { num: '4', title: 'שלח את המוצר', desc: 'שלח את המוצר בדואר רשום לכתובת שנמסרה לך. שמור את אסמכתת המשלוח.' },
                { num: '5', title: 'קבל החזר כספי', desc: 'תוך 14 ימי עסקים מקבלת המוצר במחסנינו, נחזיר לך את מלוא התשלום.' }
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

          {/* החלפת מוצר */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">החלפת מוצר</h2>
            <div className="space-y-4 text-neutral-700 text-sm">
              <p>ניתן להחליף מוצר בגודל/צבע/דגם אחר תוך 14 יום מקבלת המוצר.</p>
              <p>ההחלפה כפופה לזמינות במלאי.</p>
              <p>אם המוצר החלופי יקר יותר, תחויב בהפרש המחיר.</p>
              <p>אם המוצר החלופי זול יותר, נחזיר לך את ההפרש.</p>
              <div className="border-t border-neutral-200 pt-4 mt-6">
                <p className="font-normal mb-2">איך להחליף?</p>
                <p>צור קשר בדוא"ל, ציין את המוצר שברצונך להחליף ואת המוצר המבוקש. נבדוק זמינות ונעדכן אותך על השלבים הבאים.</p>
              </div>
            </div>
          </section>

          {/* מוצר פגום */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">מוצר פגום או שגוי</h2>
            <div className="space-y-4 text-neutral-700 text-sm">
              <p>אם קיבלת מוצר פגום, לא תקין, או שגוי:</p>
              <p>• <strong className="font-normal">דווח מיידית</strong> - צור קשר תוך 48 שעות מקבלת המוצר.</p>
              <p>• <strong className="font-normal">תעד את הבעיה</strong> - שלח תמונות של המוצר הפגום.</p>
              <p>• <strong className="font-normal">פתרון מהיר</strong> - נציע החלפה מיידית או החזר כספי מלא, כרצונך.</p>
              <p>• <strong className="font-normal">עלות המשלוח עלינו</strong> - במקרים אלו, נשלח שליח לאסוף את המוצר הפגום ללא עלות.</p>
            </div>
          </section>

          {/* החזר כספי */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">החזר כספי</h2>
            <div className="space-y-4 text-neutral-700 text-sm">
              <p>החזר כספי יבוצע לאותו אמצעי תשלום בו שימשת לרכישה.</p>
              <p>משך הזמן להחזר: 14 ימי עסקים מרגע קבלת המוצר המוחזר במחסנינו.</p>
              <p>יש לציין שחברות כרטיסי האשראי עשויות לקחת 1-2 חיובים נוספים עד שההחזר יופיע בחשבונך.</p>
              <p>נחזיר את מלוא עלות המוצר + עלות המשלוח המקורי (אם שילמת).</p>
              <p>עלות משלוח ההחזרה תהיה על חשבונך, אלא אם המוצר פגום או שגוי.</p>
            </div>
          </section>

          {/* יצירת קשר */}
          <section className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl md:text-3xl font-light mb-6">צריך עזרה?</h2>
            <p className="text-neutral-600 mb-4">אנחנו כאן לעזור לך! צור איתנו קשר:</p>
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
