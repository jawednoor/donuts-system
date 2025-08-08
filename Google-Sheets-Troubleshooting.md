# دليل حل مشاكل Google Sheets Integration

## 🚨 المشاكل الشائعة والحلول

### 1. البيانات لا تصل إلى Google Sheets

#### الأسباب المحتملة:
- **مشكلة في صلاحيات Google Apps Script**
- **خطأ في رابط Web App**
- **مشكلة في إعدادات CORS**
- **خطأ في بنية البيانات المرسلة**

#### خطوات التشخيص:

1. **افتح Developer Console** (اضغط F12)
2. **انتقل إلى تبويب Console**
3. **أنشئ فاتورة جديدة وراقب الرسائل**

#### الرسائل المتوقعة:
```
🚀 بدء عملية إرسال البيانات إلى Google Sheets...
📤 البيانات المرسلة: [كائن JSON]
🔗 رابط API: [الرابط]
📨 استجابة الخادم: 200 OK
✅ نتيجة الإرسال: [النتيجة]
```

### 2. أخطاء CORS

إذا ظهرت رسالة خطأ تحتوي على "CORS":

1. **تحقق من إعدادات Google Apps Script**
2. **تأكد من أن Web App منشور للعموم**
3. **تحقق من أن الصلاحيات صحيحة**

### 3. خطأ HTTP 403 (Forbidden)

```
❌ HTTP Error 403: Forbidden
```

**الحل:**
1. انتقل إلى Google Apps Script
2. تأكد من أن Web App منشور كـ "Anyone"
3. أعد نشر Web App مع رقم إصدار جديد

### 4. خطأ HTTP 404 (Not Found)

```
❌ HTTP Error 404: Not Found
```

**الحل:**
- تحقق من صحة رابط Web App في المتغير `GOOGLE_APPS_SCRIPT_URL`

### 5. البيانات تصل ولكن لا تظهر في الجدول

**الحل:**
1. تحقق من اسم الجدول في Google Apps Script
2. تأكد من أن الأعمدة صحيحة (A, B, C, D, E, F)
3. تحقق من صلاحيات الكتابة في الجدول

## 🧪 اختبار النظام

استخدم ملف `test-google-sheets.html` لاختبار الاتصال:

1. **افتح الملف في المتصفح**
2. **اضغط "اختبار الاتصال"**
3. **اضغط "اختبار إرسال بيانات تجريبية"**
4. **راقب النتائج**

## 📋 التسجيل اليدوي (النسخة الاحتياطية)

إذا فشل الإرسال التلقائي، ستجد البيانات في Console:

```
📋 بيانات الفاتورة للتسجيل اليدوي في Google Sheets:
📝 الصف 1:
   العمود A (رقم الفاتورة): 520250801
   العمود B (التاريخ): ٨ أغسطس ٢٠٢٥
   العمود C (اسم العميل): عميل كريم
   العمود D (اسم الصنف): دونات شوكولاتة
   العمود E (الكمية): 2
   العمود F (السعر): 15.50
```

## 🔧 إعدادات Google Apps Script

### التحقق من الكود:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'addInvoiceItems') {
      return addInvoiceItems(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### التحقق من الصلاحيات:

1. انتقل إلى **Deploy > Manage Deployments**
2. تأكد من الإعدادات:
   - **Type:** Web app
   - **Execute as:** Me
   - **Who has access:** Anyone

## 📞 الدعم الفني

إذا استمرت المشاكل:

1. **تحقق من صحة رابط Google Sheets**
2. **تأكد من أن الملف ليس محمياً بكلمة مرور**
3. **جرب إنشاء Google Apps Script جديد**
4. **تحقق من استقرار الإنترنت**

## 🔄 إعادة تعيين النظام

لإعادة تعيين كامل:

1. **احذف البيانات المحفوظة محلياً:**
   ```javascript
   localStorage.clear();
   ```

2. **أعد تحميل الصفحة**

3. **جرب فاتورة جديدة**

---

**💡 نصيحة:** احتفظ دائماً بنسخة احتياطية من البيانات من Console في حالة فشل الإرسال التلقائي.
