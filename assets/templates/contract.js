function generateContractHTML(docData, products, formatMoney) {
    let tbodyHD = "";
    
    products.forEach((prod, i) => {
        const sub = (prod.price || 0) * (prod.qty || 0); 
        const safeNameStr = prod.name || '';
        const standardName = safeNameStr.replace(/\n/g, '<br>');

        tbodyHD += `<tr>
            <td style="text-align: center; border: 1px solid black; padding: 6px;">${i + 1}</td>
            <td style="border: 1px solid black; padding: 6px;">${standardName}</td>
            <td style="text-align: center; border: 1px solid black; padding: 6px;">${prod.bh || ''}</td>
            <td style="text-align: center; border: 1px solid black; padding: 6px;">${prod.unit || ''}</td>
            <td class="money-cell" style="border: 1px solid black; padding: 6px;">${(prod.price || 0) === 0 ? '0' : formatMoney(prod.price)}</td>
            <td style="text-align: center; border: 1px solid black; padding: 6px;">${prod.qty || 1}</td>
            <td class="money-cell" style="border: 1px solid black; padding: 6px;">${(prod.price || 0) === 0 ? 'Tặng kèm' : formatMoney(sub)}</td>
        </tr>`;
    });

    let contractTaxHtml = docData.isVat ? `<tr><td colspan="6" style="text-align: right; font-weight: bold; border: 1px solid black; padding: 6px;">THUẾ 8%</td><td class="money-cell" style="font-weight: bold; border: 1px solid black; padding: 6px;">${formatMoney(docData.tax)}</td></tr>` : '';
    
    let paymentText = docData.payOpt === "50" 
        ? `<p>- <b>Đợt 1:</b> Bên A thanh toán <b>50%</b> giá trị hợp đồng (tương đương <b>${formatMoney(docData.grandTotal/2)} VNĐ</b>) ngay sau khi ký kết Hợp đồng để Bên B tiến hành chuẩn bị hàng hóa.</p><p>- <b>Đợt 2:</b> Bên A thanh toán <b>50%</b> giá trị còn lại (tương đương <b>${formatMoney(docData.grandTotal/2)} VNĐ</b>) sau khi Bên B hoàn tất giao hàng, lắp đặt và bàn giao hệ thống (nếu có).</p>` 
        : `<p>- Bên A thanh toán <b>100%</b> giá trị hợp đồng (tương đương <b>${formatMoney(docData.grandTotal)} VNĐ</b>) ngay sau khi ký kết Hợp đồng để Bên B tiến hành chuẩn bị và giao hàng.</p>`;

    return `
        <div id="contract-section" class="doc-wrapper" style="position: relative;">
            <div class="content-wrapper" contenteditable="true" style="outline: none;">
                <div style="text-align: center; margin-bottom: 20px;"><h3 style="margin: 0; font-weight: bold; font-size: 14pt;">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3><p style="margin: 0; font-weight: bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p><p style="margin: 5px 0 15px 0;">----------o0o-----------</p><h2 style="margin: 0; font-weight: bold; font-size: 16pt;">HỢP ĐỒNG MUA BÁN VÀ DỊCH VỤ</h2><p style="margin: 0; font-style: italic;">Số: ${docData.cNo}</p></div>
                <div><p><b>Căn cứ vào:</b></p><p>- Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015 và các văn bản pháp luật liên quan;</p><p>- Luật Thương mại số 36/2005/QH11 ngày 14/06/2005 và các văn bản pháp luật liên quan;</p><p>- Nhu cầu và khả năng của các Bên;</p></div>
                <p style="margin-top: 15px;">Hôm nay, ${docData.dateString}, tại TP. Hồ Chí Minh</p><p><b>Chúng tôi gồm có:</b></p>
                <div style="margin-bottom: 10px;"><p><b><u>BÊN MUA (Bên A)</u> : ${docData.bName}</b></p><table style="border: none; width: 100%; margin: 0;"><tr><td style="border: none; padding: 2px; width: 120px;">Địa chỉ</td><td style="border: none; padding: 2px;">: ${docData.bAddress}</td></tr><tr><td style="border: none; padding: 2px;">Mã số thuế</td><td style="border: none; padding: 2px;">: ${docData.bTax}</td></tr><tr><td style="border: none; padding: 2px;">Điện thoại</td><td style="border: none; padding: 2px;">: ${docData.bPhone !== '' ? docData.bPhone : '........................................'}</td></tr><tr><td style="border: none; padding: 2px;">Đại diện bởi</td><td style="border: none; padding: 2px;">: <b>${docData.bRep}</b></td></tr><tr><td style="border: none; padding: 2px;">Chức vụ</td><td style="border: none; padding: 2px;">: ${docData.bRole}</td></tr></table></div>
                <div style="margin-bottom: 15px;"><p><b><u>BÊN BÁN (Bên B)</u> : CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ TANDA</b></p><table style="border: none; width: 100%; margin: 0;"><tr><td style="border: none; padding: 2px; width: 120px;">Địa chỉ</td><td style="border: none; padding: 2px;">: 341/25S – 341/26S Lạc Long Quân, Phường Hoà Bình , TP. Hồ Chí Minh</td></tr><tr><td style="border: none; padding: 2px;">Mã số thuế</td><td style="border: none; padding: 2px;">: 0317726344</td></tr><tr><td style="border: none; padding: 2px;">Điện thoại</td><td style="border: none; padding: 2px;">: 0933 129 155</td></tr><tr><td style="border: none; padding: 2px;">Đại diện bởi</td><td style="border: none; padding: 2px;">: <b>Ông/Bà ${docData.safeFullName}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Chức vụ: ${docData.safeRole}</td></tr><tr><td style="border: none; padding: 2px;">Tài khoản số</td><td style="border: none; padding: 2px;">: 305258 - Tại: Ngân hàng TMCP Á Châu - CN Ông Ích Khiêm</td></tr></table></div>
                <p><b>ĐIỀU 1: TÊN DỊCH VỤ - GIÁ TRỊ HỢP ĐỒNG</b></p>
                <table>
                    <tr><th style="width: 5%; border: 1px solid black; padding: 6px;">STT</th><th style="width: 35%; border: 1px solid black; padding: 6px;">SẢN PHẨM</th><th style="width: 15%; border: 1px solid black; padding: 6px;">BẢO HÀNH</th><th style="width: 10%; border: 1px solid black; padding: 6px;">ĐVT</th><th style="width: 15%; border: 1px solid black; padding: 6px;">ĐƠN GIÁ (VNĐ)</th><th style="width: 5%; border: 1px solid black; padding: 6px;">SL</th><th style="width: 15%; border: 1px solid black; padding: 6px;">THÀNH TIỀN</th></tr>
                    ${tbodyHD}
                    <tr><td colspan="6" style="text-align: right; font-weight: bold; border: 1px solid black; padding: 6px;">TỔNG CỘNG</td><td class="money-cell" style="font-weight: bold; border: 1px solid black; padding: 6px;">${formatMoney(docData.total)}</td></tr>
                    ${contractTaxHtml}
                    <tr><td colspan="6" style="text-align: right; font-weight: bold; border: 1px solid black; padding: 6px;">THÀNH TIỀN</td><td class="money-cell" style="font-weight: bold; border: 1px solid black; padding: 6px;">${formatMoney(docData.grandTotal)}</td></tr>
                </table>
                <p><b>ĐIỀU 2: THỜI HẠN HỢP ĐỒNG</b></p><p>Hợp đồng thanh lý ngay sau khi 2 bên hoàn thành nghĩa vụ được quy định tại điều 5, 6.</p>
                <p><b>ĐIỀU 3: THỜI HẠN VÀ PHƯƠNG THỨC THANH TOÁN</b></p><p>Bên A thanh toán cho Bên B bằng hình thức chuyển khoản theo lộ trình sau:</p>${paymentText}
                <p><b>ĐIỀU 4: THỜI ĐIỂM VÀ ĐỊA ĐIỂM CHUYỂN GIAO HÀNG HÓA</b></p><p>- Thời gian giao hàng: 03 (ba) ngày làm việc kể từ ngày hai bên ký kết hợp đồng.</p><p>- Địa điểm chuyển giao: ${docData.deliveryAddress}.</p>
                <p><b>ĐIỀU 5: NGHĨA VỤ CỦA BÊN BÁN (BÊN B)</b></p><p>- Cung cấp đúng theo yêu cầu của Bên A về mẫu mã đã ký duyệt. Bên B có trách nhiệm cung cấp hàng hóa cho Bên A theo đúng số lượng, chất lượng, thời gian thỏa thuận và bảo hành bảo trì khi có sự cố.</p>
                <p><b>ĐIỀU 6: NGHĨA VỤ CỦA BÊN MUA (BÊN A)</b></p><p>- Đảm bảo thanh toán đúng thời hạn và tạo điều kiện thuận lợi để Bên B tiến hành lắp đặt. Kiểm tra số lượng và chất lượng ngay khi nhận hàng, nếu trong vòng 03 ngày không phản hồi xem như Bên B đã hoàn thành trách nhiệm.</p>
                <p><b>ĐIỀU 7: ĐIỀU KHOẢN CHUNG</b></p><p>Hợp đồng này được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.</p>
                <table style="border: none; width: 100%; margin-top: 20px;"><tr><td style="border: none; text-align: center; width: 50%;"><b>ĐẠI DIỆN BÊN A</b></td><td style="border: none; text-align: center; width: 50%;"><b>ĐẠI DIỆN BÊN B</b></td></tr><tr><td style="border: none; height: 100px;"></td><td style="border: none; height: 100px;"></td></tr><tr><td style="border: none; text-align: center;"><b>${docData.bRep === '..............................' ? '' : docData.bRep}</b></td><td style="border: none; text-align: center;"><b>${docData.safeFullName.toUpperCase()}</b></td></tr></table>
            </div>
        </div>
    `;
}