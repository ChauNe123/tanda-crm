function generateQuoteHTML(docData, products, formatMoney) {
    let tbodyQuote = "";
    
    products.forEach((prod, i) => {
        const sub = (prod.price || 0) * (prod.qty || 0); 
        const safeNameStr = prod.name || '';
        const lines = safeNameStr.split('\n');
        const mainName = lines[0] || '';
        const specs = lines.slice(1).join('<br>');
        
        const premiumNameHTML = `<strong style="color: #1e293b; font-size: 10pt;">${mainName}</strong>` + 
            (specs ? `<br><span style="color: #64748b; font-size: 8.5pt; display: inline-block; margin-top: 4px; line-height: 1.4;">${specs}</span>` : '');

        tbodyQuote += `<tr>
            <td class="center" style="color: #64748b; font-weight: 600;">${String(i + 1).padStart(2, '0')}</td>
            <td>${premiumNameHTML}</td>
            <td class="center" style="font-weight: 500;">${prod.bh || ''}</td>
            <td class="center" style="color: #64748b;">${prod.unit || ''}</td>
            <td class="center" style="font-weight: 600;">${prod.qty || 1}</td>
            <td class="right" style="color: ${(prod.price || 0) === 0 ? '#94a3b8' : '#1e293b'};">${(prod.price || 0) === 0 ? '0' : formatMoney(prod.price)}</td>
            <td class="right" style="color: ${(prod.price || 0) === 0 ? '#94a3b8' : '#1e293b'}; font-weight: ${(prod.price || 0) === 0 ? '400' : '600'};">${(prod.price || 0) === 0 ? 'Tặng kèm' : formatMoney(sub)}</td>
        </tr>`;
    });

    let quoteTaxHtml = docData.isVat ? `<tr><td class="total-label">Thuế VAT (8%) <span class="quote-muted">/ Tax</span></td><td class="total-value" style="padding-right: 0;">${formatMoney(docData.tax)}</td></tr>` : '';

    return `
        <div id="quote-section" class="pdf-quote pb-[10mm]">
            <table class="quote-header"><tr><td style="width: 25%; vertical-align: middle; padding: 0;">
                <div style="font-size: 28pt; font-weight: 900; color: #b30000; letter-spacing: -1px; text-align: left;">TANDA</div>
            </td><td style="width: 40%; vertical-align: middle; padding: 0 0 0 10px;"><div style="font-size: 11pt; font-weight: 800; color: #1e293b; text-transform: uppercase;">CÔNG TY TNHH KỸ THUẬT SỐ TANDA</div><div style="font-size: 9pt; color: #64748b; margin-top: 5px; line-height: 1.5;">36/8 Lý Thánh Tông, Tân Phú, TP.HCM<br>info@tanda.vn | SĐT Liên hệ TANDA</div></td><td style="width: 35%; text-align: right; vertical-align: middle; padding: 0;"><div class="quote-title">BÁO GIÁ</div><div class="quote-subtitle">Quotation Proposal</div><div style="margin-top: 8px; font-size: 10pt; color: #64748b;">Mã số / No: <span style="font-weight: 700; color: #b30000; font-family: 'JetBrains Mono', monospace; font-size: 11pt;">${docData.qNo}</span></div></td></tr></table>
            <table class="quote-meta-grid"><tr><td style="width: 42%; padding-right: 20px;"><div class="quote-label">Khách hàng <span class="quote-muted">/ To</span></div><div class="quote-value"><strong class="quote-accent" style="font-size: 11.5pt;">${docData.bName}</strong><br><span style="font-size: 9.5pt; font-weight: 400; color: #475569; display: block; margin-top: 6px;">Đại diện: <strong style="color: #1e293b;">${docData.bRep}</strong><br>SĐT: ${docData.bPhone}<br>Đ/C: ${docData.bAddress}</span></div></td><td style="width: 33%; padding-right: 15px;"><div class="quote-label" style="padding-left: 12px;">Tư vấn dự án <span class="quote-muted">/ From</span></div><div class="quote-value" style="border-left: 2px solid #e2e8f0; padding-left: 10px;"><strong style="color: #1e293b;">${docData.safeFullName}</strong><br><span style="font-size: 9.5pt; font-weight: 400; color: #475569; display: block; margin-top: 4px;">TANDA Sales Department<br>${docData.safeEmail}</span></div></td><td style="width: 25%;"><div class="quote-label">Thông tin <span class="quote-muted">/ Info</span></div><div class="quote-value"><table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; font-weight: 400; color: #475569;"><tr><td style="padding: 0 0 5px 0; width: 45px;">Ngày</td><td style="padding: 0 5px 5px 0; width: 10px;">:</td><td style="padding: 0 0 5px 0; font-weight: 600; color: #1e293b;">${docData.pdfDateStr}</td></tr><tr><td style="padding: 0 0 5px 0;">HSD</td><td style="padding: 0 5px 5px 0;">:</td><td style="padding: 0 0 5px 0;">07 Ngày</td></tr><tr><td style="padding: 0; vertical-align: top;">Dự án</td><td style="padding: 0 5px 0 0; vertical-align: top;">:</td><td style="padding: 0; font-weight: 600; color: #b30000; line-height: 1.3;">${docData.pName}</td></tr></table></div></td></tr></table>
            <p style="font-size: 10pt; color: #475569; margin-bottom: 8px; font-style: italic;">Căn cứ theo yêu cầu của Quý khách hàng, TANDA trân trọng đề xuất giải pháp và chi phí như sau:</p>
            <table class="premium-table"><thead><tr><th class="center" style="width: 5%;">STT</th><th style="width: 42%;">Hạng mục <span class="quote-muted">/ Description</span></th><th class="center" style="width: 12%;">Bảo hành</th><th class="center" style="width: 8%;">ĐVT</th><th class="center" style="width: 8%;">SL</th><th class="right" style="width: 12%;">Đơn giá</th><th class="right" style="width: 13%;">Thành tiền</th></tr></thead><tbody>${tbodyQuote}</tbody></table>
            <div style="width: 100%; overflow: hidden;"><table class="premium-total-table"><tr><td class="total-label">Tổng cộng <span class="quote-muted">/ Subtotal</span></td><td class="total-value" style="width: 45%; padding-right: 0;">${formatMoney(docData.total)}</td></tr>${quoteTaxHtml}<tr class="grand-total-row"><td style="text-transform: uppercase;">Tổng Thanh Toán</td><td style="padding-right: 0;">${formatMoney(docData.grandTotal)}</td></tr></table></div>
            <div class="premium-terms"><div class="premium-terms-title">Điều kiện thương mại <span class="quote-muted" style="text-transform: none; font-weight: normal; font-size: 9pt;">/ Commercial Terms</span></div><table style="width: 100%; border-collapse: collapse; table-layout: fixed;"><tr><td style="width: 48%; padding: 0 20px 0 0; vertical-align: top;"><ul><li><strong>Giao hàng:</strong> Trong vòng 3 - 5 ngày làm việc kể từ ngày xác nhận.</li><li><strong>Địa điểm:</strong> Giao hàng và triển khai trực tiếp tại địa chỉ do Khách hàng chỉ định.</li><li><strong>Bảo hành:</strong> Áp dụng chính sách bảo hành tận nơi theo tiêu chuẩn.</li></ul></td><td style="width: 4%; vertical-align: top; padding: 0;"></td><td style="width: 48%; padding: 0 0 0 15px; vertical-align: top; border-left: 1px solid #e2e8f0;"><ul><li><strong>Thanh toán:</strong> Thanh toán tiền mặt hoặc chuyển khoản.</li><li><strong style="color: #1e293b;">Thông tin chuyển khoản:</strong><br><span style="display: block; margin-top: 6px; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;"><span style="color: #64748b; font-size: 8.5pt;">Số Tài Khoản:</span> <strong class="quote-accent" style="font-size: 11pt;">... Đang cập nhật ...</strong><br><span style="color: #1e293b; font-size: 9pt; font-weight: 600;">Ngân hàng TANDA</span> <br><span style="color: #64748b; font-size: 8.5pt;">Chủ Tài Khoản:</span> <span style="font-size: 9pt; font-weight: 500;">CÔNG TY TNHH KTS TANDA</span></span></li></ul></td></tr></table></div>
            <table class="premium-signature"><tr><td><div class="role">ĐẠI DIỆN TANDA</div><div class="hint">Representative</div></td><td><div class="role">XÁC NHẬN TỪ KHÁCH HÀNG</div><div class="hint">Customer Approval</div></td></tr><tr><td style="height: 120px;"></td><td></td></tr></table>
        </div>
    `;
}                       