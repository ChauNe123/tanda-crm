/* =========================================
   UI/UX: KB NOTIFICATION SYSTEM (JS) -> Đã update cho TANDA
========================================= */
const KB_Notify = {
    init: function() {
        if(!document.getElementById('kb-toast-container')) {
            const tc = document.createElement('div');
            tc.id = 'kb-toast-container';
            document.body.appendChild(tc);
        }
        if(!document.getElementById('kb-modal-overlay')) {
            const mo = document.createElement('div');
            mo.id = 'kb-modal-overlay';
            mo.innerHTML = `
                <div class="kb-modal">
                    <h3 id="kb-modal-title"></h3>
                    <div id="kb-modal-msg"></div>
                    <div id="kb-modal-actions" class="mt-4"></div>
                </div>`;
            document.body.appendChild(mo);
        }
    },
    toast: function(message, type = 'success') {
        this.init();
        const container = document.getElementById('kb-toast-container');
        const toast = document.createElement('div');
        toast.className = `kb-toast ${type}`;
        const icon = type === 'success' ? '✅' : '⚠️';
        toast.innerHTML = `<span class="kb-toast-icon">${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); 
        }, 3000);
    },
    alert: function(message, title = 'Thông báo') {
        return new Promise(resolve => {
            this.init();
            const overlay = document.getElementById('kb-modal-overlay');
            document.getElementById('kb-modal-title').innerText = title;
            document.getElementById('kb-modal-msg').innerHTML = message;
            const actions = document.getElementById('kb-modal-actions');
            actions.innerHTML = `<button class="kb-btn kb-btn-primary" id="kb-btn-ok">Đã hiểu</button>`;
            overlay.classList.add('show');
            document.getElementById('kb-btn-ok').onclick = () => { overlay.classList.remove('show'); resolve(true); };
        });
    },
    confirm: function(message, title = 'Xác nhận yêu cầu') {
        return new Promise(resolve => {
            this.init();
            const overlay = document.getElementById('kb-modal-overlay');
            document.getElementById('kb-modal-title').innerText = title;
            document.getElementById('kb-modal-msg').innerHTML = message;
            const actions = document.getElementById('kb-modal-actions');
            actions.innerHTML = `
                <button class="kb-btn kb-btn-secondary" id="kb-btn-cancel">Hủy bỏ</button>
                <button class="kb-btn kb-btn-primary" id="kb-btn-ok">Đồng ý</button>
            `;
            overlay.classList.add('show');
            document.getElementById('kb-btn-cancel').onclick = () => { overlay.classList.remove('show'); resolve(false); };
            document.getElementById('kb-btn-ok').onclick = () => { overlay.classList.remove('show'); resolve(true); };
        });
    },
    prompt: function(message, title = 'Nhập thông tin', defaultValue = '', listHtml = '') {
        return new Promise(resolve => {
            this.init();
            const overlay = document.getElementById('kb-modal-overlay');
            document.getElementById('kb-modal-title').innerText = title;
            
            let extraHtml = listHtml ? `<datalist id="kb-prompt-list">${listHtml}</datalist>` : '';
            let listAttr = listHtml ? `list="kb-prompt-list"` : '';

            document.getElementById('kb-modal-msg').innerHTML = `${message}<br><br>
                <input type="text" id="kb-prompt-input" class="input-premium text-xl" value="${defaultValue}" ${listAttr} style="text-align:center; font-weight:bold; color: #dc2626;">
                ${extraHtml}`;
            
            const actions = document.getElementById('kb-modal-actions');
            actions.innerHTML = `
                <button class="kb-btn kb-btn-secondary" id="kb-btn-cancel">Hủy</button>
                <button class="kb-btn kb-btn-primary" id="kb-btn-ok">Xác nhận</button>
            `;
            overlay.classList.add('show');
            const input = document.getElementById('kb-prompt-input');
            input.focus();

            input.addEventListener('input', function() {
                let val = this.value.replace(/[^0-9]/g, '');
                if(val) this.value = new Intl.NumberFormat('vi-VN').format(val);
            });
            
            document.getElementById('kb-btn-cancel').onclick = () => { overlay.classList.remove('show'); resolve(null); };
            document.getElementById('kb-btn-ok').onclick = () => { overlay.classList.remove('show'); resolve(input.value.trim()); };
        });
    },
    paymentPrompt: function(title, remainAmount, projectName) {
        return new Promise(resolve => {
            this.init();
            const overlay = document.getElementById('kb-modal-overlay');
            document.getElementById('kb-modal-title').innerText = title;

            let defaultAmount = new Intl.NumberFormat('vi-VN').format(remainAmount);

            document.getElementById('kb-modal-msg').innerHTML = `
                <div class="mb-3 text-sm text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">Dự án: <b class="text-slate-800">${projectName}</b></div>
                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-700 mb-1 text-left">1. Số tiền Kế toán thực thu (VNĐ)</label>
                    <input type="text" id="kb-prompt-amount" class="input-premium text-2xl text-emerald-600 font-black text-center" value="${defaultAmount}">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1 text-left">2. Hoa hồng chi cho Sale (VNĐ)</label>
                    <input type="text" id="kb-prompt-commission" class="input-premium text-xl text-amber-600 font-bold text-center" value="0">
                </div>
            `;
            
            const actions = document.getElementById('kb-modal-actions');
            actions.innerHTML = `
                <button class="kb-btn kb-btn-secondary" id="kb-btn-cancel">Hủy</button>
                <button class="kb-btn kb-btn-primary" id="kb-btn-ok">Xác nhận Lưu</button>
            `;
            overlay.classList.add('show');
            
            const inputAmount = document.getElementById('kb-prompt-amount');
            const inputCommission = document.getElementById('kb-prompt-commission');
            
            inputAmount.focus();

            const formatInput = function() {
                let val = this.value.replace(/[^0-9]/g, '');
                if(val) this.value = new Intl.NumberFormat('vi-VN').format(val);
            };

            inputAmount.addEventListener('input', formatInput);
            inputCommission.addEventListener('input', formatInput);
            
            document.getElementById('kb-btn-cancel').onclick = () => { overlay.classList.remove('show'); resolve(null); };
            document.getElementById('kb-btn-ok').onclick = () => { 
                overlay.classList.remove('show'); 
                resolve({
                    amount: inputAmount.value.replace(/[^0-9]/g, ''),
                    commission: inputCommission.value.replace(/[^0-9]/g, '')
                }); 
            };
        });
    }
};

function formatMoney(num) { return new Intl.NumberFormat('vi-VN').format(Math.round(num)); }
function formatUnit(unitStr) {
    if (!unitStr) return 'Cái';
    unitStr = unitStr.trim();
    return unitStr.charAt(0).toUpperCase() + unitStr.slice(1).toLowerCase();
}
function safeVal(id, fallback = '') {
    const el = document.getElementById(id);
    return el && el.value !== undefined ? String(el.value).trim() : fallback;
}

const staffProfiles = {
    'admin': { fullName: 'ADMIN TANDA', email: 'admin@tanda.vn', phone: '0933 129 155', role: 'Giám Đốc' },
};

let products = [];
let historyDataNAS = []; 
let inventoryList = []; 
window.currentUser = ''; 
window.buyerDirectory = {}; 

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

async function checkSession() {
    try {
        let res = await fetch('auth.php?action=check'); 
        let data = await res.json();
        if (data.status === 'logged_in') {
            window.currentUser = data.user || '';
            localStorage.setItem('kb_full_name', data.full_name || '');
            localStorage.setItem('kb_email', data.email || '');
            localStorage.setItem('kb_phone', data.phone || '');
            localStorage.setItem('kb_role', data.position || data.role || 'Phụ trách Kinh doanh');
            showApp();
        } else {
            document.getElementById('loginOverlay')?.classList.remove('hidden');
        }
    } catch(e) {}
}

async function login() {
    const uEl = document.getElementById('username');
    const pEl = document.getElementById('password');
    if (!uEl || !pEl) return;

    let btn = document.getElementById('btnLogin');
    let err = document.getElementById('loginError');
    if(err) err.classList.add('hidden');
    if(btn) { btn.innerHTML = 'ĐANG XỬ LÝ...'; btn.disabled = true; }

    try {
        let res = await fetch('auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: uEl.value.trim().toLowerCase(), password: pEl.value })
        });
        let data = await res.json();

        if (data.status === 'success' || data.status === 'logged_in') {
            window.currentUser = data.user || '';
            localStorage.setItem('kb_full_name', data.full_name || '');
            localStorage.setItem('kb_email', data.email || '');
            localStorage.setItem('kb_phone', data.phone || '');
            localStorage.setItem('kb_role', data.position || data.role || 'Phụ trách Kinh doanh');
            showApp();
        } else {
            if(err) { err.innerText = data.message; err.classList.remove('hidden'); }
            else KB_Notify.alert(data.message, "Đăng nhập thất bại");
        }
    } catch(e) {}
    if(btn) { btn.innerHTML = 'ĐĂNG NHẬP'; btn.disabled = false; }
}

async function logout() {
    await fetch('auth.php?action=logout');
    localStorage.clear();
    location.reload();
}

async function showApp() {
    document.getElementById('loginOverlay')?.classList.add('hidden');
    document.getElementById('appContainer')?.classList.remove('opacity-0', 'pointer-events-none');
    
    let defaultDisplay = staffProfiles[window.currentUser] ? staffProfiles[window.currentUser].fullName : window.currentUser;
    let userDisplay = document.getElementById('currentUserDisplay');
    if(userDisplay) userDisplay.innerText = localStorage.getItem('kb_full_name') || defaultDisplay;

    await loadHistoryFromDB(); 
    loadCustomersCRM(); 
    createNewDocument(true); 
}

function switchTab(tabId) {
    const allTabs = ['form-tab', 'history-tab'];
    const allBtns = ['btn-form-tab', 'btn-history-tab'];

    allTabs.forEach(id => {
        let el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    allBtns.forEach(id => {
        let el = document.getElementById(id);
        if(el) el.classList.remove('active', 'border-orange-600', 'text-orange-600', 'bg-orange-50/50');
    });
    
    let target = document.getElementById(tabId);
    if(target) target.classList.remove('hidden');
    
    let btnTarget = document.getElementById('btn-' + tabId);
    if(btnTarget) btnTarget.classList.add('active', 'border-orange-600', 'text-orange-600', 'bg-orange-50/50');
}

async function loadCustomersCRM() {
    try {
        let res = await fetch('api.php?action=get_history'); 
        let data = await res.json();
        if (data.status === 'success' && data.data) {
            window.buyerDirectory = {};
            const dataList = document.getElementById('buyer-suggestions');
            if(!dataList) return;
            dataList.innerHTML = '';
            data.data.forEach(c => {
                if(c.buyer_name) {
                    window.buyerDirectory[c.buyer_name] = c;
                    let option = document.createElement('option');
                    option.value = c.buyer_name;
                    dataList.appendChild(option);
                }
            });
            bindCustomerAutocomplete();
        }
    } catch(e) {}
}

function bindCustomerAutocomplete() {
    const buyerInput = document.getElementById('buyerName');
    if(buyerInput && !buyerInput.hasAttribute('data-bound')) {
        buyerInput.addEventListener('input', function() {
            const name = this.value.trim();
            if(window.buyerDirectory && window.buyerDirectory[name]) {
                const info = window.buyerDirectory[name];
                if(document.getElementById('buyerAddress')) document.getElementById('buyerAddress').value = info.buyer_address || '';
                if(document.getElementById('buyerTax')) document.getElementById('buyerTax').value = info.buyer_tax || '';
                if(document.getElementById('buyerPhone')) document.getElementById('buyerPhone').value = info.buyer_phone || '';
                if(document.getElementById('buyerRep')) document.getElementById('buyerRep').value = info.buyer_rep || '';
                if(document.getElementById('buyerRole')) document.getElementById('buyerRole').value = info.buyer_role || '';
                updateDoc();
            }
        });
        buyerInput.setAttribute('data-bound', 'true');
    }
}

function toggleRetailCustomer() {
    const isRetail = document.getElementById('isRetailCustomer').checked;
    const bName = document.getElementById('buyerName'), bTax = document.getElementById('buyerTax'), bRep = document.getElementById('buyerRep'), bRole = document.getElementById('buyerRole');
    if (isRetail) {
        if(bName) bName.value = "Khách hàng lẻ"; if(bTax) bTax.value = "N/A"; if(bRep) bRep.value = "N/A"; if(bRole) bRole.value = "N/A";
    } else {
        if(bName) bName.value = ""; if(bTax) bTax.value = ""; if(bRep) bRep.value = ""; if(bRole) bRole.value = "";
    }
    updateDoc();
}

async function saveQuoteToDB() {
    if(!safeVal('quoteNo')) return KB_Notify.alert("Vui lòng điền số báo giá!", "Cảnh báo");
    if(!safeVal('buyerName')) return KB_Notify.alert("Vui lòng điền tên khách hàng!", "Cảnh báo");

    const isVatStr = document.getElementById('includeVat')?.checked ? '1' : '0';
    
    let calculatedTotal = products.reduce((sum, p) => sum + ((p.price || 0) * (p.qty || 0)), 0);
    if(isVatStr === '1') { calculatedTotal = calculatedTotal * 1.08; }

    let assigned = safeVal('assignedStaff');
    if (!assigned || assigned === '') {
        assigned = window.currentUser || 'admin';
    }

    const currentData = {
        action: 'save',
        doc_date: safeVal('docDate'), quote_no: safeVal('quoteNo'), contract_no: safeVal('contractNo'),
        project_name: safeVal('projectName'), buyer_name: safeVal('buyerName'), buyer_address: safeVal('buyerAddress'),
        delivery_address: safeVal('deliveryAddress'), buyer_tax: safeVal('buyerTax'), buyer_phone: safeVal('buyerPhone'),
        buyer_rep: safeVal('buyerRep'), buyer_role: safeVal('buyerRole'), payment_opt: safeVal('paymentOpt', '50') + '||' + isVatStr,
        staff_username: assigned, 
        created_by: assigned,     
        doc_type: safeVal('docType') || 'baogia', 
        total_amount: Math.round(calculatedTotal), 
        products_json: JSON.stringify(products)
    };

    let btn = document.getElementById('btnSaveDB');
    if(btn) { btn.innerHTML = "⏳ ĐANG LƯU BÁO GIÁ..."; btn.disabled = true; }

    try {
        let res = await fetch('api.php?action=save', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(currentData) 
        });
        
        let rawText = await res.text();
        let data;
        
        try {
            data = JSON.parse(rawText);
        } catch(err) {
            console.error("RAW LỖI TỪ SERVER:", rawText);
            KB_Notify.alert(`<b>SERVER DATABASE BÁO LỖI:</b><br><div class="mt-2 text-xs text-red-600 bg-red-50 p-3 border border-red-200 rounded max-h-40 overflow-auto text-left font-mono">${rawText || "Không có phản hồi"}</div><br><i>*Hãy chụp màn hình này gửi Team dev!</i>`, "Lỗi Hệ Thống Trầm Trọng");
            if(btn) { btn.innerHTML = "LƯU VÀO SERVER NAS"; btn.disabled = false; }
            return;
        }

        if (data.status === 'success') { 
            KB_Notify.toast(data.message, "success");
            loadHistoryFromDB(); loadCustomersCRM();
        } else {
            KB_Notify.alert(data.message, "Lỗi từ Backend");
        }
    } catch(e) { 
        KB_Notify.alert("Mất kết nối hoàn toàn tới API! Chi tiết: " + e.message, "Lỗi Mạng"); 
    }
    if(btn) { btn.innerHTML = "LƯU VÀO SERVER NAS"; btn.disabled = false; }
}

async function loadHistoryFromDB() {
    const container = document.getElementById('historyList');
    if(!container) return;

    try {
        let res = await fetch('api.php?action=get_history');
        let data = await res.json();
        
        // Luôn làm sạch vùng chứa trước khi đổ data mới
        container.innerHTML = '';

        // Kiểm tra an toàn: Nếu API lỗi, hoặc data.data không phải là một mảng, hoặc mảng rỗng
        if(data.status !== 'success' || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
            historyDataNAS = [];
            container.innerHTML = '<div class="text-center p-8 bg-white rounded-2xl"><p class="text-slate-400">Chưa có dữ liệu.</p></div>';
            return;
        }
        
        historyDataNAS = data.data; 
        
        data.data.forEach(item => {
            let prods = []; try { prods = JSON.parse(item.products_json); } catch(e){}
            let hasVat = ((item.payment_opt || '50||1').split('||')[1] !== '0');
            const totalAmount = prods.reduce((acc, p) => acc + ((p.price||0) * (p.qty||0)), 0);
            const grandTotal = hasVat ? (totalAmount * 1.08) : totalAmount;

            let displayName = staffProfiles[item.created_by] ? staffProfiles[item.created_by].fullName : item.created_by;
            let staffBadge = item.created_by ? `<span class="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shadow-sm ml-2">👤 ${displayName}</span>` : '';
            // Thêm đoạn này để format ngày
            let dateParts = (item.doc_date || '').split('-');
            let displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : item.doc_date;
            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow transition-shadow">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs cursor-pointer" onclick="fillHistoryToForm(${item.id})">📦 ${item.quote_no}</span>
                        <span class="text-xs text-slate-400">${displayDate}</span>
                    </div>
                    <div class="text-sm font-bold text-slate-800 cursor-pointer hover:text-orange-600 flex items-center" onclick="fillHistoryToForm(${item.id})">
                        ${item.buyer_name || 'Khách lẻ'} ${staffBadge}
                    </div>
                    <div class="text-xs text-slate-500 mt-1 mb-3 truncate" title="${item.project_name || 'Chưa đặt tên'}">${item.project_name || 'Chưa đặt tên'}</div>
                    <div class="flex justify-between items-center pt-3 border-t border-slate-100">
                        <div class="text-[13px] font-black text-orange-600">${formatMoney(grandTotal)} ₫</div>
                    </div>
                </div>`);
        });
    } catch(e) { 
        console.error("Lỗi hiển thị lịch sử:", e); 
        // Bắt lỗi triệt để: Nếu code crash giữa chừng, sẽ hiển thị thông báo thay vì trống trơn
        container.innerHTML = '<div class="text-center p-8 bg-white rounded-2xl"><p class="text-red-500 font-bold">Đã xảy ra lỗi khi tải lịch sử. Vui lòng tải lại trang (Ctrl + F5)!</p></div>';
    }
}

