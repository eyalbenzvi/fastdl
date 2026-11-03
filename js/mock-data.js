/* נתוני דמה – נטען כ-<script src="js/mock-data.js"> כדי שהאתר יעבוד גם מ-file:// בלי fetch. מקור: data/mock-data.json */
window.FD_DATA = {
  "_note": "נתוני דמה לאב-טיפוס בלבד. כל הנתונים בדויים. 'now' ברירת מחדל: 2026-08-25T02:12 (יום ג׳). ימי עסקים: א׳–ה׳.",
  "service": {
    "name": "רישיון עד הבית",
    "operator": "דפוס בארי",
    "domain": "fastdl.co.il",
    "authorization_line": "השירות מופעל בהרשאת משרד התחבורה ולפי הנחיותיו",
    "call_center": {
      "phone": "077-998-5095",
      "hours": [
        {
          "days": "א׳–ה׳",
          "time": "08:00–17:00"
        },
        {
          "days": "שישי וערבי חג",
          "time": "08:00–13:00"
        }
      ]
    },
    "mot_call_center": "*5678",
    "sms_sender": "[לאישור]",
    "written_response_sla": "[לאישור]"
  },
  "citizen": {
    "first_name": "ישראלה",
    "last_name": "ישראלי",
    "id_number": "000000018",
    "mobile": "054-1234567",
    "mobile_masked": "054-•••-4567",
    "moin_address": {
      "street": "העצמאות",
      "house": "10",
      "city": "באר שבע",
      "zip": "[לאישור]",
      "display": "רחוב העצמאות 10, באר שבע"
    },
    "photo_required": false
  },
  "request": {
    "document_type": "רישיון נהיגה",
    "received_at": "2026-08-24T05:12",
    "received_display": "יום ב׳, 24.8.2026, 05:12",
    "window_closes_at": "2026-08-26T05:12",
    "window_closes_display": "יום ד׳, 26.8.2026 בשעה 05:12",
    "countdown_reliable": true,
    "remaining_display": "נותרו כ-27 שעות"
  },
  "delivery_methods": [
    {
      "id": "pickup_bari",
      "group": "איסוף עצמי",
      "name": "איסוף מדפוס בארי",
      "price": 0,
      "price_display": "ללא עלות",
      "eta_rule": "למחרת יום ההזמנה, מ-11:00",
      "eta_display": "זמין לאיסוף מיום ד׳ 26.8, 11:00",
      "tracking": false,
      "tags": [
        "ללא עלות",
        "הכי מהיר"
      ],
      "needs_address": false,
      "address": "[לאישור]",
      "hours": "[לאישור]",
      "fit": "למי שגרים בדרום ורוצים את הרישיון מהר ובחינם",
      "benefits": ["ללא עלות","למחרת יום ההזמנה מ-11:00"],
      "how": "באיסוף, עם תעודה מזהה"
    },
    {
      "id": "pickup_tlv_airport",
      "group": "איסוף עצמי",
      "name": "איסוף מנתב״ג",
      "price": 118,
      "price_display": "118 ₪",
      "eta_rule": "זמין תוך יום עסקים",
      "eta_display": "זמין לאיסוף מיום ד׳ 26.8",
      "tracking": false,
      "tags": [],
      "needs_address": false,
      "address": "טרמינל 3, אולם מקבלי הפנים, ליד שער יציאה 1, עמדת \"על הקו\" [לאמת מול כתובת: כרמלית 3]",
      "hours": "א׳–ה׳ 07:00–22:00 · שישי וערבי חג עד 15:00",
      "hold_days": "[לאישור]",
      "fit": "למי שגרים במרכז או עוברים בנתב״ג",
      "benefits": ["פתוח עד 22:00","בלי לחכות לשליח"],
      "how": "באיסוף, עם תעודה מזהה"
    },
    {
      "id": "express_home",
      "group": "משלוח עד הבית",
      "name": "משלוח מהיר עד הבית",
      "price": 177,
      "price_display": "177 ₪",
      "eta_rule": "עד יום עסקים אחד",
      "eta_display": "יגיע עד יום ד׳ 26.8",
      "tracking": true,
      "tags": [
        "הכי מהיר עד הבית"
      ],
      "needs_address": true,
      "fit": "למי שצריכים את הרישיון מחר, בלי לצאת מהבית",
      "benefits": ["שליח מוסר לכם ביד","מעקב משלוח","בלי לצאת מהבית"],
      "how": "ביד, מהשליח"
    },
    {
      "id": "regular_home",
      "group": "משלוח עד הבית",
      "name": "משלוח רגיל עד הבית",
      "price": 41,
      "price_display": "41 ₪",
      "eta_rule": "2–5 ימי עסקים",
      "eta_display": "יגיע בין 27.8 ל-1.9",
      "tracking": true,
      "tags": [],
      "needs_address": true,
      "fit": "מסירה ביד עם מעקב, בלי לחץ זמן",
      "benefits": ["שליח מוסר לכם ביד","מעקב משלוח"],
      "how": "ביד, מהשליח"
    },
    {
      "id": "registered_mail",
      "group": "בדואר",
      "name": "דואר רשום",
      "price": 14.99,
      "price_display": "14.99 ₪",
      "eta_rule": "עד 14 ימי עסקים",
      "eta_display": "יגיע עד 14.9",
      "tracking": true,
      "tags": [],
      "needs_address": true,
      "fit": "מעקב דואר במחיר נמוך",
      "benefits": ["מעקב של דואר ישראל"],
      "how": "בדואר, עם מעקב"
    },
    {
      "id": "regular_mail",
      "group": "בדואר",
      "name": "דואר רגיל",
      "price": 0,
      "price_display": "ללא עלות",
      "eta_rule": "עד 14 ימי עסקים",
      "eta_display": "יגיע עד 14.9",
      "tracking": false,
      "tags": [
        "ללא עלות",
        "ללא מעקב"
      ],
      "needs_address": true,
      "fit": "ברירת המחדל אם לא בוחרים. נמסר לתיבה רק אם יש עליה שם מזהה",
      "benefits": [],
      "how": "בתיבת הדואר, ללא מעקב"
    }
  ],
  "order_example": {
    "order_number": "FD-2026-0841273",
    "method_id": "express_home",
    "production": "immediate",
    "production_display": "ייצור מיידי – קובץ הייצור של 25.8.2026 ב-07:00",
    "amount": 177
  },
  "states": {
    "S0": {
      "badge": "לא נמצאה בקשה",
      "tone": "neutral",
      "timeline_step": 0
    },
    "S1": {
      "badge": "אפשר להזמין",
      "tone": "success",
      "timeline_step": 2
    },
    "S2": {
      "badge": "הזמנה בוצעה",
      "tone": "info",
      "timeline_step": 2,
      "order_editable_until": "26.8.2026 בשעה 05:12",
      "method": "איסוף מנתב״ג",
      "paid": "118 ₪"
    },
    "S3": {
      "badge": "בייצור",
      "tone": "info",
      "timeline_step": 3,
      "production_at": "25.8.2026, 07:00",
      "method_display_variants": [
        "דואר רגיל (לא בוצעה הזמנה)",
        "משלוח מהיר עד הבית"
      ]
    },
    "S4": {
      "badge": "בדרך אליכם",
      "tone": "info",
      "timeline_step": 4,
      "shipped_at": "25.8.2026",
      "method": "משלוח מהיר עד הבית",
      "carrier": "[שם חברת השילוח]",
      "tracking_number": "123456789",
      "eta": "עד יום ד׳, 26.8.2026"
    },
    "S5": {
      "badge": "מחכה לכם",
      "tone": "success",
      "timeline_step": 4,
      "pickup_point": "pickup_tlv_airport",
      "ready_since": "26.8.2026",
      "pickup_until": "[לאישור]"
    },
    "S6": {
      "badge": "נמסרה",
      "tone": "success",
      "timeline_step": 5,
      "delivered_at": "26.8.2026",
      "now_override": "2026-08-27"
    },
    "S7": {
      "badge": "לא אושרה מסירה",
      "tone": "warning",
      "timeline_step": 4,
      "shipped_at": "26.8.2026",
      "method": "דואר רגיל",
      "business_days_elapsed": 21,
      "delivery_status": "אין תיעוד מסירה",
      "reissue_eligible": true,
      "now_override": "2026-09-24"
    },
    "S8": {
      "badge": "המסירה נכשלה",
      "tone": "danger",
      "timeline_step": 4,
      "now_override": "2026-08-28"
    },
    "S9": {
      "badge": "2 בקשות",
      "tone": "neutral",
      "documents": [
        {
          "type": "רישיון נהיגה",
          "state": "S1"
        },
        {
          "type": "תג חניה לנכה",
          "state": "S3"
        }
      ]
    }
  },
  "timeline_labels": [
    "הבקשה התקבלה",
    "בחירת משלוח",
    "בייצור",
    "נשלחה",
    "נמסרה"
  ],
  "faq_categories": [
    "אגרה ותשלום",
    "צילום",
    "הזמנה ומשלוח",
    "מסירה ובעיות"
  ],
  "maintenance": {
    "active": false,
    "html": "ביום ו׳ <span class=\"num\" dir=\"ltr\">4.9</span> בין <span class=\"num\" dir=\"ltr\">22:00</span> ל-<span class=\"num\" dir=\"ltr\">23:00</span> האתר לא יהיה זמין לצורך תחזוקה."
  }
};
