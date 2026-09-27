/**
 * 智匯記帳 - 個人收支管理 Web App
 * Pure Vanilla JavaScript (ES6+)
 */

// ==========================================
// 1. 常數與設定 (Configurations & Constants)
// ==========================================
const STORAGE_KEY = 'expense_tracker_records_v1';

// 類別設定與圖示、色彩
const CATEGORY_CONFIG = {
  expense: [
    {
      id: '餐飲',
      label: '餐飲',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/></svg>`
    },
    {
      id: '交通',
      label: '交通',
      color: '#0284c7',
      bgColor: 'rgba(2, 132, 199, 0.15)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/><path d="m5 19-2 2"/><path d="m19 19 2 2"/></svg>`
    },
    {
      id: '娛樂',
      label: '娛樂',
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.15)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
    },
    {
      id: '其他',
      label: '其他',
      color: '#94a3b8',
      bgColor: 'rgba(148, 163, 184, 0.15)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`
    }
  ],
  income: [
    {
      id: '薪資',
      label: '薪資',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`
    },
    {
      id: '獎金',
      label: '獎金',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`
    },
    {
      id: '投資',
      label: '投資',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.15)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`
    },
    {
      id: '其他',
      label: '其他',
      color: '#94a3b8',
      bgColor: 'rgba(148, 163, 184, 0.15)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`
    }
  ]
};

// ==========================================
// 2. 應用狀態管理 (Application State)
// ==========================================
class ExpenseApp {
  constructor() {
    this.records = [];
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1; // 1-12
    this.chartType = 'expense'; // 'expense' or 'income'
    this.chartInstance = null;
    this.filterType = 'all'; // 'all', 'expense', 'income'
    this.searchQuery = '';

    this.initElements();
    this.bindEvents();
    this.loadData();
    this.renderCategoryChips('expense');
    this.initDefaults();
    this.render();
  }

  // DOM 節點初始化
  initElements() {
    // 表單
    this.form = document.getElementById('transactionForm');
    this.txTypeRadios = document.querySelectorAll('input[name="txType"]');
    this.txAmountInput = document.getElementById('txAmount');
    this.txCategoryHidden = document.getElementById('txCategory');
    this.txDateInput = document.getElementById('txDate');
    this.txNoteInput = document.getElementById('txNote');
    this.categoryChipsContainer = document.getElementById('categoryChips');

    // 月份切換與篩選
    this.prevMonthBtn = document.getElementById('prevMonthBtn');
    this.nextMonthBtn = document.getElementById('nextMonthBtn');
    this.todayBtn = document.getElementById('todayBtn');
    this.currentMonthLabel = document.getElementById('currentMonthLabel');
    this.typeFilter = document.getElementById('typeFilter');
    this.searchInput = document.getElementById('searchInput');

    // 統計卡片
    this.totalExpenseDisplay = document.getElementById('totalExpenseDisplay');
    this.expenseCountDisplay = document.getElementById('expenseCountDisplay');
    this.totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
    this.incomeCountDisplay = document.getElementById('incomeCountDisplay');
    this.netBalanceDisplay = document.getElementById('netBalanceDisplay');
    this.balanceStatusText = document.getElementById('balanceStatusText');
    this.totalCountDisplay = document.getElementById('totalCountDisplay');

    // 圖表
    this.chartCanvas = document.getElementById('categoryChart');
    this.chartExpenseTab = document.getElementById('chartExpenseTab');
    this.chartIncomeTab = document.getElementById('chartIncomeTab');
    this.chartEmptyState = document.getElementById('chartEmptyState');
    this.categoryBreakdownList = document.getElementById('categoryBreakdownList');

    // 表格
    this.transactionTableBody = document.getElementById('transactionTableBody');
    this.tableEmptyState = document.getElementById('tableEmptyState');
    this.tableCountBadge = document.getElementById('tableCountBadge');
    this.emptyLoadDemoBtn = document.getElementById('emptyLoadDemoBtn');

    // 頂部操作按鈕
    this.exportCsvBtn = document.getElementById('exportCsvBtn');
    this.demoDataBtn = document.getElementById('demoDataBtn');
    this.clearDataBtn = document.getElementById('clearDataBtn');

    // 編輯彈窗
    this.editModal = document.getElementById('editModal');
    this.editForm = document.getElementById('editForm');
    this.editTxId = document.getElementById('editTxId');
    this.editTxTypeRadios = document.querySelectorAll('input[name="editTxType"]');
    this.editTxAmount = document.getElementById('editTxAmount');
    this.editTxCategory = document.getElementById('editTxCategory');
    this.editTxDate = document.getElementById('editTxDate');
    this.editTxNote = document.getElementById('editTxNote');
    this.closeEditModalBtn = document.getElementById('closeEditModalBtn');
    this.cancelEditModalBtn = document.getElementById('cancelEditModalBtn');

    // 提示通知容器
    this.toastContainer = document.getElementById('toastContainer');
  }

