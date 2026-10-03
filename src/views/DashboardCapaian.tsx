import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Printer,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  TrendingUp,
  Building2,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import { CapaianKinerjaItem, User } from '../types/sakip';
import { StorageService } from '../services/storage';

interface DashboardCapaianProps {
  items: CapaianKinerjaItem[];
  onSaveItems: (items: CapaianKinerjaItem[]) => void;
  currentUser: User;
  onOpenPrintModal: () => void;
  globalSearchQuery: string;
}

export const DashboardCapaian: React.FC<DashboardCapaianProps> = ({
  items,
  onSaveItems,
  currentUser,
  onOpenPrintModal,
  globalSearchQuery,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Filters
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [selectedBidang, setSelectedBidang] = useState<string>('Semua');
  const [localSearch, setLocalSearch] = useState<string>('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CapaianKinerjaItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<CapaianKinerjaItem | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<CapaianKinerjaItem>>({
    kategoriKinerja: 'Program',
    nomenklaturProgram: 'Program Perencanaan Tenaga Kerja',
    indikatorKinerja: '',
    satuan: 'Persen',
    target: 100,
    realisasiCapaian: 0,
    periode: 'Triwulan 3',
    sumberData: '',
    penanggungJawab: 'Bidang Pemberdayaan Tenaga Kerja',
    buktiDukung: '',
    linkEvidence: '',
    catatan: '',
  });

  const query = (globalSearchQuery || localSearch).toLowerCase().trim();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchKategori =
        selectedKategori === 'Semua' || item.kategoriKinerja === selectedKategori;
      const matchBidang =
        selectedBidang === 'Semua' || item.penanggungJawab === selectedBidang;
      const matchQuery =
        !query ||
        item.indikatorKinerja.toLowerCase().includes(query) ||
        item.nomenklaturProgram.toLowerCase().includes(query) ||
        item.penanggungJawab.toLowerCase().includes(query) ||
        item.buktiDukung.toLowerCase().includes(query) ||
        (item.linkEvidence && item.linkEvidence.toLowerCase().includes(query)) ||
        item.sumberData.toLowerCase().includes(query);

      return matchKategori && matchBidang && matchQuery;
    });
  }, [items, selectedKategori, selectedBidang, query]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = items.length;
    const achieved = items.filter((i) => i.tingkatCapaian >= 100).length;
    const pending = total - achieved;
    const sumCapaian = items.reduce((acc, curr) => acc + curr.tingkatCapaian, 0);
    const avgCapaian = total > 0 ? (sumCapaian / total).toFixed(2) : '0';

    return { total, achieved, pending, avgCapaian };
  }, [items]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      kategoriKinerja: 'Program',
      nomenklaturProgram: 'Program Perencanaan Tenaga Kerja',
      indikatorKinerja: '',
      satuan: 'Persen',
      target: 100,
      realisasiCapaian: 0,
      periode: 'Triwulan 3',
      sumberData: '',
      penanggungJawab: currentUser.unit || 'Bidang Pemberdayaan Tenaga Kerja',
      buktiDukung: '',
      linkEvidence: '',
      catatan: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: CapaianKinerjaItem) => {
    setEditingItem(item);
    setFormData({
      ...item,
      linkEvidence: item.linkEvidence || (item.buktiDukung.startsWith('http') ? item.buktiDukung : ''),
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(formData.target) || 0;
    const realisasi = Number(formData.realisasiCapaian) || 0;
    const tingkat = target > 0 ? Number(((realisasi / target) * 100).toFixed(2)) : 0;

    if (editingItem) {
      // Edit existing
      const updated = items.map((it) =>
        it.id === editingItem.id
          ? ({
              ...it,
              ...formData,
              target,
              realisasiCapaian: realisasi,
              tingkatCapaian: tingkat,
              linkEvidence: formData.linkEvidence || it.linkEvidence,
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser.name,
            } as CapaianKinerjaItem)
          : it
      );
      onSaveItems(updated);
    } else {
      // Add new
      const nextNo = items.length > 0 ? Math.max(...items.map((i) => i.no)) + 1 : 1;
      const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
      const newItem: CapaianKinerjaItem = {
        id: nextId,
        no: nextNo,
        kategoriKinerja: formData.kategoriKinerja as any,
        nomenklaturProgram: formData.nomenklaturProgram || '',
        indikatorKinerja: formData.indikatorKinerja || '',
        satuan: formData.satuan || 'Persen',
        target,
        realisasiCapaian: realisasi,
        tingkatCapaian: tingkat,
        periode: formData.periode || 'Triwulan 3',
        sumberData: formData.sumberData || '',
        penanggungJawab: formData.penanggungJawab || '',
        buktiDukung: formData.buktiDukung || '',
        linkEvidence: formData.linkEvidence || '',
        catatan: formData.catatan || '',
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name,
      };
      onSaveItems([...items, newItem]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteCandidate) return;
    const updated = items
      .filter((i) => i.id !== deleteCandidate.id)
      .map((item, idx) => ({ ...item, no: idx + 1 }));
    onSaveItems(updated);
    setDeleteCandidate(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick KPI Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                SAKIP Transnaker Luwu Utara
              </span>
              <span className="text-xs text-slate-500 font-medium">Periode Triwulan 3 Tahun 2026</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1">
              Rekapitulasi Data Capaian Kinerja Instansi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola dan pantau realisasi target IKK, IKD, SDGs / TPB, dan Program Ketenagakerjaan & Ketransmigrasian.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => StorageService.exportCapaianToExcel(items)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
              title="Unduh format Microsoft Excel (*.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export XLSX</span>
            </button>

            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Kop Dinas</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Indikator</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Indikator</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{stats.total}</span>
              <span className="text-xs text-slate-500 font-medium">IKP Terdaftar</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70">
            <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">Tercapai (≥100%)</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-emerald-700">{stats.achieved}</span>
              <span className="text-xs text-emerald-600 font-medium">
                {((stats.achieved / (stats.total || 1)) * 100).toFixed(0)}% Selesai
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/70">
            <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">Perlu Perhatian</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-amber-700">{stats.pending}</span>
              <span className="text-xs text-amber-600 font-medium">Di bawah 100%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/70">
            <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">Rata-rata Capaian</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-blue-700">{stats.avgCapaian}%</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Kategori:</span>
            </div>
            {['Semua', 'IKK', 'IKD', 'SDGs / TPB', 'Program'].map((kat) => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedKategori === kat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Semua">Semua Penanggung Jawab</option>
              <option value="Bidang Pemberdayaan Tenaga Kerja">Bidang Pemberdayaan Tenaga Kerja</option>
              <option value="Bidang Hubungan Industrial">Bidang Hubungan Industrial</option>
              <option value="Bidang Pengembangan Kawasan Tranmigrasi">Bidang Kawasan Transmigrasi</option>
              <option value="Bidang Penyiapan Kawasan dan Pengembangan Permukiman Transmigrasi">
                Bidang Penyiapan & Permukiman Transmigrasi
              </option>
              <option value="UPTD BLK">UPTD BLK</option>
            </select>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-slate-800">{filteredItems.length}</span> dari{' '}
              {items.length}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 w-24">Kategori</th>
                <th className="py-3 px-4 min-w-[200px]">Program & Indikator Kinerja</th>
                <th className="py-3 px-3 w-20 text-center">Satuan</th>
                <th className="py-3 px-3 w-20 text-right">Target</th>
                <th className="py-3 px-3 w-24 text-right">Realisasi</th>
                <th className="py-3 px-3 w-28 text-center">Capaian (%)</th>
                <th className="py-3 px-3 min-w-[160px]">Penanggung Jawab</th>
                <th className="py-3 px-3 min-w-[170px]">Link Evidence</th>
                <th className="py-3 px-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Tidak ada data indikator kinerja yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isAchieved = item.tingkatCapaian >= 100;
                  const isLow = item.tingkatCapaian < 50;
                  const hasLink = Boolean(
                    item.linkEvidence ||
                    (item.buktiDukung && (item.buktiDukung.startsWith('http') || item.buktiDukung.includes('drive.google.com')))
                  );
                  const targetUrl = item.linkEvidence || (item.buktiDukung.startsWith('http') ? item.buktiDukung : '');

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      <td className="py-3 px-3 text-center font-medium text-slate-500">
                        {item.no}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.kategoriKinerja === 'IKK'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : item.kategoriKinerja === 'IKD'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : item.kategoriKinerja === 'SDGs / TPB'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.kategoriKinerja}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 leading-snug">
                          {item.indikatorKinerja}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400 inline" />
                          {item.nomenklaturProgram}
                        </p>
                        {item.catatan && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            * {item.catatan}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-medium text-slate-600">
                        {item.satuan}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                        {item.target}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        {item.realisasiCapaian}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              isAchieved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isLow
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isAchieved ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {item.tingkatCapaian}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800">{item.penanggungJawab}</p>
                        <p className="text-[10px] text-slate-400">Sumber: {item.sumberData}</p>
                      </td>

                      <td className="py-3 px-3">
                        {hasLink ? (
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 text-[11px] transition-colors"
                            title="Buka Link Evidence"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span className="truncate max-w-[130px]">
                              {item.buktiDukung || 'Buka Evidence'}
                            </span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-200 text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate max-w-[130px]" title={item.buktiDukung}>
                              {item.buktiDukung || '-'}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit seluruh data indikator & Link Evidence"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => setDeleteCandidate(item)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Hapus indikator (Hanya Admin)"
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

        {/* Table footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Sumber: DPA 2026, Sakernas BPS, BPJS Ketenagakerjaan, Laporan RFK Bidang Transnaker Luwu Utara.
          </p>
          <p className="font-semibold text-slate-700">
            Berdasarkan format baku evaluasi SAKIP Pemkab Luwu Utara
          </p>
        </div>
      </div>

      {/* Modal Add / Edit Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Data Capaian Kinerja' : 'Tambah Indikator Capaian Kinerja'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dinas Transmigrasi dan Tenaga Kerja Kabupaten Luwu Utara
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Kinerja <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kategoriKinerja}
                    onChange={(e) =>
                      setFormData({ ...formData, kategoriKinerja: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    <option value="IKK">IKK (Indikator Kinerja Kunci)</option>
                    <option value="IKD">IKD (Indikator Kinerja Daerah)</option>
                    <option value="SDGs / TPB">SDGs / TPB</option>
                    <option value="Program">Program Prioritas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Periode Pelaporan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.periode}
                    onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    required
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomenklatur Program <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nomenklaturProgram}
                  onChange={(e) => setFormData({ ...formData, nomenklaturProgram: e.target.value })}
                  placeholder="Contoh: Program Perencanaan Tenaga Kerja"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Indikator Kinerja <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.indikatorKinerja}
                  onChange={(e) => setFormData({ ...formData, indikatorKinerja: e.target.value })}
                  placeholder="Tuliskan rumusan indikator kinerja secara lengkap dan terukur..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    placeholder="Persen / Orang / Dokumen"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.target ?? ''}
                    onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Realisasi Capaian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.realisasiCapaian ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, realisasiCapaian: parseFloat(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Penanggung Jawab (Bidang/UPTD) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.penanggungJawab}
                    onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    <option value="Bidang Pemberdayaan Tenaga Kerja">Bidang Pemberdayaan Tenaga Kerja</option>
                    <option value="Bidang Hubungan Industrial">Bidang Hubungan Industrial</option>
                    <option value="Bidang Pengembangan Kawasan Tranmigrasi">Bidang Pengembangan Kawasan Tranmigrasi</option>
                    <option value="Bidang Penyiapan Kawasan dan Pengembangan Permukiman Transmigrasi">
                      Bidang Penyiapan Kawasan dan Pengembangan Permukiman Transmigrasi
                    </option>
                    <option value="UPTD BLK">UPTD BLK</option>
                    <option value="Sekretariat">Sekretariat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sumber Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sumberData}
                    onChange={(e) => setFormData({ ...formData, sumberData: e.target.value })}
                    placeholder="Contoh: DPA 2026 / BPS LUWU UTARA / BPJS"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama / Label Bukti Dukung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.buktiDukung}
                  onChange={(e) => setFormData({ ...formData, buktiDukung: e.target.value })}
                  placeholder="Contoh: Laporan Bidang PTK / Daftar Pekerja / Laporan RFK"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Link Evidence (URL Google Drive / Web / Berkas)
                </label>
                <input
                  type="url"
                  value={formData.linkEvidence || ''}
                  onChange={(e) => setFormData({ ...formData, linkEvidence: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Analisis / Penjelasan
                </label>
                <input
                  type="text"
                  value={formData.catatan || ''}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Keterangan pendukung capaian atau kendala yang dihadapi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan Indikator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Admin only) */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Indikator</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus indikator{' '}
              <strong className="text-slate-900 font-semibold">"{deleteCandidate.indikatorKinerja}"</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
