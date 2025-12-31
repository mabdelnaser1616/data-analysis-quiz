# دليل رفع المشروع على Vercel

## الخطوات:

### 1. إنشاء حساب على Vercel
- اذهب إلى [vercel.com](https://vercel.com)
- سجل دخول بحساب GitHub/GitLab/Bitbucket

### 2. إعداد المشروع

#### أ) رفع الكود على GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

#### ب) ربط المشروع مع Vercel
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اضغط "Add New Project"
3. اختر المستودع (Repository) الخاص بك
4. اضغط "Import"

### 3. إعداد Environment Variables (المتغيرات البيئية)

في صفحة إعدادات المشروع على Vercel، أضف المتغيرات التالية:

```
DID_API_KEY=bWFiZGVsbmFzZXIxNzE3QGdtYWlsLmNvbQ:CZjkw80kd5V00wgq3G8-E
DID_PRESENTER_ID=amy-jcwCkr1grs
DID_SOURCE_URL=https://i.postimg.cc/LXjJtfd8/5.jpg
ELEVENLABS_VOICE_ID=s83SAGdFTflAwJcAV81K
```

**كيفية إضافة Environment Variables:**
1. اذهب إلى Project Settings
2. اضغط على "Environment Variables"
3. أضف كل متغير على حدة
4. اضغط "Save"
5. أعد نشر المشروع (Redeploy)

### 4. النشر

بعد ربط المشروع، Vercel سينشره تلقائياً. يمكنك أيضاً:
- النشر يدوياً من Dashboard
- استخدام Vercel CLI:
  ```bash
  npm i -g vercel
  vercel
  ```

### 5. تحديث ChatGPT API Key

**مهم:** ChatGPT API Key يجب أن يكون في `script.js` لأنه يعمل من المتصفح (Client-side).

**تحذير أمني:** 
- لا تضع API Keys في الكود المصدري إذا كان المستودع عاماً
- استخدم Environment Variables للـ Server-side APIs فقط
- ChatGPT API Key يجب أن يكون في الكود لأنه Client-side

### 6. اختبار الموقع

بعد النشر، افتح الرابط الذي يعطيك Vercel واختبر:
- الإجابة على الأسئلة
- التحقق من الإجابات
- إنشاء الفيديو

## ملاحظات مهمة:

1. **CORS:** Vercel serverless functions تدعم CORS تلقائياً
2. **API Limits:** تأكد من أن لديك رصيد كافي في D-ID و ElevenLabs
3. **Timeout:** Vercel functions لها timeout limit (10 ثواني للـ Hobby plan)
4. **Logs:** يمكنك رؤية logs من Vercel Dashboard → Deployments → Function Logs

## استكشاف الأخطاء:

### إذا فشل النشر:
- تحقق من `package.json` و `vercel.json`
- تأكد من أن جميع dependencies موجودة
- راجع Logs في Vercel Dashboard

### إذا فشلت API Calls:
- تحقق من Environment Variables
- تأكد من صحة API Keys
- راجع Function Logs في Vercel

### إذا ظهرت أخطاء CORS:
- تأكد من أن CORS headers موجودة في serverless functions
- تحقق من أن URLs صحيحة في `script.js`

## الدعم:

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)

