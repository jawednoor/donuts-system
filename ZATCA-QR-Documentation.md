# 🇸🇦 مكتبة QR Code للفواتير الإلكترونية السعودية

مكتبة JavaScript متوافقة مع معايير هيئة الزكاة والضريبة والجمارك (ZATCA) لإنشاء QR Code للفواتير الضريبية.

## 📋 نظرة عامة

تستخدم هذه المكتبة نظام التشفير المعتمد من ZATCA والذي يعتمد على:
- **TLV Encoding** (Tag-Length-Value)
- **Base64 Encoding**
- **UTF-8 Character Encoding**

## 🔧 التركيب والاستخدام

### 1. تضمين المكتبة
```html
<script src="saudi-qr-generator.js"></script>
```

### 2. الاستخدام الأساسي
```javascript
// إنشاء مولد QR Code
const qrGenerator = new SaudiQRGenerator();

// بيانات الفاتورة
const invoiceData = {
    sellerName: "اسم الشركة",
    vatNumber: "123456789012345",
    timestamp: "2025-08-08T14:30:00.000Z",
    totalWithVAT: 115.00,
    vatAmount: 15.00
};

// إنشاء QR Code
const qrContent = qrGenerator.generateQRContent(invoiceData);
console.log(qrContent); // نص Base64 مشفر
```

## 📊 البيانات المطلوبة

### الحقول الإجبارية
| الحقل | Tag | الوصف | مثال |
|-------|-----|-------|------|
| `sellerName` | 1 | اسم البائع | "دونات وحشوة" |
| `vatNumber` | 2 | الرقم الضريبي (15 رقم) | "123456789012345" |
| `timestamp` | 3 | تاريخ ووقت الفاتورة (ISO 8601) | "2025-08-08T14:30:00.000Z" |
| `totalWithVAT` | 4 | المجموع شامل الضريبة | 115.00 |
| `vatAmount` | 5 | قيمة ضريبة القيمة المضافة | 15.00 |

## 🔍 الطرق المتاحة

### `generateQRContent(invoiceData)`
إنشاء محتوى QR Code مشفر
```javascript
const qrContent = qrGenerator.generateQRContent(invoiceData);
```

### `decodeQRContent(base64Content)`
فك تشفير QR Code (للاختبار)
```javascript
const decodedData = qrGenerator.decodeQRContent(qrContent);
console.log(decodedData);
```

### `debugQRContent(invoiceData)`
إنشاء QR Code مع طباعة تفاصيل التشخيص
```javascript
const qrContent = qrGenerator.debugQRContent(invoiceData);
// سيطبع في Console:
// - البيانات الأصلية
// - محتوى Base64
// - البيانات المفكوكة للتحقق
```

### `createTestQR()`
إنشاء QR Code اختباري ببيانات افتراضية
```javascript
const testQR = qrGenerator.createTestQR();
```

## 🏗️ هيكل TLV

كل حقل في QR Code يتكون من:
```
[Tag: 1 byte][Length: 1 byte][Value: n bytes]
```

### مثال على ترميز TLV
```
اسم البائع: "دونات وحشوة"
- Tag: 01 (البائع)
- Length: 0F (15 بايت) 
- Value: D8AFD988D986D8A7D8AA20D988D8ADD8B4D988D8A9 (UTF-8 hex)

النتيجة: 010FD8AFD988D986D8A7D8AA20D988D8ADD8B4D988D8A9
```

## ✅ التحقق من صحة البيانات

المكتبة تتحقق تلقائياً من:
- وجود جميع الحقول المطلوبة
- صحة تنسيق الرقم الضريبي (15 رقم)
- صحة القيم الرقمية
- عدم تجاوز حد 255 بايت لكل حقل

## 🔍 مثال شامل