async function fillHistoryToForm(dbId) {
    const item = historyDataNAS.find(h => h.id == dbId);
    if(!item) return;
    let isOk = await KB_Notify.confirm(`Tải lại dữ liệu của <b>${item.quote_no}</b>?<br>Form hiện tại sẽ bị ghi đè.`, "Khôi phục báo giá");
    if(!isOk) return;

    ['docDate', 'quoteNo', 'contractNo', 'projectName', 'buyerName', 'buyerAddress', 'deliveryAddress', 'buyerTax', 'buyerPhone', 'buyerRep', 'buyerRole'].forEach(id => {
        let el = document.getElementById(id);
        let dbField = id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if(el && item[dbField] !== undefined && item[dbField] !== null) el.value = item[dbField];
    });

    const assignSelect = document.getElementById('assignedStaff');
    if (assignSelect && item.created_by) { assignSelect.value = item.created_by; }
    
    let parts = (item.payment_opt || '50||1').split('||');
    if(document.getElementById('paymentOpt')) document.getElementById('paymentOpt').value = parts[0];
    if(document.getElementById('includeVat')) document.getElementById('includeVat').checked = (parts[1] !== '0');
    
    const chkRetail = document.getElementById('isRetailCustomer'); if(chkRetail) chkRetail.checked = (item.buyer_name || '').toLowerCase().includes('khách hàng lẻ');
    
    try { products = JSON.parse(item.products_json) || []; } catch(e){ products = []; }
    if(products.length === 0) products = [{ name: "", bh: "12 tháng", unit: "Cái", qty: 1, price: 0 }];
    
    renderProductInputs();
    switchTab('form-tab');
}

