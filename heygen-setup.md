# إعداد Heygen API - دليل سريع

## المشكلة الحالية
يواجه الموقع مشكلة في الاتصال بـ Heygen API. إليك الخطوات لحلها:

## الخطوات المطلوبة:

### 1. الحصول على Avatar ID
- سجل دخولك إلى [Heygen Dashboard](https://app.heygen.com)
- اذهب إلى قسم "Avatars" أو "Characters"
- أنشئ شخصية كرتونية جديدة أو اختر واحدة موجودة
- انسخ الـ Avatar ID (مثل: `avatar_xxxxx`)

### 2. الحصول على Voice ID الصحيح
- في Heygen Dashboard، اذهب إلى قسم "Voices"
- ابحث عن الأصوات العربية السعودية المتاحة
- انسخ الـ Voice ID الصحيح (مثل: `ar-SA-Male`, `ar-SA-Female`, أو `ar-SA`)

### 3. تحديث الكود
افتح ملف `script.js` وابحث عن:
```javascript
avatar_id: 'default'
voice_id: 'ar-SA-Male'
```

استبدلهما بالـ IDs الصحيحة من حسابك:
```javascript
avatar_id: 'avatar_xxxxx' // استبدل بـ Avatar ID الخاص بك
voice_id: 'ar-SA-Male'    // استبدل بـ Voice ID الصحيح
```

### 4. التحقق من مفتاح API
- تأكد من أن مفتاح API صحيح ولم تنته صلاحيته
- المفتاح الحالي: `sk_V2_hgu_kXEKoQ8bGyO_22ZdR33UYzQDJDsV7ToP4qBHFd6yZPzX`
- يمكنك الحصول على مفتاح جديد من [Heygen API Settings](https://app.heygen.com/settings/api)

### 5. اختبار API
بعد التحديث:
1. افتح الموقع
2. أجب على سؤال واضغط "تحقق من الإجابة"
3. اضغط "تحويل إلى فيديو"
4. افتح Console (F12) لرؤية تفاصيل الخطأ إن وجد

## ملاحظات مهمة:
- قد تحتاج إلى اشتراك مدفوع في Heygen لاستخدام API
- بعض الميزات (مثل الشخصيات الكرتونية) قد تتطلب تفعيل خاص
- تأكد من أن حسابك لديه رصيد كافٍ لإنشاء الفيديوهات

## رابط الوثائق:
[Heygen API Documentation](https://docs.heygen.com)

