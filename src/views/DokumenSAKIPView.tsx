import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Upload,
  Download,
  Printer,
  Search,
  Filter,
  Trash2,
  Eye,
  Plus,
  Calendar,
  CheckCircle2,
  FileCode,
  Tag,
  Building,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Link2,
  LayoutGrid,
  Table as TableIcon,
  Share2,
} from 'lucide-react';
import { DokumenSAKIPItem, User } from '../types/sakip';

interface DokumenSAKIPViewProps {
  documents: DokumenSAKIPItem[];
  onSaveDocuments: (docs: DokumenSAKIPItem[]) => void;
  currentUser: User;
  onOpenPrintModal: () => void;
  globalSearchQuery: string;
  selectedKategori?: string;
  onSelectKategori?: (kategori: string) => void;
}

export const DokumenSAKIPView: React.FC<DokumenSAKIPViewProps> = ({
  documents,
  onSaveDocuments,
  currentUser,
  onOpenPrintModal,
  globalSearchQuery,
  selectedKategori: externalSelectedKategori,
  onSelectKategori: externalOnSelectKategori,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Internal category state or synced with external
  const [internalKategori, setInternalKategori] = useState<string>('Semua');
  const selectedKategori = externalSelectedKategori || internalKategori;
  const setSelectedKategori = (kat: string) => {
    setInternalKategori(kat);
    if (externalOnSelectKategori) {
      externalOnSelectKategori(kat);
    }
  };

  const [selectedTipe, setSelectedTipe] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DokumenSAKIPItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DokumenSAKIPItem | null>(null);

  // Toast copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    judul: '',
    nomorSurat: '',
    kategori: 'Bukti Dukung' as DokumenSAKIPItem['kategori'],
    url: '',
    tahun: 2026,
    tipeFile: 'pdf' as 'xlsx' | 'pdf' | 'docx' | 'link',
    triwulan: 'Triwulan 3',
    deskripsi: '',
    ukuranFile: '1.5 MB',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const allCategories = [
    'Semua',
    'Renstra',
    'IKU',
    'RKT / PK',
    'LKjIP',
    'LHE AKIP',
    'KKE / LKE',
    'SOP & Kebijakan',
    'Bukti Dukung',
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: documents.length };
    allCategories.forEach((kat) => {
      if (kat !== 'Semua') {
        counts[kat] = documents.filter((d) => d.kategori === kat).length;
      }
    });
    return counts;
  }, [documents]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    const q = globalSearchQuery.toLowerCase().trim();
    return documents.filter((doc) => {
      const matchKategori =
        selectedKategori === 'Semua' || doc.kategori === selectedKategori;
      const matchTipe =
        selectedTipe === 'Semua' ||
        doc.tipeFile === selectedTipe ||
        (selectedTipe === 'link' && doc.url && doc.url !== '#');
      const matchQuery =
        !q ||
        doc.judul.toLowerCase().includes(q) ||
        (doc.nomorSurat && doc.nomorSurat.toLowerCase().includes(q)) ||
        (doc.deskripsi && doc.deskripsi.toLowerCase().includes(q)) ||
        doc.uploadedBy.toLowerCase().includes(q) ||
        doc.kategori.toLowerCase().includes(q);

      return matchKategori && matchTipe && matchQuery;
    });
  }, [documents, selectedKategori, selectedTipe, globalSearchQuery]);

  const handleCopyLink = (url: string, id: string) => {
    if (!url || url === '#') {
      showToast('Tautan dokumen belum tersedia.');
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(id);
    showToast('Tautan Link Google Drive berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenAddModal = () => {
    setEditingDoc(null);
    setFormData({
      judul: '',
      nomorSurat: '',
      kategori: selectedKategori === 'Semua' ? 'Bukti Dukung' : (selectedKategori as any),
      url: 'https://drive.google.com/file/d/',
      tahun: 2026,
      tipeFile: 'pdf',
      triwulan: 'Triwulan 3',
      deskripsi: '',
      ukuranFile: '1.5 MB',
    });
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleOpenEditModal = (doc: DokumenSAKIPItem) => {
    setEditingDoc(doc);
    setFormData({
      judul: doc.judul,
      nomorSurat: doc.nomorSurat || '',
      kategori: doc.kategori,
      url: doc.url || '',
      tahun: doc.tahun,
      tipeFile: doc.tipeFile,
      triwulan: doc.triwulan || 'Triwulan 3',
      deskripsi: doc.deskripsi || '',
      ukuranFile: doc.ukuranFile || '1.5 MB',
    });
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        setFormData((prev) => ({ ...prev, tipeFile: 'xlsx' }));
      } else if (ext === 'pdf') {
        setFormData((prev) => ({ ...prev, tipeFile: 'pdf' }));
      } else if (ext === 'docx' || ext === 'doc') {
        setFormData((prev) => ({ ...prev, tipeFile: 'docx' }));
      }
      if (!formData.judul) {
        setFormData((prev) => ({ ...prev, judul: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul) return;

    let fileDataUrl: string | undefined = editingDoc?.fileDataUrl;
    let ukuran = formData.ukuranFile || '1.5 MB';

    if (selectedFile) {
      ukuran =
        selectedFile.size / 1024 > 1024
          ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(selectedFile.size / 1024)} KB`;

      if (selectedFile.size < 5 * 1024 * 1024) {
        fileDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (re) => resolve(re.target?.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }
    }

    const finalUrl = formData.url.trim() || 'https://drive.google.com/file/d/view?usp=sharing';

    if (editingDoc) {
      const updated = documents.map((d) =>
        d.id === editingDoc.id
          ? {
              ...d,
              judul: formData.judul,
              nomorSurat: formData.nomorSurat || undefined,
              kategori: formData.kategori,
              url: finalUrl,
              tahun: Number(formData.tahun) || 2026,
              tipeFile: formData.tipeFile,
              ukuranFile: ukuran,
              fileDataUrl,
              deskripsi: formData.deskripsi || undefined,
              triwulan: formData.triwulan,
            }
          : d
      );
      onSaveDocuments(updated);
      showToast('Tautan dokumen berhasil diperbarui!');
    } else {
      const newDoc: DokumenSAKIPItem = {
        id: 'dok-' + Date.now(),
        judul: formData.judul,
        nomorSurat: formData.nomorSurat || undefined,
        kategori: formData.kategori,
        tahun: Number(formData.tahun) || 2026,
        tipeFile: formData.tipeFile,
        ukuranFile: ukuran,
        url: finalUrl,
        fileDataUrl,
        uploadedBy: currentUser.name,
        uploadedAt: new Date().toLocaleDateString('id-ID'),
        deskripsi: formData.deskripsi || undefined,
        triwulan: formData.triwulan,
        downloadsCount: 0,
      };

      onSaveDocuments([newDoc, ...documents]);
      showToast('Tautan dokumen baru berhasil ditambahkan!');
    }

    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tautan arsip dokumen ini?')) {
      onSaveDocuments(documents.filter((d) => d.id !== id));
      showToast('Dokumen berhasil dihapus.');
    }
  };

  const handleDownload = (doc: DokumenSAKIPItem) => {
    // If it's a real web / Google Drive link, open it!
    if (doc.url && doc.url !== '#') {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    } else if (doc.fileDataUrl) {
      const a = document.createElement('a');
      a.href = doc.fileDataUrl;
      a.download = `${doc.judul}.${doc.tipeFile}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `DOKUMEN SAKIP DINAS TRANSMIGRASI DAN TENAGA KERJA KABUPATEN LUWU UTARA\n\n` +
        `Judul: ${doc.judul}\n` +
        `Nomor Surat: ${doc.nomorSurat || '-'}\n` +
        `Kategori: ${doc.kategori}\n` +
        `Tautan Drive: ${doc.url}\n` +
        `Tahun: ${doc.tahun}\n` +
        `Periode: ${doc.triwulan || '-'}\n` +
        `Pengunggah: ${doc.uploadedBy}\n` +
        `Tanggal: ${doc.uploadedAt}\n\n` +
        `Deskripsi:\n${doc.deskripsi || '-'}\n\n` +
        `Status: Terverifikasi dalam Sistem LAPAK KINERJA SAKIP Pemkab Luwu Utara.`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.judul.replace(/[^a-z0-9]/gi, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    const updated = documents.map((d) =>
      d.id === doc.id ? { ...d, downloadsCount: d.downloadsCount + 1 } : d
    );
    onSaveDocuments(updated);
  };

  const handlePrintDoc = (doc: DokumenSAKIPItem) => {
    setPreviewDoc(doc);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wide flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                Link Dokumen SAKIP
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Akses Langsung Tautan Google Drive Semua Kategori
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <span>Arsip Tautan & Berkas SAKIP Terpadu</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Seluruh kategori dokumen SAKIP telah terintegrasi sebagai <strong>tautan digital (Google Drive / Cloud URL)</strong> resmi yang dapat langsung dibuka, disalin, maupun diunduh.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Kartu Link"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kartu Link</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Link SAKIP"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel Link</span>
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tautan Dokumen</span>
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tautan dokumen berhasil disimpan dan diperbarui di repositori SAKIP!</span>
          </div>
        )}

        {/* Filter Badges Semua Kategori Dokumen SAKIP */}
        <div className="pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-700 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> Kategori Link:
            </span>
            {allCategories.map((kat) => {
              const isSelected = selectedKategori === kat;
              const count = categoryCounts[kat] || 0;

              return (
                <button
                  key={kat}
                  onClick={() => setSelectedKategori(kat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{kat === 'Semua' ? 'Semua Kategori' : kat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-semibold text-slate-600">Format:</span>
            <select
              value={selectedTipe}
              onChange={(e) => setSelectedTipe(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="Semua">Semua Format</option>
              <option value="link">Tautan Cloud / Drive</option>
              <option value="pdf">PDF Document (*.pdf)</option>
              <option value="xlsx">Excel Spreadsheet (*.xlsx)</option>
              <option value="docx">Word (*.docx)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Mode: Kartu Dokumen Berfokus pada Link */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              <Link2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">
                Tidak ada dokumen pada kategori "{selectedKategori}".
              </p>
              <p className="mt-1 text-slate-400">
                Silakan pilih kategori lain atau klik "Tambah Tautan Dokumen".
              </p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isXlsx = doc.tipeFile === 'xlsx';
              const isPdf = doc.tipeFile === 'pdf';
              const hasLink = doc.url && doc.url !== '#';
              const isCopied = copiedId === doc.id;

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Kartu */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isXlsx
                              ? 'bg-emerald-100 text-emerald-700'
                              : isPdf
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isXlsx ? (
                            <FileSpreadsheet className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200/60">
                            {doc.kategori}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase ml-1.5">
                            {doc.tipeFile} • {doc.ukuranFile || '1.5 MB'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-100 transition-colors"
                          title="Edit Tautan & Data Dokumen"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Hapus Dokumen (Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Judul Dokumen sebagai Link Langsung */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-2.5 line-clamp-2 leading-snug">
                      {hasLink ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline flex items-start gap-1"
                          title="Klik untuk membuka link dokumen langsung di tab baru"
                        >
                          <span>{doc.judul}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        </a>
                      ) : (
                        doc.judul
                      )}
                    </h3>

                    {doc.nomorSurat && (
                      <p className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{doc.nomorSurat}</span>
                      </p>
                    )}

                    {doc.deskripsi && (
                      <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {doc.deskripsi}
                      </p>
                    )}

                    {/* KOTAK TAUTAN LINK DOKUMEN (Highlight Box) */}
                    <div className="mt-3 bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-blue-900 flex items-center gap-1 uppercase tracking-wider">
                          <Link2 className="w-3 h-3 text-blue-600" />
                          Tautan Link Google Drive:
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-semibold text-[9px]">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Terverifikasi
                        </span>
                      </div>

                      <div className="bg-white px-2 py-1.5 rounded-lg border border-blue-200 font-mono text-[11px] text-blue-900 truncate select-all flex items-center justify-between">
                        <span className="truncate">{doc.url}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(doc.url, doc.id)}
                          className="text-slate-400 hover:text-blue-700 ml-1 flex-shrink-0 p-0.5"
                          title="Salin Tautan Link"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Tombol Buka Link Dokumen Utama */}
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs text-xs transition-colors"
                        title="Buka Dokumen di Google Drive (Tab Baru)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Link Dokumen</span>
                      </a>
                    </div>
                  </div>

                  {/* Footer Kartu & Aksi Tambahan */}
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                      <span>Oleh: {doc.uploadedBy.split(',')[0]}</span>
                      <span>
                        {doc.tahun} ({doc.triwulan || 'Tahunan'})
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      <button
                        onClick={() => handleCopyLink(doc.url, doc.id)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium transition-colors"
                        title="Salin tautan dokumen"
                      >
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Salin Link</span>
                      </button>

                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium transition-colors"
                        title="Lihat Rincian Dokumen"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium transition-colors"
                        title="Unduh / Akses Berkas"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                        <span>Akses</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table Mode: Tabel Tautan Lengkap Semua Kategori */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-4 min-w-[260px]">Judul Dokumen & Nomor Surat</th>
                  <th className="py-3 px-3">Tahun / Triwulan</th>
                  <th className="py-3 px-4 min-w-[280px]">Tautan Link Dokumen (Google Drive)</th>
                  <th className="py-3 px-3">Pengunggah</th>
                  <th className="py-3 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Tidak ada dokumen yang sesuai dengan filter kategori.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc, idx) => {
                    const hasLink = doc.url && doc.url !== '#';
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                            {doc.kategori}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-slate-900 hover:text-blue-600 hover:underline flex items-start gap-1"
                          >
                            <span>{doc.judul}</span>
                            <ExternalLink className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                          </a>
                          {doc.nomorSurat && (
                            <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                              {doc.nomorSurat}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                          {doc.tahun} • {doc.triwulan || 'Tahunan'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded border border-blue-200 flex items-center gap-1 text-[11px] transition-colors whitespace-nowrap"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Buka Link Drive</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(doc.url, doc.id)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Salin Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                              {doc.url}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                          {doc.uploadedBy.split(',')[0]}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(doc)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Tautan & Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Hapus Dokumen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload / Edit Link Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingDoc ? 'Edit Tautan Dokumen SAKIP' : 'Tambah Tautan Dokumen SAKIP Baru'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Dokumen disimpan dan dapat diakses langsung melalui tautan cloud / Google Drive.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Kolom Tautan Google Drive (Utama) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tautan / Link Google Drive Dokumen <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Salin tautan Google Drive / Cloud Storage resmi dokumen SAKIP.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Dokumen SAKIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Contoh: Rencana Strategis (Renstra) Dinas Transnaker 2021-2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Dokumen</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({ ...formData, kategori: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="Renstra">Renstra (Rencana Strategis)</option>
                    <option value="IKU">IKU (Indikator Kinerja Utama)</option>
                    <option value="RKT / PK">RKT / Perjanjian Kinerja (PK)</option>
                    <option value="LKjIP">LKjIP (Laporan Kinerja)</option>
                    <option value="LHE AKIP">LHE AKIP Inspektorat</option>
                    <option value="KKE / LKE">Kertas Kerja Evaluasi (KKE)</option>
                    <option value="SOP & Kebijakan">SOP & Kebijakan</option>
                    <option value="Bukti Dukung">Bukti Dukung Kinerja</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Surat / SK</label>
                  <input
                    type="text"
                    value={formData.nomorSurat}
                    onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                    placeholder="Contoh: 050/112/DTN-LU/2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Anggaran</label>
                  <input
                    type="number"
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Periode Triwulan</label>
                  <select
                    value={formData.triwulan}
                    onChange={(e) => setFormData({ ...formData, triwulan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Triwulan 1">Triwulan 1</option>
                    <option value="Triwulan 2">Triwulan 2</option>
                    <option value="Triwulan 3">Triwulan 3</option>
                    <option value="Triwulan 4">Triwulan 4</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format Berkas</label>
                  <select
                    value={formData.tipeFile}
                    onChange={(e) =>
                      setFormData({ ...formData, tipeFile: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="pdf">PDF Document (*.pdf)</option>
                    <option value="xlsx">Excel Spreadsheet (*.xlsx)</option>
                    <option value="docx">Word Document (*.docx)</option>
                    <option value="link">Tautan Cloud / Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unggah Berkas Fisik (Opsional)
                  </label>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .pdf, .docx, .doc"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 border border-slate-300 rounded-lg p-1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={2}
                  placeholder="Ringkasan isi dokumen atau peruntukan eviden SAKIP..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  {editingDoc ? 'Simpan Perubahan Tautan' : 'Simpan Tautan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Rincian Dokumen & Tautan SAKIP</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-900">{previewDoc.judul}</p>
                {previewDoc.nomorSurat && (
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    No: {previewDoc.nomorSurat}
                  </p>
                )}
              </div>

              {/* Tautan Box */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    Tautan Google Drive Resmi:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(previewDoc.url, previewDoc.id)}
                    className="text-blue-600 hover:text-blue-800 text-[10px] font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin Link</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] text-blue-800 bg-white p-2 rounded-lg border border-blue-200 truncate select-all">
                  {previewDoc.url}
                </p>
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Link Dokumen di Tab Baru</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 border rounded bg-white">
                  <span className="text-slate-400 block">Kategori:</span>
                  <span className="font-semibold text-slate-800">{previewDoc.kategori}</span>
                </div>
                <div className="p-2 border rounded bg-white">
                  <span className="text-slate-400 block">Format & Ukuran:</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {previewDoc.tipeFile} ({previewDoc.ukuranFile || '1.5 MB'})
                  </span>
                </div>
                <div className="p-2 border rounded bg-white">
                  <span className="text-slate-400 block">Tahun / Periode:</span>
                  <span className="font-semibold text-slate-800">
                    {previewDoc.tahun} ({previewDoc.triwulan || '-'})
                  </span>
                </div>
                <div className="p-2 border rounded bg-white">
                  <span className="text-slate-400 block">Pengunggah:</span>
                  <span className="font-semibold text-slate-800">{previewDoc.uploadedBy}</span>
                </div>
              </div>

              {previewDoc.deskripsi && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-0.5">Deskripsi:</span>
                  {previewDoc.deskripsi}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handlePrintDoc(previewDoc);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
