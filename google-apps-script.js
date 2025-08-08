/**
 * Google Apps Script لإدارة فواتير دونات وحشوة
 * يتم نشر هذا الكود كـ Web App للتفاعل مع HTML
 */

// معرف الجدول
const SPREADSHEET_ID = '1POl2ntUZL9x0n79Wr1_ZswEETSFUrgjMrXcFtDfoFqA';
const SHEET_NAME = 'invoices'; // اسم الشيت

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'addInvoiceItems') {
      return addInvoiceItems(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'عملية غير مدعومة'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('خطأ في doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function addInvoiceItems(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`الشيت "${SHEET_NAME}" غير موجود`);
    }
    
    // الحصول على آخر صف فارغ
    const lastRow = sheet.getLastRow();
    let nextRow = lastRow + 1;
    
    // إضافة كل صنف في صف منفصل
    data.items.forEach((item, index) => {
      const rowData = [
        data.invoiceNumber,     // العمود A - رقم الفاتورة
        data.date,              // العمود B - التاريخ
        data.customerName,      // العمود C - اسم العميل
        item.name,              // العمود D - اسم الصنف
        item.quantity,          // العمود E - الكمية
        item.price              // العمود F - السعر
      ];
      
      // إضافة الصف إلى الشيت
      sheet.getRange(nextRow + index, 1, 1, rowData.length).setValues([rowData]);
    });
    
    console.log(`تم إضافة ${data.items.length} عنصر للفاتورة ${data.invoiceNumber}`);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `تم حفظ ${data.items.length} عنصر بنجاح`,
      invoiceNumber: data.invoiceNumber,
      itemsCount: data.items.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('خطأ في addInvoiceItems:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// دالة للاختبار المباشر في Apps Script Editor
function testAddInvoiceItems() {
  const testData = {
    action: 'addInvoiceItems',
    invoiceNumber: '52002507001',
    customerName: 'عميل تجريبي',
    date: '8 أغسطس 2025',
    items: [
      {
        name: 'دونات شوكولاتة',
        quantity: 2,
        price: 25.00
      },
      {
        name: 'دونات فراولة',
        quantity: 1,
        price: 20.00
      }
    ]
  };
  
  const result = addInvoiceItems(testData);
  console.log('نتيجة الاختبار:', result.getContent());
}

// دالة لإنشاء هيكل الشيت إذا لم يكن موجوداً
function setupSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // إنشاء الشيت إذا لم يكن موجوداً
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }
    
    // إضافة العناوين
    const headers = [
      'رقم الفاتورة',      // A
      'التاريخ',           // B
      'اسم العميل',        // C
      'اسم الصنف',         // D
      'الكمية',            // E
      'السعر'              // F
    ];
    
    // التحقق من وجود العناوين
    const firstRowValues = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const hasHeaders = firstRowValues.some(cell => cell && cell.toString().trim() !== '');
    
    if (!hasHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // تنسيق العناوين
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      
      console.log('تم إنشاء الشيت وإضافة العناوين');
    } else {
      console.log('الشيت موجود والعناوين محددة مسبقاً');
    }
    
    return true;
    
  } catch (error) {
    console.error('خطأ في setupSheet:', error);
    return false;
  }
}

// دالة للحصول على معلومات الشيت
function getSheetInfo() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return { error: 'الشيت غير موجود' };
    }
    
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    
    return {
      sheetName: SHEET_NAME,
      lastRow: lastRow,
      lastColumn: lastColumn,
      totalRows: lastRow,
      hasData: lastRow > 1
    };
    
  } catch (error) {
    console.error('خطأ في getSheetInfo:', error);
    return { error: error.toString() };
  }
}
