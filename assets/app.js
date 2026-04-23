/* =========================================
   UI/UX: KB NOTIFICATION SYSTEM (JS)
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

// ================= 1. TIỆN ÍCH =================
function formatMoney(num) { return new Intl.NumberFormat('vi-VN').format(num); }
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
    'admin': { fullName: 'Lê Tuấn Hải', email: 'admin@kbtech.vn', phone: '0933 129 155', role: 'Quản lý Hệ thống' },
    'tuanhai': { fullName: 'Lê Tuấn Hải', email: 'tuanhai@kbtech.vn', phone: '0933 129 155', role: 'Phụ trách Kinh doanh' },
    'myhoa': { fullName: 'Huỳnh Mỹ Hoa', email: 'myhoa@kbtech.vn', phone: '0933 129 155', role: 'Phụ trách Kinh doanh' },
    'hoangduc': { fullName: 'Nguyễn Hoàng Đức', email: 'hoangduc@kbtech.vn', phone: '0933 129 155', role: 'Phụ trách Kinh doanh' },
    'anhtu': { fullName: 'Phạm Đức Anh Tú', email: 'anhtu@kbtech.vn', phone: '0933 129 155', role: 'Phụ trách Kinh doanh' },
    'huukhuong': { fullName: 'Nguyễn Hữu Khương', email: 'huukhuong@kbtech.vn', phone: '0933 129 155', role: 'Phụ trách Kinh doanh' },
    'thanhchau': { fullName: 'Nguyễn Thành Châu', email: 'thanhchau@kbtech.vn', phone: '0933 129 155', role: 'Phụ trách Kinh doanh' }
};

// ================= 2. BIẾN TOÀN CỤC =================
let products = [];
let historyDataNAS = []; 
let inventoryList = []; 
window.currentUser = ''; 
window.buyerDirectory = {}; 

// ================= 3. KHỞI TẠO =================
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadInventory();
});

// ================= 4. LOGIN & AUTH =================
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
    const allTabs = ['form-tab', 'history-tab', 'order-tab', 'dashboard-tab'];
    const allBtns = ['btn-form-tab', 'btn-history-tab', 'btn-order-tab', 'btn-dashboard-tab'];

    allTabs.forEach(id => {
        let el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    allBtns.forEach(id => {
        let el = document.getElementById(id);
        if(el) el.classList.remove('active', 'border-red-600', 'text-red-600', 'bg-red-50/50');
    });
    
    let target = document.getElementById(tabId);
    if(target) target.classList.remove('hidden');
    
    let btnTarget = document.getElementById('btn-' + tabId);
    if(btnTarget) btnTarget.classList.add('active', 'border-red-600', 'text-red-600', 'bg-red-50/50');
}

// ================= 5. KHO HÀNG & CRM =================
async function loadInventory() {
    try {
        const res = await fetch('proxy.php'); 
        if (!res.ok) return;
        const data = await res.json();
        inventoryList = data.data || data || []; 
        let datalist = document.getElementById('inventory-datalist');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'inventory-datalist';
            document.body.appendChild(datalist);
        }
        datalist.innerHTML = inventoryList.map(item => `<option value="${(item.productName || '').replace(/"/g, '&quot;')}"></option>`).join('');
    } catch (e) {}
}

function getInventorySearchHTML(index) {
    return;
}

function applyFromSearch(inputEl, index) {
    const searchTerm = inputEl.value.trim().toLowerCase();
    if (!searchTerm) return;
    let item = inventoryList.find(p => (p.productName||'').toLowerCase() === searchTerm) || inventoryList.find(p => (p.productName||'').toLowerCase().includes(searchTerm));
    if (item) {
        products[index].name = item.productName;
        products[index].unit = formatUnit(item.unit || 'Cái');
        products[index].price = parseInt(item.salePrice || 0) || 0;
        renderProductInputs();
    }
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

// ================= 6. LƯU VÀ TẢI BÁO GIÁ =================
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
    try {
        let res = await fetch('api.php?action=get_history');
        let data = await res.json();
        if(data.status !== 'success') return;
        
        historyDataNAS = data.data; 
        const container = document.getElementById('historyList');
        if(!container) return;
        container.innerHTML = '';
        if(data.data.length === 0) {
            return container.innerHTML = '<div class="text-center p-8 bg-white rounded-2xl"><p class="text-slate-400">Chưa có dữ liệu.</p></div>';
        }
        
        data.data.forEach(item => {
            let prods = []; try { prods = JSON.parse(item.products_json); } catch(e){}
            let hasVat = ((item.payment_opt || '50||1').split('||')[1] !== '0');
            const totalAmount = prods.reduce((acc, p) => acc + ((p.price||0) * (p.qty||0)), 0);
            const grandTotal = hasVat ? (totalAmount * 1.08) : totalAmount;

            let displayName = staffProfiles[item.created_by] ? staffProfiles[item.created_by].fullName : item.created_by;
            let staffBadge = item.created_by ? `<span class="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shadow-sm ml-2">👤 ${displayName}</span>` : '';
            let safeBuyerName = (item.buyer_name || '').replace(/'/g, "\\'");

            let actionButton = '';
            
            let isConverted = (item.is_converted == 1 || item.is_converted === '1' || item.is_converted === true || String(item.is_converted).toLowerCase() === 'true');

            if (isConverted) {
                actionButton = `<button disabled class="bg-slate-200 border border-slate-300 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded shadow-sm cursor-not-allowed uppercase">✓ Đã Lên Đơn</button>`;
            } else {
                actionButton = `<button onclick="convertQuoteToOrder(${item.id}, '${safeBuyerName}')" class="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded shadow-sm uppercase">CHỐT ĐƠN HÀNG</button>`;
            }

            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow transition-shadow">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold text-red-600 bg-red-50 px-2 py-1 rounded text-xs cursor-pointer" onclick="fillHistoryToForm(${item.id})">📦 ${item.quote_no}</span>
                        <span class="text-xs text-slate-400">${item.doc_date}</span>
                    </div>
                    <div class="text-sm font-bold text-slate-800 cursor-pointer hover:text-red-600 flex items-center" onclick="fillHistoryToForm(${item.id})">
                        ${item.buyer_name || 'Khách lẻ'} ${staffBadge}
                    </div>
                    <div class="text-xs text-slate-500 mt-1 mb-3 truncate" title="${item.project_name || 'Chưa đặt tên'}">${item.project_name || 'Chưa đặt tên'}</div>
                    <div class="flex justify-between items-center pt-3 border-t border-slate-100">
                        <div class="text-[13px] font-black text-red-600">${formatMoney(grandTotal)} ₫</div>
                        ${actionButton}
                    </div>
                </div>`);
        });
    } catch(e) { console.error("Lỗi hiển thị lịch sử:", e); }
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

// ================= 7. KANBAN KÉO THẢ VÀ QUẢN LÝ CÔNG NỢ =================
function setupKanbanDragDrop() {
    ['pending', 'exported', 'completed'].forEach(status => {
        let col = document.getElementById('col-' + status);
        if(!col) return;
        
        col.ondragover = (e) => { 
            e.preventDefault(); 
            col.classList.add('ring-2', 'ring-red-400', 'bg-red-50/50', 'rounded-xl'); 
        };
        col.ondragleave = (e) => { 
            col.classList.remove('ring-2', 'ring-red-400', 'bg-red-50/50', 'rounded-xl'); 
        };
        col.ondrop = (e) => {
            e.preventDefault();
            col.classList.remove('ring-2', 'ring-red-400', 'bg-red-50/50', 'rounded-xl');
            let orderId = e.dataTransfer.getData("orderId");
            let oldStatus = e.dataTransfer.getData("oldStatus");
            if (orderId && oldStatus !== status) { 
                updateOrderStatus(orderId, status); 
            }
        };
    });
}

async function loadOrderHistory() {
    try {
        let res = await fetch('api.php?action=get_orders');
        let data = await res.json();
        if (data.status !== 'success') return;

        const userRole = localStorage.getItem('kb_role') || '';
        const isAdmin = (userRole.toLowerCase().includes('quản lý') || userRole === 'admin' || window.currentUser === 'admin' || window.currentUser === 'tuanhai');

        let pending = '', exported = '', completed = '';

        data.data.forEach(item => {
            let paid = parseFloat(item.paid_amount) || 0;
            let total = parseFloat(item.total_amount) || 0;
            let remain = total - paid;

            let payBadge = item.payment_status === 'paid' ? '<span class="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Đã Thu Đủ</span>'
                         : (item.payment_status === 'partial' ? '<span class="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Thu 1 Phần</span>'
                         : '<span class="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">Chưa Thu Tiền</span>');

            let btnPay = '';
            let debtInfo = '';
            let safeProjectName = (item.project_name || 'Hợp đồng / Đơn hàng').replace(/'/g, "\\'");
            
            if (remain > 0) {
                debtInfo = `<div class="text-[10px] text-slate-500 mt-1">Đã thu: <span class="text-emerald-600 font-bold">${formatMoney(paid)}</span> | Còn nợ: <span class="text-red-500 font-bold">${formatMoney(remain)}</span></div>`;
                
                if (item.status === 'pending') {
                    btnPay = `<button disabled class="flex-1 bg-slate-50 text-slate-400 text-[10px] py-2 rounded-lg font-bold border border-slate-200 border-dashed cursor-not-allowed z-10">⏳ Chờ duyệt xuất kho</button>`;
                } else if (isAdmin) {
                    btnPay = `<button onclick="promptPayment(${item.id}, ${remain}, '${safeProjectName}')" class="flex-1 bg-emerald-500 text-white text-[10px] py-2 rounded-lg font-bold hover:bg-emerald-600 shadow-sm transition cursor-pointer z-10">💰 Nộp Tiền</button>`;
                } else {
                    btnPay = `<button disabled class="flex-1 bg-slate-100 text-slate-400 text-[10px] py-2 rounded-lg font-bold cursor-not-allowed z-10 border border-slate-200">Chỉ Admin</button>`;
                }
            } else {
                debtInfo = `<div class="text-[10px] text-emerald-600 mt-1 font-bold">✓ Đã thanh toán 100%</div>`;
            }

            let card = `
                <div draggable="true" ondragstart="event.dataTransfer.setData('orderId', '${item.id}'); event.dataTransfer.setData('oldStatus', '${item.status}');" 
                     class="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing relative mb-3">
                    
                    <div class="flex justify-between items-start mb-2">
                        <span class="font-black text-slate-800 text-[11px] bg-slate-100 px-2 py-1 rounded border">${item.order_no}</span>
                        <div class="text-[9px] font-bold">${payBadge}</div>
                    </div>
                    
                    <div class="text-[13px] font-bold text-slate-700 leading-snug mb-1">${item.customer_name || 'Khách lẻ'}</div>
                    <div class="text-[11px] font-bold text-red-600">Trị giá: ${formatMoney(total)} ₫</div>
                    ${debtInfo}
                    
                    ${btnPay ? `<div class="mt-3 pt-3 border-t border-slate-100 flex gap-2 relative z-10" onmousedown="event.stopPropagation();">${btnPay}</div>` : ''}
                </div>`;

            if (item.status === 'completed') completed += card;
            else if (item.status === 'exported') exported += card;
            else pending += card; 
        });

        if(document.getElementById('col-pending')) document.getElementById('col-pending').innerHTML = pending || '<div class="text-[11px] text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">Kéo thả vào đây</div>';
        if(document.getElementById('col-exported')) document.getElementById('col-exported').innerHTML = exported || '<div class="text-[11px] text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">Kéo thả vào đây</div>';
        if(document.getElementById('col-completed')) document.getElementById('col-completed').innerHTML = completed || '<div class="text-[11px] text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">Kéo thả vào đây</div>';

        setupKanbanDragDrop();

    } catch (e) {}
}

async function convertQuoteToOrder(quoteId, companyName = '') {
    let isOk = await KB_Notify.confirm('Xác nhận chốt Báo giá này thành <b>Đơn Hàng chính thức</b>?', 'Chốt Đơn');
    if(!isOk) return;

    let finalTarget = '';

    if (companyName.toLowerCase().includes('khách hàng lẻ')) {
        finalTarget = 'Khách hàng lẻ';
    } else if (companyName !== '') {
        KB_Notify.toast("Đang đồng bộ dữ liệu với báo cáo...", "success");
        try {
            let checkRes = await fetch('api.php?action=check_report_target', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ action: 'check_report_target', company_name: companyName })
            });
            let checkData = await checkRes.json();

            if (checkData.status === 'exact_match') {
                finalTarget = checkData.target;
            } else if (checkData.status === 'suggest_match') {
                let optionsHTML = checkData.all_targets.map(t => `<option value="${t}">`).join('');
                let promptMsg = `Đối tác này chưa được lập Báo cáo bao giờ.<br>Hệ thống gợi ý Tên định danh là: <b>${checkData.suggested}</b>.<br><br>Nếu sai, hãy gõ sửa lại hoặc chọn từ danh sách:`;
                
                let userTarget = await KB_Notify.prompt(promptMsg, "Xác nhận Tên Báo Cáo", checkData.suggested, optionsHTML);
                if (userTarget === null) return; 
                finalTarget = userTarget;
            }
        } catch (e) {}
    }

    try {
        let agentDisplay = localStorage.getItem('kb_full_name') || staffProfiles[window.currentUser]?.fullName || window.currentUser;
        let res = await fetch('api.php?action=create_order_from_quote', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ action: 'create_order_from_quote', quote_id: quoteId, report_target: finalTarget, agent_name: agentDisplay }) 
        });
        
        let rawText = await res.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch(err) {
            console.error("RAW LỖI:", rawText);
            KB_Notify.alert(`<b>SERVER BÁO LỖI:</b><br><div class="mt-2 text-xs text-red-600 bg-red-50 p-3 border border-red-200 rounded max-h-40 overflow-auto font-mono text-left">${rawText}</div>`, "Lỗi Xử Lý Chốt Đơn");
            return;
        }

        if(data.status === 'success') { 
            KB_Notify.toast(data.message, "success");
            loadHistoryFromDB();
            switchTab('order-tab'); loadOrderHistory(); loadDashboard();
        } else {
            KB_Notify.alert(data.message, "Lỗi tạo đơn");
        }
    } catch(e) { KB_Notify.alert("Mất kết nối API", "Lỗi Mạng"); }
}

async function updateOrderStatus(orderId, newStatus) {
    let note = '';
    if(newStatus === 'exported') {
        let rs = await KB_Notify.prompt("Ghi chú tiến độ (Số xe, SĐT tài xế, Người giao...):", "Đang triển khai / Giao hàng");
        if(rs === null) return;
        note = rs;
    } else {
        let isOk = await KB_Notify.confirm('Xác nhận cập nhật trạng thái đơn hàng này?', 'Cập nhật tiến độ');
        if(!isOk) return;
    }

    try {
        let res = await fetch('api.php?action=update_order_status', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ action: 'update_order_status', order_id: orderId, status: newStatus, note: note }) 
        });
        let data = await res.json();
        KB_Notify.toast(data.message);
        loadOrderHistory();
    } catch(e) {}
}

async function promptPayment(orderId, remainAmount, projectName) {
    let result = await KB_Notify.paymentPrompt('Xác nhận Thu tiền & Hoa hồng', remainAmount, projectName);
    if(result === null) return; 
    
    let actualPaid = parseFloat(result.amount);
    let commission = parseFloat(result.commission) || 0;
    
    if(isNaN(actualPaid) || actualPaid <= 0) {
        return KB_Notify.alert("Số tiền thu không hợp lệ hoặc để trống!", "Lỗi");
    }

    try {
        let res = await fetch('api.php?action=record_payment', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ 
                action: 'record_payment', 
                order_id: orderId, 
                amount: actualPaid,
                commission: commission,
                project_name: projectName
            }) 
        });
        let data = await res.json();
        if(data.status === 'success') {
            KB_Notify.toast("Đã thu tiền & Ghi nhận hoa hồng (nếu có) thành công!");
            loadOrderHistory(); loadDashboard(); 
        } else {
            KB_Notify.alert(data.message, "Lỗi từ Database"); 
        }
    } catch(e) { KB_Notify.alert("Lỗi kết nối máy chủ!", "Lỗi mạng"); }
}

async function loadDashboard() {
    try {
        let res = await fetch('api.php?action=get_stats');
        let result = await res.json();
        if(result.status === 'success') {
            if(document.getElementById('db-total-orders')) document.getElementById('db-total-orders').innerText = result.data.total_orders || 0;
            if(document.getElementById('db-total-revenue')) document.getElementById('db-total-revenue').innerText = formatMoney(result.data.total_revenue || 0) + ' ₫';
            if(document.getElementById('db-total-debt')) document.getElementById('db-total-debt').innerText = formatMoney(result.data.total_debt || 0) + ' ₫';
        }
    } catch(e) {}
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
    const baseCode = `KB${String(d.getFullYear()).slice(-2)}${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}`;
    
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
                ${getInventorySearchHTML(index)}
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
        
        let assignedUser = safeVal('assignedStaff');
        if (!assignedUser) assignedUser = window.currentUser || 'admin';
        
        let profile = staffProfiles[assignedUser] || {
            fullName: assignedUser.toUpperCase(), email: `${assignedUser}@kbtech.vn`, phone: '0933 129 155', role: 'Phụ trách Kinh doanh'
        };

        if (assignedUser === window.currentUser && localStorage.getItem('kb_full_name')) {
            profile.fullName = localStorage.getItem('kb_full_name');
            profile.email = localStorage.getItem('kb_email') || profile.email;
            profile.phone = localStorage.getItem('kb_phone') || profile.phone;
            profile.role = localStorage.getItem('kb_role') || profile.role;
        }

        const cDate = safeVal('docDate') ? new Date(safeVal('docDate')) : new Date();
        const docData = {
            safeFullName: profile.fullName, safePhone: profile.phone, safeEmail: profile.email, safeRole: profile.role,
            dateString: `ngày ${String(cDate.getDate()).padStart(2, '0')} tháng ${String(cDate.getMonth() + 1).padStart(2, '0')} năm ${cDate.getFullYear()}`,
            pdfDateStr: `${String(cDate.getDate()).padStart(2, '0')}/${String(cDate.getMonth() + 1).padStart(2, '0')}/${cDate.getFullYear()}`,
            qNo: safeVal('quoteNo', ".................."), cNo: safeVal('contractNo', ".................."), pName: safeVal('projectName', ".................."),
            bName: safeVal('buyerName', "......................................................."), 
            bAddress: safeVal('buyerAddress', "......................................................................................."),
            bTax: safeVal('buyerTax', "........................."), bPhone: safeVal('buyerPhone', ""), 
            bRep: safeVal('buyerRep', ".............................."), bRole: safeVal('buyerRole', ".............................."),
            payOpt: safeVal('paymentOpt', "50"), 
            deliveryAddress: safeVal('deliveryAddress').trim() !== "" ? safeVal('deliveryAddress').trim() : safeVal('buyerAddress', "......................................................................................."),
            isVat: document.getElementById('includeVat') ? document.getElementById('includeVat').checked : true
        };

        let total = 0; products.forEach(p => total += (p.price || 0) * (p.qty || 0));
        docData.total = total; docData.tax = docData.isVat ? total * 0.08 : 0; docData.grandTotal = total + docData.tax;

        let quoteHtml = typeof generateQuoteHTML === 'function' ? generateQuoteHTML(docData, products, formatMoney) : '';
        let contractHtml = typeof generateContractHTML === 'function' ? generateContractHTML(docData, products, formatMoney) : '';
        let acceptHtml = typeof generateAcceptanceHTML === 'function' ? generateAcceptanceHTML(docData, products) : '';

        const isRetail = document.getElementById('isRetailCustomer') ? document.getElementById('isRetailCustomer').checked : false;
        if (isRetail) {
            quoteHtml = quoteHtml.replace(/305258/g, "19028000272011");          
            quoteHtml = quoteHtml.replace(/Ngân hàng ACB<\/span>[\s\S]*?\(CN Ông Ích Khiêm\)<\/span>/gi, "Ngân hàng Techcombank</span>");            
            quoteHtml = quoteHtml.replace(/(Chủ Tài Khoản:<\/span>[\s\S]*?)CÔNG TY TNHH TM DV KB/gi, "$1LÊ TUẤN HẢI");
        }

        if (contractHtml && docData.safeFullName && docData.safeRole) {
            contractHtml = contractHtml.replace(/Ông\/Bà:\s*/gi, "")
                                       .replace(/Ông:\s*/gi, "")
                                       .replace(/Bà:\s*/gi, "");
            contractHtml = contractHtml.replace(new RegExp(docData.safeFullName, 'gi'), "LÊ TUẤN HẢI");            
            contractHtml = contractHtml.replace(new RegExp(docData.safeRole, 'gi'), "Giám đốc");
            contractHtml = contractHtml.replace(/Ông\s+LÊ TUẤN HẢI/gi, "LÊ TUẤN HẢI")
                                       .replace(/Bà\s+LÊ TUẤN HẢI/gi, "LÊ TUẤN HẢI")
                                       .replace(/Ông\/Bà\s+LÊ TUẤN HẢI/gi, "LÊ TUẤN HẢI");
        }

        docPreview.innerHTML = `
            ${quoteHtml}
            <div class="print-divider page-break w-full border-t-2 border-dashed border-slate-300 my-10 py-5 text-center text-slate-400 text-xs font-semibold tracking-widest no-print">CUT HERE / NEXT PAGE</div>
            ${contractHtml}
            <div class="print-divider page-break w-full border-t-2 border-dashed border-slate-300 my-10 py-5 text-center text-slate-400 text-xs font-semibold tracking-widest no-print">CUT HERE / NEXT PAGE</div>
            ${acceptHtml}
        `;
    } catch (err) {}
}