```javascript
// إنشاء الفاتورة
const invoiceData = {
    sellerName: "مؤسسة البيان التجارية", 
    vatNumber: "300123456700003",
    timestamp: new Date().toISOString(),
    totalWithVAT: 1150.00,
    vatAmount: 150.00
};

// إنشاء مولد QR
const qrGenerator = new SaudiQRGenerator();

try {
    // إنشاء QR Code مع التشخيص
    const qrContent = qrGenerator.debugQRContent(invoiceData);
    
    // استخدام مع مكتبة QR Code
    QRCode.toCanvas(canvas, qrContent, {
        width: 200,
        height: 200,
        errorCorrectionLevel: 'M'
    });
    
    console.log('✅ QR Code تم إنشاؤه بنجاح');
    
} catch (error) {
    console.error('❌ خطأ:', error.message);
}
```

## 🔧 معالجة الأخطاء

### الأخطاء الشائعة
```javascript
// خطأ: حقل مفقود
Error: الحقل المطلوب مفقود: vatNumber

// خطأ: قيمة طويلة
Error: قيمة الحقل 1 طويلة جداً: 300 بايت (الحد الأقصى: 255)

// خطأ: قيمة رقمية غير صحيحة  
Error: القيم الرقمية غير صحيحة

// تحذير: رقم ضريبي غير صحيح
Warning: الرقم الضريبي يجب أن يكون 15 رقم
```

## 🧪 الاختبار

### اختبار أساسي
```javascript
const qrGenerator = new SaudiQRGenerator();
const testQR = qrGenerator.createTestQR();
const decoded = qrGenerator.decodeQRContent(testQR);

console.assert(decoded.sellerName === "دونات وحشوة");
console.assert(decoded.vatNumber === "123456789012345");
```

### اختبار دورة كاملة
```javascript
const originalData = {
    sellerName: "شركة اختبار",
    vatNumber: "123456789012345", 
    timestamp: "2025-08-08T14:30:00.000Z",
    totalWithVAT: 100.00,
    vatAmount: 15.00
};

const qrContent = qrGenerator.generateQRContent(originalData);
const decodedData = qrGenerator.decodeQRContent(qrContent);

// التحقق من تطابق البيانات
Object.keys(originalData).forEach(key => {
    console.assert(
        originalData[key].toString() === decodedData[key],
        `البيانات غير متطابقة للحقل: ${key}`
    );
});
```

## 📱 التكامل مع التطبيقات

### مع نظام الفواتير
```javascript
function generateInvoiceQR(invoiceData) {
    const qrGenerator = new SaudiQRGenerator();
    
    const qrData = {
        sellerName: invoiceData.companyName,
        vatNumber: invoiceData.companyVAT,
        timestamp: invoiceData.createdAt,
        totalWithVAT: invoiceData.totalAmount,
        vatAmount: invoiceData.vatAmount
    };
    
    return qrGenerator.generateQRContent(qrData);
}
```

### مع مكتبات QR Code أخرى
```javascript
// مع qrcode.js
const qrContent = qrGenerator.generateQRContent(invoiceData);
QRCode.toDataURL(qrContent, (err, url) => {
    document.getElementById('qr-image').src = url;
});

// مع qrcode-generator
const qr = qrcode(0, 'M');
qr.addData(qrContent);
qr.make();
document.getElementById('qr-code').innerHTML = qr.createImgTag();
```

## 🔗 المراجع

- [معايير ZATCA للفواتير الإلكترونية](https://zatca.gov.sa)
- [مواصفات UTF-8 Encoding](https://tools.ietf.org/html/rfc3629)
- [مواصفات Base64 Encoding](https://tools.ietf.org/html/rfc4648)

## 📝 الملاحظات

- الرقم الضريبي يجب أن يكون الرقم الفعلي المسجل لدى الهيئة
- التاريخ والوقت يجب أن يكون بتوقيت المملكة العربية السعودية
- القيم النقدية يجب أن تكون بالريال السعودي
- QR Code يجب أن يكون مقروءاً بتطبيق الهيئة الرسمي
