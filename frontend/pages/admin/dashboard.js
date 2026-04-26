import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const EMPTY_FORM = { title: '', slug: '', excerpt: '', content: '', coverImage: '', category: '' };
const VN   = { fontFamily: "'Be Vietnam Pro', sans-serif" };
const MONO = { fontFamily: 'ui-monospace, monospace' };

// ─── Reusable field components ────────────────────────────────────────────────

function Label({ children }) {
  return (
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', ...VN }}>
      {children}
    </label>
  );
}

function Field({ label, value, onChange, placeholder, required, mono, rows }) {
  const base = {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '10px 14px', color: '#0f172a', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
    background: '#fff', fontSize: '15px',
    ...(mono ? { ...MONO, fontSize: '13px', lineHeight: '1.7' } : VN),
  };
  const focus = e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.08)'; };
  const blur  = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  return (
    <div>
      {label && <Label>{label}</Label>}
      {rows ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows}
          style={{ ...base, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
      ) : (
        <input type="text" value={value} onChange={onChange} placeholder={placeholder} required={required}
          style={base} onFocus={focus} onBlur={blur} />
      )}
    </div>
  );
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

const TOOLBAR_GROUPS = [
  { key: 'block', items: [
    { cmd: 'formatBlock', val: 'h2',         label: 'H2', title: 'Heading 2' },
    { cmd: 'formatBlock', val: 'h3',         label: 'H3', title: 'Heading 3' },
    { cmd: 'formatBlock', val: 'p',          label: '¶',  title: 'Paragraph' },
    { cmd: 'formatBlock', val: 'blockquote', label: '❝',  title: 'Blockquote' },
  ]},
  { key: 'inline', items: [
    { cmd: 'bold',          label: 'B',  title: 'Bold' },
    { cmd: 'italic',        label: 'I',  title: 'Italic' },
    { cmd: 'underline',     label: 'U',  title: 'Underline' },
    { cmd: 'strikeThrough', label: 'S',  title: 'Strikethrough' },
  ]},
  { key: 'list', items: [
    { cmd: 'insertUnorderedList', label: '•≡', title: 'Bullet list' },
    { cmd: 'insertOrderedList',   label: '1≡', title: 'Numbered list' },
  ]},
  { key: 'align', items: [
    { cmd: 'justifyLeft',   label: '⬛⬜', title: 'Align left' },
    { cmd: 'justifyCenter', label: '⬛⬛', title: 'Align center' },
    { cmd: 'justifyRight',  label: '⬜⬛', title: 'Align right' },
  ]},
  { key: 'misc', items: [
    { cmd: 'insertHorizontalRule', label: '─',  title: 'Horizontal rule' },
    { cmd: 'removeFormat',         label: '✕f', title: 'Clear formatting' },
  ]},
];

function ToolbarButton({ label, title, active, onMouseDown }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      onMouseOver={() => setHov(true)}
      onMouseOut={() => setHov(false)}
      style={{
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        minWidth: '30px',
        height: '28px',
        padding: '0 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.03em',
        transition: 'all 0.12s',
        background: active ? '#0f172a' : hov ? '#f1f5f9' : 'transparent',
        color: active ? '#10b981' : '#64748b',
        fontFamily: 'ui-monospace, monospace',
      }}>
      {label}
    </button>
  );
}

function Divider() {
  return <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 3px', flexShrink: 0 }} />;
}

