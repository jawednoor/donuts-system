// Google Apps Script لحفظ بيانات الدفعات في شيت payments
// يجب نسخ هذا الكود ولصقه في Google Apps Script

function doPost(e) {
  try {
    // فتح الشيت
    const sheetId = '1POl2ntUZL9x0n79Wr1_ZswEETSFUrgjMrXcFtDfoFqA';
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName('payments');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'شيت payments غير موجود'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // تحليل البيانات المرسلة
    const data = JSON.parse(e.postData.contents);
    console.log('البيانات المستلمة:', data);
    
    // التأكد من أن النوع هو payment
    if (data.type !== 'payment') {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'نوع البيانات غير صحيح'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // العثور على أول صف فارغ
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;
    
    // إعداد البيانات حسب الأعمدة المطلوبة:
    // A: التاريخ, B: العميل, C: رقم الفاتورة, D: المبلغ, E: طريقة الدفع, F: رقم الجوال, G: ملاحظات
    const rowData = [
      data.date,           // عمود A - التاريخ
      data.customer,       // عمود B - العميل  
      data.invoiceNumber,  // عمود C - رقم الفاتورة
      data.amount,         // عمود D - المبلغ
      data.paymentMethod,  // عمود E - طريقة الدفع
      data.mobile,         // عمود F - رقم الجوال
      data.notes || ''     // عمود G - ملاحظات
    ];
    
    // كتابة البيانات في الصف الجديد
    const range = sheet.getRange(newRow, 1, 1, 7); // من A إلى G
    range.setValues([rowData]);
    
    console.log('تم حفظ البيانات في الصف:', newRow);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'تم حفظ بيانات الدفعة بنجاح',
      row: newRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('خطأ في حفظ البيانات:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// دالة للاختبار
function testPayment() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        type: 'payment',
        customer: 'عميل تجريبي',
        date: '2025-01-20',
        amount: 100.50,
        invoiceNumber: 'INV-001',
        paymentMethod: 'كاش',
        mobile: '0501234567',
        notes: 'اختبار'
      })
    }
  };
  
  const result = doPost(testData);
  console.log(result.getContent());
}
