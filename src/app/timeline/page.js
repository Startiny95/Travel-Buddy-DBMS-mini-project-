"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function TimelinePage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const fileRef = useRef();

  useEffect(() => { fetchMemories(); }, []);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/memories");
      const data = await res.json();
      setMemories(data.memories || []);
    } catch { setMemories([]); }
    finally { setLoading(false); }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setUploadMsg("Please select a photo."); return; }
    setUploading(true);
    setUploadMsg("");
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("caption", caption);
    fd.append("taken_at", takenAt);
    try {
      const res = await fetch("/api/memories", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setUploadMsg("Memory saved! ✓");
        setFile(null); setPreview(null); setCaption(""); setTakenAt("");
        if (fileRef.current) fileRef.current.value = "";
        fetchMemories();
      } else { setUploadMsg(data.error || "Upload failed."); }
    } catch { setUploadMsg("Network error."); }
    finally { setUploading(false); }
  };

  // Group memories by year and month
  const grouped = memories.reduce((acc, m) => {
    const d = new Date(m.taken_at);
    const year = d.getFullYear();
    const month = d.getMonth();
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(m);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => b - a);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@500;700;800;900&family=Outfit:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b12; font-family: 'Outfit', sans-serif; color: #e2e8f0; }

        .page { min-height: 100vh; background: #080b12; }

        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 40px;
          background: rgba(8,11,18,0.95); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: sticky; top: 0; z-index: 200;
        }
        .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo { width: 34px; height: 34px; background: linear-gradient(135deg,#3b82f6,#10b981); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .nav-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 17px; font-weight: 800; color: #f1f5f9; }
        .back-btn { font-size: 12px; color: rgba(200,210,230,0.4); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 7px 14px; text-decoration: none; transition: all 0.2s; }
        .back-btn:hover { color: #e2e8f0; }

        .main { max-width: 900px; margin: 0 auto; padding: 48px 32px 80px; }

        .page-header { margin-bottom: 40px; animation: fadeUp 0.5s ease both; }
        .page-tag { font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(245,158,11,0.7); margin-bottom: 8px; }
        .page-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: clamp(28px,4vw,42px); font-weight: 900; color: #f1f5f9; line-height: 1.1; letter-spacing: -0.5px; }
        .page-sub { font-size: 14px; color: rgba(200,210,230,0.35); font-weight: 300; margin-top: 8px; }

        /* Upload card */
        .upload-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(245,158,11,0.15);
          border-radius: 18px; padding: 24px; margin-bottom: 48px;
          animation: fadeUp 0.5s ease 0.1s both;
        }
        .upload-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 15px; font-weight: 800; color: #f1f5f9; margin-bottom: 18px; }

        .upload-grid { display: grid; grid-template-columns: 140px 1fr; gap: 18px; align-items: start; }

        .photo-drop {
          width: 140px; height: 140px; border-radius: 12px;
          border: 2px dashed rgba(245,158,11,0.3);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; overflow: hidden; position: relative;
          background: rgba(245,158,11,0.04);
        }
        .photo-drop:hover { border-color: rgba(245,158,11,0.6); background: rgba(245,158,11,0.08); }
        .photo-drop img { width: 100%; height: 100%; object-fit: cover; }
        .drop-label { font-size: 11px; color: rgba(200,210,230,0.3); text-align: center; padding: 10px; }
        .drop-icon { font-size: 26px; margin-bottom: 6px; opacity: 0.4; }

        .upload-fields { display: flex; flex-direction: column; gap: 12px; }
        .field label { display: block; font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(200,210,230,0.3); margin-bottom: 6px; }
        .field input, .field textarea {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 13px; color: #e8e0ff;
          font-family: 'Outfit', sans-serif; font-size: 13px; outline: none;
          transition: border-color 0.2s;
        }
        .field input:focus, .field textarea:focus { border-color: rgba(245,158,11,0.4); }
        .field input::placeholder, .field textarea::placeholder { color: rgba(200,190,230,0.2); }

        .upload-btn {
          padding: 11px 24px; background: linear-gradient(135deg,#f59e0b,#ef4444);
          border: none; border-radius: 10px; color: #fff;
          font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; font-weight: 800;
          cursor: pointer; transition: opacity 0.2s; align-self: flex-end;
        }
        .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .upload-msg { font-size: 12px; color: #6ee7b7; margin-top: 8px; }

        /* Timeline */
        .timeline { animation: fadeUp 0.5s ease 0.2s both; }

        .year-block { margin-bottom: 52px; }
        .year-label {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 42px; font-weight: 900;
          color: rgba(200,210,230,0.06);
          margin-bottom: -16px;
          letter-spacing: -2px;
          user-select: none;
        }

        .month-block { margin-bottom: 32px; }
        .month-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(245,158,11,0.6);
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .month-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.04); }

        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 10px;
        }

        .photo-card {
          border-radius: 12px; overflow: hidden;
          aspect-ratio: 1; cursor: pointer;
          position: relative; background: #12151f;
          transition: all 0.2s;
        }
        .photo-card:hover { transform: scale(1.03); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .photo-card img { width: 100%; height: 100%; object-fit: cover; }
        .photo-caption {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px 10px 10px;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          font-size: 11px; color: rgba(255,255,255,0.8);
          opacity: 0; transition: opacity 0.2s;
        }
        .photo-card:hover .photo-caption { opacity: 1; }

        /* Lightbox */
        .lightbox {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.92); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 32px;
          animation: fadeIn 0.2s ease;
        }
        .lightbox-inner { position: relative; max-width: 80vw; max-height: 80vh; }
        .lightbox-img { max-width: 100%; max-height: 75vh; border-radius: 14px; object-fit: contain; }
        .lightbox-close {
          position: absolute; top: -16px; right: -16px;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.1); border: none;
          color: #fff; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .lightbox-caption { margin-top: 12px; text-align: center; font-size: 14px; color: rgba(255,255,255,0.6); }
        .lightbox-date { text-align: center; font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 4px; }

        .empty { text-align: center; padding: 64px 20px; color: rgba(200,210,230,0.25); }
        .empty-icon { font-size: 48px; opacity: 0.3; margin-bottom: 14px; }
        .empty-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 6px; }
        .empty-sub { font-size: 13px; font-weight: 300; }

        .loading-state { text-align: center; padding: 80px; color: rgba(200,210,230,0.3); font-size: 14px; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 600px) {
          .main { padding: 28px 16px 60px; }
          .navbar { padding: 14px 16px; }
          .upload-grid { grid-template-columns: 1fr; }
          .photo-drop { width: 100%; height: 160px; }
        }
      `}</style>

      <div className="page">
        <nav className="navbar">
          <Link href="/home" className="nav-brand">
            <div className="nav-logo">🧭</div>
            <span className="nav-title">Wandr</span>
          </Link>
          <Link href="/home" className="back-btn">← Dashboard</Link>
        </nav>

        <main className="main">
          <div className="page-header">
            <p className="page-tag">✦ Memories</p>
            <h1 className="page-title">Your Timeline</h1>
            <p className="page-sub">Photos from your journeys, arranged by when they were taken.</p>
          </div>

          {/* Upload */}
          <div className="upload-card">
            <div className="upload-title">📷 Add a Memory</div>
            <form onSubmit={handleUpload}>
              <div className="upload-grid">
                <div className="photo-drop" onClick={() => fileRef.current?.click()}>
                  {preview
                    ? <img src={preview} alt="preview" />
                    : <><span className="drop-icon">📷</span><span className="drop-label">Click to upload photo</span></>
                  }
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                </div>
                <div className="upload-fields">
                  <div className="field">
                    <label>Date & Time Taken</label>
                    <input type="datetime-local" value={takenAt} onChange={e => setTakenAt(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Caption (optional)</label>
                    <input type="text" placeholder="What was happening here?" value={caption} onChange={e => setCaption(e.target.value)} />
                  </div>
                  <button type="submit" className="upload-btn" disabled={uploading}>
                    {uploading ? "Uploading..." : "Save Memory →"}
                  </button>
                  {uploadMsg && <div className="upload-msg">{uploadMsg}</div>}
                </div>
              </div>
            </form>
          </div>

          {/* Timeline */}
          {loading ? (
            <div className="loading-state">Loading your memories...</div>
          ) : memories.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📸</div>
              <div className="empty-title">No memories yet</div>
              <div className="empty-sub">Upload your first photo to start building your timeline.</div>
            </div>
          ) : (
            <div className="timeline">
              {years.map(year => (
                <div key={year} className="year-block">
                  <div className="year-label">{year}</div>
                  {Object.keys(grouped[year]).sort((a, b) => b - a).map(month => (
                    <div key={month} className="month-block">
                      <div className="month-label">{MONTHS[month]} {year}</div>
                      <div className="photos-grid">
                        {grouped[year][month]
                          .sort((a, b) => new Date(b.taken_at) - new Date(a.taken_at))
                          .map((m, i) => (
                            <div key={i} className="photo-card" onClick={() => setSelectedMemory(m)}>
                              <img src={`/uploads/${m.photo_path}`} alt={m.caption || "memory"} />
                              {m.caption && <div className="photo-caption">{m.caption}</div>}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Lightbox */}
      {selectedMemory && (
        <div className="lightbox" onClick={() => setSelectedMemory(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedMemory(null)}>✕</button>
            <img className="lightbox-img" src={`/uploads/${selectedMemory.photo_path}`} alt={selectedMemory.caption} />
            {selectedMemory.caption && <div className="lightbox-caption">{selectedMemory.caption}</div>}
            <div className="lightbox-date">{new Date(selectedMemory.taken_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</div>
          </div>
        </div>
      )}
    </>
  );
}