function RichEditor({ value, onChange }) {
  const editorRef    = useRef(null);
  const isInternal   = useRef(false);
  const savedRange   = useRef(null);
  const [formats, setFormats]     = useState({});
  const [linkModal, setLinkModal] = useState(false);
  const [linkUrl, setLinkUrl]     = useState('');
  const [focused, setFocused]     = useState(false);

  // Sync value → DOM only when driven externally (e.g. loading a saved post)
  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternal.current) return;
    if (el.innerHTML !== (value || '')) el.innerHTML = value || '';
  }, [value]);

  const syncOut = useCallback(() => {
    isInternal.current = true;
    onChange(editorRef.current?.innerHTML ?? '');
    requestAnimationFrame(() => { isInternal.current = false; });
  }, [onChange]);

  const refreshFormats = useCallback(() => {
    const s = {};
    ['bold','italic','underline','strikeThrough','insertUnorderedList','insertOrderedList',
     'justifyLeft','justifyCenter','justifyRight'].forEach(c => {
      try { s[c] = document.queryCommandState(c); } catch {}
    });
    try { s._block = document.queryCommandValue('formatBlock').toLowerCase().replace(/[<>]/g, ''); } catch {}
    setFormats(s);
  }, []);

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
    syncOut();
    refreshFormats();
  }, [syncOut, refreshFormats]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel?.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
  };

  const isActive = (cmd, val) => val ? formats._block === val : !!formats[cmd];

  const makeMouseDown = (cmd, val) => e => {
    e.preventDefault();
    exec(cmd, val ?? null);
  };

  return (
    <div style={{
      border: `1px solid ${focused ? '#10b981' : '#e2e8f0'}`,
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: focused ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1px',
        padding: '6px 10px',
        borderBottom: '1px solid #f1f5f9',
        background: '#fafafa',
        flexWrap: 'wrap',
        rowGap: '4px',
      }}>
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={group.key} style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
            {group.items.map(item => (
              <ToolbarButton
                key={item.cmd + (item.val || '')}
                label={item.label}
                title={item.title}
                active={isActive(item.cmd, item.val)}
                onMouseDown={makeMouseDown(item.cmd, item.val)}
              />
            ))}
            {gi < TOOLBAR_GROUPS.length - 1 && <Divider />}
          </div>
        ))}

        {/* Link */}
        <Divider />
        <ToolbarButton
          label="🔗"
          title="Insert link"
          active={false}
          onMouseDown={e => { e.preventDefault(); saveSelection(); setLinkUrl(''); setLinkModal(true); }}
        />

        {/* Unlink */}
        <ToolbarButton
          label="⊘"
          title="Remove link"
          active={false}
          onMouseDown={e => { e.preventDefault(); exec('unlink'); }}
        />

        {/* Undo / Redo */}
        <Divider />
        {[['undo','↩','Undo'],['redo','↪','Redo']].map(([cmd, icon, title]) => (
          <ToolbarButton key={cmd} label={icon} title={title} active={false} onMouseDown={e => { e.preventDefault(); exec(cmd); }} />
        ))}

        <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#cbd5e1', letterSpacing: '0.1em', textTransform: 'uppercase', ...VN, flexShrink: 0 }}>
          Rich Text
        </span>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Bắt đầu viết nội dung bài..."
        onInput={syncOut}
        onKeyUp={refreshFormats}
        onMouseUp={refreshFormats}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); syncOut(); }}
        style={{
          flex: 1,
          minHeight: '380px',
          padding: '24px 28px',
          outline: 'none',
          fontSize: '16px',
          lineHeight: '1.85',
          color: '#334155',
          overflowY: 'auto',
          ...VN,
        }}
      />

      {/* ── Link modal ── */}
      {linkModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setLinkModal(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '400px', boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0f172a', marginBottom: '16px', ...VN }}>Chèn liên kết</div>
            <input
              autoFocus
              type="text"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://..."
              onKeyDown={e => {
                if (e.key === 'Enter') { restoreSelection(); if (linkUrl) exec('createLink', linkUrl); setLinkModal(false); }
                if (e.key === 'Escape') setLinkModal(false);
              }}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', ...MONO }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setLinkModal(false)}
                style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '7px', padding: '7px 16px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#64748b', ...VN }}>
                Hủy
              </button>
              <button type="button" onClick={() => { restoreSelection(); if (linkUrl) exec('createLink', linkUrl); setLinkModal(false); }}
                style={{ border: 'none', background: '#0f172a', borderRadius: '7px', padding: '7px 18px', cursor: 'pointer', fontSize: '11px', fontWeight: 800, color: '#fff', ...VN }}>
                Chèn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Styles scoped to the editable area ── */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #cbd5e1;
          pointer-events: none;
        }
        [contenteditable] h2 {
          font-size: 22px; font-weight: 800; color: #0f172a;
          margin: 1.3em 0 0.4em; line-height: 1.25;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        [contenteditable] h3 {
          font-size: 18px; font-weight: 700; color: #0f172a;
          margin: 1.1em 0 0.3em; line-height: 1.3;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        [contenteditable] p  { margin: 0 0 0.85em; }
        [contenteditable] blockquote {
          border-left: 3px solid #10b981;
          margin: 1em 0; padding: 10px 18px;
          color: #64748b; font-style: italic;
          background: #f0fdf4; border-radius: 0 6px 6px 0;
        }
        [contenteditable] ul { list-style: disc;    padding-left: 1.6em; margin: 0.6em 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.6em; margin: 0.6em 0; }
        [contenteditable] li { margin-bottom: 0.3em; }
        [contenteditable] a  { color: #10b981; text-decoration: underline; }
        [contenteditable] hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.6em 0; }
        [contenteditable] strong { font-weight: 800; }
      `}</style>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ posts, view, onNew, onLogout }) {
  const [hov, setHov] = useState(null);

  const navItems = [
    { id: 'posts', label: 'Bài viết', sub: `${posts.length} bài`, onClick: () => {} },
    { id: 'new',   label: 'Tạo bài mới', sub: 'Xuất bản nội dung', onClick: onNew },
  ];

  return (
    <aside style={{
      width: '220px', minHeight: '100vh', background: '#0f172a',
      borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30,
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e293b' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '30px', height: '30px', background: '#10b981', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', color: '#0f172a', ...VN }}>SG</div>
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff', ...VN }}>Sài Gòn Blog</span>
          </div>
        </Link>
        <span style={{ fontSize: '9px', color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', ...VN }}>Admin Dashboard</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        <div style={{ padding: '0 20px 8px', fontSize: '9px', color: '#334155', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800, ...VN }}>Nội dung</div>
        {navItems.map(item => {
          const active = item.id === 'posts' && (view === 'list');
          return (
            <button key={item.id} onClick={item.onClick}
              onMouseOver={() => setHov(item.id)} onMouseOut={() => setHov(null)}
              style={{
                width: '100%', textAlign: 'left', background: active || hov === item.id ? '#1e293b' : 'transparent',
                border: 'none', borderLeft: active ? '2px solid #10b981' : '2px solid transparent',
                padding: '10px 20px', cursor: 'pointer', transition: 'all 0.15s', borderRadius: '0 6px 6px 0',
              }}>
              <span style={{ display: 'block', fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: active ? '#10b981' : '#94a3b8', ...VN }}>{item.label}</span>
              <span style={{ display: 'block', fontSize: '9px', color: '#475569', marginTop: '2px', ...VN }}>{item.sub}</span>
            </button>
          );
        })}

        <div style={{ padding: '16px 20px 8px', fontSize: '9px', color: '#334155', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800, marginTop: '8px', ...VN }}>Hệ thống</div>
        {[['Rendering: CSR', 'Client Side'], ['API Backend', 'localhost:5123']].map(([l, s]) => (
          <div key={l} style={{ padding: '10px 20px' }}>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#475569', ...VN }}>{l}</span>
            <span style={{ fontSize: '9px', color: '#334155', ...VN }}>{s}</span>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '16px 0' }}>
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '9px', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', ...VN }}>Hệ thống hoạt động</span>
        </div>
        <button onClick={onLogout}
          onMouseOver={e => e.currentTarget.style.background = '#1e293b'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderLeft: '2px solid transparent', padding: '10px 20px', cursor: 'pointer', transition: 'all 0.15s' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f87171', ...VN }}>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

// ─── Full-page Editor ─────────────────────────────────────────────────────────

function EditorPage({ visible, editingPost, onBack, onSuccess }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData(editingPost || EMPTY_FORM);
    setSaved(false);
    setUploadErr('');
  }, [editingPost, visible]);

  const set = key => e => setFormData(f => ({ ...f, [key]: e.target.value }));
  const setVal = (key, val) => setFormData(f => ({ ...f, [key]: val })); // Helper for RichEditor

  const handleImageUpload = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setUploadErr('Chỉ hỗ trợ JPG, PNG, WebP');
      return;
    }
    setUploadErr('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd }); 
      const data = await res.json();
      if (data.success) {
        setFormData(f => ({ ...f, coverImage: data.imageUrl }));
        } else {
        setUploadErr(data.error || 'Upload failed');
    }
    } catch { setUploadErr('Lỗi Proxy Upload'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    const method = editingPost ? 'PUT' : 'POST';
    
    // Thay đổi: Đường dẫn nội bộ
    const url = editingPost ? `/api/posts/${editingPost._id}` : '/api/posts';
    
    try {
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      });
      if (res.ok) {
        setSaved(true);
        onSuccess();
        setTimeout(() => { setSaved(false); onBack(); }, 900);
      }
    } catch { alert('Lỗi Proxy!'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,  /* higher than sidebar's z-index: 30 */
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
      display: 'flex', flexDirection: 'column', background: '#f8fafc',
    }}>
      {/* Top bar */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0 32px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', transition: 'color 0.15s', ...VN }}
          onMouseOver={e => e.currentTarget.style.color = '#fff'}
          onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
          <span style={{ fontSize: '16px' }}>←</span>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>Dashboard</span>
        </button>
        <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#10b981', ...VN }}>
          {editingPost ? 'Chỉnh sửa bài viết' : 'Bài viết mới'}
        </span>
        <button type="submit" form="post-form" disabled={saving || saved}
          style={{
            background: saved ? '#10b981' : '#fff', color: saved ? '#fff' : '#0f172a',
            border: 'none', padding: '7px 20px', borderRadius: '6px', cursor: 'pointer',
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
            transition: 'all 0.2s', ...VN,
          }}>
          {saved ? '✓ Đã lưu' : saving ? 'Đang lưu...' : editingPost ? 'Cập nhật' : 'Đăng bài'}
        </button>
      </div>

      {/* Editor body — two columns like WordPress */}
      <form id="post-form" onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', display: 'flex', gap: 0 }}>

        {/* Main column — title + content */}
        <div style={{ flex: 1, padding: '48px 56px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px' }}>
          <input
            type="text"
            value={formData.title}
            onChange={set('title')}
            placeholder="Tiêu đề bài viết..."
            required
            style={{
              width: '100%', border: 'none', borderBottom: '2px solid #e2e8f0',
              background: 'transparent', fontSize: '32px', fontWeight: 800,
              color: '#0f172a', outline: 'none', padding: '0 0 16px',
              transition: 'border-color 0.15s', boxSizing: 'border-box', ...VN,
            }}
            onFocus={e => e.target.style.borderColor = '#10b981'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />

          <div>
            <Label>Tóm tắt</Label>
            <textarea value={formData.excerpt} onChange={set('excerpt')} placeholder="Một đoạn giới thiệu ngắn hiển thị ngoài trang chủ..." rows={3}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', fontSize: '15px', color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s', background: '#fff', ...VN }}
              onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Label>Nội dung</Label>
            <RichEditor value={formData.content} onChange={val => setVal('content', val)} />
          </div>
        </div>

        {/* Sidebar column — meta fields */}
        <div style={{ width: '280px', borderLeft: '1px solid #e2e8f0', padding: '48px 28px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#fff', flexShrink: 0 }}>

          <div>
            <Label>Cover Image</Label>

            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={e => handleImageUpload(e.target.files[0])}
            />

            {/* Drop zone */}
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files[0]); }}
              style={{
                border: `2px dashed ${dragOver ? '#10b981' : uploading ? '#10b981' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '20px 12px',
                textAlign: 'center',
                cursor: uploading ? 'wait' : 'pointer',
                background: dragOver ? 'rgba(16,185,129,0.04)' : '#fafafa',
                transition: 'all 0.2s',
              }}
            >
              {uploading ? (
                <>
                  <div style={{ fontSize: '20px', marginBottom: '6px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
                  <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#10b981', ...VN }}>Đang tải lên...</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>🖼️</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', ...VN }}>Kéo thả ảnh vào đây</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', ...VN }}>hoặc click để chọn file</div>
                  <div style={{ fontSize: '9px', color: '#cbd5e1', marginTop: '6px', letterSpacing: '0.1em', textTransform: 'uppercase', ...VN }}>JPG · PNG · WebP</div>
                </>
              )}
            </div>

            {/* Upload error */}
            {uploadErr && (
              <div style={{ marginTop: '6px', fontSize: '10px', color: '#ef4444', fontWeight: 700, ...VN }}>⚠ {uploadErr}</div>
            )}

            {/* Preview + clear */}
            {formData.coverImage && !uploading && (
              <div style={{ marginTop: '10px', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '16/9' }}>
                <img src={formData.coverImage} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, coverImage: '' }))}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: 'rgba(15,23,42,0.7)', border: 'none', borderRadius: '4px',
                    color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px',
                    cursor: 'pointer', letterSpacing: '0.05em', ...VN,
                  }}>
                  Xóa
                </button>
              </div>
            )}

            {/* Fallback: paste URL manually */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '9px', color: '#cbd5e1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px', ...VN }}>hoặc dán URL</div>
              <input type="text" value={formData.coverImage} onChange={set('coverImage')} placeholder="https://..."
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', fontSize: '11px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', ...MONO }}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '9px', color: '#cbd5e1', ...VN, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Rendering</div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', ...VN, letterSpacing: '0.15em', textTransform: 'uppercase' }}>CSR</span>
            <span style={{ fontSize: '10px', color: '#94a3b8', ...VN }}> — Client Side</span>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Full-page Post Preview ───────────────────────────────────────────────────

