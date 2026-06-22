import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
      <Head>
        <title>מאז ועד היום</title>
        <meta name="description" content="המקומות הכי מסקרנים, האנשים שמכירים אותם הכי טוב, החוויות שלא תשכחו" />
      </Head>

      <header>
        <nav>
          <div>
            <Image src="/Logo-white.png" alt="לוגו" width={80} height={80} />
            <ul>
              <li>מצא מקומות</li>
              <li>הפודקאסט</li>
              <li>המדריכים</li>
              <li>אני מדריך</li>
            </ul>
          </div>
        </nav>
      </header>

      <main>
        <section>
          <div>
            <Image src="/Hero.png" alt="תמונה ראשית" width={1200} height={500} />
            <h1>כולם צריכים תירוץ טוב לצאת מהבית.</h1>
            <p>המקומות הכי מסקרנים<br/>האנשים שמכירים אותם הכי טוב<br/>החוויות שלא תשכחו</p>
            <button>מצא סיור</button>
            <button>הצטרפו לקהילה</button>
          </div>
        </section>

        <section>
          <h2>איך זה עובד?</h2>
          <div>
            <ol>
              <li>אנחנו בוחרים את המקומות הכי מסקרנים</li>
              <li>מחפשים את האנשים שמכירים אותם הכי טוב</li>
              <li>מקליטים איתם פרק פודקאסט מאז ועד היום</li>
              <li>משיגים לכם סיור במחיר מיוחד</li>
            </ol>
          </div>
        </section>

        <section>
          <h2>גלו מקומות דרך הסיפורים שלהם</h2>
          <div>
            {/* כרטיסי סיורים */}
            <div>
              <Image src="/Tours-Apolonia.png" alt="סיור אפולוניה" width={300} height={400} />
              <h3>אפולוניה</h3>
              <p>סיור עם מיכל לוי</p>
              <p>108 ₪ ← 120 ₪</p>
              <button>מצא סיור</button>
            </div>
            {/* כאן עוד כרטיסים כמו צפת, עיר דוד, כנסיות ירושלים */}
          </div>
        </section>

        <section>
          <h2>פגשו את האנשים שמספרים את הסיפורים</h2>
          <div>
            <div>
              <Image src="/Hero-Guide-F.png" alt="מיכל לוי" width={200} height={300} />
              <h3>מיכל לוי</h3>
              <p>ירושלים</p>
              <p>סיורים: 15</p>
              <button>פרופיל</button>
            </div>
            <div>
              <Image src="/Hero-Guide-M.png" alt="דניאל כהן" width={200} height={300} />
              <h3>דניאל כהן</h3>
              <p>צפת</p>
              <p>סיורים: 12</p>
              <button>פרופיל</button>
            </div>
          </div>
        </section>

        <section>
          <h2>חברי הקהילה משלמים פחות</h2>
          <div>
            <Image src="/CTA-Community.png" alt="קהילה" width={1200} height={400} />
            <p>הצטרפו לקהילה וקבלו 10% הנחה על כל הסיורים באתר.</p>
            <button>הצטרפו לקהילה</button>
          </div>
        </section>
      </main>

      <footer>
        <Image src="/Logo-black.png" alt="לוגו שחור" width={80} height={80} />
        <p>© כל הזכויות שמורות - מאז ועד היום</p>
      </footer>
    </div>
  );
}
