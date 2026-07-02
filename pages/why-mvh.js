import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'

function BrandName() {
  return <strong style={{ color: BROWN, fontWeight: 800 }}>מאז ועד היום</strong>
}

export default function WhyMvh() {
  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>למה מאז ועד היום | מאז ועד היום</title>
        <meta name="description" content="למה בחרנו לבנות את מאז ועד היום סביב האנשים שמובילים את הסיורים, ולא רק סביב המקומות." />
      </Head>
      <Header />

      <main style={{ flex: 1, maxWidth: 680, margin: '0 auto', padding: '56px 24px 72px', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 900, color: '#1a1a1a', marginBottom: 32, letterSpacing: '-0.4px' }}>
          למה <BrandName />
        </h1>

        <div style={{ fontSize: 17, lineHeight: 1.9, color: '#333' }}>
          <p style={{ marginBottom: 22 }}>
            בשנים האחרונות הפך להיות קל יותר למצוא מידע על מקומות, אבל לא בהכרח קל יותר למצוא את האנשים הנכונים שיכולים לעזור לנו להבין אותם.
          </p>

          <p style={{ marginBottom: 22 }}>
            מורי דרך עובדים שנים כדי להכיר לעומק ערים, שכונות, תקופות, קהילות וסיפורים. חלקם מתמחים באזור גיאוגרפי מסוים, אחרים בנושא, תקופה או קהל מאוד מסוים. הרבה מהידע, הניסיון והאישיות שהם מביאים איתם פשוט לא עוברים דרך מנוע חיפוש או רשימת תוצאות ארוכה.
          </p>

          <p style={{ marginBottom: 22 }}>
            <BrandName /> נולד מתוך מחשבה פשוטה.
          </p>

          <p style={{ marginBottom: 22 }}>
            אולי הדרך הטובה ביותר לבחור סיור היא לא לפי מחיר, מיקום או מספר כוכבים, אלא קודם כל לפי האדם שמוביל אותו.
          </p>

          <p style={{ marginBottom: 22 }}>
            אנחנו רוצים להקל על אנשים למצוא מורי דרך שמתאימים למה שמעניין אותם, ולהקל על מורי הדרך להגיע לקהל שמחפש בדיוק את סוג החוויה שהם יודעים ליצור.
          </p>

          <p style={{ marginBottom: 22 }}>
            לא כל מדריך מתאים לכל מטייל, ולא כל מטייל מחפש את אותו הדבר.
            <br />
            יש מי שמחפש היסטוריה, יש מי שמחפש אוכל, יש מי שמעדיף טבע, תרבות, אדריכלות, משפחות, צילום או נושאים הרבה יותר ספציפיים.
            <br />
            יש מי שמחפש סיור בתל אביב, בירושלים או בגליל, ויש מי שמחפש דווקא סיור בליסבון, בלונדון או בטוקיו.
          </p>

          <p style={{ marginBottom: 22 }}>
            אנחנו מאמינים שככל שיהיה קל יותר למצוא את האדם הנכון, כך יהיה קל יותר למצוא גם את הסיור הנכון.
          </p>

          <p style={{ marginBottom: 22 }}>
            במקביל לעבודה על הפלטפורמה התחלנו להקליט פרקים ראשונים לפודקאסט חדש עם מורי דרך, מתוך רצון להכיר טוב יותר את האנשים שמאחורי הסיורים, את הדרך שבה הם עובדים ואת נקודת המבט הייחודית שכל אחד מהם מביא איתו.
          </p>

          <p style={{ marginBottom: 22 }}>
            <BrandName /> עדיין נמצא בתחילת הדרך.
            <br />
            אנחנו בונים אותו יחד עם מורי הדרך ועם חברי הקהילה הראשונים שלנו, ומנסים לשפר אותו בכל גרסה מחדש.
          </p>

          <p>
            אם הגעתם לכאן מוקדם, תודה שאתם חלק מהמסע.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