function PreviewPage({ visible, post, onBack }) {
  if (!post) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,  /* higher than sidebar's z-index: 30 */
      background: '#fff', overflowY: 'auto',
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
    }}>
      {/* Top bar */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0 32px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', transition: 'color 0.15s', ...VN }}
          onMouseOver={e => e.currentTarget.style.color = '#fff'}
          onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
          <span style={{ fontSize: '16px' }}>←</span>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>Dashboard</span>
        </button>
        <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#475569', ...VN }}>Xem trước bài viết</span>
        <div style={{ width: '80px' }} />
      </div>

      {/* Post content — mirrors the public blog post style */}
      {post.coverImage && (
        <div style={{ width: '100%', height: '340px', overflow: 'hidden' }}>
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '52px 32px 96px' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#10b981', display: 'block', marginBottom: '12px', ...VN }}>
          {post.category || 'Địa danh Sài Gòn'}
        </span>
        <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, margin: '0 0 20px', ...VN }}>{post.title}</h1>
        <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.7, borderLeft: '2px solid #e2e8f0', paddingLeft: '16px', marginBottom: '40px', ...VN }}>{post.excerpt}</p>
        <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: '40px' }} />
        <div
          style={{ fontSize: '17px', color: '#334155', lineHeight: 1.85, ...VN }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState('list');   // 'list' | 'editor' | 'preview'
  const [editingPost, setEditingPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/admin/login'); return; }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts'); 
      setPosts(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/admin/login');
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bài viết này?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' }); 
    fetchPosts();
  };

  const openCreate = () => { setEditingPost(null); setView('editor'); };
  const openEdit   = post => { setEditingPost(post); setView('editor'); };
  const openPreview = post => { setPreviewPost(post); setView('preview'); };
  const backToList = () => setView('list');

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#10b981', textTransform: 'uppercase', ...VN }}>Đang tải...</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      <Head>
        <title>Dashboard | Sài Gòn Blog</title>
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Sidebar — always visible underneath overlays */}
      <Sidebar posts={posts} view={view} onNew={openCreate} onLogout={handleLogout} />

      {/* Main list */}
      <main style={{ marginLeft: '220px', flex: 1, padding: '40px 48px', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#10b981', display: 'block', marginBottom: '6px', ...VN }}>Quản lý</span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0, ...VN }}>Bài viết</h1>
          </div>
          <button onClick={openCreate}
            onMouseOver={e => e.currentTarget.style.background = '#1e293b'}
            onMouseOut={e => e.currentTarget.style.background = '#0f172a'}
            style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'background 0.15s', ...VN }}>
            + Bài mới
          </button>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '24px' }} />

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <p style={{ ...VN, fontSize: '14px' }}>Chưa có bài viết nào.</p>
            <button onClick={openCreate} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '13px', fontWeight: 700, ...VN }}>Tạo bài đầu tiên →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {/* Table head */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', padding: '8px 16px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', ...VN }}>
              <span>Tiêu đề</span><span>Slug</span><span style={{ textAlign: 'right' }}>Thao tác</span>
            </div>

            {posts.map((post, i) => (
              <div key={post._id}
                style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', alignItems: 'center', background: '#fff', borderRadius: '8px', padding: '14px 16px', border: '1px solid #f1f5f9', animation: 'fadeUp 0.2s ease both', animationDelay: `${i * 35}ms`, transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', margin: 0, ...VN }}>{post.title}</p>
                  {post.category && <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#10b981', ...VN }}>{post.category}</span>}
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', ...MONO }}>/{post.slug}</span>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  {[
                    { label: 'Xem', bg: '#f0fdf4', color: '#16a34a', hbg: '#dcfce7', onClick: () => openPreview(post) },
                    { label: 'Sửa', bg: '#f1f5f9', color: '#0f172a', hbg: '#e2e8f0', onClick: () => openEdit(post) },
                    { label: 'Xóa', bg: '#fff0f0', color: '#ef4444', hbg: '#fee2e2', onClick: () => handleDelete(post._id) },
                  ].map(({ label, bg, color, hbg, onClick }) => (
                    <button key={label} onClick={onClick}
                      onMouseOver={e => e.currentTarget.style.background = hbg}
                      onMouseOut={e => e.currentTarget.style.background = bg}
                      style={{ background: bg, border: 'none', color, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.15s', ...VN }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Full-page Editor — slides up from bottom, covers sidebar */}
      <EditorPage
        visible={view === 'editor'}
        editingPost={editingPost}
        onBack={backToList}
        onSuccess={fetchPosts}
      />

      {/* Full-page Preview — slides up from bottom, covers sidebar */}
      <PreviewPage
        visible={view === 'preview'}
        post={previewPost}
        onBack={backToList}
      />

      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}