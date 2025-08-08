/**
 * مكتبة تشفير QR Code للفواتير الإلكترونية السعودية
 * متوافقة مع معايير هيئة الزكاة والضريبة والجمارك (ZATCA)
 * 
 * نظام التشفير: TLV (Tag-Length-Value) + Base64
 */

class SaudiQRGenerator {
    constructor() {
        this.tags = {
            SELLER_NAME: 1,
            VAT_NUMBER: 2,
            TIMESTAMP: 3,
            TOTAL_WITH_VAT: 4,
            VAT_AMOUNT: 5
        };
    }

    /**
     * إنشاء QR Code للفاتورة الضريبية
     * @param {Object} invoiceData - بيانات الفاتورة
     * @returns {String} - محتوى QR Code مشفر بـ Base64
     */
    generateQRContent(invoiceData) {
        try {
            // التحقق من البيانات المطلوبة
            this.validateInvoiceData(invoiceData);

            // إنشاء حقول TLV
            const tlvFields = [
                this.createTLVField(this.tags.SELLER_NAME, invoiceData.sellerName),
                this.createTLVField(this.tags.VAT_NUMBER, invoiceData.vatNumber),
                this.createTLVField(this.tags.TIMESTAMP, invoiceData.timestamp),
                this.createTLVField(this.tags.TOTAL_WITH_VAT, invoiceData.totalWithVAT.toString()),
                this.createTLVField(this.tags.VAT_AMOUNT, invoiceData.vatAmount.toString())
            ];

            // دمج جميع الحقول
            const combinedData = this.combineFields(tlvFields);

            // تحويل إلى Base64
            return this.arrayToBase64(combinedData);

        } catch (error) {
            console.error('خطأ في إنشاء QR Code:', error);
            throw error;
        }
    }

    /**
     * التحقق من صحة بيانات الفاتورة
     */
    validateInvoiceData(data) {
        const required = ['sellerName', 'vatNumber', 'timestamp', 'totalWithVAT', 'vatAmount'];
        for (const field of required) {
            if (!data[field] && data[field] !== 0) {
                throw new Error(`الحقل المطلوب مفقود: ${field}`);
            }
        }

        // التحقق من الرقم الضريبي
        if (!/^\d{15}$/.test(data.vatNumber)) {
            console.warn('تحذير: الرقم الضريبي يجب أن يكون 15 رقم');
        }

        // التحقق من القيم الرقمية
        if (isNaN(data.totalWithVAT) || isNaN(data.vatAmount)) {
            throw new Error('القيم الرقمية غير صحيحة');
        }
    }

    /**
     * إنشاء حقل TLV
     * @param {Number} tag - رمز الحقل
     * @param {String} value - قيمة الحقل
     * @returns {Uint8Array} - مصفوفة البايتات
     */
    createTLVField(tag, value) {
        // تحويل القيمة إلى UTF-8
        const valueBytes = this.stringToUTF8(value);
        const length = valueBytes.length;

        // التحقق من الحد الأقصى للطول (255 بايت)
        if (length > 255) {
            throw new Error(`قيمة الحقل ${tag} طويلة جداً: ${length} بايت (الحد الأقصى: 255)`);
        }

        // إنشاء مصفوفة النتيجة
        const result = new Uint8Array(2 + length);
        result[0] = tag;           // Tag (1 byte)
        result[1] = length;        // Length (1 byte)
        result.set(valueBytes, 2); // Value (n bytes)

        return result;
    }

    /**
     * تحويل النص إلى UTF-8 bytes
     */
    stringToUTF8(str) {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    }

    /**
     * دمج حقول TLV
     */
    combineFields(fields) {
        // حساب الطول الإجمالي
        const totalLength = fields.reduce((sum, field) => sum + field.length, 0);
        
        // إنشاء مصفوفة موحدة
        const combined = new Uint8Array(totalLength);
        let offset = 0;

        for (const field of fields) {
            combined.set(field, offset);
            offset += field.length;
        }

        return combined;
    }

    /**
     * تحويل مصفوفة البايتات إلى Base64
     */
    arrayToBase64(uint8Array) {
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binaryString);
    }

    /**
     * فك تشفير QR Code (للاختبار)
     */
    decodeQRContent(base64Content) {
        try {
            // فك تشفير Base64
            const binaryString = atob(base64Content);
            const uint8Array = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
            }

            // فك تحليل TLV
            const result = {};
            let offset = 0;

            while (offset < uint8Array.length) {
                const tag = uint8Array[offset++];
                const length = uint8Array[offset++];
                const value = uint8Array.slice(offset, offset + length);
                
                // تحويل القيمة إلى نص
                const decoder = new TextDecoder();
                const textValue = decoder.decode(value);

                // تحديد اسم الحقل
                const fieldName = this.getFieldName(tag);
                result[fieldName] = textValue;

                offset += length;
            }

            return result;

        } catch (error) {
            console.error('خطأ في فك تشفير QR Code:', error);
            throw error;
        }
    }

    /**
     * الحصول على اسم الحقل من الرمز
     */
    getFieldName(tag) {
        const fieldNames = {
            1: 'sellerName',
            2: 'vatNumber', 
            3: 'timestamp',
            4: 'totalWithVAT',
            5: 'vatAmount'
        };
        return fieldNames[tag] || `unknown_field_${tag}`;
    }

    /**
     * إنشاء QR Code للاختبار مع بيانات افتراضية
     */
    createTestQR() {
        const testData = {
            sellerName: "دونات وحشوة",
            vatNumber: "123456789012345",
            timestamp: new Date().toISOString(),
            totalWithVAT: 115.0,
            vatAmount: 15.0
        };

        return this.generateQRContent(testData);
    }

    /**
     * طباعة تفاصيل القR Code للتشخيص
     */
    debugQRContent(invoiceData) {
        console.group('🔍 تحليل QR Code - ZATCA');
        
        console.log('📋 البيانات الأصلية:');
        console.table(invoiceData);

        const qrContent = this.generateQRContent(invoiceData);
        console.log('🔐 محتوى QR (Base64):', qrContent);

        try {
            const decoded = this.decodeQRContent(qrContent);
            console.log('✅ البيانات المفكوكة:');
            console.table(decoded);
        } catch (error) {
            console.error('❌ خطأ في فك التشفير:', error);
        }

        console.groupEnd();
        return qrContent;
    }
}

// تصدير المكتبة للاستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaudiQRGenerator;
} else if (typeof window !== 'undefined') {
    window.SaudiQRGenerator = SaudiQRGenerator;
}
