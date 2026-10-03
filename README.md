# سكاي آيكون

منصة عربية لإدارة السفر والسياحة والحج والعمرة، مع محاسبة متعددة العملات.

## العملة الأساسية

USD — الدولار الأمريكي.

العملات الإضافية الافتراضية: YER وSAR.

## الوضع الحالي

المشروع الأصلي تطبيق Electron بواجهة HTML/CSS/JavaScript وتخزين محلي. تتم المحافظة على الوحدات الحالية أثناء بناء طبقة الويب والسحابة تدريجيًا.

## البنية المستهدفة

- Vercel: موقع العملاء ولوحة الإدارة.
- Supabase PostgreSQL: قاعدة البيانات والمصادقة والتخزين.
- GitHub: إدارة الكود والإصدارات.
- Cloudflare: DNS وSSL والحماية عند ربط النطاق.

## التشغيل المحلي الحالي

```bash
npm install
npm start
```

## إعداد Supabase

نفّذ ملفات الترحيل بالترتيب من SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_security_accounting.sql`
3. `supabase/migrations/003_rls_policies.sql`

انسخ `.env.example` إلى `.env` عند التشغيل المحلي. استخدم `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY` في الواجهة فقط. لا تضع `SUPABASE_SERVICE_ROLE_KEY` في المتصفح أو Git.

## قواعد البيانات

لا تُستخدم ملفات `sync-data` كمصدر إنتاجي. يجب تنظيفها وأخذ نسخة احتياطية قبل أي ترحيل إلى Supabase.

## الفروع

- `main`: النسخة الحالية المستقرة.
- `feature/platform-foundation`: فرع ترحيل المنصة السحابية.
