/**
 * 🏛️ Founder Control Panel — Dashboard JS
 * Auth + Data Fetching + Rendering
 */
(function () {
    'use strict';

    // ═══ STATE ═══
    const state = {
        token: localStorage.getItem('admin_token') || null,
        activeTab: 'events',
        events: [],
        guests: [],
        kpis: null,
        sortField: 'created_at',
        sortDir: 'desc'
    };

    const API_BASE = '/api/admin';

    // ═══ DOM REFS ═══
    const $ = id => document.getElementById(id);
    const loginScreen = $('login-screen');
    const dashboard = $('dashboard');
    const loginForm = $('login-form');
    const loginError = $('login-error');
    const loginBtn = $('login-btn');

    // ═══ INIT ═══
    function init() {
        if (state.token) {
            verifyToken();
        } else {
            showLogin();
        }

        // Event listeners
        loginForm.addEventListener('submit', handleLogin);
        $('btn-logout').addEventListener('click', handleLogout);
        $('btn-refresh-events').addEventListener('click', () => loadEvents());
        $('btn-refresh-kpis').addEventListener('click', () => loadKPIs());

        // Tab nav
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        // CRM search + filter
        $('crm-search').addEventListener('input', debounce(renderGuestsFiltered, 300));
        $('crm-filter-source').addEventListener('change', renderGuestsFiltered);

        // Table sorting
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                if (state.sortField === field) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
                else { state.sortField = field; state.sortDir = 'asc'; }
                renderGuestsFiltered();
            });
        });
    }

    // ═══ AUTH ═══
    async function handleLogin(e) {
        e.preventDefault();
        const email = $('login-email').value.trim();
        const password = $('login-password').value;

        loginBtn.disabled = true;
        loginBtn.querySelector('.btn-text').textContent = 'Signing in...';
        loginBtn.querySelector('.btn-spinner').style.display = 'inline';
        loginError.style.display = 'none';

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            state.token = data.token;
            localStorage.setItem('admin_token', data.token);
            showDashboard();
        } catch (err) {
            loginError.textContent = err.message;
            loginError.style.display = 'block';
        } finally {
            loginBtn.disabled = false;
            loginBtn.querySelector('.btn-text').textContent = 'Sign In';
            loginBtn.querySelector('.btn-spinner').style.display = 'none';
        }
    }

    async function verifyToken() {
        try {
            const res = await apiFetch('/events');
            if (res.ok) {
                showDashboard();
            } else {
                handleLogout();
            }
        } catch {
            handleLogout();
        }
    }

    function handleLogout() {
        state.token = null;
        localStorage.removeItem('admin_token');
        showLogin();
    }

    function showLogin() {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    }

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        loadEvents();
    }

    // ═══ API ═══
    function apiFetch(path) {
        return fetch(`${API_BASE}${path}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
    }

    // ═══ TAB SWITCHING ═══
    function switchTab(tab) {
        state.activeTab = tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.tab-panel').forEach(p => {
            p.style.display = p.id === `tab-${tab}` ? 'block' : 'none';
        });

        if (tab === 'events' && state.events.length === 0) loadEvents();
        if (tab === 'crm' && state.guests.length === 0) loadGuests();
        if (tab === 'kpis' && !state.kpis) loadKPIs();
    }

    // ═══ EVENTS ═══
    async function loadEvents() {
        $('events-loading').style.display = 'flex';
        $('events-grid').style.display = 'none';
        $('events-empty').style.display = 'none';

        try {
            const res = await apiFetch('/events');
            if (res.status === 401) return handleLogout();
            const data = await res.json();
            state.events = data.events || [];
            renderEvents();
        } catch (err) {
            console.error('Events load error:', err);
        } finally {
            $('events-loading').style.display = 'none';
        }
    }

    function renderEvents() {
        const grid = $('events-grid');
        const empty = $('events-empty');

        if (state.events.length === 0) {
            empty.style.display = 'block';
            grid.style.display = 'none';
            return;
        }

        grid.style.display = 'grid';
        grid.innerHTML = state.events.map(ev => {
            const count = ev.paid_count || 0;
            const min = 5;
            const pct = Math.min(100, (count / min) * 100);

            let statusClass, badgeClass, badgeText, fillClass;
            if (count >= min) {
                statusClass = 'status-go'; badgeClass = 'badge-go'; badgeText = '✓ GO'; fillClass = 'fill-go';
            } else if (count >= 3) {
                statusClass = 'status-caution'; badgeClass = 'badge-caution'; badgeText = '⚠ Caution'; fillClass = 'fill-caution';
            } else {
                statusClass = 'status-risk'; badgeClass = 'badge-risk'; badgeText = '✕ At Risk'; fillClass = 'fill-risk';
            }

            const d = new Date(ev.date + 'T00:00:00');
            const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const dayStr = d.toLocaleDateString('en-US', { weekday: 'long' });

            const revenue = (ev.total_revenue || 0).toLocaleString();

            return `
                <div class="event-card ${statusClass}">
                    <div class="event-card-header">
                        <div>
                            <div class="event-date">${dateStr}</div>
                            <div class="event-day">${dayStr}</div>
                        </div>
                        <span class="event-status-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="event-headcount">
                        <span class="headcount-number">${count}</span>
                        <span class="headcount-label">paid guests<br>/ ${min} minimum</span>
                    </div>
                    <div class="headcount-bar">
                        <div class="headcount-progress ${fillClass}" style="width:${pct}%"></div>
                    </div>
                    <div class="event-revenue">
                        <span class="event-revenue-label">Revenue</span>
                        <span class="event-revenue-value">฿${revenue}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ═══ CRM ═══
    async function loadGuests() {
        $('crm-loading').style.display = 'flex';
        $('crm-table-wrapper').style.display = 'none';
        $('crm-count').style.display = 'none';

        try {
            const res = await apiFetch('/guests');
            if (res.status === 401) return handleLogout();
            const data = await res.json();
            state.guests = data.guests || [];
            renderGuestsFiltered();
        } catch (err) {
            console.error('Guests load error:', err);
        } finally {
            $('crm-loading').style.display = 'none';
        }
    }

    function renderGuestsFiltered() {
        const search = ($('crm-search').value || '').toLowerCase();
        const sourceFilter = $('crm-filter-source').value;

        let filtered = state.guests.filter(g => {
            const matchSearch = !search ||
                (g.first_name || '').toLowerCase().includes(search) ||
                (g.last_name || '').toLowerCase().includes(search) ||
                (g.email || '').toLowerCase().includes(search) ||
                (g.phone || '').includes(search);
            const matchSource = !sourceFilter || g.source === sourceFilter;
            return matchSearch && matchSource;
        });

        // Sort
        filtered.sort((a, b) => {
            let va = a[state.sortField] || '';
            let vb = b[state.sortField] || '';
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return state.sortDir === 'asc' ? -1 : 1;
            if (va > vb) return state.sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        renderGuests(filtered);
    }

    function renderGuests(guests) {
        const wrapper = $('crm-table-wrapper');
        const tbody = $('crm-tbody');
        const countEl = $('crm-count');

        wrapper.style.display = 'block';
        countEl.style.display = 'block';
        countEl.textContent = `Showing ${guests.length} of ${state.guests.length} guests`;

        tbody.innerHTML = guests.map(g => {
            const name = [g.first_name, g.last_name].filter(Boolean).join(' ') || 'Unknown';
            const phone = g.phone
                ? `<span class="phone-cell">${g.phone}</span>`
                : `<span class="phone-missing">Missing</span>`;

            const sourceClass = (g.source || '').toLowerCase();
            const source = g.source
                ? `<span class="source-badge ${sourceClass}">${g.source}</span>`
                : '<span class="source-badge">—</span>';

            const tags = (g.tags || []).map(t => {
                let cls = '';
                if (t.includes('⭐') || t.includes('Repeat')) cls = 'tag-star';
                else if (t.includes('Booked') || t.includes('Attended')) cls = 'tag-booked';
                else if (t.includes('Missing')) cls = 'tag-missing';
                else if (t.includes('OTA')) cls = 'tag-ota';
                else if (t.includes('Interested')) cls = 'tag-warning';
                return `<span class="tag-chip ${cls}">${t}</span>`;
            }).join('');

            const joined = g.created_at
                ? new Date(g.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : '—';

            return `
                <tr>
                    <td>
                        <div class="guest-name">${escHtml(name)}</div>
                    </td>
                    <td>${phone}</td>
                    <td>${escHtml(g.email || '—')}</td>
                    <td>${source}</td>
                    <td><div class="tag-list">${tags || '—'}</div></td>
                    <td>${joined}</td>
                </tr>
            `;
        }).join('');
    }

    // ═══ KPIs ═══
    async function loadKPIs() {
        $('kpis-loading').style.display = 'flex';
        $('kpis-grid').style.display = 'none';

        try {
            const res = await apiFetch('/kpis');
            if (res.status === 401) return handleLogout();
            state.kpis = await res.json();
            renderKPIs();
        } catch (err) {
            console.error('KPIs load error:', err);
        } finally {
            $('kpis-loading').style.display = 'none';
        }
    }

    function renderKPIs() {
        const k = state.kpis;
        if (!k) return;

        $('kpis-grid').style.display = 'grid';
        $('kpis-grid').innerHTML = `
            <div class="kpi-card">
                <div class="kpi-icon pink-bg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF2D95" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div class="kpi-label">Total Revenue</div>
                <div class="kpi-value pink">฿${(k.total_revenue || 0).toLocaleString()}</div>
                <div class="kpi-sub">${k.total_paid_bookings || 0} paid bookings</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon gold-bg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <div class="kpi-label">Avg Revenue / Event</div>
                <div class="kpi-value gold">฿${(k.avg_revenue_per_event || 0).toLocaleString()}</div>
                <div class="kpi-sub">${k.total_events_with_bookings || 0} events with bookings</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon green-bg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div class="kpi-label">Repeat Guest Rate</div>
                <div class="kpi-value green">${(k.repeat_guest_rate || 0).toFixed(1)}%</div>
                <div class="kpi-sub">${k.repeat_guests || 0} of ${k.total_guests || 0} guests returned</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Avg Guests / Event</div>
                <div class="kpi-value white">${(k.avg_guests_per_event || 0).toFixed(1)}</div>
                <div class="kpi-sub">Average paid headcount</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Total Guests</div>
                <div class="kpi-value white">${k.total_guests || 0}</div>
                <div class="kpi-sub">${k.guests_with_phone || 0} with phone number</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Booking Sources</div>
                <div class="kpi-value white">${k.source_breakdown ? Object.keys(k.source_breakdown).length : 0}</div>
                <div class="kpi-sub">${k.source_breakdown ? Object.entries(k.source_breakdown).map(([s, c]) => `${s}: ${c}`).join(' · ') : '—'}</div>
            </div>
        `;
    }

    // ═══ UTILS ═══
    function debounce(fn, ms) {
        let t;
        return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
    }

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    // ═══ BOOT ═══
    document.addEventListener('DOMContentLoaded', init);
})();