  // 預設日期與分類設置
  initDefaults() {
    const today = new Date();
    const formattedDate = this.formatDateForInput(today);
    this.txDateInput.value = formattedDate;
  }

  // 格式化 YYYY-MM-DD
  formatDateForInput(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 事件綁定
  bindEvents() {
    // 類型切換 (支出 / 收入)
    this.txTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.renderCategoryChips(e.target.value);
      });
    });

    // 表單提交
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // 月份切換
    this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
    this.todayBtn.addEventListener('click', () => this.goToCurrentMonth());

    // 篩選與搜尋
    this.typeFilter.addEventListener('change', (e) => {
      this.filterType = e.target.value;
      this.render();
    });

    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.render();
    });

    // 圖表支出/收入分頁切換
    this.chartExpenseTab.addEventListener('click', () => {
      this.chartType = 'expense';
      this.chartExpenseTab.classList.add('active');
      this.chartIncomeTab.classList.remove('active');
      this.renderChart();
    });

    this.chartIncomeTab.addEventListener('click', () => {
      this.chartType = 'income';
      this.chartIncomeTab.classList.add('active');
      this.chartExpenseTab.classList.remove('active');
      this.renderChart();
    });

    // 匯出 CSV
    this.exportCsvBtn.addEventListener('click', () => this.exportCsv());

    // 範例資料
    this.demoDataBtn.addEventListener('click', () => this.loadDemoData());
    if (this.emptyLoadDemoBtn) {
      this.emptyLoadDemoBtn.addEventListener('click', () => this.loadDemoData());
    }

    // 清空資料
    this.clearDataBtn.addEventListener('click', () => this.clearAllData());

    // 編輯表單事件
    this.closeEditModalBtn.addEventListener('click', () => this.closeEditModal());
    this.cancelEditModalBtn.addEventListener('click', () => this.closeEditModal());
    this.editModal.addEventListener('click', (e) => {
      if (e.target === this.editModal) this.closeEditModal();
    });

    this.editTxTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.populateEditCategoryOptions(e.target.value);
      });
    });

    this.editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditFormSubmit();
    });
  }

  // 渲染分類晶片按鈕 (Chips)
  renderCategoryChips(type) {
    const categories = CATEGORY_CONFIG[type] || CATEGORY_CONFIG.expense;
    this.categoryChipsContainer.innerHTML = '';

    categories.forEach((cat, index) => {
      const chip = document.createElement('div');
      chip.className = `category-chip ${index === 0 ? 'active' : ''}`;
      chip.dataset.categoryId = cat.id;
      chip.innerHTML = `
        <span style="color: ${cat.color}">${cat.icon}</span>
        <span>${cat.label}</span>
      `;

      chip.addEventListener('click', () => {
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.txCategoryHidden.value = cat.id;
      });

      this.categoryChipsContainer.appendChild(chip);
    });

    // 預設選取第一個
    this.txCategoryHidden.value = categories[0].id;
  }

  // ==========================================
  // 3. 資料持久化與載入 (LocalStorage)
  // ==========================================
  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.records = JSON.parse(stored);
      } else {
        // 初次使用者直接載入精美範例資料
        this.generateDefaultDemoData();
      }
    } catch (err) {
      console.error('載入資料失敗:', err);
      this.records = [];
    }
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch (err) {
      console.error('儲存資料失敗:', err);
      this.showToast('資料儲存失敗，請檢查瀏覽器容量', 'error');
    }
  }

  // 生成範例資料 (符合餐飲/交通/娛樂/其他 + 收入)
  generateDefaultDemoData() {
    const y = this.selectedYear;
    const m = String(this.selectedMonth).padStart(2, '0');

    this.records = [
      {
        id: 'tx_demo_1',
        type: 'income',
        category: '薪資',
        amount: 58000,
        date: `${y}-${m}-05`,
        note: '本月正職薪資入帳',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_demo_2',
        type: 'expense',
        category: '餐飲',
        amount: 280,
        date: `${y}-${m}-06`,
        note: '早午餐義大利麵與拿鐵',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_demo_3',
        type: 'expense',
        category: '交通',
        amount: 1200,
        date: `${y}-${m}-07`,
        note: '悠遊卡 TPASS 通勤月票',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_demo_4',
        type: 'expense',
        category: '餐飲',
        amount: 120,
        date: `${y}-${m}-10`,
        note: '商業便當與冰紅茶',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_demo_5',
        type: 'expense',
        category: '娛樂',
        amount: 650,
        date: `${y}-${m}-12`,
        note: '週末 IMAX 電影票與爆米花',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_demo_6',
        type: 'expense',
        category: '其他',
        amount: 450,
        date: `${y}-${m}-15`,
        note: '生活日用品與洗沐補充包',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_demo_7',
        type: 'income',
        category: '獎金',
        amount: 6000,
        date: `${y}-${m}-18`,
        note: '專案績效季度分紅',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_demo_8',
        type: 'expense',
        category: '餐飲',
        amount: 1680,
        date: `${y}-${m}-20`,
        note: '朋友聚餐日式和牛居酒屋',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_demo_9',
        type: 'expense',
        category: '娛樂',
        amount: 390,
        date: `${y}-${m}-22`,
        note: '串流影音家庭方案訂閱',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_demo_10',
        type: 'expense',
        category: '交通',
        amount: 350,
        date: `${y}-${m}-25`,
        note: '深夜返家 Uber 計程車',
        createdAt: new Date().toISOString()
      }
    ];
    this.saveData();
  }

  loadDemoData() {
    this.generateDefaultDemoData();
    this.render();
    this.showToast('已載入本月範例記帳資料！', 'success');
  }

  clearAllData() {
    if (confirm('確定要清空所有記帳記錄嗎？此動作無法復原。')) {
      this.records = [];
      this.saveData();
      this.render();
      this.showToast('所有記帳資料已清空', 'info');
    }
  }

  // ==========================================
  // 4. 表單新增與編輯處理 (CRUD Operations)
  // ==========================================
  handleFormSubmit() {
    const type = document.querySelector('input[name="txType"]:checked').value;
    const amount = parseFloat(this.txAmountInput.value);
    const category = this.txCategoryHidden.value;
    const date = this.txDateInput.value;
    const note = this.txNoteInput.value.trim();

    if (!amount || isNaN(amount) || amount <= 0) {
      this.showToast('請輸入大於 0 的有效金額', 'error');
      this.txAmountInput.focus();
      return;
    }

    if (!date) {
      this.showToast('請選擇記帳日期', 'error');
      return;
    }

    if (!category) {
      this.showToast('請選擇類別', 'error');
      return;
    }

    const newRecord = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type,
      category,
      amount,
      date,
      note,
      createdAt: new Date().toISOString()
    };

    this.records.unshift(newRecord);
    this.saveData();

    // 如果新增的日期不在目前瀏覽的月份，自動切換至該月份方便查看
    const [recordYear, recordMonth] = date.split('-').map(Number);
    if (recordYear !== this.selectedYear || recordMonth !== this.selectedMonth) {
      this.selectedYear = recordYear;
      this.selectedMonth = recordMonth;
    }

    // 重設表單金額與備註，保留日期
    this.txAmountInput.value = '';
    this.txNoteInput.value = '';

    this.render();
    this.showToast(`記帳成功！NT$ ${amount.toLocaleString()}`, 'success');
  }

  deleteRecord(id) {
    const record = this.records.find(r => r.id === id);
    if (!record) return;

    if (!confirm(`確定要刪除「${record.category}」NT$ ${record.amount.toLocaleString()} 這筆記錄嗎？`)) {
      return;
    }

    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      const removed = this.records.splice(index, 1)[0];
      this.saveData();
      this.render();
      this.showToast(`已刪除「${removed.category}」NT$ ${removed.amount.toLocaleString()}`, 'info');
    }
  }

  openEditModal(id) {
    const record = this.records.find(r => r.id === id);
    if (!record) return;

    this.editTxId.value = record.id;
    this.editTxAmount.value = record.amount;
    this.editTxDate.value = record.date;
    this.editTxNote.value = record.note || '';

    // 設定類型 radio
    this.editTxTypeRadios.forEach(radio => {
      radio.checked = (radio.value === record.type);
    });

    this.populateEditCategoryOptions(record.type, record.category);
    this.editModal.classList.add('active');
  }

  populateEditCategoryOptions(type, selectedCategory = '') {
    const categories = CATEGORY_CONFIG[type] || CATEGORY_CONFIG.expense;
    this.editTxCategory.innerHTML = '';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.label;
      if (cat.id === selectedCategory) {
        option.selected = true;
      }
      this.editTxCategory.appendChild(option);
    });
  }

  closeEditModal() {
    this.editModal.classList.remove('active');
  }

  handleEditFormSubmit() {
    const id = this.editTxId.value;
    const type = document.querySelector('input[name="editTxType"]:checked').value;
    const amount = parseFloat(this.editTxAmount.value);
    const category = this.editTxCategory.value;
    const date = this.editTxDate.value;
    const note = this.editTxNote.value.trim();

    if (!amount || isNaN(amount) || amount <= 0) {
      this.showToast('請輸入有效金額', 'error');
      return;
    }

    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records[index] = {
        ...this.records[index],
        type,
        amount,
        category,
        date,
        note
      };

      this.saveData();
      this.closeEditModal();
      this.render();
      this.showToast('記錄已成功更新！', 'success');
    }
  }

  // ==========================================
  // 5. 月份切換與導覽 (Month Navigation)
  // ==========================================
  changeMonth(delta) {
    let newMonth = this.selectedMonth + delta;
    let newYear = this.selectedYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    this.selectedYear = newYear;
    this.selectedMonth = newMonth;
    this.render();
  }

  goToCurrentMonth() {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    this.render();
  }

  // 取得目前選擇月份的所有紀錄
  getCurrentMonthRecords() {
    const monthPrefix = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
    return this.records.filter(r => r.date.startsWith(monthPrefix));
  }

  // ==========================================
  // 6. 渲染邏輯 (UI Rendering)
  // ==========================================
  render() {
    // 1. 更新月份標題
    this.currentMonthLabel.textContent = `${this.selectedYear} 年 ${String(this.selectedMonth).padStart(2, '0')} 月`;

    // 2. 獲取本月紀錄並排序（日期由新到舊）
    const monthRecords = this.getCurrentMonthRecords();
    monthRecords.sort((a, b) => new Date(b.date) - new Date(a.date) || b.createdAt.localeCompare(a.createdAt));

    // 3. 計算統計指標
    let totalExpense = 0;
    let totalIncome = 0;
    let expenseCount = 0;
    let incomeCount = 0;

    monthRecords.forEach(r => {
      if (r.type === 'expense') {
        totalExpense += r.amount;
        expenseCount++;
      } else {
        totalIncome += r.amount;
        incomeCount++;
      }
    });

    const netBalance = totalIncome - totalExpense;

    // 4. 更新統計卡片顯示
    this.totalExpenseDisplay.textContent = `NT$ ${totalExpense.toLocaleString()}`;
    this.expenseCountDisplay.textContent = `${expenseCount} 筆支出`;

    this.totalIncomeDisplay.textContent = `NT$ ${totalIncome.toLocaleString()}`;
    this.incomeCountDisplay.textContent = `${incomeCount} 筆收入`;

    this.netBalanceDisplay.textContent = `${netBalance >= 0 ? '+' : '-'}NT$ ${Math.abs(netBalance).toLocaleString()}`;
    this.netBalanceDisplay.style.color = netBalance >= 0 ? 'var(--income-color)' : 'var(--expense-color)';
    
    if (netBalance > 0) {
      this.balanceStatusText.textContent = `財務健康 · 盈餘 NT$ ${netBalance.toLocaleString()}`;
      this.balanceStatusText.style.color = 'var(--income-color)';
    } else if (netBalance < 0) {
      this.balanceStatusText.textContent = `本月赤字 · 透支 NT$ ${Math.abs(netBalance).toLocaleString()}`;
      this.balanceStatusText.style.color = 'var(--expense-color)';
    } else {
      this.balanceStatusText.textContent = '收支平衡';
      this.balanceStatusText.style.color = 'var(--text-dim)';
    }

    this.totalCountDisplay.textContent = monthRecords.length;

    // 5. 根據收支類型與搜尋關鍵字篩選明細
    let filteredRecords = monthRecords;

    if (this.filterType !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.type === this.filterType);
    }

    if (this.searchQuery) {
      filteredRecords = filteredRecords.filter(r => 
        (r.note && r.note.toLowerCase().includes(this.searchQuery)) ||
        (r.category && r.category.toLowerCase().includes(this.searchQuery))
      );
    }

    // 6. 渲染表格
    this.renderTable(filteredRecords);

    // 7. 渲染圖表
    this.renderChart(monthRecords);
  }

  // 渲染收支明細表格
  renderTable(records) {
    this.tableCountBadge.textContent = `${records.length} 筆記錄`;

    if (records.length === 0) {
      this.transactionTableBody.innerHTML = '';
      this.tableEmptyState.classList.remove('hidden');
      return;
    }

    this.tableEmptyState.classList.add('hidden');
    this.transactionTableBody.innerHTML = records.map(record => {
      const isExpense = record.type === 'expense';
      const typeBadgeClass = isExpense ? 'badge-expense' : 'badge-income';
      const typeText = isExpense ? '支出' : '收入';
      const amountSign = isExpense ? '-' : '+';
      const amountClass = isExpense ? 'amount-expense' : 'amount-income';

      // 取得類別顏色與樣式
      const catList = CATEGORY_CONFIG[record.type] || [];
      const catConfig = catList.find(c => c.id === record.category) || {
        color: '#94a3b8',
        bgColor: 'rgba(148, 163, 184, 0.15)'
      };

      const noteDisplay = record.note ? this.escapeHtml(record.note) : '<span class="text-dim">無備註</span>';

      return `
        <tr data-id="${record.id}">
          <td class="date-cell">${record.date}</td>
          <td>
            <span class="badge ${typeBadgeClass}">${typeText}</span>
          </td>
          <td>
            <span class="badge" style="color: ${catConfig.color}; background-color: ${catConfig.bgColor}; border: 1px solid ${catConfig.color}40;">
              ${this.escapeHtml(record.category)}
            </span>
          </td>
          <td class="note-text" title="${this.escapeHtml(record.note || '')}">${noteDisplay}</td>
          <td style="text-align: right;" class="${amountClass}">
            ${amountSign}NT$ ${record.amount.toLocaleString()}
          </td>
          <td>
            <div class="action-cell">
              <button class="btn-table-action edit-action" title="編輯記錄" onclick="window.app.openEditModal('${record.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
              <button class="btn-table-action delete-action" title="刪除記錄" onclick="window.app.deleteRecord('${record.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // 7. Chart.js 圓餅圖/環形圖渲染
  // ==========================================
  renderChart(records = null) {
    if (!records) {
      records = this.getCurrentMonthRecords();
    }

    // 依據目前圖表選取的是「支出」還是「收入」
    const targetType = this.chartType;
    const filtered = records.filter(r => r.type === targetType);

    // 累計各類別金額
    const catMap = {};
    let total = 0;

    filtered.forEach(r => {
      catMap[r.category] = (catMap[r.category] || 0) + r.amount;
      total += r.amount;
    });

    const labels = Object.keys(catMap);
    const dataValues = Object.values(catMap);

    // 空狀態處理
    if (labels.length === 0 || total === 0) {
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
      this.chartCanvas.style.display = 'none';
      this.chartEmptyState.classList.remove('hidden');
      this.categoryBreakdownList.innerHTML = '';
      return;
    }

    this.chartCanvas.style.display = 'block';
    this.chartEmptyState.classList.add('hidden');

    // 類別對應色彩
    const catConfigList = CATEGORY_CONFIG[targetType] || [];
    const colors = labels.map(label => {
      const found = catConfigList.find(c => c.id === label);
      return found ? found.color : '#6366f1';
    });

    // 銷毀舊圖表實例
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    if (typeof Chart === 'undefined') {
      console.warn('Chart.js 尚未加載');
      this.renderCategoryBreakdown(labels, dataValues, colors, total);
      return;
    }

    const ctx = this.chartCanvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: colors,
          borderColor: '#111827',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // 我們使用自製的更精美的詳細 Breakdown 列表
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const percentage = ((value / total) * 100).toFixed(1);
                return ` ${context.label}: NT$ ${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });

    // 渲染圖表下方的精美類別比例列表
    this.renderCategoryBreakdown(labels, dataValues, colors, total);
  }

  // 渲染分類佔比列表
  renderCategoryBreakdown(labels, dataValues, colors, total) {
    // 依照金額由高至低排序
    const items = labels.map((label, i) => ({
      label,
      amount: dataValues[i],
      color: colors[i],
      pct: ((dataValues[i] / total) * 100).toFixed(1)
    })).sort((a, b) => b.amount - a.amount);

    this.categoryBreakdownList.innerHTML = items.map(item => `
      <div class="breakdown-row">
        <div class="breakdown-cat">
          <span class="color-dot" style="background-color: ${item.color};"></span>
          <span>${this.escapeHtml(item.label)}</span>
        </div>
        <div class="breakdown-val">
          <span class="breakdown-amount">NT$ ${item.amount.toLocaleString()}</span>
          <span class="breakdown-pct">${item.pct}%</span>
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // 8. CSV 匯出功能 (Export to CSV with UTF-8 BOM)
  // ==========================================
  exportCsv() {
    const monthRecords = this.getCurrentMonthRecords();
    if (monthRecords.length === 0) {
      this.showToast('本月尚無任何記帳記錄可匯出', 'error');
      return;
    }

    // 排序由新到舊
    const recordsToExport = [...monthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

    // CSV 表頭
    const headers = ['日期', '收支類型', '類別', '金額', '備註說明', '建立時間'];
    
    // CSV 內容
    const rows = recordsToExport.map(r => [
      r.date,
      r.type === 'expense' ? '支出' : '收入',
      r.category,
      r.amount,
      `"${(r.note || '').replace(/"/g, '""')}"`, // 轉義 CSV 雙引號
      r.createdAt
    ]);

    // 加入 UTF-8 BOM (\uFEFF) 防止 Excel 開啟時中文亂碼
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const fileName = `記帳記錄_${this.selectedYear}年${String(this.selectedMonth).padStart(2, '0')}月.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast(`已成功匯出「${fileName}」`, 'success');
  }

  // ==========================================
  // 9. 輔助函式 (Toast & Helper Utilities)
  // ==========================================
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${this.escapeHtml(message)}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ExpenseApp();
});