function createNewDocument(isInit = false) {
    if(!isInit) {
        if(!confirm("Làm mới? Dữ liệu đang nhập sẽ bị xóa!")) return;
    }
    
    if(document.getElementById('docDate')) document.getElementById('docDate').valueAsDate = new Date();
    ['projectName', 'buyerName', 'buyerAddress', 'deliveryAddress', 'buyerTax', 'buyerPhone', 'buyerRep', 'buyerRole'].forEach(id => { 
        if(document.getElementById(id)) document.getElementById(id).value = ""; 
    });
    
    const assignSelect = document.getElementById('assignedStaff');
    if (assignSelect && window.currentUser) {
        assignSelect.value = window.currentUser;
    }
    
    if(document.getElementById('includeVat')) document.getElementById('includeVat').checked = true;
    products = [{ name: "", bh: "12 tháng", unit: "Cái", qty: 1, price: 0 }];
    
    autoGenerateDocumentNumbers();
    renderProductInputs();
    if(!isInit) { switchTab('form-tab'); }
}

function autoGenerateDocumentNumbers() {
    const d = safeVal('docDate') ? new Date(safeVal('docDate')) : new Date();
    const baseCode = `TANDA${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    
    let nextSuffix = 1;
    if (historyDataNAS && historyDataNAS.length > 0) {
        let maxSuffix = 0;
        historyDataNAS.forEach(item => {
            if (item.quote_no && item.quote_no.startsWith(baseCode)) {
                let parts = item.quote_no.split('-');
                if (parts.length >= 2) {
                    let suffix = parseInt(parts[1], 10);
                    if (!isNaN(suffix) && suffix > maxSuffix) {
                        maxSuffix = suffix;
                    }
                }
            }
        });
        nextSuffix = maxSuffix + 1;
    }
    
    if(document.getElementById('quoteNo')) document.getElementById('quoteNo').value = `${baseCode}-${nextSuffix}`;
    if(document.getElementById('contractNo')) document.getElementById('contractNo').value = `${baseCode}-${nextSuffix}-HDMB`;
}

function handleDateChange() { autoGenerateDocumentNumbers(); updateDoc(); }

function updateProductName(index, value) { products[index].name = value; updateDoc(); }
function updateProductQty(index, value) { products[index].qty = parseInt(value) || 0; updateDoc(); }
function handlePriceInput(inputElem, index) {
    let numValue = parseInt(inputElem.value.replace(/[^0-9]/g, ''), 10) || 0;
    products[index].price = numValue;
    inputElem.value = numValue === 0 ? '' : formatMoney(numValue);
    updateDoc(); 
}

const bhOptions = ["N/A", "12 tháng", "24 tháng", "36 tháng", "60 tháng"];
const unitOptions = ["Cái", "Bộ", "Gói", "Mét"];
function createSelectHTML(options, currentValue, index, field) {
    let isCustom = true;
    let opts = options.map(opt => {
        if(currentValue === opt) isCustom = false;
        return `<option value="${opt}" ${currentValue === opt ? 'selected' : ''}>${opt}</option>`;
    }).join('');
    if(isCustom && currentValue) opts += `<option value="${currentValue}" selected>${currentValue}</option>`;
    return `<select onchange="updateProductSelect(${index}, '${field}', this.value)" class="input-premium py-2 cursor-pointer text-xs">${opts}<option value="Khác...">Nhập khác...</option></select>`;
}

function updateProductSelect(index, field, value) {
    if(value === "Khác...") { value = prompt("Nhập giá trị mới:") || ((field === 'bh') ? "12 tháng" : "Cái"); }
    products[index][field] = value;
    renderProductInputs();
}

function renderProductInputs() {
    const container = document.getElementById('productList');
    if(!container) return;
    container.innerHTML = '';
    products.forEach((prod, index) => {
        container.insertAdjacentHTML('beforeend', `
            <div class="bg-white border border-slate-200 p-5 rounded-2xl relative group mb-4">
                <button onclick="removeProductRow(${index})" class="absolute -top-3 -right-3 bg-white border border-slate-200 text-red-500 rounded-full w-8 h-8 font-bold hover:bg-red-500 hover:text-white transition-all z-10 shadow-sm">✕</button>
                <div class="mb-4"><label class="label-premium">Tên & Mô tả</label><textarea rows="3" oninput="updateProductName(${index}, this.value)" class="input-premium font-medium">${prod.name || ''}</textarea></div>
                <div class="grid grid-cols-12 gap-2">
                    <div class="col-span-3"><label class="label-premium">Bảo hành</label>${createSelectHTML(bhOptions, prod.bh || '12 tháng', index, 'bh')}</div>
                    <div class="col-span-2"><label class="label-premium">Đơn vị</label>${createSelectHTML(unitOptions, prod.unit || 'Cái', index, 'unit')}</div>
                    <div class="col-span-2"><label class="label-premium text-center">SL</label><input type="number" min="1" value="${prod.qty || 1}" oninput="updateProductQty(${index}, this.value)" class="input-premium text-center"></div>
                    <div class="col-span-5"><label class="label-premium text-right">Đơn giá</label><input type="text" value="${(prod.price||0)===0 ? '' : formatMoney(prod.price)}" oninput="handlePriceInput(this, ${index})" class="input-premium text-right text-red-600 font-bold"></div>
                </div>
            </div>`);
    });
    updateDoc(); 
}

function addProductRow() { products.push({ name: "", bh: "12 tháng", unit: "Cái", qty: 1, price: 0 }); renderProductInputs(); }
function removeProductRow(index) { products.splice(index, 1); renderProductInputs(); }

function printSection(sectionId) {
    const sections = ['quote-section', 'contract-section', 'acceptance-section'];
    const dividers = document.querySelectorAll('.print-divider');
    sections.forEach(s => document.getElementById(s)?.classList.toggle('no-print', sectionId !== 'all' && s !== sectionId));
    dividers.forEach(d => d.classList.toggle('no-print', sectionId !== 'all'));
    window.print();
    sections.forEach(s => document.getElementById(s)?.classList.remove('no-print'));
    dividers.forEach(d => d.classList.remove('no-print'));
}

function updateDoc() {
    try {
        const docPreview = document.getElementById('documentPreview');
        if (!docPreview) return;
        
        const cDate = safeVal('docDate') ? new Date(safeVal('docDate')) : new Date();
        
        // ÉP CỨNG TẤT CẢ LÀ ADMIN TANDA - GIÁM ĐỐC TẠI ĐÂY
        const docData = {
            safeFullName: 'ADMIN TANDA', 
            safePhone: '0933 129 155', 
            safeEmail: 'admin@tanda.vn', 
            safeRole: 'Giám Đốc',
            dateString: `ngày ${String(cDate.getDate()).padStart(2, '0')} tháng ${String(cDate.getMonth() + 1).padStart(2, '0')} năm ${cDate.getFullYear()}`,
            pdfDateStr: `${String(cDate.getDate()).padStart(2, '0')}/${String(cDate.getMonth() + 1).padStart(2, '0')}/${cDate.getFullYear()}`,
            qNo: safeVal('quoteNo', ".................."), 
            cNo: safeVal('contractNo', ".................."), 
            pName: safeVal('projectName', ".................."),
            bName: safeVal('buyerName', "......................................................."), 
            bAddress: safeVal('buyerAddress', "......................................................................................."),
            bTax: safeVal('buyerTax', "........................."), 
            bPhone: safeVal('buyerPhone', ""), 
            bRep: safeVal('buyerRep', ".............................."), 
            bRole: safeVal('buyerRole', ".............................."),
            payOpt: safeVal('paymentOpt', "50"), 
            deliveryAddress: safeVal('deliveryAddress').trim() !== "" ? safeVal('deliveryAddress').trim() : safeVal('buyerAddress', "......................................................................................."),
            isVat: document.getElementById('includeVat') ? document.getElementById('includeVat').checked : true
        };

        let total = 0; products.forEach(p => total += (p.price || 0) * (p.qty || 0));
        docData.total = total; docData.tax = docData.isVat ? total * 0.08 : 0; docData.grandTotal = total + docData.tax;

        let quoteHtml = typeof generateQuoteHTML === 'function' ? generateQuoteHTML(docData, products, formatMoney) : '';
        let contractHtml = typeof generateContractHTML === 'function' ? generateContractHTML(docData, products, formatMoney) : '';
        let acceptHtml = typeof generateAcceptanceHTML === 'function' ? generateAcceptanceHTML(docData, products) : '';

        // Chỉ giữ lại đoạn đổi tài khoản ngân hàng nếu là khách lẻ
        const isRetail = document.getElementById('isRetailCustomer') ? document.getElementById('isRetailCustomer').checked : false;
        if (isRetail) {
            quoteHtml = quoteHtml.replace(/305258/g, "19028000272011");          
            quoteHtml = quoteHtml.replace(/Ngân hàng ACB<\/span>[\s\S]*?\(CN Ông Ích Khiêm\)<\/span>/gi, "Ngân hàng Techcombank</span>");            
            quoteHtml = quoteHtml.replace(/(Chủ Tài Khoản:<\/span>[\s\S]*?)CÔNG TY TNHH TM DV TANDA/gi, "$1ADMIN TANDA");
        }

        // Vứt bỏ toàn bộ các đoạn contractHtml.replace("LÊ TUẤN HẢI"...) cũ rác rưởi ở đây

        docPreview.innerHTML = `
            ${quoteHtml}
            <div class="print-divider page-break w-full border-t-2 border-dashed border-slate-300 my-10 py-5 text-center text-slate-400 text-xs font-semibold tracking-widest no-print">CUT HERE / NEXT PAGE</div>
            ${contractHtml}
            <div class="print-divider page-break w-full border-t-2 border-dashed border-slate-300 my-10 py-5 text-center text-slate-400 text-xs font-semibold tracking-widest no-print">CUT HERE / NEXT PAGE</div>
            ${acceptHtml}
        `;
    } catch (err) {
        console.error(err);
    }
}