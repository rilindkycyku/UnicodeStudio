import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Trash2,
  Sparkles,
  FileEdit,
  Palette,
  Search,
  Hash,
  X,
  PlusCircle,
  Star,
  History as HistoryIcon,
  SearchCode,
  Layout,
  Clock,
  Command
} from 'lucide-react';
import { toUnicodeStyle, availableStyles } from './utils/textConverter';
import templatesData from './data/templates.json';

// Configuration for Social Limits
const SOCIAL_LIMITS = [
  { name: 'FB Post', limit: 250, color: 'text-emerald-400' },
  { name: 'FB Ad', limit: 125, color: 'text-blue-400' },
  { name: 'Insta', limit: 2200, color: 'text-purple-400' }
];

export default function App() {
  const [inputText, setInputText] = useState("");
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(availableStyles[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Local Storage States
  const [history, setHistory] = useState([]);
  const [myTemplates, setMyTemplates] = useState([]);

  // Initialization
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('studio_history') || '[]');
    const savedTemplates = JSON.parse(localStorage.getItem('studio_custom') || '[]');
    setHistory(savedHistory);
    setMyTemplates(savedTemplates);
  }, []);

  // Persist Changes
  useEffect(() => {
    localStorage.setItem('studio_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('studio_custom', JSON.stringify(myTemplates));
  }, [myTemplates]);

  // Template Logic
  const allTemplates = useMemo(() => templatesData.flatMap(c => c.templates), []);
  const filteredTemplates = useMemo(() => {
    if (!searchTerm) return allTemplates;
    const term = searchTerm.toLowerCase();
    return allTemplates.filter(t =>
      t.title.toLowerCase().includes(term) || t.content.toLowerCase().includes(term)
    );
  }, [allTemplates, searchTerm]);

  const convertedText = useMemo(() => toUnicodeStyle(inputText, selectedStyle), [inputText, selectedStyle]);

  const handleCopy = () => {
    if (!convertedText) return;
    navigator.clipboard.writeText(convertedText);
    setShowToast(true);

    // Save to History
    const entry = {
      id: Date.now(),
      content: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (!history.find(h => h.content === inputText)) {
      setHistory(prev => [entry, ...prev.slice(0, 5)]);
    }

    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSaveTemplate = () => {
    if (!inputText.trim()) return;
    const name = prompt("Template name:", `Template ${myTemplates.length + 1}`);
    if (!name) return;
    const newTpl = { id: Date.now(), title: name, content: inputText };
    setMyTemplates(prev => [newTpl, ...prev]);
  };

  const select = (tpl) => {
    setActiveTemplate(tpl.id);
    setInputText(tpl.content);
  };

  const charCount = inputText.length;

  return (
    <>
      <div className="canvas" />

      <div className="app-container">
        {/* --- NAVIGATION SIDEBAR --- */}
        <aside className="sidebar animate-up">
          <div className="glass-panel" style={{ height: '100%' }}>
            <div className="panel-header" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Command size={18} className="text-emerald-400" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white/90">Unicode Studio</h2>
              </div>
            </div>

            <div className="scroller">
              {/* STYLE HUB */}
              <div className="section">
                <div className="section-header">
                  <h3 className="tag-label">
                    <Palette size={12} /> Style Hub
                  </h3>
                </div>
                <div className="style-grid-xl">
                  {availableStyles.map(s => (
                    <button
                      key={s.id}
                      className={`style-chip ${selectedStyle === s.id ? 'active' : ''}`}
                      onClick={() => setSelectedStyle(s.id)}
                    >
                      <span className="preview">{s.preview}</span>
                      <span className="name">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SAVED GALLERY */}
              <div className="section">
                <div className="section-header">
                  <h3 className="tag-label">
                    <Star size={12} /> My Gallery
                  </h3>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!inputText.trim()}
                    className="btn-icon btn-emerald disabled:opacity-20"
                    title="Save current as template"
                  >
                    <PlusCircle size={16} />
                  </button>
                </div>
                <div className="tpl-stack">
                  {myTemplates.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-white/5 text-center opacity-30 text-xs">
                      Gallery is empty
                    </div>
                  ) : (
                    myTemplates.map(tpl => (
                      <div key={tpl.id} className={`tpl-card ${activeTemplate === tpl.id ? 'active' : ''}`} onClick={() => select(tpl)}>
                        <div className="flex justify-between items-start">
                          <h4>{tpl.title}</h4>
                          <button
                            className="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-red-400 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); setMyTemplates(prev => prev.filter(t => t.id !== tpl.id)) }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p>{tpl.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* BROWSE OFFICIAL */}
              <div className="section">
                <div className="section-header">
                  <h3 className="tag-label">
                    <SearchCode size={12} /> Models
                  </h3>
                  {!searchTerm && (
                    <div className="search-hint">
                      <span>CTRL</span>
                      <span>K</span>
                    </div>
                  )}
                </div>
                <div className="search-field">
                  <Search size={16} className="search-icon-left" />
                  <input
                    placeholder="Find a template..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="tpl-stack mt-4">
                  {filteredTemplates.map(tpl => (
                    <div key={tpl.id} className={`tpl-card ${activeTemplate === tpl.id ? 'active' : ''}`} onClick={() => select(tpl)}>
                      <h4>{tpl.title}</h4>
                      <p>{tpl.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT ACTIONS */}
              <div className="section">
                <div className="section-header">
                  <h3 className="tag-label">
                    <Clock size={12} /> History
                  </h3>
                  {history.length > 0 && (
                    <button className="text-[10px] font-black text-red-400/50 hover:text-red-400 uppercase tracking-tighter" onClick={() => setHistory([])}>
                      Clear
                    </button>
                  )}
                </div>
                <div className="tpl-stack">
                  {history.map(h => (
                    <div key={h.id} className="tpl-card" onClick={() => setInputText(h.content)}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-white/20 uppercase">{h.time}</span>
                        <HistoryIcon size={12} className="text-white/10" />
                      </div>
                      <p>{h.content}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* --- MAIN WORKSPACE --- */}
        <main className="main-workspace animate-up" style={{ animationDelay: '0.1s' }}>

          <div className="editor-grid">
            {/* DRAFTING POD */}
            <div className="glass-panel editor-pod">
              <div className="panel-header">
                <div className="flex items-center gap-3">
                  <FileEdit size={16} className="text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">Draft Station</span>
                </div>
                <button
                  className="btn-icon btn-red"
                  onClick={() => { setInputText(""); setActiveTemplate(null); }}
                  title="Clear editor"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                className="main-input"
                placeholder="Start writing your masterpiece..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
              <div className="panel-footer">
                <div className="char-badge">
                  <Hash size={12} />
                  <span><span className="count">{charCount}</span> Characters</span>
                </div>
                <div className="flex gap-2">
                  {SOCIAL_LIMITS.map(s => (
                    <div key={s.name} className={`limit-pill ${charCount > s.limit ? 'exceeded' : ''}`}>
                      <span className={s.color}>{s.name}</span>
                      <span className="opacity-30">{s.limit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PREVIEW POD */}
            <div className="glass-panel preview-pod">
              <div className="panel-header">
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">Live Rendition</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <Layout size={12} className="text-white/30" />
                  <span className="text-[10px] font-black uppercase text-white/40">
                    {availableStyles.find(s => s.id === selectedStyle)?.name}
                  </span>
                </div>
              </div>

              <div className="output-area">
                <AnimatePresence mode="wait">
                  {convertedText ? (
                    <motion.div
                      key={convertedText}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      {convertedText}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4">
                      <Sparkles size={48} />
                      <p className="font-light italic text-xl">Generator ready for input</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="panel-footer">
                <div className="char-badge">
                  <Sparkles size={12} className={convertedText ? "text-emerald-400" : "opacity-20"} />
                  <span>Rendition {convertedText ? "Active" : "Ready"}</span>
                </div>
                <button
                  className={`btn-copy-pill ${showToast ? 'success' : ''} !py-2 px-6`}
                  onClick={handleCopy}
                  disabled={!convertedText}
                >
                  {showToast ? <Check size={14} /> : <Copy size={14} />}
                  {showToast ? 'Copied' : 'Copy Result'}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showToast && (
              <motion.div
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-full bg-white text-black font-black uppercase flex items-center gap-3 shadow-[0_20px_60px_rgba(255,255,255,0.3)]"
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, scale: 0.5, x: '-50%' }}
              >
                <Check size={20} /> Professional copy complete
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
