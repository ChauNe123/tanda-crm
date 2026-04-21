function generateAcceptanceHTML(docData, products) {
    let tbodyNT = "";
    
    products.forEach((prod, i) => {
        const safeNameStr = prod.name || '';
        const standardName = safeNameStr.replace(/\n/g, '<br>');

        tbodyNT += `<tr>
            <td style="text-align: center; border: 1px solid black; padding: 6px;">${i + 1}</td>
            <td style="border: 1px solid black; padding: 6px;">${standardName}</td>
            <td style="text-align: center; border: 1px solid black; padding: 6px;">${prod.unit || ''}</td>
            <td style="text-align: center; border: 1px solid black; padding: 6px;">${prod.qty || 1}</td>
            <td style="text-align: center; border: 1px solid black; padding: 6px;">Mới 100%, Hoạt động tốt</td>
        </tr>`;
    });

    return `
        <div id="acceptance-section" class="doc-wrapper" style="position: relative;">
            <div class="watermark"></div>
            <div class="content-wrapper" contenteditable="true" style="outline: none;">
                <div style="text-align: center; margin-bottom: 20px;"><h3 style="margin: 0; font-weight: bold; font-size: 14pt;">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3><p style="margin: 0; font-weight: bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p><p style="margin: 5px 0 15px 0;">----------o0o-----------</p><h2 style="margin: 0; font-weight: bold; font-size: 16pt;">BIÊN BẢN BÀN GIAO & NGHIỆM THU</h2><p style="margin: 0; font-style: italic;">Căn cứ Hợp đồng số: ${docData.cNo}</p></div>
                <p style="margin-top: 15px;">Hôm nay, ${docData.dateString}, tại địa điểm: ${docData.deliveryAddress}. Chúng tôi gồm có:</p>
                <p style="margin-top: 10px;"><b><u>BÊN GIAO (BÊN B)</u> : CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ KB</b></p><p>Đại diện: <b>Ông/Bà ${docData.safeFullName}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Chức vụ: ${docData.safeRole}</p>
                <p style="margin-top: 10px;"><b><u>BÊN NHẬN (BÊN A)</u> : ${docData.bName}</b></p><p>Đại diện: <b>${docData.bRep}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Chức vụ: ${docData.bRole}</p>
                <p style="margin-top: 15px;">Hai bên cùng thống nhất tiến hành bàn giao và nghiệm thu các hạng mục thiết bị/dịch vụ sau:</p>
                <table><tr><th style="width: 5%; border: 1px solid black; padding: 6px;">STT</th><th style="width: 45%; border: 1px solid black; padding: 6px;">TÊN HÀNG HÓA / DỊCH VỤ</th><th style="width: 10%; border: 1px solid black; padding: 6px;">ĐVT</th><th style="width: 10%; border: 1px solid black; padding: 6px;">SL</th><th style="width: 30%; border: 1px solid black; padding: 6px;">TÌNH TRẠNG</th></tr>${tbodyNT}</table>
                <p><b>Kết luận:</b></p><p>- Bên B đã tiến hành bàn giao đầy đủ số lượng thiết bị, phụ kiện và hoàn tất các dịch vụ triển khai theo đúng Hợp đồng.</p><p>- Hàng hóa mới 100%, hoạt động ổn định, đủ điều kiện đưa vào sử dụng thực tế.</p><p>- Bên A đồng ý nghiệm thu toàn bộ hệ thống kể từ ngày ký biên bản này.</p><p>Biên bản được lập thành hai (02) bản có giá trị như nhau, mỗi bên giữ một (01) bản để làm cơ sở thanh lý hợp đồng.</p>
                <table style="border: none; width: 100%; margin-top: 20px;"><tr><td style="border: none; text-align: center; width: 50%;"><b>ĐẠI DIỆN BÊN NHẬN (BÊN A)</b></td><td style="border: none; text-align: center; width: 50%;"><b>ĐẠI DIỆN BÊN GIAO (BÊN B)</b></td></tr><tr><td style="border: none; height: 100px;"></td><td style="border: none; height: 100px;"></td></tr><tr><td style="border: none; text-align: center;"><b>${docData.bRep}</b></td><td style="border: none; text-align: center;"><b>${docData.safeFullName.toUpperCase()}</b></td></tr></table>
            </div>
        </div>
    `;
}