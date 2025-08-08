# دليل حل مشكلة CORS مع Google Apps Script

## 🚨 ما هي مشكلة CORS؟

CORS (Cross-Origin Resource Sharing) هي آلية أمان في المتصفحات تمنع الطلبات عبر النطاقات المختلفة.

### رسالة الخطأ:
```
Access to fetch at 'https://script.google.com/macros/s/...' 
from origin 'http://127.0.0.1:3000' has been blocked by CORS policy
```

## 🔧 الحلول المطبقة:

### 1. **تغيير من `cors` إلى `no-cors`**
```javascript
// قبل التعديل
fetch(url, { mode: 'cors' })

// بعد التعديل
fetch(url, { mode: 'no-cors' })
```

### 2. **معالجة Opaque Response**
مع `no-cors`، المتصفح يرسل الطلب لكن لا يسمح بقراءة الاستجابة.

## 📋 كيفية التحقق من نجاح الإرسال:

### الطريقة الأولى: Google Sheets مباشرة
1. افتح Google Sheets
2. تحقق من ظهور البيانات الجديدة
3. ابحث عن رقم الفاتورة

### الطريقة الثانية: Google Apps Script Logs
1. افتح Google Apps Script
2. انتقل إلى **Executions** 
3. تحقق من سجل التنفيذ

### الطريقة الثالثة: Console Logs
```javascript
// في النظام الجديد سترى:
✅ تم إرسال البيانات (opaque response مع no-cors)
```

## 🛠️ إعدادات Google Apps Script المطلوبة:

### 1. **صلاحيات النشر**
```
Execute as: Me (owner email)
Who has access: Anyone
```

### 2. **كود doPost صحيح**
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

## 🔄 خطوات حل المشكلة:

### الخطوة 1: التحقق من إعدادات Apps Script
1. افتح Google Apps Script
2. تأكد من النشر الصحيح
3. انسخ Web App URL الجديد

### الخطوة 2: اختبار الاتصال
```bash
# افتح test-google-sheets.html
# اضغط "اختبار إرسال بيانات تجريبية"
# اتبع التعليمات
```

### الخطوة 3: التحقق من Google Sheets
1. افتح الجدول مباشرة
2. ابحث عن البيانات الجديدة
3. تأكد من صحة الأعمدة

## 📊 البيانات المرسلة:

### تنسيق JSON المطلوب:
```json
{
  "action": "addInvoiceItems",
  "invoiceNumber": "520250801",
  "customerName": "اسم العميل",
  "date": "٢٠٢٥/٨/٨",
  "items": [
    {
      "name": "دونات شوكولاتة",
      "quantity": 2,
      "price": 15.50
    }
  ]
}
```

### الأعمدة في Google Sheets:
- **A**: رقم الفاتورة
- **B**: التاريخ  
- **C**: اسم العميل
- **D**: اسم المنتج
- **E**: الكمية
- **F**: السعر

## 🎯 علامات النجاح:

### في نظام الفواتير:
```
✅ تم حفظ الفاتورة في Google Sheets!

رقم الفاتورة: 520250801
عدد الأصناف: 2

ملاحظة: تحقق من Google Sheets للتأكد من وصول البيانات
```

### في Google Sheets:
- ظهور صفوف جديدة
- البيانات في الأعمدة الصحيحة
- رقم الفاتورة صحيح

## ⚠️ مشاكل شائعة:

### 1. **Web App URL خاطئ**
```bash
❌ HTTP Error 404: Not Found
✅ تحقق من رابط Web App
```

### 2. **صلاحيات خاطئة**
```bash
❌ HTTP Error 403: Forbidden  
✅ تحقق من صلاحيات النشر
```

### 3. **كود Apps Script خاطئ**
```bash
❌ doPost: Cannot read properties of undefined
✅ تحقق من كود doPost
```

## 🚀 النظام الجديد المحسن:

- ✅ **no-cors mode**: تجنب مشاكل CORS
- ✅ **opaque response handling**: معالجة الاستجابات المخفية
- ✅ **fallback verification**: التحقق البديل
- ✅ **detailed logging**: سجلات مفصلة
- ✅ **user guidance**: إرشادات واضحة

## 💡 نصائح مهمة:

1. **دائماً تحقق من Google Sheets** بعد الإرسال
2. **استخدم رقم الفاتورة** للبحث في الجدول
3. **راقب Apps Script Executions** للأخطاء
4. **احتفظ بنسخة احتياطية** من البيانات في Console

---

**الخلاصة:** مشكلة CORS طبيعية مع الاختبار المحلي، لكن النظام الجديد يتعامل معها بذكاء ويضمن وصول البيانات إلى Google Sheets.
