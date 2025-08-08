/**
 * Google Apps Script محسن لحفظ بيانات الدفعات
 * يعمل مع أي ملف Google Sheets
 */

function doPost(e) {
  try {
    console.log('🚀 بدء معالجة طلب حفظ الدفعة...');
    
    // التحقق من وجود البيانات
    if (!e || !e.postData || !e.postData.contents) {
      console.error('❌ لا توجد بيانات في الطلب');
      return createJsonResponse(false, 'لا توجد بيانات في الطلب');
    }
    
    // تحليل البيانات المرسلة
    const requestData = JSON.parse(e.postData.contents);
    console.log('📥 البيانات المستلمة:', requestData);
    
    // التحقق من نوع البيانات
    if (requestData.type !== 'payment') {
      console.error('❌ نوع البيانات غير صحيح:', requestData.type);
      return createJsonResponse(false, 'نوع البيانات يجب أن يكون payment');
    }
    
    // الحصول على الملف النشط (أول ملف Google Sheets متاح للسكريبت)
    let spreadsheet;
    try {
      // جرب الحصول على الملف النشط أولاً
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    } catch (error) {
      // إذا لم يعمل، جرب فتح ملف محدد (ضع معرف ملفك هنا)
      const SHEET_ID = '1POl2ntUZL9x0n79Wr1_ZswEETSFUrgjMrXcFtDfoFqA';
      spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    }
    
    if (!spreadsheet) {
      console.error('❌ لا يمكن فتح ملف Google Sheets');
      return createJsonResponse(false, 'لا يمكن فتح ملف Google Sheets');
    }
    
    console.log('📄 تم فتح الملف:', spreadsheet.getName());
    
    // البحث عن ورقة العمل payments أو إنشاؤها
    let sheet = spreadsheet.getSheetByName('payments');
    
    if (!sheet) {
      console.log('📝 إنشاء ورقة عمل جديدة باسم payments');
      sheet = spreadsheet.insertSheet('payments');
      
      // إضافة العناوين
      const headers = ['التاريخ', 'اسم العميل', 'رقم الفاتورة', 'المبلغ', 'طريقة الدفع', 'رقم الجوال', 'ملاحظات'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // تنسيق العناوين
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4CAF50');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
    }
    
    console.log('✅ تم العثور على/إنشاء ورقة payments');
    
    // تحضير البيانات للكتابة
    const currentDate = new Date();
    const formattedDate = Utilities.formatDate(currentDate, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    
    // ترتيب البيانات حسب الأعمدة المطلوبة
    const rowData = [
      requestData.date || formattedDate,     // A - التاريخ
      requestData.customer || '',            // B - العميل
      requestData.invoiceNumber || '',       // C - رقم الفاتورة
      parseFloat(requestData.amount) || 0,   // D - المبلغ
      requestData.paymentMethod || '',       // E - طريقة الدفع
      requestData.mobile || '',              // F - رقم الجوال
      requestData.notes || ''                // G - ملاحظات
    ];
    
    console.log('📝 البيانات المجهزة للكتابة:', rowData);
    
    // العثور على آخر صف فارغ
    const lastRow = sheet.getLastRow();
    const newRowNumber = lastRow + 1;
    
    console.log('📍 سيتم الكتابة في الصف رقم:', newRowNumber);
    
    // كتابة البيانات في الصف الجديد
    const range = sheet.getRange(newRowNumber, 1, 1, 7); // من A إلى G
    range.setValues([rowData]);
    
    // تنسيق الصف الجديد
    range.setBorder(true, true, true, true, true, true);
    
    // تلوين بديل للصفوف
    if (newRowNumber % 2 === 0) {
      range.setBackground('#f8f9fa');
    }
    
    console.log('✅ تم حفظ البيانات بنجاح في الصف:', newRowNumber);
    console.log('📊 البيانات المحفوظة:', rowData);
    
    // حفظ التغييرات
    SpreadsheetApp.flush();
    
    // إرجاع استجابة النجاح
    return createJsonResponse(true, 'تم حفظ الدفعة بنجاح', {
      row: newRowNumber,
      data: rowData,
      timestamp: formattedDate,
      sheetName: 'payments',
      sheetId: spreadsheet.getId(),
      sheetUrl: spreadsheet.getUrl()
    });
    
  } catch (error) {
    console.error('💥 خطأ في معالجة الطلب:', error.toString());
    console.error('📍 تفاصيل الخطأ:', error.stack);
    return createJsonResponse(false, 'خطأ في الخادم: ' + error.message);
  }
}

/**
 * دالة مساعدة لإنشاء الاستجابات بتنسيق JSON
 */
function createJsonResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString(),
    data: data
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * دالة اختبار لحفظ بيانات تجريبية
 */
function testPaymentSave() {
  const testData = {
    type: 'payment',
    customer: 'عميل تجريبي',
    invoiceNumber: 'TEST-' + Math.floor(Math.random() * 1000),
    amount: '150.50',
    paymentMethod: 'كاش',
    mobile: '966501234567',
    notes: 'اختبار من داخل السكريبت',
    date: new Date().toISOString().split('T')[0]
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('نتيجة الاختبار:', result.getContent());
  
  return result;
}

/**
 * دالة للحصول على معلومات الملف
 */
function getSheetInfo() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    console.log('📄 اسم الملف:', spreadsheet.getName());
    console.log('🆔 معرف الملف:', spreadsheet.getId());
    console.log('🔗 رابط الملف:', spreadsheet.getUrl());
    console.log('📊 أوراق العمل:');
    
    sheets.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.getName()} (${sheet.getLastRow()} صفوف)`);
    });
    
    return {
      name: spreadsheet.getName(),
      id: spreadsheet.getId(),
      url: spreadsheet.getUrl(),
      sheets: sheets.map(sheet => ({
        name: sheet.getName(),
        rows: sheet.getLastRow(),
        cols: sheet.getLastColumn()
      }))
    };
    
  } catch (error) {
    console.error('خطأ في الحصول على معلومات الملف:', error);
    return null;
  }
}
