import React, { useState, useRef, useEffect, useCallback } from "react";
import ModalPortal from "../shared/ModalPortal";
import { Plus, Save, Trash2, PackagePlus, CheckCircle2, AlertTriangle, Circle } from "lucide-react";

/* ─── Injected Styles ──────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  .bic-root *, .bic-root *::before, .bic-root *::after { box-sizing: border-box; }
  .bic-root { font-family: 'DM Mono', monospace; }
  .bic-syne { font-family: 'Syne', sans-serif; }

  @keyframes bic-slide-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bic-fade-overlay {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes bic-scale-up {
    from { opacity: 0; transform: scale(0.96) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .bic-overlay {
    animation: bic-fade-overlay 0.2s ease forwards;
  }
  .bic-modal {
    animation: bic-scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .bic-row-new {
    animation: bic-slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .bic-input {
    background: transparent;
    border: none;
    outline: none;
    color: #E2E8F0;
    font-family: 'DM Mono', monospace;
    font-size: 12.5px;
    width: 100%;
    padding: 7px 10px;
    border-radius: 5px;
    transition: background 0.12s, box-shadow 0.12s;
    caret-color: #22D3EE;
  }
  .bic-input::placeholder { color: #263147; }
  .bic-input:focus {
    background: rgba(34, 211, 238, 0.06);
    box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.25);
  }
  .bic-input:hover:not(:focus) { background: rgba(255,255,255,0.02); }
  .bic-input[type="number"] {
    -moz-appearance: textfield;
    text-align: center;
  }
  .bic-input[type="number"]::-webkit-inner-spin-button,
  .bic-input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }

  .bic-table-row {
    border-bottom: 1px solid #0F1929;
    transition: background 0.1s;
  }
  .bic-table-row:hover { background: rgba(34, 211, 238, 0.025); }
  .bic-table-row:hover .bic-del-btn { opacity: 1 !important; }

  .bic-del-btn {
    opacity: 0 !important;
    transition: opacity 0.15s, background 0.15s, color 0.15s;
  }
  .bic-del-btn:hover {
    background: rgba(239,68,68,0.12) !important;
    color: #EF4444 !important;
  }

  .bic-add-btn:hover {
    border-color: rgba(34, 211, 238, 0.25) !important;
    color: #22D3EE !important;
    background: rgba(34, 211, 238, 0.04) !important;
  }
  .bic-add-btn:hover .bic-add-icon {
    transform: rotate(90deg) scale(1.1);
  }
  .bic-add-icon { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }

  .bic-save-btn {
    transition: box-shadow 0.2s, transform 0.15s;
  }
  .bic-save-btn:hover {
    box-shadow: 0 0 28px rgba(34, 211, 238, 0.45) !important;
    transform: translateY(-1px) !important;
  }
  .bic-save-btn:active { transform: scale(0.97) !important; }

  .bic-cancel-btn:hover {
    border-color: #334155 !important;
    color: #94A3B8 !important;
    background: rgba(255,255,255,0.03) !important;
  }

  .bic-status-select {
    border: none;
    outline: none;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    appearance: none;
    -webkit-appearance: none;
    transition: box-shadow 0.15s;
    white-space: nowrap;
  }
  .bic-status-select:focus { box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.4); }

  .bic-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
  .bic-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .bic-scrollbar::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
  .bic-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }

  .bic-progress-fill {
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bic-row-num {
    font-size: 10px;
    color: #1E3A52;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
`;

/* ─── Constants ──────────────────────────────────────────────── */
const STATUS_CFG = {
  "In Stock":      { bg: "rgba(16,185,129,0.13)", color: "#34D399", border: "rgba(52,211,153,0.25)" },
  "Low In Stock":  { bg: "rgba(245,158,11,0.13)", color: "#FBBF24", border: "rgba(251,191,36,0.25)" },
  "Out Of Stock":  { bg: "rgba(239,68,68,0.12)",  color: "#F87171", border: "rgba(248,113,113,0.25)" },
};

function createEmptyItem() {
  return { item_name:"", brand:"", item_type:"", supplier:"", balance:0, min_stock:0, moq:0, location:"", item_status:"In Stock" };
}
function isRowReady(item) {
  return item.item_name.trim() !== "" && item.item_type.trim() !== "";
}

