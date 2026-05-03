/* =========================================
   TANDA CRM - QUOTATION SYSTEM
========================================= */

// ================= 1. NOTIFICATION SYSTEM =================
const TANDA_Notify = {
    init: function() {
        if(!document.getElementById('tanda-toast-container')) {
            const tc = document.createElement('div');
            tc.id = 'tanda-toast-container';
            document.body.appendChild(tc);
        }
        if(!document.getElementById('tanda-modal-overlay')) {
            const mo = document.createElement('div');
            mo.id = 'tanda-modal-overlay';
            mo.innerHTML = `<div class="kb-modal"><h3 id="tanda-modal-title"></h3><div id="tanda-modal-msg"></div><div id="tanda-modal-actions" class="mt-4"></div></div>`;
            document.body.appendChild(mo);
        }
    },
    toast: function(message, type = 'success') {
        this.init();
        const container = document.getElementById('tanda-toast-container');
        const toast = document.createElement('div');
        toast.className = `kb-toast ${type}`;
        toast.innerHTML = `<span class="kb-toast-icon">${type === 'success' ? '✅' : '⚠️'}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {toast.classList.remove('show'); setTimeout(() => toast.remove(), 400);}, 3000);
    },
    alert: function(message, title = 'Thông báo') {
        return new Promise(resolve => {
            this.init();
            const overlay = document.getElementById('tanda-modal-overlay');
            document.getElementById('tanda-modal-title').innerText = title;
            document.getElementById('tanda-modal-msg').innerHTML = message;
            document.getElementById('tanda-modal-actions').innerHTML = `<button class="kb-btn kb-btn-primary" id="tanda-btn-ok">Đã hiểu</button>`;
            overlay.classList.add('show');
            document.getElementById('tanda-btn-ok').onclick = () => {overlay.classList.remove('show'); resolve(true);};
        });
    }
};

function formatMoney(num) { return new Intl.NumberFormat('vi-VN').format(num); }
function formatUnit(unitStr) { return (!unitStr) ? 'Cái' : unitStr.charAt(0).toUpperCase() + unitStr.slice(1).toLowerCase(); }
function safeVal(id, fallback = '') { const el = document.getElementById(id); return el && el.value ? String(el.value).trim() : fallback; }

const staffProfiles = {
    'admin': { fullName: 'Quản Trị Viên', email: 'admin@tanda.vn', phone: '0933129155', role: 'Quản lý' },
    'tuanhai': { fullName: 'Lê Tuấn Hải', email: 'tuanhai@tanda.vn', phone: '0933129155', role: 'Sale' },
    'myhoa': { fullName: 'Huỳnh Mỹ Hoa', email: 'myhoa@tanda.vn', phone: '0933129155', role: 'Sale' },
    'hoangduc': { fullName: 'Nguyễn Hoàng Đức', email: 'hoangduc@tanda.vn', phone: '0933129155', role: 'Sale' },
    'anhtu': { fullName: 'Phạm Đức Anh Tú', email: 'anhtu@tanda.vn', phone: '0933129155', role: 'Sale' }
};

let products = [], historyDataNAS = [];
window.currentUser = 'admin'; // Default user - NO LOGIN REQUIRED

document.addEventListener('DOMContentLoaded', () => { 
    showApp(); // Bypass login - go directly to app
});

// ===== LOGIN & AUTH (DISABLED - NO LOGIN REQUIRED) =====
// All authentication functions removed for direct access

async function login() {
    alert('Login disabled - direct access enabled');
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
    if(userDisplay) userDisplay.innerText = localStorage.getItem('tanda_full_name') || defaultDisplay;
    loadHistoryFromDB();
    createNewDocument(true);
}

function switchTab(tabId) {
    document.querySelectorAll('[id$="-tab"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id^="btn-"]').forEach(el => el.classList.remove('active'));
    let target = document.getElementById(tabId);
    if(target) target.classList.remove('hidden');
    let btn = document.getElementById('btn-' + tabId);
    if(btn) btn.classList.add('active');
}

async function loadHistoryFromDB() {
    try {
        let res = await fetch('api.php?action=get_history');
        let data = await res.json();
        if(data.status !== 'success') return;
        historyDataNAS = data.data;
        const container = document.getElementById('historyList');
        if(!container) return;
        container.innerHTML = '';
    } catch(e) {}
}

async function saveQuoteToDB() {
    if(!safeVal('quoteNo')) return TANDA_Notify.alert("Vui lòng điền số báo giá!");
    if(!safeVal('buyerName')) return TANDA_Notify.alert("Vui lòng điền tên khách hàng!");

    const isVatStr = document.getElementById('includeVat')?.checked ? '1' : '0';
    let calculatedTotal = products.reduce((sum, p) => sum + ((p.price || 0) * (p.qty || 0)), 0);
    if(isVatStr === '1') { calculatedTotal = calculatedTotal * 1.08; }

    let assigned = safeVal('assignedStaff') || window.currentUser || 'admin';

    const currentData = {
        action: 'save',
        doc_date: safeVal('docDate'), quote_no: safeVal('quoteNo'), contract_no: safeVal('contractNo'),
        project_name: safeVal('projectName'), buyer_name: safeVal('buyerName'), buyer_address: safeVal('buyerAddress'),
        delivery_address: safeVal('deliveryAddress'), buyer_tax: safeVal('buyerTax'), buyer_phone: safeVal('buyerPhone'),
        buyer_rep: safeVal('buyerRep'), buyer_role: safeVal('buyerRole'), payment_opt: safeVal('paymentOpt', '50') + '||' + isVatStr,
        staff_username: assigned, created_by: assigned, doc_type: safeVal('docType') || 'baogia',
        total_amount: Math.round(calculatedTotal), products_json: JSON.stringify(products)
    };

    let btn = document.getElementById('btnSaveDB');
    if(btn) { btn.innerHTML = "⏳ ĐANG LƯU..."; btn.disabled = true; }

    try {
        let res = await fetch('api.php?action=save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentData) });
        let data = await res.json();
        if (data.status === 'success') { TANDA_Notify.toast(data.message, "success"); loadHistoryFromDB(); }
        else TANDA_Notify.alert(data.message, "Lỗi");
    } catch(e) { TANDA_Notify.alert("Lỗi kết nối: " + e.message); }
    if(btn) { btn.innerHTML = "LƯU VÀO SERVER NAS"; btn.disabled = false; }
}

function toggleRetailCustomer() {
    const isRetail = document.getElementById('isRetailCustomer').checked;
    ['buyerName', 'buyerTax', 'buyerRep', 'buyerRole'].forEach(id => {
        let el = document.getElementById(id);
        if(el) el.value = isRetail ? (id === 'buyerName' ? 'Khách hàng lẻ' : 'N/A') : '';
    });
    updateDoc();
}

function createNewDocument(isInit = false) {
    if(!isInit && !confirm("Làm mới?")) return;
    if(document.getElementById('docDate')) document.getElementById('docDate').valueAsDate = new Date();
    ['projectName', 'buyerName', 'buyerAddress', 'deliveryAddress', 'buyerTax', 'buyerPhone', 'buyerRep', 'buyerRole'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = "";
    });
    const assignSelect = document.getElementById('assignedStaff');
    if (assignSelect && window.currentUser) assignSelect.value = window.currentUser;
    if(document.getElementById('includeVat')) document.getElementById('includeVat').checked = true;
    products = [{ name: "", bh: "12 tháng", unit: "Cái", qty: 1, price: 0 }];
    autoGenerateDocumentNumbers();
    renderProductInputs();
}

function autoGenerateDocumentNumbers() {
    const d = safeVal('docDate') ? new Date(safeVal('docDate')) : new Date();
    const baseCode = `TA${String(d.getFullYear()).slice(-2)}${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}`;
    let nextSuffix = 1;
    if (historyDataNAS && historyDataNAS.length > 0) {
        let maxSuffix = 0;
        historyDataNAS.forEach(item => {
            if (item.quote_no && item.quote_no.startsWith(baseCode)) {
                let parts = item.quote_no.split('-');
                if (parts.length >= 2) {
                    let suffix = parseInt(parts[1], 10);
                    if (!isNaN(suffix) && suffix > maxSuffix) maxSuffix = suffix;
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

const bhOptions = ["N/A", "12 tháng", "24 tháng", "36 tháng"];
const unitOptions = ["Cái", "Bộ", "Gói", "Mét"];

function createSelectHTML(options, currentValue, index, field) {
    let opts = options.map(opt => `<option value="${opt}" ${currentValue === opt ? 'selected' : ''}>${opt}</option>`).join('');
    return `<select onchange="updateProductSelect(${index}, '${field}', this.value)" class="input-premium py-2 cursor-pointer text-xs">${opts}<option value="Khác...">Nhập khác...</option></select>`;
}

function updateProductSelect(index, field, value) {
    if(value === "Khác...") { value = prompt("Nhập giá trị mới:") || (field === 'bh' ? "12 tháng" : "Cái"); }
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
    sections.forEach(s => document.getElementById(s)?.classList.toggle('no-print', sectionId !== 'all' && s !== sectionId));
    window.print();
    sections.forEach(s => document.getElementById(s)?.classList.remove('no-print'));
}

function updateDoc() {
    try {
        const docPreview = document.getElementById('documentPreview');
        if (!docPreview) return;
        let total = 0;
        products.forEach(p => total += (p.price || 0) * (p.qty || 0));
        const tax = (document.getElementById('includeVat') && document.getElementById('includeVat').checked) ? total * 0.08 : 0;
        docPreview.innerHTML = `<div class="p-10"><h1>Báo Giá</h1><p>Số báo giá: ${safeVal('quoteNo', '...')}</p><p>Khách hàng: ${safeVal('buyerName', '...')}</p><p>Tổng: ${formatMoney(total)} đ</p><p>Thuế: ${formatMoney(tax)} đ</p><p>Cộng: ${formatMoney(total + tax)} đ</p></div>`;
    } catch (err) {}
}
