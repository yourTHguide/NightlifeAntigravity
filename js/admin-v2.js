(function () {
    'use strict';

    const state = {
        token: localStorage.getItem('admin_token') || null,
        dates: [],
        bookings: []
    };

    const API_BASE = '/api/admin';

    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    function init() {
        if (state.token) {
            showDashboard();
        } else {
            showLogin();
        }

        loginForm.addEventListener('submit', handleLogin);
        document.getElementById('btn-logout').addEventListener('click', handleLogout);
        document.getElementById('btn-refresh').addEventListener('click', loadDates);

        // Tab Switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));

                e.target.classList.add('active');
                const targetId = 'tab-' + e.target.dataset.tab;
                document.getElementById(targetId).classList.add('active');
            });
        });

        // Manual Entry Button
        const bookingsHeader = document.querySelector('#tab-bookings .section-header div');
        if (bookingsHeader) {
            const btnAdd = document.createElement('button');
            btnAdd.id = 'btn-add-booking';
            btnAdd.type = 'button';
            btnAdd.className = 'btn';
            btnAdd.style.width = 'auto';
            btnAdd.style.background = '#FF2D95';
            btnAdd.style.padding = '0.4rem 1.25rem';
            btnAdd.style.marginRight = '0.5rem';
            btnAdd.innerText = '+ Add Booking';
            btnAdd.onclick = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                openNewBookingForm();
            };
            bookingsHeader.insertBefore(btnAdd, bookingsHeader.firstChild);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        loginError.style.display = 'none';
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            state.token = data.token;
            localStorage.setItem('admin_token', data.token);
            showDashboard();
        } catch (err) {
            loginError.textContent = err.message;
            loginError.style.display = 'block';
        }
    }

    function handleLogout() {
        state.token = null;
        localStorage.removeItem('admin_token');
        showLogin();
    }

    function showLogin() {
        loginView.style.display = 'flex';
        dashboardView.style.display = 'none';
    }

    function showDashboard() {
        loginView.style.display = 'none';
        dashboardView.style.display = 'block';
        loadDates();
    }

    function apiFetch(path, options = {}) {
        const headers = { 'Authorization': `Bearer ${state.token}`, ...options.headers };
        if (options.body && !headers['Content-Type']) { headers['Content-Type'] = 'application/json'; }
        return fetch(`${API_BASE}${path}`, { ...options, headers });
    }

    // Calendar state
    let currentCalMonth = new Date().getMonth();
    let currentCalYear = new Date().getFullYear();

    async function loadDates() {
        const datesLoading = document.getElementById('dates-loading');
        datesLoading.style.display = 'block';
        document.getElementById('calendar-widget').style.display = 'none';
        try {
            const res = await apiFetch('/v2/events');
            if (res.status === 401) return handleLogout();
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load dates');
            state.dates = data.dates || [];
            renderCalendar();
        } catch (err) {
            console.error('Error loading dates:', err);
            datesLoading.textContent = `Error: ${err.message}`;
            datesLoading.style.color = '#fb7185';
        } finally {
            if (!datesLoading.textContent.startsWith('Error')) {
                datesLoading.style.display = 'none';
                document.getElementById('calendar-widget').style.display = 'block';
            }
        }
    }

    function renderCalendar() {
        const grid = document.getElementById('admin-cal-grid');
        const monthSelect = document.getElementById('admin-cal-month');
        const yearSelect = document.getElementById('admin-cal-year');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthSelect.innerHTML = monthNames.map((m, i) => `<option value="${i}" ${i === currentCalMonth ? 'selected' : ''}>${m}</option>`).join('');
        yearSelect.innerHTML = [2026, 2027].map(y => `<option value="${y}" ${y === currentCalYear ? 'selected' : ''}>${y}</option>`).join('');
        monthSelect.onchange = (e) => { currentCalMonth = parseInt(e.target.value); renderCalendar(); };
        yearSelect.onchange = (e) => { currentCalYear = parseInt(e.target.value); renderCalendar(); };
        let html = '';
        const firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
        const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
        const datesMap = {};
        state.dates.forEach(d => { datesMap[d.event_date] = d.is_open; });
        for (let i = 0; i < firstDay; i++) { html += `<div class="calendar-day empty"></div>`; }
        for (let d = 1; d <= daysInMonth; d++) {
            const mm = String(currentCalMonth + 1).padStart(2, '0');
            const dd = String(d).padStart(2, '0');
            const dateStrIso = `${currentCalYear}-${mm}-${dd}`;
            const isOpen = datesMap[dateStrIso] === true;
            const hasData = datesMap[dateStrIso] !== undefined;
            if (hasData) {
                const statusClass = isOpen ? 'open' : 'closed';
                const statusText = isOpen ? 'OPEN' : 'CLOSED';
                html += `
                    <div class="calendar-day ${statusClass}" data-date="${dateStrIso}" data-status="${isOpen}">
                        ${d}
                        <div class="status-text">${statusText}</div>
                    </div>`;
            } else {
                html += `<div class="calendar-day closed" style="opacity:0.3; cursor:not-allowed;" title="Out of range">${d}<div class="status-text">-</div></div>`;
            }
        }
        grid.innerHTML = html;
        grid.querySelectorAll('.calendar-day[data-date]').forEach(day => {
            day.onclick = (e) => {
                if (day.classList.contains('updating')) return;
                const currentDateStr = day.dataset.date;
                const currentStatus = day.dataset.status === 'true';
                toggleDate(day, currentDateStr, !currentStatus);
            };
        });
    }

    async function toggleDate(element, eventDate, newStatus) {
        element.classList.add('updating');
        element.style.opacity = '0.5';
        try {
            const res = await apiFetch(`/v2/events/toggle`, {
                method: 'POST',
                body: JSON.stringify({ event_date: eventDate, is_open: newStatus })
            });
            if (res.status === 401) return handleLogout();
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to update status');
                loadDates();
                return;
            }
            await loadDates();
        } catch (err) {
            console.error('Error toggling date:', err);
            alert('Failed to connect to server.');
            element.style.opacity = '1';
        }
    }

    // --- Bookings (CRM) Logic ---
    async function loadBookings() {
        const bookingsContainer = document.getElementById('bookings-list-container');
        if (!bookingsContainer) return;
        bookingsContainer.innerHTML = '<div class="loading">Loading bookings...</div>';
        try {
            const res = await apiFetch('/v2/bookings');
            if (res.status === 401) return handleLogout();
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load bookings');
            state.bookings = data.bookings || [];
            renderBookings();
        } catch (err) {
            console.error('Error loading bookings:', err);
            bookingsContainer.innerHTML = `<p style="color:#fb7185; text-align:center;">Error: ${err.message}</p>`;
        }
    }

    function getStatusBadge(eventDateStr, paymentStatus) {
        const pStatus = String(paymentStatus || '').toLowerCase();
        if (pStatus === 'cancelled') return '<span class="booking-badge badge-completed" style="background:rgba(251,113,133,0.15); color:#fb7185;">Cancelled</span>';
        if (pStatus === 'refunded') return '<span class="booking-badge badge-completed" style="background:rgba(251,113,133,0.15); color:#fb7185;">Refunded</span>';
        if (pStatus === 'completed') return '<span class="booking-badge badge-completed">Completed</span>';
        const todayStr = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (eventDateStr < todayStr) return '<span class="booking-badge badge-completed">Completed</span>';
        if (eventDateStr === todayStr) return '<span class="booking-badge badge-today">Today</span>';
        return '<span class="booking-badge badge-upcoming">Active</span>';
    }

    function renderBookingCards(container, bookingsToRender) {
        if (!bookingsToRender || !bookingsToRender.length) {
            container.innerHTML = '<p style="color: #94a3b8; text-align: center;">No paid bookings found.</p>';
            return;
        }
        container.innerHTML = '';
        bookingsToRender.forEach(b => {
            const card = document.createElement('div');
            card.className = 'booking-card';
            const renderReadMode = () => {
                const male = b.pax_breakdown && typeof b.pax_breakdown.male !== 'undefined' ? Number(b.pax_breakdown.male) : 0;
                const female = b.pax_breakdown && typeof b.pax_breakdown.female !== 'undefined' ? Number(b.pax_breakdown.female) : 0;
                const q = b.quantity || (male + female) || 1;
                const paxDisplay = (male > 0 || female > 0) ? `${male}M / ${female}F` : `${q} Pax`;
                const bDateObj = new Date(b.event_date);
                const bDate = bDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const createdDate = new Date(b.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                const statusBadge = getStatusBadge(b.event_date, b.payment_status);
                const phoneValue = (b.whatsapp_number || '').trim();
                const phoneDisplay = phoneValue ? phoneValue : '<span style="color:#ef4444; font-weight:bold; font-size:0.75rem;">Action Needed: Message on OTA</span>';
                let badgesHtml = '';
                const pStatus = String(b.payment_status || '').toLowerCase().trim();
                const isPaidSuccess = ['paid', 'confirmed', 'completed', 'success', 'captured'].includes(pStatus);
                if (isPaidSuccess) {
                    badgesHtml += `<span style="font-size:0.65rem; background:rgba(52, 211, 153, 0.2); border:1px solid #34d399; color:#34d399; border-radius:4px; padding:2px 4px; margin-right:4px; display:inline-block; margin-top:2px;">Paid</span>`;
                }
                const rawTags = b.tags || [];
                const hiddenKeywords = ['Interested', 'OTA-Booked', 'Missing Phone', 'Needs Date'];
                const filteredTags = rawTags.filter(t => !hiddenKeywords.some(kw => t.toLowerCase().includes(kw.toLowerCase())));
                if (filteredTags.length > 0) {
                    badgesHtml += filteredTags.map(t => `<span style="font-size:0.65rem; background:rgba(255,45,149,0.2); border:1px solid #FF2D95; border-radius:4px; padding:2px 4px; margin-right:4px; display:inline-block; margin-top:2px;">${t}</span>`).join('');
                }
                const fullName = [b.first_name || '', b.last_name || ''].filter(Boolean).join(' ') || 'Guest';
                card.className = 'booking-card';
                card.innerHTML = `
                    <div class="booking-header" style="cursor: pointer;" onclick="this.parentElement.classList.toggle('expanded')">
                        <div style="display:flex; flex-direction:column; gap:0.25rem;">
                            <span class="booking-name">${fullName}</span>
                            <div style="margin-top:0.2rem;">${badgesHtml}</div>
                        </div>
                        <div style="display:flex; align-items:center;">
                            <span class="booking-date" style="margin-right:0.5rem;">${bDate}</span>
                            ${statusBadge}
                        </div>
                    </div>
                    <div class="booking-details" style="cursor: pointer; position: relative;" onclick="this.parentElement.classList.toggle('expanded')">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.75rem;">
                            <span><strong>Quantity:</strong> ${q} Pax</span>
                            <span><strong>Breakdown:</strong> ${paxDisplay}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.75rem;">
                            <span><strong>WhatsApp:</strong> <br/><span style="color: #f8fafc;">${phoneDisplay}</span></span>
                            <span><strong>Email:</strong> <br/><span style="color: #f8fafc;">${b.email || 'N/A'}</span></span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items: flex-end;">
                            <div>
                                <span><strong>Booked On:</strong> ${createdDate}</span><br/>
                                <span style="margin-top: 0.25rem; display: inline-block;"><strong>Amount Paid:</strong> ฿${b.total_amount_paid || b.total_price || 0}</span>
                            </div>
                            <button class="edit-btn" type="button" style="background:none; border:none; font-size:1.4rem; cursor:pointer;" title="Edit Booking">✏️</button>
                        </div>
                    </div>
                `;
                const editBtn = card.querySelector('.edit-btn');
                editBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    renderEditMode();
                };
            };

            const availableTags = ['⭐ Repeat Guest', 'Attended', 'No Show', 'Rescheduled', 'Refunded', '⚠ Caution Guest'];

            const renderEditMode = () => {
                card.className = 'booking-card expanded';
                const currentStatusValue = String(b.payment_status || 'Paid').toLowerCase();
                const isoDate = b.event_date ? new Date(b.event_date).toISOString().split('T')[0] : '';
                const hiddenKeywords = ['Interested', 'OTA-Booked', 'Missing Phone', 'Needs Date'];
                let editTags = (b.tags || []).filter(t => !hiddenKeywords.some(kw => t.toLowerCase().includes(kw.toLowerCase())));
                const renderTagPills = () => {
                    const container = card.querySelector('.tag-editor-chips');
                    if (!container) return;
                    container.innerHTML = editTags.map((tag, idx) => `
                        <span style="background:rgba(255,45,149,0.2); border:1px solid #FF2D95; border-radius:4px; padding:6px 12px; font-size:0.75rem; display:flex; align-items:center; gap:8px;">
                            ${tag}
                            <span class="remove-tag" data-idx="${idx}" style="cursor:pointer; font-weight:bold; color:#FF2D95; font-size:1.1rem; line-height: 1;">&times;</span>
                        </span>
                    `).join('');
                    container.querySelectorAll('.remove-tag').forEach(btn => {
                        btn.onclick = (e) => { e.stopPropagation(); editTags.splice(parseInt(btn.dataset.idx), 1); renderTagPills(); };
                    });
                };
                card.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:1.5rem; font-size:0.875rem; padding: 1.5rem 0;">
                        <h4 style="color:#f8fafc; margin:0; font-size:1.25rem; border-bottom: 2px solid #334155; padding-bottom: 0.75rem;">Edit Booking</h4>
                        <div style="display:flex; flex-direction:column; gap:1.25rem;">
                            <div class="edit-grid">
                                <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">First Name</label>
                                    <input type="text" id="edit-fn-${b.id}" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="${b.first_name || ''}">
                                </div>
                                <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Last Name</label>
                                    <input type="text" id="edit-ln-${b.id}" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="${b.last_name || ''}">
                                </div>
                            </div>
                            <div class="edit-grid">
                                <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">WhatsApp</label>
                                    <input type="text" id="edit-wa-${b.id}" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="${b.whatsapp_number || ''}">
                                </div>
                                <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Email</label>
                                    <input type="email" id="edit-em-${b.id}" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="${b.email || ''}">
                                </div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:0.6rem; background: rgba(30, 41, 59, 0.5); padding: 1rem; border-radius: 8px; border: 1px solid #334155;">
                                <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Add / Remove Tags</label>
                                <div class="tag-editor-chips" style="display:flex; flex-wrap:wrap; gap:0.75rem; min-height: 24px;"></div>
                                <select id="add-tag-select" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; cursor: pointer; font-family: inherit;">
                                    <option value="">+ Add Tag to Profile</option>
                                    ${availableTags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
                                </select>
                            </div>
                            <div class="edit-grid">
                                <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Event Date</label>
                                    <input type="date" id="edit-ed-${b.id}" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="${isoDate}">
                                </div>
                                <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Booking Status</label>
                                    <select id="edit-stat-${b.id}" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; cursor: pointer; font-family: inherit;">
                                        <option value="Upcoming" ${(!['cancelled', 'completed'].includes(currentStatusValue)) ? 'selected' : ''}>Upcoming / Active</option>
                                        <option value="Completed" ${currentStatusValue === 'completed' ? 'selected' : ''}>Completed</option>
                                        <option value="Cancelled" ${currentStatusValue === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div class="edit-grid">
                                <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Quantity (Total)</label>
                                    <input type="number" id="edit-q-${b.id}" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#94a3b8; border-radius:8px; box-sizing: border-box;" value="${b.quantity || 1}" readonly>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Amount Collected (฿)</label>
                                    <input type="number" id="edit-am-${b.id}" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="${b.total_amount_paid || b.total_price || 0}">
                                </div>
                            </div>
                        </div>
                        <div class="edit-actions" style="border-top: 2px solid #334155; padding-top: 1.5rem;">
                            <button id="delete-${b.id}" type="button" style="background:#ef4444; color:#fff; border:none; padding:0.75rem 1.5rem; border-radius:8px; cursor:pointer; font-weight:bold; margin-right: auto;">Delete</button>
                            <button id="cancel-${b.id}" type="button" style="background:transparent; color:#f8fafc; border:1px solid #475569; padding:0.75rem 1.5rem; border-radius:8px; cursor:pointer; font-weight: 600;">Cancel</button>
                            <button id="save-${b.id}" type="button" style="background:#34d399; color:#0f172a; border:none; padding:0.75rem 2.5rem; font-weight:bold; border-radius:8px; cursor:pointer;">Save</button>
                        </div>
                    </div>
                `;
                renderTagPills();
                card.querySelector('#add-tag-select').onchange = (e) => {
                    e.stopPropagation();
                    const tag = e.target.value;
                    if (tag && !editTags.includes(tag)) { editTags.push(tag); renderTagPills(); }
                    e.target.value = '';
                };
                card.querySelector(`#delete-${b.id}`).onclick = async (e) => {
                    // Task 1: Fix Delete Confirmation Glitch
                    e.stopPropagation();
                    e.preventDefault();
                    if (!confirm('Are you sure you want to delete this booking?')) return;
                    const res = await apiFetch(`/v2/bookings/${b.id}`, { method: 'DELETE' });
                    if (res.ok) card.remove();
                };
                card.querySelector(`#cancel-${b.id}`).onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    renderReadMode();
                };
                card.querySelector(`#save-${b.id}`).onclick = async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const hiddenTags = (b.tags || []).filter(t => hiddenKeywords.some(kw => t.toLowerCase().includes(kw.toLowerCase())));
                    const finalTags = [...new Set([...editTags, ...hiddenTags])];
                    const payload = {
                        first_name: document.getElementById(`edit-fn-${b.id}`).value,
                        last_name: document.getElementById(`edit-ln-${b.id}`).value,
                        whatsapp_number: document.getElementById(`edit-wa-${b.id}`).value,
                        email: document.getElementById(`edit-em-${b.id}`).value,
                        tags: finalTags,
                        event_date: document.getElementById(`edit-ed-${b.id}`).value,
                        event_status: document.getElementById(`edit-stat-${b.id}`).value,
                        total_amount_paid: parseFloat(document.getElementById(`edit-am-${b.id}`).value)
                    };
                    try {
                        const res = await apiFetch(`/v2/bookings/${b.id}`, { method: 'PUT', body: JSON.stringify(payload) });
                        if (!res.ok) throw new Error('Failed to update');
                        Object.assign(b, {
                            first_name: payload.first_name, last_name: payload.last_name, whatsapp_number: payload.whatsapp_number, email: payload.email,
                            tags: payload.tags, event_date: payload.event_date, payment_status: payload.event_status.toLowerCase(),
                            total_amount_paid: payload.total_amount_paid
                        });
                        renderReadMode();
                    } catch (error) { alert(error.message); }
                };
            };
            renderReadMode();
            container.appendChild(card);
        });
    }

    function openNewBookingForm() {
        const container = document.getElementById('bookings-list-container');
        const modal = document.createElement('div');
        modal.className = 'booking-card expanded';
        modal.style.marginBottom = '2rem';
        modal.id = 'manual-entry-form';
        const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
        modal.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:1.5rem; font-size:0.875rem; padding: 1.5rem 0;">
                <h4 style="color:#FF2D95; margin:0; font-size:1.25rem; border-bottom: 2px solid #FF2D95; padding-bottom: 0.75rem;">+ New Manual Booking</h4>
                <div style="display:flex; flex-direction:column; gap:1.25rem;">
                    <div class="edit-grid">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">First Name</label>
                            <input type="text" id="new-fn" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" placeholder="e.g. John">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Last Name</label>
                            <input type="text" id="new-ln" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" placeholder="e.g. Doe">
                        </div>
                    </div>
                    <div class="edit-grid">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">WhatsApp (Phone)</label>
                            <input type="text" id="new-wa" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" placeholder="+66...">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Email</label>
                            <input type="email" id="new-em" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" placeholder="email@example.com">
                        </div>
                    </div>
                    <div class="edit-grid">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Event Date</label>
                            <input type="date" id="new-ed" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="${today}">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Paid By</label>
                            <select id="new-method" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; cursor: pointer; font-family: inherit;">
                                <option value="Cash">Cash</option>
                                <option value="Thai Bank">Thai Bank</option>
                                <option value="Online Payment">Online Payment</option>
                            </select>
                        </div>
                    </div>
                    <div class="edit-grid">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Male Count</label>
                            <input type="number" id="new-male" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="1">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Female Count</label>
                            <input type="number" id="new-female" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="0">
                        </div>
                    </div>
                    <div class="edit-grid">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Amount Collected (฿)</label>
                            <input type="number" id="new-am" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" value="1000">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Created By (Host Name)</label>
                            <input type="text" id="new-by" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box;" placeholder="e.g. Sarah">
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.4rem;">
                        <label style="color:#94a3b8; font-size:0.75rem; font-weight: 700;">Notes (Special Requests)</label>
                        <textarea id="new-notes" style="width:100%; padding:0.75rem; background:#0f172a; border:1px solid #334155; color:#f8fafc; border-radius:8px; box-sizing: border-box; min-height: 80px; font-family: inherit;" placeholder="e.g. Birthday celebration..."></textarea>
                    </div>
                </div>
                <div class="edit-actions" style="border-top: 2px solid #334155; padding-top: 1.5rem;">
                    <button id="new-cancel" type="button" style="background:transparent; color:#f8fafc; border:1px solid #475569; padding:0.75rem 1.5rem; border-radius:8px; cursor:pointer; font-weight: 600;">Discard</button>
                    <button id="new-save" type="button" style="background:#FF2D95; color:#fff; border:none; padding:0.75rem 2.5rem; font-weight:bold; border-radius:8px; cursor:pointer;">Create Booking</button>
                </div>
            </div>
        `;
        container.prepend(modal);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        modal.querySelector('#new-cancel').onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.remove();
        };
        modal.querySelector('#new-save').onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const btn = modal.querySelector('#new-save');
            btn.innerText = 'Creating...';
            btn.disabled = true;
            const payload = {
                first_name: document.getElementById('new-fn').value.trim(),
                last_name: document.getElementById('new-ln').value.trim(),
                whatsapp_number: document.getElementById('new-wa').value.trim(),
                email: document.getElementById('new-em').value.trim(),
                event_date: document.getElementById('new-ed').value,
                male: parseInt(document.getElementById('new-male').value || 0),
                female: parseInt(document.getElementById('new-female').value || 0),
                total_amount_paid: parseFloat(document.getElementById('new-am').value || 0),
                payment_method: document.getElementById('new-method').value,
                notes: document.getElementById('new-notes').value.trim(),
                created_by: document.getElementById('new-by').value.trim(),
                tags: []
            };
            if (!payload.first_name || !payload.whatsapp_number) {
                alert('First Name and WhatsApp are required.');
                btn.innerText = 'Create Booking';
                btn.disabled = false;
                return;
            }
            try {
                const res = await apiFetch('/v2/bookings', { method: 'POST', body: JSON.stringify(payload) });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to create booking');
                modal.remove();
                loadBookings();
            } catch (err) { alert(err.message); btn.innerText = 'Create Booking'; btn.disabled = false; }
        };
    }

    function renderBookings() {
        renderBookingCards(document.getElementById('bookings-list-container'), state.bookings);
        renderCrmCalendar();
    }

    // --- CRM Calendar ---
    let crmCalMonth = new Date().getMonth();
    let crmCalYear = new Date().getFullYear();
    function renderCrmCalendar() {
        const grid = document.getElementById('crm-cal-grid');
        if (!grid) return;
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthSelect = document.getElementById('crm-cal-month');
        const yearSelect = document.getElementById('crm-cal-year');
        if (monthSelect.children.length === 0) {
            monthSelect.innerHTML = monthNames.map((m, i) => `<option value="${i}" ${i === crmCalMonth ? 'selected' : ''}>${m}</option>`).join('');
            yearSelect.innerHTML = [2025, 2026, 2027].map(y => `<option value="${y}" ${y === crmCalYear ? 'selected' : ''}>${y}</option>`).join('');
            monthSelect.onchange = (e) => { crmCalMonth = parseInt(e.target.value); renderCrmCalendar(); };
            yearSelect.onchange = (e) => { crmCalYear = parseInt(e.target.value); renderCrmCalendar(); };
        }
        let html = '';
        const firstDay = new Date(crmCalYear, crmCalMonth, 1).getDay();
        const daysInMonth = new Date(crmCalYear, crmCalMonth + 1, 0).getDate();
        const bookingsMap = {};
        state.bookings.forEach(b => {
            if (!bookingsMap[b.event_date]) bookingsMap[b.event_date] = [];
            bookingsMap[b.event_date].push(b);
        });
        for (let i = 0; i < firstDay; i++) { html += `<div class="calendar-day empty"></div>`; }
        for (let d = 1; d <= daysInMonth; d++) {
            const mm = String(crmCalMonth + 1).padStart(2, '0');
            const dd = String(d).padStart(2, '0');
            const dateStrIso = `${crmCalYear}-${mm}-${dd}`;
            const hasBookings = !!bookingsMap[dateStrIso];
            html += `<div class="calendar-day" data-crmdate="${dateStrIso}" style="background: #1e293b;">${d}${hasBookings ? '<div class="crm-dot"></div>' : ''}</div>`;
        }
        grid.innerHTML = html;
        grid.querySelectorAll('.calendar-day[data-crmdate]').forEach(day => {
            day.onclick = (e) => {
                e.stopPropagation();
                const crmDate = day.dataset.crmdate;
                const cardsContainer = document.getElementById('bookings-calendar-cards');
                cardsContainer.style.display = 'flex';
                renderBookingCards(cardsContainer, (bookingsMap[crmDate] || []));
            };
        });
    }

    const btnRefreshBookings = document.getElementById('btn-refresh-bookings');
    if (btnRefreshBookings) btnRefreshBookings.addEventListener('click', loadBookings);

    const viewListBtn = document.getElementById('view-list-btn');
    const viewCalBtn = document.getElementById('view-cal-btn');
    if (viewListBtn && viewCalBtn) {
        viewListBtn.onclick = (e) => {
            e.stopPropagation();
            viewListBtn.classList.add('active'); viewCalBtn.classList.remove('active');
            document.getElementById('bookings-list-container').style.display = 'flex';
            document.getElementById('bookings-calendar-container').style.display = 'none';
            document.getElementById('bookings-calendar-cards').style.display = 'none';
        };
        viewCalBtn.onclick = (e) => {
            e.stopPropagation();
            viewCalBtn.classList.add('active'); viewListBtn.classList.remove('active');
            document.getElementById('bookings-list-container').style.display = 'none';
            document.getElementById('bookings-calendar-container').style.display = 'block';
            document.getElementById('bookings-calendar-cards').style.display = 'flex';
        };
    }

    const originalInit = init;
    init = function () {
        originalInit();
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.dataset.tab === 'bookings' && (!state.bookings || state.bookings.length === 0)) loadBookings();
            });
        });
    };
    document.addEventListener('DOMContentLoaded', init);
})();
