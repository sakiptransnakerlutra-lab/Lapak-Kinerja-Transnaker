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
} from 'lucide-react';
import { DokumenSAKIPItem, User } from '../types/sakip';
import { StorageService } from '../services/storage';

interface DokumenSAKIPViewProps {
  documents: DokumenSAKIPItem[];
  onSaveDocuments: (docs: DokumenSAKIPItem[]) => void;
  currentUser: User;
  onOpenPrintModal: () => void;
  globalSearchQuery: string;
}

export const DokumenSAKIPView: React.FC<DokumenSAKIPViewProps> = ({
  documents,
  onSaveDocuments,
  currentUser,
  onOpenPrintModal,
  globalSearchQuery,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [selectedTipe, setSelectedTipe] = useState<string>('Semua');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DokumenSAKIPItem | null>(null);

  // Upload Form State
  const [formData, setFormData] = useState({
    judul: '',
    nomorSurat: '',
    kategori: 'Bukti Dukung' as DokumenSAKIPItem['kategori'],
    tahun: 2026,
    tipeFile: 'pdf' as 'xlsx' | 'pdf' | 'docx',
    triwulan: 'Triwulan 3',
    deskripsi: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    const q = globalSearchQuery.toLowerCase().trim();
    return documents.filter((doc) => {
      const matchKategori =
        selectedKategori === 'Semua' || doc.kategori === selectedKategori;
      const matchTipe = selectedTipe === 'Semua' || doc.tipeFile === selectedTipe;
      const matchQuery =
        !q ||
        doc.judul.toLowerCase().includes(q) ||
        (doc.nomorSurat && doc.nomorSurat.toLowerCase().includes(q)) ||
        (doc.deskripsi && doc.deskripsi.toLowerCase().includes(q)) ||
        doc.uploadedBy.toLowerCase().includes(q);

      return matchKategori && matchTipe && matchQuery;
    });
  }, [documents, selectedKategori, selectedTipe, globalSearchQuery]);

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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul) return;

    let fileDataUrl: string | undefined = undefined;
    let ukuran = '1.2 MB';

    if (selectedFile) {
      ukuran = (selectedFile.size / 1024 > 1024)
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(selectedFile.size / 1024)} KB`;

      // Read as data URL if small enough
      if (selectedFile.size < 5 * 1024 * 1024) {
        fileDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (re) => resolve(re.target?.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }
    }

    const newDoc: DokumenSAKIPItem = {
      id: 'dok-' + Date.now(),
      judul: formData.judul,
      nomorSurat: formData.nomorSurat || undefined,
      kategori: formData.kategori,
      tahun: Number(formData.tahun) || 2026,
      tipeFile: formData.tipeFile,
      ukuranFile: ukuran,
      url: '#',
      fileDataUrl,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toLocaleDateString('id-ID'),
      deskripsi: formData.deskripsi || undefined,
      triwulan: formData.triwulan,
      downloadsCount: 0,
    };

    onSaveDocuments([newDoc, ...documents]);
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus arsip dokumen ini?')) {
      onSaveDocuments(documents.filter((d) => d.id !== id));
    }
  };

  const handleDownload = (doc: DokumenSAKIPItem) => {
    // If it has a real uploaded data URL
    if (doc.fileDataUrl) {
      const a = document.createElement('a');
      a.href = doc.fileDataUrl;
      a.download = `${doc.judul}.${doc.tipeFile}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a downloadable document summary file
      const content = `DOKUMEN SAKIP DINAS TRANSMIGRASI DAN TENAGA KERJA KABUPATEN LUWU UTARA\n\n` +
        `Judul: ${doc.judul}\n` +
        `Nomor Surat: ${doc.nomorSurat || '-'}\n` +
        `Kategori: ${doc.kategori}\n` +
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

    // Increment download counter
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
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase">
                Arsip Digital SAKIP
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Penyimpanan & Bukti Dukung Resmi (*.xlsx, *.pdf)
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Dokumen Sistem Akuntabilitas Kinerja Instansi Pemerintah
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Akses cepat pengunduhan dan pencetakan dokumen Renstra, IKU, Perjanjian Kinerja, LKjIP, LHE, dan Eviden.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Dokumen Baru</span>
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dokumen berhasil diunggah dan disimpan ke repositori SAKIP!</span>
          </div>
        )}

        {/* Filter Badges */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Kategori:
            </span>
            {[
              'Semua',
              'Renstra',
              'IKU',
              'RKT / PK',
              'LKjIP',
              'LHE AKIP',
              'KKE / LKE',
              'Bukti Dukung',
            ].map((kat) => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedKategori === kat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Format:</span>
            <select
              value={selectedTipe}
              onChange={(e) => setSelectedTipe(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="Semua">Semua Format</option>
              <option value="pdf">PDF Document</option>
              <option value="xlsx">Excel Spreadsheet (*.xlsx)</option>
              <option value="docx">Word (*.docx)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            Tidak ada dokumen yang sesuai dengan filter atau kata kunci pencarian.
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isXlsx = doc.tipeFile === 'xlsx';
            const isPdf = doc.tipeFile === 'pdf';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {doc.kategori}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase ml-1.5">
                          {doc.tipeFile} • {doc.ukuranFile || '1 MB'}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Hapus Dokumen (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-2.5 line-clamp-2 leading-snug">
                    {doc.judul}
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
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2.5">
                    <span>Oleh: {doc.uploadedBy.split(',')[0]}</span>
                    <span>{doc.uploadedAt}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium transition-colors"
                      title="Lihat Rincian Dokumen"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-700 font-medium transition-colors"
                      title="Unduh file dokumen"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>

                    <button
                      onClick={() => handlePrintDoc(doc)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium transition-colors"
                      title="Cetak lembar bukti dukung"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Unggah Dokumen SAKIP Baru</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Berkas (*.xlsx, *.pdf, *.docx) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .pdf, .docx, .doc"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-lg p-1.5"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Dokumen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Contoh: Laporan Monev Capaian Triwulan 3 Dinas Transnaker"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Surat / SK</label>
                  <input
                    type="text"
                    value={formData.nomorSurat}
                    onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                    placeholder="Contoh: 060/123/DTN-LU/2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Dokumen</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({ ...formData, kategori: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={2}
                  placeholder="Ringkasan isi dokumen atau peruntukan eviden..."
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Unggah Dokumen
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
                <h3 className="text-sm font-bold text-slate-900">Rincian Dokumen SAKIP</h3>
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

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 border rounded bg-white">
                  <span className="text-slate-400 block">Kategori:</span>
                  <span className="font-semibold text-slate-800">{previewDoc.kategori}</span>
                </div>
                <div className="p-2 border rounded bg-white">
                  <span className="text-slate-400 block">Format & Ukuran:</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {previewDoc.tipeFile} ({previewDoc.ukuranFile || '1 MB'})
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
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-slate-700 leading-relaxed">
                  <span className="font-bold text-blue-900 block mb-0.5">Deskripsi:</span>
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
                  handleDownload(previewDoc);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </button>
              <button
                onClick={() => {
                  handlePrintDoc(previewDoc);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