/* ─── Sub-components ─────────────────────────────────────────── */
function ReadyDot({ ready }) {
  return (
    <div style={{
      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
      background: ready ? "#10B981" : "#1E293B",
      boxShadow: ready ? "0 0 6px rgba(16,185,129,0.6)" : "none",
      transition: "all 0.35s ease",
    }} />
  );
}

function KbdHint({ keys }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      {keys.map(([k,label]) => (
        <React.Fragment key={k}>
          <kbd style={{ padding:"2px 6px", borderRadius:4, fontSize:9, background:"#0D1420", border:"1px solid #1E293B", color:"#334155", fontFamily:"DM Mono, monospace" }}>{k}</kbd>
          <span style={{ fontSize:9, color:"#263147", fontFamily:"DM Mono, monospace" }}>{label}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function BulkItemCreator({ isOpen, onClose, onSubmit, initialItems = [] }) {
  const [items, setItems] = useState(() =>
    initialItems.length > 0 ? initialItems.map(i => ({ ...createEmptyItem(), ...i })) : [createEmptyItem()]
  );
  const [newRows, setNewRows] = useState(new Set());

  const addItem = useCallback(() => {
    const idx = items.length;
    setItems(prev => [...prev, createEmptyItem()]);
    setNewRows(prev => new Set([...prev, idx]));
    setTimeout(() => setNewRows(prev => { const n = new Set(prev); n.delete(idx); return n; }), 300);
    // auto-scroll to new row
    setTimeout(() => {
      document.getElementById(`bic-row-${idx}`)?.scrollIntoView({ behavior:"smooth", block:"nearest" });
    }, 50);
  }, [items.length]);

  const delItem = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };
  const updateItem = (idx, updates) => {
    setItems(items.map((item, i) => i === idx ? { ...item, ...updates } : item));
  };

  // Enter on last field of last row → add row
  const handleLastKeyDown = useCallback((e) => {
    if (e.key === "Enter") { e.preventDefault(); addItem(); }
  }, [addItem]);

  const ready = items.filter(isRowReady).length;
  const pct   = items.length ? (ready / items.length) * 100 : 0;

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <style>{STYLES}</style>
      {/* Overlay */}
      <div className="bic-root bic-overlay" style={{
        position:"fixed", inset:0, zIndex:50,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"16px",
        background:"rgba(2,6,23,0.88)",
        backdropFilter:"blur(10px)",
      }}>
        {/* Modal */}
        <div className="bic-modal bic-scrollbar" style={{
          width:"100%", maxWidth:1080, height:"90vh",
          background:"#08111E",
          borderRadius:16,
          border:"1px solid #131F30",
          boxShadow:"0 0 0 1px rgba(34,211,238,0.04), 0 40px 100px rgba(0,0,0,0.7)",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          position:"relative",
        }}>

          {/* Subtle corner accent */}
          <div style={{
            position:"absolute", top:0, right:0, width:200, height:200,
            background:"radial-gradient(circle at top right, rgba(34,211,238,0.05) 0%, transparent 65%)",
            pointerEvents:"none", borderRadius:"0 16px 0 0",
          }}/>

          {/* ── Header ── */}
          <header style={{
            padding:"18px 28px",
            borderBottom:"1px solid #0F1929",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            background:"linear-gradient(180deg, #0C1525 0%, #08111E 100%)",
            flexShrink:0,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              {/* Icon badge */}
              <div style={{
                width:42, height:42, borderRadius:11,
                background:"rgba(34,211,238,0.08)",
                border:"1px solid rgba(34,211,238,0.15)",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0,
              }}>
                <PackagePlus size={20} color="#22D3EE" strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="bic-syne" style={{ fontSize:17, fontWeight:700, color:"#E2E8F0", margin:0, letterSpacing:"-0.02em" }}>
                  Bulk Item Entry
                </h2>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:3 }}>
                  <span style={{ fontSize:11, color:"#1E3A52" }}>{items.length} {items.length === 1 ? "item" : "items"}</span>
                  <span style={{ color:"#0F1929" }}>·</span>
                  <span style={{
                    fontSize:11,
                    color: ready === items.length ? "#34D399" : ready > 0 ? "#FBBF24" : "#334155",
                    display:"flex", alignItems:"center", gap:4,
                    transition:"color 0.3s",
                  }}>
                    {ready === items.length && ready > 0
                      ? <CheckCircle2 size={11} />
                      : ready > 0
                        ? <AlertTriangle size={11} />
                        : <Circle size={11} />}
                    {ready}/{items.length} ready
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button className="bic-cancel-btn" onClick={onClose} style={{
                padding:"8px 18px", borderRadius:8, border:"1px solid #131F30",
                background:"transparent", color:"#4A5568", cursor:"pointer",
                fontFamily:"DM Mono, monospace", fontSize:11, letterSpacing:"0.04em",
                transition:"all 0.15s",
              }}>
                Cancel
              </button>
              <button className="bic-save-btn" onClick={() => onSubmit(items)} style={{
                padding:"8px 20px", borderRadius:8,
                background:"linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)",
                border:"none", color:"#03111E", cursor:"pointer",
                fontFamily:"DM Mono, monospace", fontSize:11, fontWeight:700, letterSpacing:"0.05em",
                display:"flex", alignItems:"center", gap:7,
                boxShadow:"0 0 20px rgba(34,211,238,0.2)",
                textTransform:"uppercase",
              }}>
                <Save size={13} strokeWidth={2.5} />
                Save {items.length} {items.length === 1 ? "Item" : "Items"}
              </button>
            </div>
          </header>

          {/* ── Progress bar ── */}
          <div style={{ height:2, background:"#0A1520", flexShrink:0 }}>
            <div className="bic-progress-fill" style={{
              height:"100%",
              width:`${pct}%`,
              background:"linear-gradient(90deg, #0E7490, #22D3EE)",
              boxShadow:"0 0 10px rgba(34,211,238,0.4)",
            }}/>
          </div>

          {/* ── Column Headers ── */}
          <div style={{
            background:"#08111E",
            borderBottom:"1px solid #0D1E2E",
            flexShrink:0,
            overflowX:"hidden",
          }}>
            <div style={{ display:"grid", gridTemplateColumns: TH_COLS, minWidth:720, paddingRight:4 }}>
              <div style={TH_NUM_STYLE}>#</div>
              <div style={TH_STYLE}>Item Name <span style={TH_REQ}>*</span></div>
              <div style={TH_STYLE}>Brand</div>
              <div style={TH_STYLE}>Type <span style={TH_REQ}>*</span></div>
              <div style={TH_STYLE}>Supplier</div>
              <div style={{ ...TH_STYLE, textAlign:"center" }}>Qty</div>
              <div style={{ ...TH_STYLE, textAlign:"center" }}>Min</div>
              <div style={TH_STYLE}>Location</div>
              <div style={{ ...TH_STYLE, textAlign:"center" }}>Status</div>
              <div style={{ width:40 }}/>
            </div>
          </div>

          {/* ── Table rows ── */}
          <div className="bic-scrollbar" style={{ flex:1, overflowY:"auto", overflowX:"auto" }}>
            <div style={{ minWidth:720 }}>
              {items.map((item, idx) => {
                const ready = isRowReady(item);
                const ss = STATUS_CFG[item.item_status];
                const isLast = idx === items.length - 1;
                return (
                  <div id={`bic-row-${idx}`} key={idx}
                    className={`bic-table-row${newRows.has(idx) ? " bic-row-new" : ""}`}
                    style={{ display:"grid", gridTemplateColumns:TH_COLS, alignItems:"center", minHeight:44 }}
                  >
                    {/* # + dot */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, paddingLeft:8 }}>
                      <span className="bic-row-num">{String(idx+1).padStart(2,"0")}</span>
                      <ReadyDot ready={ready} />
                    </div>

                    {/* Item Name */}
                    <div style={TD_STYLE}>
                      <input className="bic-input" placeholder="e.g. Hex Bolt M8" value={item.item_name}
                        onChange={e => updateItem(idx, { item_name: e.target.value })}
                        style={{ fontWeight:500, fontSize:13 }} />
                    </div>

                    {/* Brand */}
                    <div style={TD_STYLE}>
                      <input className="bic-input" placeholder="—" value={item.brand}
                        onChange={e => updateItem(idx, { brand: e.target.value })} />
                    </div>

                    {/* Type */}
                    <div style={TD_STYLE}>
                      <input className="bic-input" placeholder="e.g. Fastener" value={item.item_type}
                        onChange={e => updateItem(idx, { item_type: e.target.value })} />
                    </div>

                    {/* Supplier */}
                    <div style={TD_STYLE}>
                      <input className="bic-input" placeholder="—" value={item.supplier}
                        onChange={e => updateItem(idx, { supplier: e.target.value })} />
                    </div>

                    {/* Qty */}
                    <div style={{ ...TD_STYLE, padding:"2px 4px" }}>
                      <input className="bic-input" type="number" value={item.balance}
                        onChange={e => updateItem(idx, { balance: e.target.value })}
                        onKeyDown={isLast ? handleLastKeyDown : undefined}
                        style={{ textAlign:"center", color:"#22D3EE", fontWeight:500 }} />
                    </div>

                    {/* Min stock */}
                    <div style={{ ...TD_STYLE, padding:"2px 4px" }}>
                      <input className="bic-input" type="number" value={item.min_stock}
                        onChange={e => updateItem(idx, { min_stock: e.target.value })}
                        style={{ textAlign:"center", color:"#FBBF24", fontWeight:500 }} />
                    </div>

                    {/* Location */}
                    <div style={TD_STYLE}>
                      <input className="bic-input" placeholder="—" value={item.location}
                        onChange={e => updateItem(idx, { location: e.target.value })} />
                    </div>

                    {/* Status */}
                    <div style={{ ...TD_STYLE, padding:"2px 6px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <select className="bic-status-select" value={item.item_status}
                        onChange={e => updateItem(idx, { item_status: e.target.value })}
                        style={{ background:ss.bg, color:ss.color, border:`1px solid ${ss.border}` }}>
                        <option>In Stock</option>
                        <option>Low In Stock</option>
                        <option>Out Of Stock</option>
                      </select>
                    </div>

                    {/* Delete */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", paddingRight:6 }}>
                      <button className="bic-del-btn" onClick={() => delItem(idx)}
                        title="Remove row"
                        style={{
                          padding:"6px", borderRadius:6, border:"none",
                          background:"transparent", cursor: items.length === 1 ? "not-allowed" : "pointer",
                          color:"#263147", display:"flex", alignItems:"center", justifyContent:"center",
                          opacity: items.length === 1 ? "0 !important" : undefined,
                        }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add row button */}
              <div style={{ padding:"12px 16px" }}>
                <button className="bic-add-btn" onClick={addItem} style={{
                  width:"100%", padding:"14px 16px",
                  border:"1px dashed #131F30",
                  borderRadius:10, background:"transparent", cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  color:"#1E3A52",
                  fontFamily:"DM Mono, monospace", fontSize:12,
                  letterSpacing:"0.05em",
                  transition:"all 0.2s",
                }}>
                  <Plus size={14} className="bic-add-icon" />
                  Add another row
                  <span style={{ marginLeft:"auto", fontSize:9, opacity:0.5, letterSpacing:"0.08em" }}>↵ ENTER</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer style={{
            padding:"10px 28px",
            borderTop:"1px solid #0D1929",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            background:"#060E1A",
            flexShrink:0,
          }}>
            <div style={{ display:"flex", gap:20, alignItems:"center" }}>
              <KbdHint keys={[["Tab","next field"],["↵","add row"],["Esc","close"]]} />
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:9, color:"#1E3A52", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                <span style={{ color:"#22D3EE" }}>*</span> required fields
              </span>
            </div>
          </footer>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ─── Layout / Style constants ───────────────────────────────── */
const TH_COLS = "40px 1fr 0.6fr 0.7fr 0.7fr 64px 64px 0.6fr 120px 40px";

const TH_STYLE = {
  padding:"9px 10px",
  fontSize:9,
  fontFamily:"DM Mono, monospace",
  fontWeight:500,
  letterSpacing:"0.1em",
  textTransform:"uppercase",
  color:"#1E3A52",
  textAlign:"left",
  whiteSpace:"nowrap",
  userSelect:"none",
};
const TH_NUM_STYLE = { ...TH_STYLE, textAlign:"center", paddingLeft:8 };
const TH_REQ = { color:"#22D3EE", marginLeft:2 };

const TD_STYLE = {
  padding:"2px 4px",
  verticalAlign:"middle",
};