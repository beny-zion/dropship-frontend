export const metadata = {
  title: 'מדיניות פרטיות | TORINO',
  description: 'מדיניות הפרטיות ואבטחת המידע שלנו',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">מדיניות פרטיות</h1>

      <div className="prose prose-lg max-w-none space-y-8">
        {/* הקדמה */}
        <section>
          <p className="text-gray-600 mb-6">
            עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
          </p>
          <p>
            אנו מחויבים להגן על פרטיות המשתמשים שלנו. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים,
            ומגנים על המידע האישי שלך.
          </p>
        </section>

        {/* מידע שאנו אוספים */}
        <section>
          <h2 className="text-2xl font-bold mb-4">1. איזה מידע אנו אוספים?</h2>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold mb-2">מידע שאתה מספק לנו:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>שם מלא</li>
                <li>כתובת דוא&quot;ל</li>
                <li>מספר טלפון</li>
                <li>כתובת למשלוח</li>
                <li>פרטי תשלום (מאובטחים דרך ספק תשלומים חיצוני)</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold mb-2">מידע שנאסף אוטומטית:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>כתובת IP</li>
                <li>סוג דפדפן ומערכת הפעלה</li>
                <li>דפים שבקרת בהם באתר</li>
                <li>זמן וכשעות הביקורים שלך</li>
                <li>היסטוריית רכישות</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-bold mb-2">Cookies מאובטחים:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>token</strong> - Cookie מאובטח (HttpOnly) שמאפשר לך להישאר מחובר</li>
                <li>Cookie זה לא נגיש ל-JavaScript ומוגן מפני XSS attacks</li>
                <li>הנתונים מוצפנים ונשלחים באופן מאובטח בלבד (HTTPS)</li>
              </ul>
              <p className="mt-2 text-sm text-gray-600">
                Cookies אלו מאובטחים ברמה הגבוהה ביותר ומאפשרים לך להישאר מחובר בצורה בטוחה.
              </p>
            </div>
          </div>
        </section>

        {/* כיצד אנו משתמשים במידע */}
        <section>
          <h2 className="text-2xl font-bold mb-4">2. כיצד אנו משתמשים במידע?</h2>
          <div className="space-y-3">
            <p>
              2.1. <strong>עיבוד הזמנות:</strong> לצורך ביצוע ההזמנות שלך, משלוח מוצרים, וחיוב.
            </p>
            <p>
              2.2. <strong>תקשורת:</strong> לשלוח לך עדכונים על הזמנות, הודעות שירות, ותמיכה טכנית.
            </p>
            <p>
              2.3. <strong>שיפור השירות:</strong> לנתח את השימוש באתר כדי לשפר את החוויה.
            </p>
            <p>
              2.4. <strong>אבטחה:</strong> למנוע הונאות ולהגן על האתר והמשתמשים.
            </p>
            <p>
              2.5. <strong>שיווק:</strong> לשלוח לך מבצעים והצעות (רק אם נתת הסכמה).
            </p>
          </div>
        </section>

        {/* שירותי אימות צד שלישי */}
        <section>
          <h2 className="text-2xl font-bold mb-4">3. התחברות עם Google (OAuth 2.0)</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 space-y-3">
            <p>
              <strong>אנו מציעים אפשרות נוחה להירשם ולהתחבר באמצעות חשבון Google שלך.</strong>
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>מה אנו מקבלים מ-Google?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mr-4 text-sm">
                <li>שמך המלא</li>
                <li>כתובת האימייל שלך</li>
                <li>תמונת הפרופיל שלך (אם קיימת)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>מה אנו לא מקבלים?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mr-4 text-sm">
                <li>אנו <strong>לא</strong> מקבלים גישה לסיסמת Google שלך</li>
                <li>אנו <strong>לא</strong> יכולים לגשת לחשבון Gmail שלך</li>
                <li>אנו <strong>לא</strong> יכולים לבצע פעולות בשמך ב-Google</li>
              </ul>
            </div>
            <p className="text-sm">
              <strong>בקרת הרשאות:</strong> Google תבקש את הסכמתך המפורשת לשיתוף המידע הבסיסי לפני ההתחברות.
              תוכל לנתק את ההרשאה בכל עת דרך הגדרות חשבון Google שלך.
            </p>
            <p className="text-xs text-gray-600 mt-3">
              מדיניות הפרטיות של Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/privacy</a>
            </p>
          </div>
        </section>

        {/* שיתוף מידע עם צדדים שלישיים */}
        <section>
          <h2 className="text-2xl font-bold mb-4">4. האם אנו משתפים את המידע שלך?</h2>
          <div className="space-y-3">
            <p>
              אנו <strong>לא</strong> מוכרים או משכירים את המידע האישי שלך לצדדים שלישיים.
            </p>
            <p>
              עם זאת, אנו עשויים לשתף מידע עם:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>
                <strong>חברות שילוח:</strong> כדי לספק את המוצרים שהזמנת (שם, כתובת, טלפון בלבד).
              </li>
              <li>
                <strong>ספקי תשלומים:</strong> לעיבוד תשלומים מאובטחים (אנו לא שומרים פרטי כרטיס אשראי).
              </li>
              <li>
                <strong>ספקי שירותים טכניים:</strong> אחסון, ניתוח נתונים, תמיכה טכנית.
              </li>
              <li>
                <strong>רשויות חוק:</strong> אם נדרש על פי חוק או לצורך אכיפת זכויותינו.
              </li>
            </ul>
          </div>
        </section>

        {/* אבטחת מידע */}
        <section>
          <h2 className="text-2xl font-bold mb-4">5. כיצד אנו מגנים על המידע שלך?</h2>
          <div className="space-y-3">
            <p>
              4.1. <strong>הצפנה:</strong> כל התקשורת עם האתר מוצפנת באמצעות HTTPS.
            </p>
            <p>
              4.2. <strong>אימות:</strong> שימוש ב-JWT (JSON Web Tokens) לאימות מאובטח.
            </p>
            <p>
              4.3. <strong>הגנה על סיסמאות:</strong> הסיסמאות שלך מוצפנות באמצעות bcrypt ולא נשמרות בטקסט פשוט.
            </p>
            <p>
              4.4. <strong>הגבלת גישה:</strong> רק עובדים מורשים יכולים לגשת למידע אישי, ורק כשהדבר נחוץ.
            </p>
            <p>
              4.5. <strong>ניטור:</strong> אנו מנטרים באופן קבוע את המערכות שלנו לאיתור איומי אבטחה.
            </p>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>שים לב:</strong> למרות שאנו נוקטים באמצעים מתקדמים להגנה על המידע שלך, אף שיטת אבטחה אינה בטוחה ב-100%.
              אנו ממליצים להשתמש בסיסמאות חזקות ולא לשתף את פרטי ההתחברות שלך עם אחרים.
            </p>
          </div>
        </section>

        {/* זכויותיך */}
        <section>
          <h2 className="text-2xl font-bold mb-4">6. מהן הזכויות שלך?</h2>
          <div className="space-y-3">
            <p>
              על פי חוק הגנת הפרטיות, תשמ&quot;א-1981, יש לך את הזכויות הבאות:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>
                <strong>זכות עיון:</strong> לבקש עותק של כל המידע האישי שיש לנו עליך.
              </li>
              <li>
                <strong>זכות תיקון:</strong> לבקש לתקן מידע לא מדויק או לא שלם.
              </li>
              <li>
                <strong>זכות מחיקה:</strong> לבקש למחוק את המידע האישי שלך (בכפוף להגבלות חוקיות).
              </li>
              <li>
                <strong>זכות התנגדות:</strong> להתנגד לעיבוד מידע למטרות שיווק.
              </li>
              <li>
                <strong>זכות להגבלה:</strong> לבקש להגביל את השימוש במידע שלך.
              </li>
              <li>
                <strong>זכות לניידות:</strong> לקבל את המידע שלך בפורמט מובנה.
              </li>
            </ul>
            <p className="mt-4">
              לממש את זכויותיך, אנא צור איתנו קשר ב-<a href="mailto:torino900100@gmail.com" className="text-lime-600 hover:text-lime-700 underline">torino900100@gmail.com</a>
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-2xl font-bold mb-4">7. שימוש ב-Cookies מאובטחים</h2>
          <div className="space-y-3">
            <p>
              7.1. <strong>Cookies אימות:</strong> אנו משתמשים ב-HttpOnly Cookies מאובטחים לשמירת מצב ההתחברות שלך.
            </p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mr-4">
              <h4 className="font-bold mb-2">מה זה HttpOnly Cookie?</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Cookie שלא נגיש לקוד JavaScript באתר</li>
                <li>מוגן מפני XSS (Cross-Site Scripting) attacks</li>
                <li>נשלח אוטומטית רק לשרת שלנו</li>
                <li>מוצפן ומאובטח (Secure flag)</li>
                <li>מוגן מפני CSRF attacks (SameSite flag)</li>
              </ul>
            </div>
            <p>
              7.2. <strong>Cookies אנליטיים:</strong> אנו עשויים להשתמש ב-cookies אנליטיים כדי להבין כיצד משתמשים מתנהגים באתר ולשפר את החוויה.
            </p>
            <p>
              7.3. <strong>משך שמירה:</strong> ה-cookies נשמרים עד 7 ימים או עד להתנתקות מהאתר.
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-bold mb-2">כיצד לנהל Cookies?</h4>
            <p className="text-sm">
              רוב הדפדפנים מאפשרים לך לחסום או למחוק cookies דרך ההגדרות. עם זאת, חסימת cookies תמנע ממך להתחבר לאתר.
              תוכל תמיד להתנתק מהאתר ו-cookies האימות יימחקו אוטומטית.
            </p>
          </div>
        </section>

        {/* שמירת מידע */}
        <section>
          <h2 className="text-2xl font-bold mb-4">8. כמה זמן אנו שומרים את המידע?</h2>
          <div className="space-y-3">
            <p>
              7.1. אנו שומרים את המידע האישי שלך כל עוד החשבון שלך פעיל.
            </p>
            <p>
              7.2. לאחר סגירת חשבון, נמחק את רוב המידע תוך 90 יום.
            </p>
            <p>
              7.3. מידע מסוים (כמו היסטוריית הזמנות וחשבוניות) נשמר למשך 7 שנים בהתאם לדרישות חוקיות.
            </p>
          </div>
        </section>

        {/* קטינים */}
        <section>
          <h2 className="text-2xl font-bold mb-4">9. פרטיות קטינים</h2>
          <div className="space-y-3">
            <p>
              8.1. האתר מיועד למשתמשים מעל גיל 18.
            </p>
            <p>
              8.2. אנו לא אוספים במודע מידע מילדים מתחת לגיל 18.
            </p>
            <p>
              8.3. אם הנך הורה וגילית שילדך שיתף איתנו מידע, אנא צור קשר ונמחק את המידע.
            </p>
          </div>
        </section>

        {/* שינויים במדיניות */}
        <section>
          <h2 className="text-2xl font-bold mb-4">10. שינויים במדיניות פרטיות</h2>
          <div className="space-y-3">
            <p>
              9.1. אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת.
            </p>
            <p>
              9.2. שינויים מהותיים יפורסמו באתר ו/או יישלחו אליך בדוא&quot;ל.
            </p>
            <p>
              9.3. המשך השימוש באתר לאחר שינויים מהווה הסכמה למדיניות המעודכנת.
            </p>
          </div>
        </section>

        {/* קישורים לאתרים חיצוניים */}
        <section>
          <h2 className="text-2xl font-bold mb-4">11. קישורים לאתרים חיצוניים</h2>
          <div className="space-y-3">
            <p>
              10.1. האתר שלנו עשוי להכיל קישורים לאתרים חיצוניים.
            </p>
            <p>
              10.2. אנו לא אחראים על מדיניות הפרטיות או התוכן של אתרים אלו.
            </p>
            <p>
              10.3. אנו ממליצים לקרוא את מדיניות הפרטיות של כל אתר שאליו אתה מועבר.
            </p>
          </div>
        </section>

        {/* יצירת קשר */}
        <section className="bg-gradient-to-r from-lime-50 to-green-50 p-6 rounded-lg border border-lime-200">
          <h2 className="text-2xl font-bold mb-4">יצירת קשר בנושא פרטיות</h2>
          <p className="mb-4">
            אם יש לך שאלות, בקשות, או חששות לגבי מדיניות הפרטיות שלנו, אנא צור קשר:
          </p>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border border-lime-300">
              <p className="font-bold mb-2">טורינו יבוא וסחר בע״מ</p>
              <ul className="list-none space-y-2">
                <li className="flex items-center gap-2">
                  <strong className="min-w-[120px]">דוא&quot;ל:</strong>
                  <a href="mailto:torino900100@gmail.com" className="text-lime-600 hover:text-lime-700 font-semibold">
                    torino900100@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <strong className="min-w-[120px]">שעות מענה:</strong>
                  <span className="text-gray-700">אנו עונים לפניות במייל בתוך 48 שעות</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              בעתיד נוסיף גם תמיכה ב-WhatsApp וצ׳אט חי באתר לשירות מהיר יותר.
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            נשתדל להגיב לפנייתך תוך 30 יום בהתאם לדרישות חוק הגנת הפרטיות.
          </p>
        </section>

        {/* הסכמה */}
        <section className="border-t pt-6">
          <p className="font-semibold">
            השימוש באתר מהווה הסכמה למדיניות פרטיות זו. אם אינך מסכים, אנא הימנע משימוש באתר.
          </p>
        </section>
      </div>
    </div>
  );
}
