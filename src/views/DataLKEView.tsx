import React, { useState, useRef, useMemo } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Printer,
  Search,
  CheckCircle2,
  FileText,
  HelpCircle,
  BookOpen,
  Layers,
  ChevronRight,
  Filter,
  Download,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  LKEEvaluationComponent,
  LKECriteriaItem,
  LKETab,
  User,
} from '../types/sakip';
import { StorageService, CustomUploadedSheet } from '../services/storage';

interface DataLKEViewProps {
  activeSubTab: LKETab;
  setActiveSubTab: (tab: LKETab) => void;
  components: LKEEvaluationComponent[];
  onSaveComponents?: (components: LKEEvaluationComponent[]) => void;
  criteria: LKECriteriaItem[];
  onSaveCriteria: (criteria: LKECriteriaItem[]) => void;
  currentUser: User;
  onOpenPrintModal: () => void;
  globalSearchQuery: string;
}

export const DataLKEView: React.FC<DataLKEViewProps> = ({
  activeSubTab,
  setActiveSubTab,
  components,
  onSaveComponents,
  criteria,
  onSaveCriteria,
  currentUser,
  onOpenPrintModal,
  globalSearchQuery,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom uploaded Excel sheets state
  const [customSheets, setCustomSheets] = useState<CustomUploadedSheet[]>(() =>
    StorageService.getCustomSheets()
  );
  const [activeCustomSheetIndex, setActiveCustomSheetIndex] = useState<number>(0);
  const [activeSheetName, setActiveSheetName] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Filter for Data LKE criteria table
  const [selectedKomponenFilter, setSelectedKomponenFilter] = useState('Semua');

  // Edit / Add Criteria Modal State
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<LKECriteriaItem | null>(null);
  const [criteriaFormData, setCriteriaFormData] = useState<Partial<LKECriteriaItem>>({
    kode: '',
    komponen: '1. PERENCANAAN KINERJA',
    subKomponenKode: '1.a',
    subKomponenNama: 'Dokumen Perencanaan kinerja telah tersedia',
    kriteria: '',
    bobot: 1.0,
    jawaban: 'Ya',
    nilai: 0.8,
    persen: 100,
    catatan: '',
    linkEvidence: '',
  });

  // Edit Rekap Component Modal State
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<LKEEvaluationComponent | null>(null);
  const [compFormData, setCompFormData] = useState({
    nama: '',
    bobot: 30,
    nilai: 24.9,
    capaianPersen: 83.0,
    deskripsi: '',
  });

  // Handle XLSX file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const parsed = await StorageService.parseExcelFile(file);
      const newSheet: CustomUploadedSheet = {
        id: 'sheet-' + Date.now(),
        fileName: file.name,
        sheetNames: parsed.sheetNames,
        activeSheet: parsed.sheetNames[0] || 'Sheet1',
        data: parsed.data,
        uploadedAt: new Date().toLocaleDateString('id-ID'),
      };

      const updatedList = [newSheet, ...customSheets];
      setCustomSheets(updatedList);
      StorageService.saveCustomSheets(updatedList);
      setActiveCustomSheetIndex(0);
      setActiveSheetName(parsed.sheetNames[0] || '');
      setActiveSubTab('uploaded-sheet');
      setUploadSuccess(`File "${file.name}" berhasil diunggah (${parsed.sheetNames.length} sheet terbaca)!`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      alert('Gagal memproses file Excel: ' + (err?.message || 'Format tidak didukung'));
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalNilaiRekap = components.reduce((acc, c) => acc + c.nilai, 0);

  const filteredCriteria = useMemo(() => {
    return criteria.filter((c) => {
      const matchKomponen =
        selectedKomponenFilter === 'Semua' || c.komponen.includes(selectedKomponenFilter);
      const q = globalSearchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.kode.toLowerCase().includes(q) ||
        c.kriteria.toLowerCase().includes(q) ||
        c.catatan.toLowerCase().includes(q) ||
        c.linkEvidence.toLowerCase().includes(q) ||
        c.jawaban.toLowerCase().includes(q);
      return matchKomponen && matchQuery;
    });
  }, [criteria, selectedKomponenFilter, globalSearchQuery]);

  // Open Add Criteria
  const handleOpenAddCriteria = () => {
    setEditingCriteria(null);
    setCriteriaFormData({
      noUrut: criteria.length + 1,
      kode: `1.a.${criteria.length + 1}`,
      komponen: '1. PERENCANAAN KINERJA',
      subKomponenKode: '1.a',
      subKomponenNama: 'Dokumen Perencanaan kinerja telah tersedia',
      kriteria: '',
      bobot: 1.0,
      jawaban: 'Ya',
      nilai: 0.8,
      persen: 100,
      catatan: '',
      linkEvidence: '',
    });
    setIsCriteriaModalOpen(true);
  };

  // Open Edit Criteria
  const handleOpenEditCriteria = (item: LKECriteriaItem) => {
    setEditingCriteria(item);
    setCriteriaFormData({ ...item });
    setIsCriteriaModalOpen(true);
  };

  // Save Criteria Form
  const handleSaveCriteriaForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteriaFormData.kriteria) return;

    if (editingCriteria) {
      const updated = criteria.map((c) =>
        c.id === editingCriteria.id
          ? ({
              ...c,
              ...criteriaFormData,
              bobot: Number(criteriaFormData.bobot) || 0,
              nilai: Number(criteriaFormData.nilai) || 0,
              persen: Number(criteriaFormData.persen) || 100,
            } as LKECriteriaItem)
          : c
      );
      onSaveCriteria(updated);
    } else {
      const newItem: LKECriteriaItem = {
        id: 'lke-' + Date.now(),
        noUrut: criteria.length + 1,
        kode: criteriaFormData.kode || `LKE-${criteria.length + 1}`,
        komponen: criteriaFormData.komponen || '1. PERENCANAAN KINERJA',
        subKomponenKode: criteriaFormData.subKomponenKode || '1.a',
        subKomponenNama: criteriaFormData.subKomponenNama || 'Dokumen Perencanaan kinerja telah tersedia',
        kriteria: criteriaFormData.kriteria || '',
        bobot: Number(criteriaFormData.bobot) || 1.0,
        jawaban: criteriaFormData.jawaban || 'Ya',
        nilai: Number(criteriaFormData.nilai) || 0,
        persen: Number(criteriaFormData.persen) || 100,
        catatan: criteriaFormData.catatan || '',
        linkEvidence: criteriaFormData.linkEvidence || '',
      };
      onSaveCriteria([...criteria, newItem]);
    }
    setIsCriteriaModalOpen(false);
  };

  // Delete Criteria
  const handleDeleteCriteria = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kriteria evaluasi ini?')) {
      onSaveCriteria(criteria.filter((c) => c.id !== id));
    }
  };

  // Open Edit Component (Rekap LKE)
  const handleOpenEditComponent = (comp: LKEEvaluationComponent) => {
    setEditingComponent(comp);
    setCompFormData({
      nama: comp.nama,
      bobot: comp.bobot,
      nilai: comp.nilai,
      capaianPersen: comp.capaianPersen,
      deskripsi: comp.deskripsi,
    });
    setIsComponentModalOpen(true);
  };

  // Save Component (Rekap LKE)
  const handleSaveComponentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComponent || !onSaveComponents) return;

    const updated = components.map((c) =>
      c.id === editingComponent.id
        ? {
            ...c,
            nama: compFormData.nama,
            bobot: Number(compFormData.bobot),
            nilai: Number(compFormData.nilai),
            capaianPersen: Number(compFormData.capaianPersen),
            deskripsi: compFormData.deskripsi,
          }
        : c
    );
    onSaveComponents(updated);
    StorageService.saveLKEComponents(updated);
    setIsComponentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for Excel upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header and Horizontal Sub-Menu Tabs (Matching user screenshot) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                Evaluasi Kinerja Instansi
              </span>
              <span className="text-xs text-slate-400">• SAKIP Pemkab Luwu Utara</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Lembar Kerja Evaluasi (LKE) & Kertas Kerja SAKIP
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              title="Unggah file spreadsheet *.xlsx untuk menampilkan data setiap sheet"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadLoading ? 'Membaca XLSX...' : 'Unggah File XLSX'}</span>
            </button>

            <button
              onClick={() => StorageService.exportLKEToExcel(components, criteria)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Unduh seluruh instrumen LKE ke file Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export LKE</span>
            </button>

            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Horizontal Navigation Pills (Exact match to user screenshot) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-thin scrollbar-thumb-slate-300">
          {[
            { id: 'penjelasan' as LKETab, label: 'Penjelasan Penilaian' },
            { id: 'rekap' as LKETab, label: 'Rekap LKE' },
            { id: 'data-lke' as LKETab, label: 'Data LKE' },
            { id: 'kke-pd' as LKETab, label: 'KKE PD' },
            { id: 'kke-juknis' as LKETab, label: 'KKE PD Juknis' },
            { id: 'kke-penjelasan' as LKETab, label: 'KKE PD Penjelasan' },
            { id: 'kke-1b4' as LKETab, label: 'KKE 1.b.4' },
            { id: 'kke-1b5' as LKETab, label: 'KKE 1.b.5' },
            { id: 'kke-2b1' as LKETab, label: 'KKE 2.b.1 Kues' },
            { id: 'kke-2c1' as LKETab, label: 'KKE 2.c.1 Kues' },
            ...(customSheets.length > 0
              ? [{ id: 'uploaded-sheet' as LKETab, label: `Excel Sheet (${customSheets[0].fileName})` }]
              : []),
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PENJELASAN PENILAIAN */}
      {activeSubTab === 'penjelasan' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-8 text-xs text-slate-800">
          {/* Section A: Dasar Hukum dan Kerangka Evaluasi */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                A
              </span>
              <span>Dasar Hukum dan Kerangka Evaluasi</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Evaluasi Akuntabilitas Kinerja Instansi Pemerintah pada Dinas Transmigrasi dan Tenaga Kerja
              Kabupaten Luwu Utara dilaksanakan berpedoman pada:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700 leading-relaxed">
              <li>
                <strong>Peraturan Pemerintah No. 8 Tahun 2006</strong> tentang Pelaporan Keuangan dan
                Kinerja Instansi Pemerintah.
              </li>
              <li>
                <strong>Peraturan Presiden No. 29 Tahun 2014</strong> tentang Sistem Akuntabilitas Kinerja
                Instansi Pemerintah (SAKIP).
              </li>
              <li>
                <strong>Peraturan Menteri PAN-RB No. 88 Tahun 2021</strong> tentang Evaluasi Akuntabilitas
                Kinerja Instansi Pemerintah.
              </li>
              <li>
                <strong>Peraturan Menteri PAN-RB No. 89 Tahun 2021</strong> tentang Penjenjangan Kinerja
                (Cascading).
              </li>
              <li>
                <strong>Peraturan Bupati Luwu Utara</strong> tentang Petunjuk Pelaksanaan Evaluasi SAKIP
                Perangkat Daerah di Lingkungan Pemerintah Kabupaten Luwu Utara.
              </li>
            </ul>
          </div>

          {/* Section B: 5 Komponen Utama Penilaian SAKIP */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                B
              </span>
              <span>5 Komponen Utama Penilaian SAKIP</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-900">1. Perencanaan Kinerja</h4>
                  <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                    Bobot 30%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menilai kualitas Renstra, keselarasan sasaran dengan RPJMD, penetapan IKU, dan
                  Perjanjian Kinerja (PK) berjenjang.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-900">2. Pengukuran Kinerja</h4>
                  <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                    Bobot 30%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menilai keandalan data capaian berkala, manual indikator kerja, dan pemanfaatan data
                  kinerja dalam pengambilan kebijakan.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-900">3. Pelaporan Kinerja</h4>
                  <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                    Bobot 15%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menilai kualitas LKjIP, kelengkapan analisis efisiensi penggunaan anggaran, serta ketepatan
                  waktu penyampaian.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-900">4. Evaluasi Internal</h4>
                  <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                    Bobot 10%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menilai pelaksanaan monev berkala oleh pimpinan unit kerja serta tingkat tindak lanjut
                  rekomendasi hasil evaluasi.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 md:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-900">5. Capaian Kinerja</h4>
                  <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                    Bobot 15%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menilai capaian target IKU ketenagakerjaan dan ketransmigrasian serta inovasi pelayanan
                  publik dinas.
                </p>
              </div>
            </div>
          </div>

          {/* Section C: Kategori Predikat dan Nilai Akuntabilitas */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                C
              </span>
              <span>Kategori Predikat dan Nilai Akuntabilitas</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-4 w-36">Nilai Angka</th>
                    <th className="py-2.5 px-4 w-52">Predikat</th>
                    <th className="py-2.5 px-4">Interpretasi Akuntabilitas Kinerja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-4 font-mono font-semibold">&gt; 90 - 100</td>
                    <td className="py-2 px-4 font-bold text-emerald-600">AA</td>
                    <td className="py-2 px-4 text-slate-700">
                      Sangat Memuaskan / Leading (Manajemen kinerja prima berkelanjutan)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono font-semibold">&gt; 80 - 90</td>
                    <td className="py-2 px-4 font-bold text-blue-600">A</td>
                    <td className="py-2 px-4 text-slate-700">
                      Memuaskan (Sistem akuntabilitas handal dan berkinerja tinggi)
                    </td>
                  </tr>
                  <tr className="bg-blue-50/70 font-semibold">
                    <td className="py-2 px-4 font-mono font-bold text-blue-900">&gt; 70 - 80</td>
                    <td className="py-2 px-4 font-extrabold text-blue-800">
                      BB <span className="text-[11px] font-normal text-blue-600">(Posisi Transnaker)</span>
                    </td>
                    <td className="py-2 px-4 text-blue-950 font-medium">
                      Sangat Baik (Akuntabilitas kinerja sudah baik, memiliki sistem yang dapat diandalkan)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono font-semibold">&gt; 60 - 70</td>
                    <td className="py-2 px-4 font-bold text-amber-600">B</td>
                    <td className="py-2 px-4 text-slate-700">
                      Baik (Akuntabilitas kinerja sudah cukup baik namun perlu perbaikan)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono font-semibold">&gt; 50 - 60</td>
                    <td className="py-2 px-4 font-bold text-orange-600">CC</td>
                    <td className="py-2 px-4 text-slate-700">
                      Cukup (Perlu perbaikan mendasar pada perumusan sasaran dan pengukuran)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REKAP LKE */}
      {activeSubTab === 'rekap' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Rekapitulasi Lembar Kerja Evaluasi Gabungan Dinas Transnaker
              </h3>
              <p className="text-xs text-slate-500">
                Berdasarkan data dokumen evaluasi resmi Dinas Transmigrasi dan Tenaga Kerja Kabupaten Luwu Utara
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Skor Akuntabilitas</span>
              <span className="text-3xl font-black text-blue-900 font-mono">
                {totalNilaiRekap.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-indigo-700 ml-2 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Predikat B / BB
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[240px]">Komponen / Sub Komponen Penilaian</th>
                  <th className="py-3 px-3 text-center w-24">Bobot (%)</th>
                  <th className="py-3 px-3 text-center w-28">Nilai Capaian</th>
                  <th className="py-3 px-3 text-center w-28">Capaian (%)</th>
                  <th className="py-3 px-4 min-w-[260px]">Deskripsi Evaluasi</th>
                  <th className="py-3 px-3 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {components.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{c.nama}</td>
                    <td className="py-3 px-3 text-center font-mono font-semibold">{c.bobot}%</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">
                      {c.nilai.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-mono font-semibold bg-emerald-100 text-emerald-800 text-[11px]">
                        {c.capaianPersen}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                      {c.deskripsi}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleOpenEditComponent(c)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit data komponen rekap"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                    Nilai Akuntabilitas Kinerja:
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold">100%</td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-blue-900 text-base">
                    {totalNilaiRekap.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                    {(totalNilaiRekap).toFixed(1)}%
                  </td>
                  <td colSpan={2} className="py-3 px-4 text-xs font-semibold text-blue-800">
                    Predikat Akuntabilitas Kinerja: Sangat Baik (BB / B)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DATA LKE (Detailed criteria table with exact uploaded data and editable Link Evidence) */}
      {activeSubTab === 'data-lke' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tabel Rincian Data LKE & Link Evidence (Sesuai File XLSX)
              </h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan bukti dukung dan penilaian parameter evaluasi akuntabilitas kinerja instansi
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedKomponenFilter}
                onChange={(e) => setSelectedKomponenFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
              >
                <option value="Semua">Semua Komponen</option>
                <option value="1. PERENCANAAN">1. Perencanaan Kinerja</option>
                <option value="2. PENGUKURAN">2. Pengukuran Kinerja</option>
                <option value="3. PELAPORAN">3. Pelaporan Kinerja</option>
                <option value="4. EVALUASI">4. Evaluasi Internal</option>
              </select>

              <button
                onClick={handleOpenAddCriteria}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris LKE</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-20">Kode</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Komponen / Kriteria Penilaian</th>
                  <th className="py-2.5 px-2 w-16 text-center">Bobot</th>
                  <th className="py-2.5 px-2 w-20 text-center">Jawaban</th>
                  <th className="py-2.5 px-2 w-16 text-center">Nilai</th>
                  <th className="py-2.5 px-4 min-w-[220px]">Catatan / Hasil Evaluasi</th>
                  <th className="py-2.5 px-4 min-w-[190px]">Link Evidence</th>
                  <th className="py-2.5 px-2 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredCriteria.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada data kriteria LKE yang cocok dengan pencarian atau filter.
                    </td>
                  </tr>
                ) : (
                  filteredCriteria.map((cr, idx) => {
                    const isUrl = Boolean(
                      cr.linkEvidence &&
                      (cr.linkEvidence.startsWith('http://') ||
                        cr.linkEvidence.startsWith('https://') ||
                        cr.linkEvidence.includes('drive.google.com') ||
                        cr.linkEvidence.includes('peraturan.bpk.go.id'))
                    );

                    return (
                      <tr key={cr.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                          {cr.noUrut || idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{cr.kode}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900 leading-snug">{cr.kriteria}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{cr.subKomponenNama}</p>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium">{cr.bobot ?? '-'}</td>
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              cr.jawaban === 'Ya' || cr.jawaban === 'Ada dan Berkualitas'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cr.jawaban === 'Tdk' || cr.jawaban === 'Tidak'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {cr.jawaban}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-950">
                          {cr.nilai}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 text-[11px] leading-relaxed">
                          {cr.catatan || '-'}
                        </td>
                        <td className="py-2.5 px-4">
                          {isUrl ? (
                            <a
                              href={cr.linkEvidence}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 text-[11px] transition-colors"
                              title={cr.linkEvidence}
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span className="truncate max-w-[140px]">Buka Link Evidence</span>
                            </a>
                          ) : cr.linkEvidence ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 max-w-[160px] truncate" title={cr.linkEvidence}>
                              <FileText className="w-3 h-3 text-slate-500 flex-shrink-0" />
                              <span className="truncate">{cr.linkEvidence}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum ada link</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditCriteria(cr)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit kriteria & Link Evidence"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteCriteria(cr.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Hapus baris kriteria"
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

      {/* TAB 4: KKE PD */}
      {activeSubTab === 'kke-pd' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kertas Kerja Evaluasi Perangkat Daerah (KKE PD)
              </h3>
              <p className="text-xs text-slate-500">
                Format Lembar Kerja Evaluasi Mandiri SAKIP Dinas Transmigrasi dan Tenaga Kerja Luwu Utara
              </p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded">
              Instrumen Resmi Inspektorat
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-[11px] uppercase">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">Sub-Komponen</th>
                  <th className="py-2.5 px-4">Pertanyaan Evaluasi / Kriteria Pemenuhan</th>
                  <th className="py-2.5 px-3 w-24 text-center">Jawaban</th>
                  <th className="py-2.5 px-4 w-60">Link Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {[
                  {
                    sub: '1.a Dokumen',
                    q: 'Terdapat Peraturan Daerah Nomor 03 Tahun 2014 Tentang Sistem Perencanaan Pembangunan Daerah',
                    ans: 'Ya',
                    link: 'https://drive.google.com/file/d/1DkAlyAqjLPI4fNEHUjMi2hrrQ6xBSPZ6/view?usp=sharing',
                  },
                  {
                    sub: '1.a Dokumen',
                    q: 'Terdapat Renstra Distransnaker 2021-2026',
                    ans: 'Ya',
                    link: 'https://drive.google.com/file/d/1cKgiu3pPi5FMdL7RiIhxumZPWLrJ_4Uq/view?usp=sharing',
                  },
                  {
                    sub: '1.a Dokumen',
                    q: 'Terdapat Renja Distransnaker 2024 / 2026',
                    ans: 'Ya',
                    link: 'https://drive.google.com/file/d/1EF8AkJp6qWwDbRS2lg-IBP1b80ul8n71/view?usp=sharing',
                  },
                  {
                    sub: '1.b Cascading',
                    q: 'Sebagian dokumen 1a telah diformalkan, IKU telah diformalkan dan PK telah ditandatangani',
                    ans: 'Ya',
                    link: 'https://drive.google.com/file/d/1oMDZwCCK0leuDmOlIx0XDtIaZcS56vIs/view?usp=sharing',
                  },
                  {
                    sub: '2.a Manual IKU',
                    q: 'Formulasi pengukuran indikator sesuai Permendagri No. 18 Tahun 2020',
                    ans: 'Ya',
                    link: 'https://peraturan.bpk.go.id/Details/138501/permendagri-no-18-tahun-2020',
                  },
                  {
                    sub: '2.a SOP',
                    q: 'SOP pengumpulan dan pengukuran kinerja',
                    ans: 'Ya',
                    link: 'https://drive.google.com/file/d/1xFEe2WdG_7p_sg3TW_XBsS7aVqhcTIOF/view?usp=sharing',
                  },
                  {
                    sub: '3.a LAKIP',
                    q: 'Dokumen LAKIP telah disusun dan dipublikasikan tepat waktu',
                    ans: 'Ya',
                    link: 'https://drive.google.com/file/d/1AfWnUvMLMY9Y9cEnI06fn-H3s3oS-Jim/view?usp=sharing',
                  },
                  {
                    sub: '4.c Tindak Lanjut',
                    q: 'Tindak Lanjut rekomendasi LHE SAKIP Inspektorat',
                    ans: 'Ya',
                    link: 'https://drive.google.com/file/d/1xj2m2FYE9-Aw5VWDK2SJ10usr2BiLi5B/view?usp=sharing',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{row.sub}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">{row.q}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{row.ans}</td>
                    <td className="py-2.5 px-4">
                      <a
                        href={row.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold bg-blue-50 px-2.5 py-1 rounded border border-blue-200 text-[11px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Buka Link Evidence</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: KKE PD JUKNIS */}
      {activeSubTab === 'kke-juknis' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2">
            Petunjuk Teknis (Juknis) Pengisian Kertas Kerja Evaluasi Perangkat Daerah
          </h3>
          <div className="space-y-4 text-slate-700 leading-relaxed">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">Tujuan Petunjuk Teknis:</h4>
              <p>
                Memberikan panduan operasional bagi tim SAKIP dan operator di masing-masing bidang pada
                Dinas Transmigrasi dan Tenaga Kerja dalam mempersiapkan, memverifikasi, dan mengunggah Link Evidence evaluasi akuntabilitas kinerja instansi.
              </p>
            </div>

            <ol className="list-decimal pl-5 space-y-2 text-slate-800">
              <li>
                <strong>Verifikasi Ketersediaan Dokumen:</strong> Pastikan seluruh dokumen perencanaan
                (Renstra, IKU, RKT, PK) telah ditandatangani secara sah dan memiliki nomor surat resmi.
              </li>
              <li>
                <strong>Kesesuaian Data Triwulanan:</strong> Angka realisasi pada tabel capaian kinerja harus
                bersumber dari dokumen primer seperti DPA, laporan RFK bidang, atau publikasi resmi BPS / BPJS.
              </li>
              <li>
                <strong>Penyediaan Link Evidence:</strong> Setiap indikator wajib dilengkapi Link Evidence
                aktif berupa link Google Drive atau publikasi resmi peraturan.
              </li>
              <li>
                <strong>Pemberian Skor:</strong> Skor pemenuhan mengacu pada pedoman PermenPAN-RB No. 88
                Tahun 2021 dengan rentang penilaian 0% s/d 100%.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 6: KKE PD PENJELASAN */}
      {activeSubTab === 'kke-penjelasan' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2">
            Penjelasan Instrumen & Indikator KKE Perangkat Daerah
          </h3>
          <div className="space-y-3 text-slate-700">
            <p>
              Penjelasan kriteria penilaian dimaksudkan untuk memastikan kesamaan persepsi antara evaluator
              (Inspektorat Kabupaten Luwu Utara) dan tim penyusun SAKIP Dinas Transnaker.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <p className="font-bold text-blue-900 mb-1">Kualitas Renstra & IKU</p>
                <p className="text-[11px] leading-relaxed">
                  IKU harus berorientasi pada hasil (outcome) bukan sekadar output kegiatan. Sebagai contoh,
                  persentase penyerapan tenaga kerja formal dan rasio kemandirian transmigran.
                </p>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <p className="font-bold text-blue-900 mb-1">Cascading Kinerja Berjenjang</p>
                <p className="text-[11px] leading-relaxed">
                  Pohon kinerja harus menggambarkan hubungan sebab-akibat (cause and effect) yang logis dari
                  sasaran strategis kepala dinas hingga indikator kinerja individu pelaksana.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: KKE 1.b.4 (Cascading Pohon Kinerja - Dari Data Resmi PDF/XLSX) */}
      {activeSubTab === 'kke-1b4' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                KKE 1.b.4 - Keterkaitan Tujuan, Sasaran dan Program (Cascading)
              </h3>
              <p className="text-xs text-slate-500">
                Sesuai Lampiran Data Workbook SAKIP Dinas Transmigrasi dan Tenaga Kerja Luwu Utara
              </p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
              Pohon Kinerja Resmi
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="border border-slate-300 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-100/80 text-amber-950 font-bold border-b border-amber-300 text-[11px]">
                    <th className="py-2.5 px-3 border-r border-amber-200">Tujuan (Renstra, Renja, Pohon Kinerja)</th>
                    <th className="py-2.5 px-3 border-r border-amber-200">Indikator Tujuan</th>
                    <th className="py-2.5 px-3 border-r border-amber-200">Sasaran Strategis</th>
                    <th className="py-2.5 px-3">Program & Indikator Program</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 border-r border-slate-200 font-medium">
                      <strong>T1 : Meningkatkan Kualitas Pembangunan Manusia</strong>
                      <p className="text-[10px] text-slate-500 mt-1">Selaras Renstra, Renja, Pohon Kinerja & Cascading</p>
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200 font-semibold text-blue-900">
                      Indeks Pembangunan Manusia (IPM)
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200">
                      <strong>Meningkatnya pemerataan pembangunan sektor ekonomi dan Penanggulangan Kemiskinan</strong>
                      <p className="text-[10px] text-slate-500 mt-1">Indikator: Pertumbuhan Ekonomi & TPT</p>
                    </td>
                    <td className="py-3 px-3 space-y-2">
                      <div className="p-2 bg-blue-50/60 rounded border border-blue-100">
                        <strong className="text-blue-900">p1: Program Pelatihan Kerja & Produktivitas</strong>
                        <p className="text-[10px] text-slate-600 mt-0.5">• Tingkat Produktivitas Tenaga Kerja</p>
                        <p className="text-[10px] text-slate-600">• Persentase Tenaga Kerja Bersertifikat Kompetensi</p>
                      </div>
                      <div className="p-2 bg-emerald-50/60 rounded border border-emerald-100">
                        <strong className="text-emerald-900">p2: Program Penempatan Tenaga Kerja</strong>
                        <p className="text-[10px] text-slate-600 mt-0.5">• Persentase Tenaga Kerja yang Ditempatkan di Dalam & Luar Negeri</p>
                      </div>
                      <div className="p-2 bg-purple-50/60 rounded border border-purple-100">
                        <strong className="text-purple-900">p3: Program Hubungan Industrial</strong>
                        <p className="text-[10px] text-slate-600 mt-0.5">• Persentase Perusahaan Menerapkan Tata Kelola Layak (PP/PKB, BPJS)</p>
                      </div>
                      <div className="p-2 bg-amber-50/60 rounded border border-amber-100">
                        <strong className="text-amber-900">Program Perencanaan & Pengembangan Kawasan Transmigrasi</strong>
                        <p className="text-[10px] text-slate-600 mt-0.5">• Persentase jumlah kawasan transmigrasi difasilitasi penetapannya</p>
                        <p className="text-[10px] text-slate-600">• Persentase Pengembangan Kawasan Transmigrasi</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: KKE 1.b.5 (Matriks Penyelarasan) */}
      {activeSubTab === 'kke-1b5' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                KKE 1.b.5 - Matriks Penyelarasan Sasaran, Indikator, dan Anggaran
              </h3>
              <p className="text-xs text-slate-500">
                Keselarasan antara Renstra, Renja, DPA, dan Perjanjian Kinerja
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-[11px]">
                  <th className="py-2.5 px-3">Sasaran Strategis</th>
                  <th className="py-2.5 px-3">Indikator Kinerja Utama</th>
                  <th className="py-2.5 px-3 text-right">Target</th>
                  <th className="py-2.5 px-3">Program / Kegiatan Terkait</th>
                  <th className="py-2.5 px-3">Unit Pelaksana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Meningkatnya Kesiapan Tenaga Kerja</td>
                  <td className="py-2.5 px-3">Persentase naker terlatih bersertifikasi</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">59.06%</td>
                  <td className="py-2.5 px-3">Program Pelatihan Kerja & Produktivitas</td>
                  <td className="py-2.5 px-3">UPTD BLK</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Perlindungan Pekerja Rentan</td>
                  <td className="py-2.5 px-3">Persentase pekerja bukan penerima upah terproteksi</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">40.00%</td>
                  <td className="py-2.5 px-3">Program Hubungan Industrial</td>
                  <td className="py-2.5 px-3">Bidang Hubungan Industrial</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Kemandirian Warga Transmigrasi</td>
                  <td className="py-2.5 px-3">Persentase transmigran dibina dan diberdayakan</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">11.49%</td>
                  <td className="py-2.5 px-3">Program Pengembangan Kawasan Transmigrasi</td>
                  <td className="py-2.5 px-3">Bidang Pengembangan Kawasan Tranmigrasi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: KKE 2.b.1 KUES */}
      {activeSubTab === 'kke-2b1' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                KKE 2.b.1 Kues - Kuesioner Pengukuran Kinerja Berkala
              </h3>
              <p className="text-xs text-slate-500">
                Instrumen Evaluasi Ketersediaan dan Mekanisme Pengukuran Data Triwulan
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
              Skor: 92% Terpenuhi
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                q: 'Apakah dinas menyusun jadwal berkala pengumpulan data capaian kinerja dari setiap bidang?',
                status: 'Ya, setiap akhir triwulan melalui aplikasi LAPAK KINERJA',
                skor: 'A (Sangat Baik)',
              },
              {
                q: 'Apakah data realisasi capaian diverifikasi dengan bukti dukung yang valid sebelum dilaporkan?',
                status: 'Ya, diverifikasi oleh Kasubag Perencanaan dan disetujui Kepala Dinas',
                skor: 'A (Sangat Baik)',
              },
              {
                q: 'Apakah terdapat manual indikator kinerja yang menjelaskan definisi dan tata cara perhitungan?',
                status: 'Tersedia lengkap pada lampiran Keputusan Kadis tentang IKU',
                skor: 'A (Sangat Baik)',
              },
            ].map((kues, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <p className="font-semibold text-slate-900">
                  {idx + 1}. {kues.q}
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-600">Catatan: {kues.status}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {kues.skor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: KKE 2.c.1 KUES */}
      {activeSubTab === 'kke-2c1' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                KKE 2.c.1 Kues - Kuesioner Pemanfaatan Data Kinerja
              </h3>
              <p className="text-xs text-slate-500">
                Pemanfaatan Capaian Kinerja dalam Pengambilan Kebijakan dan Evaluasi Program
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
              Skor: 88% Terpenuhi
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                q: 'Apakah hasil capaian kinerja digunakan sebagai bahan penyusunan dokumen perencanaan tahun berikutnya?',
                status: 'Ya, menjadi baseline perumusan target Renja 2027',
              },
              {
                q: 'Apakah pimpinan unit kerja memberikan arahan perbaikan terhadap indikator yang belum mencapai target?',
                status: 'Ya, tertuang dalam notulen rapat monev pimpinan triwulan 2 dan 3',
              },
              {
                q: 'Apakah data kinerja dipublikasikan kepada masyarakat untuk akuntabilitas publik?',
                status: 'Ya, melalui website resmi www.luwuutarakab.go.id dan papan pengumuman kantor',
              },
            ].map((kues, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <p className="font-semibold text-slate-900">
                  {idx + 1}. {kues.q}
                </p>
                <p className="text-[11px] text-slate-600">Tindak Lanjut: {kues.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: UPLOADED EXCEL SHEET VIEWER */}
      {activeSubTab === 'uploaded-sheet' && customSheets.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          {(() => {
            const currentSheetFile = customSheets[activeCustomSheetIndex] || customSheets[0];
            const currentSheetData =
              currentSheetFile.data[activeSheetName || currentSheetFile.activeSheet] || [];

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {currentSheetFile.fileName}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Diunggah: {currentSheetFile.uploadedAt} • Total Sheet:{' '}
                      {currentSheetFile.sheetNames.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                    >
                      Unggah File Lain
                    </button>
                  </div>
                </div>

                {/* Sheet Tabs within the uploaded file */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200">
                  <span className="font-bold text-slate-500 text-[11px] mr-1">Sheets:</span>
                  {currentSheetFile.sheetNames.map((name) => {
                    const isSheetActive = (activeSheetName || currentSheetFile.activeSheet) === name;
                    return (
                      <button
                        key={name}
                        onClick={() => setActiveSheetName(name)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          isSheetActive
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>

                {/* Sheet Data Grid */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[500px]">
                  {currentSheetData.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Sheet ini kosong atau tidak memiliki baris data.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                          {currentSheetData[0]?.map((col, cIdx) => (
                            <th key={cIdx} className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                              {col !== undefined && col !== null ? String(col) : `Kolom ${cIdx + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {currentSheetData.slice(1).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="py-2 px-3 border-r border-slate-200/60 whitespace-nowrap text-slate-800"
                              >
                                {cell !== undefined && cell !== null ? String(cell) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* MODAL: EDIT / ADD CRITERIA ITEM FOR DATA LKE */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingCriteria ? 'Edit Baris Data LKE & Link Evidence' : 'Tambah Baris Kriteria LKE'}
                </h3>
                <p className="text-xs text-slate-500">
                  Dinas Transmigrasi dan Tenaga Kerja Kabupaten Luwu Utara
                </p>
              </div>
              <button
                onClick={() => setIsCriteriaModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCriteriaForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode Kriteria <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={criteriaFormData.kode || ''}
                    onChange={(e) => setCriteriaFormData({ ...criteriaFormData, kode: e.target.value })}
                    placeholder="Contoh: 1.a.1 / 2.b.3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Komponen Penilaian <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={criteriaFormData.komponen || '1. PERENCANAAN KINERJA'}
                    onChange={(e) => setCriteriaFormData({ ...criteriaFormData, komponen: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="1. PERENCANAAN KINERJA">1. PERENCANAAN KINERJA</option>
                    <option value="2. PENGUKURAN KINERJA">2. PENGUKURAN KINERJA</option>
                    <option value="3. PELAPORAN KINERJA">3. PELAPORAN KINERJA</option>
                    <option value="4. EVALUASI AKUNTABILITAS KINERJA INTERNAL">
                      4. EVALUASI INTERNAL
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sub-Komponen
                  </label>
                  <input
                    type="text"
                    value={criteriaFormData.subKomponenNama || ''}
                    onChange={(e) => setCriteriaFormData({ ...criteriaFormData, subKomponenNama: e.target.value })}
                    placeholder="Contoh: Dokumen Perencanaan kinerja telah tersedia"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kriteria / Parameter Evaluasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={criteriaFormData.kriteria || ''}
                  onChange={(e) => setCriteriaFormData({ ...criteriaFormData, kriteria: e.target.value })}
                  placeholder="Deskripsi kriteria evaluasi akuntabilitas kinerja..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bobot Nilai</label>
                  <input
                    type="number"
                    step="any"
                    value={criteriaFormData.bobot ?? ''}
                    onChange={(e) => setCriteriaFormData({ ...criteriaFormData, bobot: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jawaban / Status</label>
                  <select
                    value={criteriaFormData.jawaban || 'Ya'}
                    onChange={(e) => setCriteriaFormData({ ...criteriaFormData, jawaban: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Ya">Ya</option>
                    <option value="Tdk">Tdk (Tidak)</option>
                    <option value="Ada dan Berkualitas">Ada dan Berkualitas</option>
                    <option value="Ada/Tidak">Ada/Tidak</option>
                    <option value="A">A</option>
                    <option value="BB">BB</option>
                    <option value="B">B</option>
                    <option value="CC">CC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nilai Capaian</label>
                  <input
                    type="number"
                    step="any"
                    value={criteriaFormData.nilai ?? ''}
                    onChange={(e) => setCriteriaFormData({ ...criteriaFormData, nilai: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan / Hasil Evaluasi
                </label>
                <textarea
                  value={criteriaFormData.catatan || ''}
                  onChange={(e) => setCriteriaFormData({ ...criteriaFormData, catatan: e.target.value })}
                  placeholder="Catatan analisis, tindak lanjut, atau keterangan pemenuhan..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Link Evidence (URL Google Drive / Web / Berkas)</span>
                  <span className="text-[10px] text-blue-600 font-normal">Mendukung link sharing drive atau peraturan</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={criteriaFormData.linkEvidence || ''}
                    onChange={(e) => setCriteriaFormData({ ...criteriaFormData, linkEvidence: e.target.value })}
                    placeholder="https://drive.google.com/file/d/... atau https://peraturan.bpk.go.id/..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCriteriaModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingCriteria ? 'Simpan Perubahan LKE' : 'Tambahkan Kriteria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT REKAP LKE COMPONENT */}
      {isComponentModalOpen && editingComponent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Edit Nilai Komponen Rekap LKE</h3>
              <button
                onClick={() => setIsComponentModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveComponentForm} className="mt-4 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Komponen</label>
                <input
                  type="text"
                  value={compFormData.nama}
                  onChange={(e) => setCompFormData({ ...compFormData, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bobot (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={compFormData.bobot}
                    onChange={(e) => setCompFormData({ ...compFormData, bobot: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nilai Capaian</label>
                  <input
                    type="number"
                    step="any"
                    value={compFormData.nilai}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const persen = compFormData.bobot > 0 ? (val / compFormData.bobot) * 100 : 0;
                      setCompFormData({ ...compFormData, nilai: val, capaianPersen: parseFloat(persen.toFixed(2)) });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-blue-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capaian (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={compFormData.capaianPersen}
                    onChange={(e) => setCompFormData({ ...compFormData, capaianPersen: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-semibold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Evaluasi</label>
                <textarea
                  value={compFormData.deskripsi}
                  onChange={(e) => setCompFormData({ ...compFormData, deskripsi: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComponentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
