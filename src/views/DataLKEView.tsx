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
  KKEPDItem,
  KKEJuknisItem,
  KKEJuknisData,
  KKEPenjelasanItem,
  KKEPenjelasanData,
  KKE1b4Item,
  KKE1b5Item,
  KKE2b1Item,
  KKE2c1Item,
} from '../types/sakip';
import { StorageService, CustomUploadedSheet } from '../services/storage';
import {
  INITIAL_KKE_PD,
  INITIAL_KKE_JUKNIS,
  INITIAL_KKE_PENJELASAN,
  INITIAL_KKE_1B4,
  INITIAL_KKE_1B5,
  INITIAL_KKE_2B1,
  INITIAL_KKE_2C1,
} from '../data/initialData';

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

  // ==================== KKE STATES & HANDLERS ====================
  // 1. KKE PD
  const [kkePDList, setKkePDList] = useState<KKEPDItem[]>(() => StorageService.getKKEPD());
  const [isKKEPDModalOpen, setIsKKEPDModalOpen] = useState(false);
  const [editingKKEPD, setEditingKKEPD] = useState<KKEPDItem | null>(null);
  const [kkePDFormData, setKkePDFormData] = useState<Partial<KKEPDItem>>({
    sub: '1.a Dokumen',
    q: '',
    ans: 'Ya',
    link: '',
    catatan: '',
  });

  const handleOpenAddKKEPD = () => {
    setEditingKKEPD(null);
    setKkePDFormData({
      sub: '1.a Dokumen',
      q: '',
      ans: 'Ya',
      link: '',
      catatan: '',
    });
    setIsKKEPDModalOpen(true);
  };

  const handleOpenEditKKEPD = (item: KKEPDItem) => {
    setEditingKKEPD(item);
    setKkePDFormData({ ...item });
    setIsKKEPDModalOpen(true);
  };

  const handleSaveKKEPDForm = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: KKEPDItem[];
    if (editingKKEPD) {
      updated = kkePDList.map((item) =>
        item.id === editingKKEPD.id ? ({ ...item, ...kkePDFormData } as KKEPDItem) : item
      );
    } else {
      const newItem: KKEPDItem = {
        id: 'kke-pd-' + Date.now(),
        sub: kkePDFormData.sub || '1.a Dokumen',
        q: kkePDFormData.q || '',
        ans: kkePDFormData.ans || 'Ya',
        link: kkePDFormData.link || '',
        catatan: kkePDFormData.catatan || '',
      };
      updated = [...kkePDList, newItem];
    }
    setKkePDList(updated);
    StorageService.saveKKEPD(updated);
    setIsKKEPDModalOpen(false);
  };

  const handleDeleteKKEPD = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus butir instrumen KKE PD ini?')) return;
    const updated = kkePDList.filter((item) => item.id !== id);
    setKkePDList(updated);
    StorageService.saveKKEPD(updated);
  };

  const handleResetKKEPD = () => {
    if (!window.confirm('Kembalikan seluruh data KKE PD ke format standar awal?')) return;
    setKkePDList(INITIAL_KKE_PD);
    StorageService.saveKKEPD(INITIAL_KKE_PD);
  };

  // 2. KKE JUKNIS
  const [kkeJuknisData, setKkeJuknisData] = useState(() => StorageService.getKKEJuknis());
  const [isJuknisModalOpen, setIsJuknisModalOpen] = useState(false);
  const [editingJuknisItem, setEditingJuknisItem] = useState<KKEJuknisItem | null>(null);
  const [isEditingJuknisTujuan, setIsEditingJuknisTujuan] = useState(false);
  const [juknisFormData, setJuknisFormData] = useState({
    nomor: 1,
    judul: '',
    uraian: '',
    tujuan: '',
  });

  const handleOpenEditJuknisTujuan = () => {
    setIsEditingJuknisTujuan(true);
    setEditingJuknisItem(null);
    setJuknisFormData({
      nomor: 1,
      judul: '',
      uraian: '',
      tujuan: kkeJuknisData.tujuan,
    });
    setIsJuknisModalOpen(true);
  };

  const handleOpenAddJuknisItem = () => {
    setIsEditingJuknisTujuan(false);
    setEditingJuknisItem(null);
    setJuknisFormData({
      nomor: kkeJuknisData.items.length + 1,
      judul: '',
      uraian: '',
      tujuan: '',
    });
    setIsJuknisModalOpen(true);
  };

  const handleOpenEditJuknisItem = (item: KKEJuknisItem) => {
    setIsEditingJuknisTujuan(false);
    setEditingJuknisItem(item);
    setJuknisFormData({
      nomor: item.nomor,
      judul: item.judul,
      uraian: item.uraian,
      tujuan: '',
    });
    setIsJuknisModalOpen(true);
  };

  const handleSaveJuknisForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingJuknisTujuan) {
      const updated = { ...kkeJuknisData, tujuan: juknisFormData.tujuan };
      setKkeJuknisData(updated);
      StorageService.saveKKEJuknis(updated);
    } else if (editingJuknisItem) {
      const updatedItems = kkeJuknisData.items.map((it) =>
        it.id === editingJuknisItem.id
          ? { ...it, nomor: juknisFormData.nomor, judul: juknisFormData.judul, uraian: juknisFormData.uraian }
          : it
      );
      const updated = { ...kkeJuknisData, items: updatedItems };
      setKkeJuknisData(updated);
      StorageService.saveKKEJuknis(updated);
    } else {
      const newItem: KKEJuknisItem = {
        id: 'juknis-' + Date.now(),
        nomor: juknisFormData.nomor,
        judul: juknisFormData.judul,
        uraian: juknisFormData.uraian,
      };
      const updated = { ...kkeJuknisData, items: [...kkeJuknisData.items, newItem] };
      setKkeJuknisData(updated);
      StorageService.saveKKEJuknis(updated);
    }
    setIsJuknisModalOpen(false);
  };

  const handleDeleteJuknisItem = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus butir petunjuk teknis ini?')) return;
    const updated = {
      ...kkeJuknisData,
      items: kkeJuknisData.items.filter((it) => it.id !== id),
    };
    setKkeJuknisData(updated);
    StorageService.saveKKEJuknis(updated);
  };

  const handleResetJuknis = () => {
    if (!window.confirm('Kembalikan seluruh teks Petunjuk Teknis ke format awal?')) return;
    setKkeJuknisData(INITIAL_KKE_JUKNIS);
    StorageService.saveKKEJuknis(INITIAL_KKE_JUKNIS);
  };

  // 3. KKE PENJELASAN
  const [kkePenjelasanData, setKkePenjelasanData] = useState(() => StorageService.getKKEPenjelasan());
  const [isPenjelasanModalOpen, setIsPenjelasanModalOpen] = useState(false);
  const [editingPenjelasanItem, setEditingPenjelasanItem] = useState<KKEPenjelasanItem | null>(null);
  const [isEditingPengantar, setIsEditingPengantar] = useState(false);
  const [penjelasanFormData, setPenjelasanFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'Perencanaan',
    pengantar: '',
  });

  const handleOpenEditPengantar = () => {
    setIsEditingPengantar(true);
    setEditingPenjelasanItem(null);
    setPenjelasanFormData({
      judul: '',
      deskripsi: '',
      kategori: '',
      pengantar: kkePenjelasanData.pengantar,
    });
    setIsPenjelasanModalOpen(true);
  };

  const handleOpenAddPenjelasanItem = () => {
    setIsEditingPengantar(false);
    setEditingPenjelasanItem(null);
    setPenjelasanFormData({
      judul: '',
      deskripsi: '',
      kategori: 'Perencanaan',
      pengantar: '',
    });
    setIsPenjelasanModalOpen(true);
  };

  const handleOpenEditPenjelasanItem = (item: KKEPenjelasanItem) => {
    setIsEditingPengantar(false);
    setEditingPenjelasanItem(item);
    setPenjelasanFormData({
      judul: item.judul,
      deskripsi: item.deskripsi,
      kategori: item.kategori || 'Umum',
      pengantar: '',
    });
    setIsPenjelasanModalOpen(true);
  };

  const handleSavePenjelasanForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingPengantar) {
      const updated = { ...kkePenjelasanData, pengantar: penjelasanFormData.pengantar };
      setKkePenjelasanData(updated);
      StorageService.saveKKEPenjelasan(updated);
    } else if (editingPenjelasanItem) {
      const updatedItems = kkePenjelasanData.items.map((it) =>
        it.id === editingPenjelasanItem.id
          ? { ...it, judul: penjelasanFormData.judul, deskripsi: penjelasanFormData.deskripsi, kategori: penjelasanFormData.kategori }
          : it
      );
      const updated = { ...kkePenjelasanData, items: updatedItems };
      setKkePenjelasanData(updated);
      StorageService.saveKKEPenjelasan(updated);
    } else {
      const newItem: KKEPenjelasanItem = {
        id: 'penj-' + Date.now(),
        judul: penjelasanFormData.judul,
        deskripsi: penjelasanFormData.deskripsi,
        kategori: penjelasanFormData.kategori || 'Umum',
      };
      const updated = { ...kkePenjelasanData, items: [...kkePenjelasanData.items, newItem] };
      setKkePenjelasanData(updated);
      StorageService.saveKKEPenjelasan(updated);
    }
    setIsPenjelasanModalOpen(false);
  };

  const handleDeletePenjelasanItem = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus kartu penjelasan ini?')) return;
    const updated = {
      ...kkePenjelasanData,
      items: kkePenjelasanData.items.filter((it) => it.id !== id),
    };
    setKkePenjelasanData(updated);
    StorageService.saveKKEPenjelasan(updated);
  };

  const handleResetPenjelasan = () => {
    if (!window.confirm('Kembalikan seluruh teks Penjelasan ke format awal?')) return;
    setKkePenjelasanData(INITIAL_KKE_PENJELASAN);
    StorageService.saveKKEPenjelasan(INITIAL_KKE_PENJELASAN);
  };

  // 4. KKE 1.b.4 (Cascading)
  const [kke1b4List, setKke1b4List] = useState<KKE1b4Item[]>(() => StorageService.getKKE1b4());
  const [is1b4ModalOpen, setIs1b4ModalOpen] = useState(false);
  const [editing1b4, setEditing1b4] = useState<KKE1b4Item | null>(null);
  const [formData1b4, setFormData1b4] = useState({
    tujuanKode: 'T1',
    tujuanNama: '',
    tujuanCatatan: '',
    indikatorTujuan: '',
    sasaranStrategis: '',
    sasaranCatatan: '',
    programRawText: '',
  });

  const handleOpenAdd1b4 = () => {
    setEditing1b4(null);
    setFormData1b4({
      tujuanKode: 'T' + (kke1b4List.length + 1),
      tujuanNama: '',
      tujuanCatatan: 'Selaras Renstra, Renja, Pohon Kinerja & Cascading',
      indikatorTujuan: '',
      sasaranStrategis: '',
      sasaranCatatan: '',
      programRawText: 'p1: Program Pelatihan Kerja | Indikator: Tingkat Produktivitas Tenaga Kerja',
    });
    setIs1b4ModalOpen(true);
  };

  const handleOpenEdit1b4 = (item: KKE1b4Item) => {
    setEditing1b4(item);
    const progText = item.programList
      .map((p) => `${p.kode}: ${p.nama} | Indikator: ${p.indikator}`)
      .join('\n');
    setFormData1b4({
      tujuanKode: item.tujuanKode,
      tujuanNama: item.tujuanNama,
      tujuanCatatan: item.tujuanCatatan,
      indikatorTujuan: item.indikatorTujuan,
      sasaranStrategis: item.sasaranStrategis,
      sasaranCatatan: item.sasaranCatatan,
      programRawText: progText,
    });
    setIs1b4ModalOpen(true);
  };

  const handleSave1b4Form = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrograms = formData1b4.programRawText
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line, idx) => {
        const parts = line.split('|');
        const mainPart = parts[0] || '';
        const indPart = parts[1] || '';
        const colonIdx = mainPart.indexOf(':');
        const kode = colonIdx !== -1 ? mainPart.substring(0, colonIdx).trim() : `p${idx + 1}`;
        const nama = colonIdx !== -1 ? mainPart.substring(colonIdx + 1).trim() : mainPart.trim();
        const indikator = indPart.replace(/^Indikator:\s*/i, '').trim() || 'Indikator program terukur';
        return {
          id: 'prog-' + idx + '-' + Date.now(),
          kode,
          nama,
          indikator,
        };
      });

    let updated: KKE1b4Item[];
    if (editing1b4) {
      updated = kke1b4List.map((item) =>
        item.id === editing1b4.id
          ? {
              ...item,
              tujuanKode: formData1b4.tujuanKode,
              tujuanNama: formData1b4.tujuanNama,
              tujuanCatatan: formData1b4.tujuanCatatan,
              indikatorTujuan: formData1b4.indikatorTujuan,
              sasaranStrategis: formData1b4.sasaranStrategis,
              sasaranCatatan: formData1b4.sasaranCatatan,
              programList: parsedPrograms.length > 0 ? parsedPrograms : item.programList,
            }
          : item
      );
    } else {
      const newItem: KKE1b4Item = {
        id: 'casc-' + Date.now(),
        tujuanKode: formData1b4.tujuanKode,
        tujuanNama: formData1b4.tujuanNama,
        tujuanCatatan: formData1b4.tujuanCatatan,
        indikatorTujuan: formData1b4.indikatorTujuan,
        sasaranStrategis: formData1b4.sasaranStrategis,
        sasaranCatatan: formData1b4.sasaranCatatan,
        programList: parsedPrograms,
      };
      updated = [...kke1b4List, newItem];
    }
    setKke1b4List(updated);
    StorageService.saveKKE1b4(updated);
    setIs1b4ModalOpen(false);
  };

  const handleDelete1b4 = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus baris pohon kinerja cascading ini?')) return;
    const updated = kke1b4List.filter((it) => it.id !== id);
    setKke1b4List(updated);
    StorageService.saveKKE1b4(updated);
  };

  const handleReset1b4 = () => {
    if (!window.confirm('Kembalikan pohon kinerja cascading ke format standar?')) return;
    setKke1b4List(INITIAL_KKE_1B4);
    StorageService.saveKKE1b4(INITIAL_KKE_1B4);
  };

  // 5. KKE 1.b.5 (Matriks Penyelarasan)
  const [kke1b5List, setKke1b5List] = useState<KKE1b5Item[]>(() => StorageService.getKKE1b5());
  const [is1b5ModalOpen, setIs1b5ModalOpen] = useState(false);
  const [editing1b5, setEditing1b5] = useState<KKE1b5Item | null>(null);
  const [formData1b5, setFormData1b5] = useState<Partial<KKE1b5Item>>({
    sasaranStrategis: '',
    indikatorKinerjaUtama: '',
    target: '',
    programKegiatan: '',
    unitPelaksana: '',
  });

  const handleOpenAdd1b5 = () => {
    setEditing1b5(null);
    setFormData1b5({
      sasaranStrategis: '',
      indikatorKinerjaUtama: '',
      target: '50.00%',
      programKegiatan: '',
      unitPelaksana: 'Bidang Pembinaan & Penempatan Tenaga Kerja',
    });
    setIs1b5ModalOpen(true);
  };

  const handleOpenEdit1b5 = (item: KKE1b5Item) => {
    setEditing1b5(item);
    setFormData1b5({ ...item });
    setIs1b5ModalOpen(true);
  };

  const handleSave1b5Form = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: KKE1b5Item[];
    if (editing1b5) {
      updated = kke1b5List.map((item) =>
        item.id === editing1b5.id ? ({ ...item, ...formData1b5 } as KKE1b5Item) : item
      );
    } else {
      const newItem: KKE1b5Item = {
        id: 'mat-' + Date.now(),
        sasaranStrategis: formData1b5.sasaranStrategis || '',
        indikatorKinerjaUtama: formData1b5.indikatorKinerjaUtama || '',
        target: formData1b5.target || '',
        programKegiatan: formData1b5.programKegiatan || '',
        unitPelaksana: formData1b5.unitPelaksana || '',
      };
      updated = [...kke1b5List, newItem];
    }
    setKke1b5List(updated);
    StorageService.saveKKE1b5(updated);
    setIs1b5ModalOpen(false);
  };

  const handleDelete1b5 = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus baris matriks ini?')) return;
    const updated = kke1b5List.filter((it) => it.id !== id);
    setKke1b5List(updated);
    StorageService.saveKKE1b5(updated);
  };

  const handleReset1b5 = () => {
    if (!window.confirm('Kembalikan matriks penyelarasan ke format standar awal?')) return;
    setKke1b5List(INITIAL_KKE_1B5);
    StorageService.saveKKE1b5(INITIAL_KKE_1B5);
  };

  // 6. KKE 2.b.1 (Kuesioner Pengukuran)
  const [kke2b1List, setKke2b1List] = useState<KKE2b1Item[]>(() => StorageService.getKKE2b1());
  const [is2b1ModalOpen, setIs2b1ModalOpen] = useState(false);
  const [editing2b1, setEditing2b1] = useState<KKE2b1Item | null>(null);
  const [formData2b1, setFormData2b1] = useState<Partial<KKE2b1Item>>({
    q: '',
    status: '',
    skor: 'A (Sangat Baik)',
  });

  const handleOpenAdd2b1 = () => {
    setEditing2b1(null);
    setFormData2b1({
      q: '',
      status: 'Ya, terdokumentasi secara tertib',
      skor: 'A (Sangat Baik)',
    });
    setIs2b1ModalOpen(true);
  };

  const handleOpenEdit2b1 = (item: KKE2b1Item) => {
    setEditing2b1(item);
    setFormData2b1({ ...item });
    setIs2b1ModalOpen(true);
  };

  const handleSave2b1Form = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: KKE2b1Item[];
    if (editing2b1) {
      updated = kke2b1List.map((item) =>
        item.id === editing2b1.id ? ({ ...item, ...formData2b1 } as KKE2b1Item) : item
      );
    } else {
      const newItem: KKE2b1Item = {
        id: 'kues-2b1-' + Date.now(),
        q: formData2b1.q || '',
        status: formData2b1.status || '',
        skor: formData2b1.skor || 'A (Sangat Baik)',
      };
      updated = [...kke2b1List, newItem];
    }
    setKke2b1List(updated);
    StorageService.saveKKE2b1(updated);
    setIs2b1ModalOpen(false);
  };

  const handleDelete2b1 = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus butir kuesioner ini?')) return;
    const updated = kke2b1List.filter((it) => it.id !== id);
    setKke2b1List(updated);
    StorageService.saveKKE2b1(updated);
  };

  const handleReset2b1 = () => {
    if (!window.confirm('Kembalikan kuesioner pengukuran ke format standar?')) return;
    setKke2b1List(INITIAL_KKE_2B1);
    StorageService.saveKKE2b1(INITIAL_KKE_2B1);
  };

  // 7. KKE 2.c.1 (Kuesioner Pemanfaatan)
  const [kke2c1List, setKke2c1List] = useState<KKE2c1Item[]>(() => StorageService.getKKE2c1());
  const [is2c1ModalOpen, setIs2c1ModalOpen] = useState(false);
  const [editing2c1, setEditing2c1] = useState<KKE2c1Item | null>(null);
  const [formData2c1, setFormData2c1] = useState<Partial<KKE2c1Item>>({
    q: '',
    status: '',
    skor: 'A (Sangat Baik)',
  });

  const handleOpenAdd2c1 = () => {
    setEditing2c1(null);
    setFormData2c1({
      q: '',
      status: 'Ya, dijadikan dasar evaluasi tindak lanjut',
      skor: 'A (Sangat Baik)',
    });
    setIs2c1ModalOpen(true);
  };

  const handleOpenEdit2c1 = (item: KKE2c1Item) => {
    setEditing2c1(item);
    setFormData2c1({ ...item });
    setIs2c1ModalOpen(true);
  };

  const handleSave2c1Form = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: KKE2c1Item[];
    if (editing2c1) {
      updated = kke2c1List.map((item) =>
        item.id === editing2c1.id ? ({ ...item, ...formData2c1 } as KKE2c1Item) : item
      );
    } else {
      const newItem: KKE2c1Item = {
        id: 'kues-2c1-' + Date.now(),
        q: formData2c1.q || '',
        status: formData2c1.status || '',
        skor: formData2c1.skor || 'A (Sangat Baik)',
      };
      updated = [...kke2c1List, newItem];
    }
    setKke2c1List(updated);
    StorageService.saveKKE2c1(updated);
    setIs2c1ModalOpen(false);
  };

  const handleDelete2c1 = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus butir kuesioner ini?')) return;
    const updated = kke2c1List.filter((it) => it.id !== id);
    setKke2c1List(updated);
    StorageService.saveKKE2c1(updated);
  };

  const handleReset2c1 = () => {
    if (!window.confirm('Kembalikan kuesioner pemanfaatan ke format standar?')) return;
    setKke2c1List(INITIAL_KKE_2C1);
    StorageService.saveKKE2c1(INITIAL_KKE_2C1);
  };

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Kertas Kerja Evaluasi Perangkat Daerah (KKE PD)
                </h3>
                <span className="text-[11px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                  Instrumen Resmi Inspektorat
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Format Lembar Kerja Evaluasi Mandiri SAKIP Dinas Transmigrasi dan Tenaga Kerja Luwu Utara
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddKKEPD}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Butir KKE PD</span>
                </button>
                <button
                  onClick={handleResetKKEPD}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1"
                  title="Kembalikan ke format standar"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Default</span>
                </button>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span><strong>Mode Administrator SAKIP:</strong> Klik tombol edit pada baris tabel untuk memperbarui pertanyaan, jawaban, atau link evidence.</span>
              </span>
              <span className="text-[11px] font-semibold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded">
                Total: {kkePDList.length} Butir
              </span>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-[11px] uppercase">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-32">Sub-Komponen</th>
                  <th className="py-2.5 px-4 min-w-[260px]">Pertanyaan Evaluasi / Kriteria Pemenuhan</th>
                  <th className="py-2.5 px-3 w-24 text-center">Jawaban</th>
                  <th className="py-2.5 px-4 min-w-[200px]">Link Evidence</th>
                  <th className="py-2.5 px-3 min-w-[140px]">Catatan</th>
                  {isAdmin && <th className="py-2.5 px-3 w-20 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {kkePDList.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-400">
                      Belum ada data butir KKE PD. Klik "Tambah Butir KKE PD" di atas.
                    </td>
                  </tr>
                ) : (
                  kkePDList.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{row.sub}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{row.q}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] ${
                          row.ans === 'Ya' || row.ans === 'A' || row.ans === 'Ada dan Berkualitas'
                            ? 'text-emerald-800 bg-emerald-100'
                            : 'text-amber-800 bg-amber-100'
                        }`}>
                          {row.ans}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {row.link ? (
                          <a
                            href={row.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold bg-blue-50 px-2.5 py-1 rounded border border-blue-200 text-[11px]"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                            <span>Buka Link Evidence</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum ditautkan</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {row.catatan || '-'}
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditKKEPD(row)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Edit Butir KKE PD"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteKKEPD(row.id)}
                              className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Hapus Butir KKE PD"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: KKE PD JUKNIS */}
      {activeSubTab === 'kke-juknis' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Petunjuk Teknis (Juknis) Pengisian Kertas Kerja Evaluasi Perangkat Daerah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pedoman operasional SAKIP Dinas Transmigrasi dan Tenaga Kerja Kabupaten Luwu Utara
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddJuknisItem}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Poin Juknis</span>
                </button>
                <button
                  onClick={handleResetJuknis}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1"
                  title="Kembalikan ke teks default"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Default</span>
                </button>
              </div>
            )}
          </div>

          {/* Tujuan Juknis Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 mb-1.5 text-xs uppercase tracking-wider text-blue-900">
                  Tujuan Petunjuk Teknis:
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {kkeJuknisData.tujuan}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={handleOpenEditJuknisTujuan}
                  className="ml-3 px-2 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-blue-700 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
                  title="Edit teks tujuan juknis"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Tujuan</span>
                </button>
              )}
            </div>
          </div>

          {/* Juknis Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Langkah-Langkah & Ketentuan Pengisian ({kkeJuknisData.items.length} Poin)
              </h4>
              {isAdmin && (
                <span className="text-[11px] text-blue-700 font-medium">
                  Akses Edit Administrator Aktif
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {kkeJuknisData.items.map((it, idx) => (
                <div
                  key={it.id}
                  className="p-3.5 bg-white rounded-lg border border-slate-200 hover:border-blue-200 transition-all flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {it.nomor || idx + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">
                        {it.judul}
                      </h5>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        {it.uraian}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        onClick={() => handleOpenEditJuknisItem(it)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Edit butir juknis"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteJuknisItem(it.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Hapus butir juknis"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: KKE PD PENJELASAN */}
      {activeSubTab === 'kke-penjelasan' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Penjelasan Instrumen & Indikator KKE Perangkat Daerah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kriteria penilaian evaluator Inspektorat Kabupaten Luwu Utara
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddPenjelasanItem}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kartu Penjelasan</span>
                </button>
                <button
                  onClick={handleResetPenjelasan}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1"
                  title="Kembalikan ke teks default"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Default</span>
                </button>
              </div>
            )}
          </div>

          {/* Pengantar Penjelasan */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
            <p className="text-slate-700 leading-relaxed">
              {kkePenjelasanData.pengantar}
            </p>
            {isAdmin && (
              <button
                onClick={handleOpenEditPengantar}
                className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-blue-700 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0 shadow-2xs"
                title="Edit teks pengantar penjelasan"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Pengantar</span>
              </button>
            )}
          </div>

          {/* Grid Kartu Penjelasan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kkePenjelasanData.items.map((it) => (
              <div
                key={it.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {it.kategori || 'Umum'}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditPenjelasanItem(it)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Edit kartu ini"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePenjelasanItem(it.id)}
                          className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Hapus kartu ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1.5">
                    {it.judul}
                  </h4>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {it.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: KKE 1.b.4 (Cascading Pohon Kinerja) */}
      {activeSubTab === 'kke-1b4' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  KKE 1.b.4 - Keterkaitan Tujuan, Sasaran dan Program (Cascading)
                </h3>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                  Pohon Kinerja Resmi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesuai Lampiran Data Workbook SAKIP Dinas Transmigrasi dan Tenaga Kerja Luwu Utara
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAdd1b4}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Cascading</span>
                </button>
                <button
                  onClick={handleReset1b4}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1"
                  title="Kembalikan ke data standar"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Default</span>
                </button>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span><strong>Mode Administrator SAKIP:</strong> Klik tombol edit untuk memperbarui tujuan, indikator, sasaran, maupun daftar program & indikatornya.</span>
              </span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="border border-slate-300 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-100/80 text-amber-950 font-bold border-b border-amber-300 text-[11px]">
                    <th className="py-2.5 px-3 border-r border-amber-200 w-64">Tujuan (Renstra, Renja, Pohon Kinerja)</th>
                    <th className="py-2.5 px-3 border-r border-amber-200 w-44">Indikator Tujuan</th>
                    <th className="py-2.5 px-3 border-r border-amber-200 w-64">Sasaran Strategis</th>
                    <th className="py-2.5 px-3">Program & Indikator Program</th>
                    {isAdmin && <th className="py-2.5 px-3 w-16 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {kke1b4List.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 border-r border-slate-200 font-medium align-top">
                        <strong className="text-slate-900">{row.tujuanKode} : {row.tujuanNama}</strong>
                        <p className="text-[10px] text-slate-500 mt-1">{row.tujuanCatatan}</p>
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200 font-semibold text-blue-900 align-top">
                        {row.indikatorTujuan}
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200 align-top">
                        <strong className="text-slate-900">{row.sasaranStrategis}</strong>
                        <p className="text-[10px] text-slate-500 mt-1">{row.sasaranCatatan}</p>
                      </td>
                      <td className="py-3 px-3 space-y-2 align-top">
                        {row.programList.map((prog, pIdx) => {
                          const colors = [
                            'bg-blue-50/70 border-blue-200 text-blue-900',
                            'bg-emerald-50/70 border-emerald-200 text-emerald-900',
                            'bg-purple-50/70 border-purple-200 text-purple-900',
                            'bg-amber-50/70 border-amber-200 text-amber-900',
                          ];
                          const color = colors[pIdx % colors.length];
                          return (
                            <div key={prog.id || pIdx} className={`p-2 rounded border ${color}`}>
                              <strong>{prog.kode}: {prog.nama}</strong>
                              <p className="text-[10px] text-slate-700 mt-0.5">• Indikator: {prog.indikator}</p>
                            </div>
                          );
                        })}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-3 text-center align-top">
                          <div className="flex flex-col items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit1b4(row)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Edit Pohon Kinerja"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete1b4(row.id)}
                              className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Hapus Pohon Kinerja"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: KKE 1.b.5 (Matriks Penyelarasan) */}
      {activeSubTab === 'kke-1b5' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                KKE 1.b.5 - Matriks Penyelarasan Sasaran, Indikator, dan Anggaran
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keselarasan antara Renstra, Renja, DPA, dan Perjanjian Kinerja
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAdd1b5}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris Matriks</span>
                </button>
                <button
                  onClick={handleReset1b5}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1"
                  title="Kembalikan ke data standar"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Default</span>
                </button>
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-[11px]">
                  <th className="py-2.5 px-3">Sasaran Strategis</th>
                  <th className="py-2.5 px-3">Indikator Kinerja Utama</th>
                  <th className="py-2.5 px-3 text-right">Target</th>
                  <th className="py-2.5 px-3">Program / Kegiatan Terkait</th>
                  <th className="py-2.5 px-3">Unit Pelaksana</th>
                  {isAdmin && <th className="py-2.5 px-3 w-16 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {kke1b5List.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{row.sasaranStrategis}</td>
                    <td className="py-2.5 px-3">{row.indikatorKinerjaUtama}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">{row.target}</td>
                    <td className="py-2.5 px-3">{row.programKegiatan}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{row.unitPelaksana}</td>
                    {isAdmin && (
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit1b5(row)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Edit Matriks"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete1b5(row.id)}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Hapus Matriks"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: KKE 2.b.1 KUES */}
      {activeSubTab === 'kke-2b1' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  KKE 2.b.1 Kues - Kuesioner Pengukuran Kinerja Berkala
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                  Skor: Terpenuhi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Instrumen Evaluasi Ketersediaan dan Mekanisme Pengukuran Data Triwulan
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAdd2b1}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pertanyaan</span>
                </button>
                <button
                  onClick={handleReset2b1}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1"
                  title="Kembalikan ke data standar"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Default</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {kke2b1List.map((kues, idx) => (
              <div
                key={kues.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:border-blue-200 transition-all space-y-1.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-slate-900">
                    {idx + 1}. {kues.q}
                  </p>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit2b1(kues)}
                        className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                        title="Edit kuesioner ini"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete2b1(kues.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Hapus kuesioner ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <span className="text-slate-600">Catatan: {kues.status}</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  KKE 2.c.1 Kues - Kuesioner Pemanfaatan Data Kinerja
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                  Skor: Terpenuhi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemanfaatan Capaian Kinerja dalam Pengambilan Kebijakan dan Evaluasi Program
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAdd2c1}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pertanyaan</span>
                </button>
                <button
                  onClick={handleReset2c1}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1"
                  title="Kembalikan ke data standar"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Reset Default</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {kke2c1List.map((kues, idx) => (
              <div
                key={kues.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:border-blue-200 transition-all space-y-1.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-slate-900">
                    {idx + 1}. {kues.q}
                  </p>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit2c1(kues)}
                        className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                        title="Edit kuesioner ini"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete2c1(kues.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Hapus kuesioner ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <span className="text-slate-600">Tindak Lanjut / Status: {kues.status}</span>
                  {kues.skor && (
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {kues.skor}
                    </span>
                  )}
                </div>
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

      {/* ==================== 7 KKE MODALS FOR ADMINISTRATOR ==================== */}

      {/* 1. MODAL: KKE PD */}
      {isKKEPDModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingKKEPD ? 'Edit Butir KKE Perangkat Daerah' : 'Tambah Butir KKE Perangkat Daerah'}
                </h3>
                <p className="text-xs text-slate-500">
                  Format Lembar Kerja Evaluasi Mandiri SAKIP Luwu Utara
                </p>
              </div>
              <button
                onClick={() => setIsKKEPDModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKKEPDForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sub-Komponen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={kkePDFormData.sub || ''}
                    onChange={(e) => setKkePDFormData({ ...kkePDFormData, sub: e.target.value })}
                    placeholder="Contoh: 1.a Dokumen / 1.b Cascading / 2.a SOP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jawaban Evaluasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={kkePDFormData.ans || 'Ya'}
                    onChange={(e) => setKkePDFormData({ ...kkePDFormData, ans: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                  >
                    <option value="Ya">Ya</option>
                    <option value="Tidak">Tidak</option>
                    <option value="Ada dan Berkualitas">Ada dan Berkualitas</option>
                    <option value="Sebagian">Sebagian</option>
                    <option value="A">A</option>
                    <option value="BB">BB</option>
                    <option value="B">B</option>
                    <option value="CC">CC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pertanyaan Evaluasi / Kriteria Pemenuhan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={kkePDFormData.q || ''}
                  onChange={(e) => setKkePDFormData({ ...kkePDFormData, q: e.target.value })}
                  placeholder="Deskripsi pertanyaan atau kriteria pemenuhan instrumen evaluasi..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Link Evidence (URL Google Drive / Peraturan / Berkas)
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={kkePDFormData.link || ''}
                    onChange={(e) => setKkePDFormData({ ...kkePDFormData, link: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Keterangan / Analisis
                </label>
                <input
                  type="text"
                  value={kkePDFormData.catatan || ''}
                  onChange={(e) => setKkePDFormData({ ...kkePDFormData, catatan: e.target.value })}
                  placeholder="Catatan verifikasi atau tindak lanjut..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKKEPDModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingKKEPD ? 'Simpan Perubahan' : 'Tambahkan Butir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: KKE JUKNIS */}
      {isJuknisModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditingJuknisTujuan
                    ? 'Edit Tujuan Petunjuk Teknis'
                    : editingJuknisItem
                    ? 'Edit Butir Petunjuk Teknis'
                    : 'Tambah Butir Petunjuk Teknis'}
                </h3>
                <p className="text-xs text-slate-500">
                  Pedoman Pengisian KKE Dinas Transmigrasi dan Tenaga Kerja
                </p>
              </div>
              <button
                onClick={() => setIsJuknisModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJuknisForm} className="p-6 space-y-4">
              {isEditingJuknisTujuan ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tujuan Petunjuk Teknis <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={juknisFormData.tujuan}
                    onChange={(e) => setJuknisFormData({ ...juknisFormData, tujuan: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-1">
                      <label className="block font-semibold text-slate-700 mb-1">Nomor</label>
                      <input
                        type="number"
                        value={juknisFormData.nomor}
                        onChange={(e) => setJuknisFormData({ ...juknisFormData, nomor: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold"
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Judul Poin Juknis <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={juknisFormData.judul}
                        onChange={(e) => setJuknisFormData({ ...juknisFormData, judul: e.target.value })}
                        placeholder="Contoh: Verifikasi Ketersediaan Dokumen"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Uraian Petunjuk Teknis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={juknisFormData.uraian}
                      onChange={(e) => setJuknisFormData({ ...juknisFormData, uraian: e.target.value })}
                      placeholder="Petunjuk rinci untuk tim SAKIP dan operator..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed"
                      required
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJuknisModalOpen(false)}
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

      {/* 3. MODAL: KKE PENJELASAN */}
      {isPenjelasanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditingPengantar
                    ? 'Edit Pengantar Penjelasan'
                    : editingPenjelasanItem
                    ? 'Edit Kartu Penjelasan Instrumen'
                    : 'Tambah Kartu Penjelasan Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Penjelasan Indikator Evaluator SAKIP Luwu Utara
                </p>
              </div>
              <button
                onClick={() => setIsPenjelasanModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePenjelasanForm} className="p-6 space-y-4">
              {isEditingPengantar ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teks Pengantar Penjelasan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={penjelasanFormData.pengantar}
                    onChange={(e) => setPenjelasanFormData({ ...penjelasanFormData, pengantar: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Judul Kartu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={penjelasanFormData.judul}
                        onChange={(e) => setPenjelasanFormData({ ...penjelasanFormData, judul: e.target.value })}
                        placeholder="Contoh: Kualitas Renstra & IKU"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                      <input
                        type="text"
                        value={penjelasanFormData.kategori}
                        onChange={(e) => setPenjelasanFormData({ ...penjelasanFormData, kategori: e.target.value })}
                        placeholder="Perencanaan / Pengukuran / dll"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Deskripsi Penjelasan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={penjelasanFormData.deskripsi}
                      onChange={(e) => setPenjelasanFormData({ ...penjelasanFormData, deskripsi: e.target.value })}
                      placeholder="Penjelasan kriteria evaluasi dan standar kualitas..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed"
                      required
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPenjelasanModalOpen(false)}
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

      {/* 4. MODAL: KKE 1.b.4 CASCADING */}
      {is1b4ModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editing1b4 ? 'Edit Pohon Kinerja Cascading (KKE 1.b.4)' : 'Tambah Baris Pohon Kinerja Cascading'}
                </h3>
                <p className="text-xs text-slate-500">
                  Keterkaitan Tujuan, Indikator, Sasaran Strategis, dan Program
                </p>
              </div>
              <button
                onClick={() => setIs1b4ModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave1b4Form} className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Kode Tujuan</label>
                  <input
                    type="text"
                    value={formData1b4.tujuanKode}
                    onChange={(e) => setFormData1b4({ ...formData1b4, tujuanKode: e.target.value })}
                    placeholder="T1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Tujuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData1b4.tujuanNama}
                    onChange={(e) => setFormData1b4({ ...formData1b4, tujuanNama: e.target.value })}
                    placeholder="Meningkatkan Kualitas Pembangunan Manusia..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Keselarasan Tujuan</label>
                <input
                  type="text"
                  value={formData1b4.tujuanCatatan}
                  onChange={(e) => setFormData1b4({ ...formData1b4, tujuanCatatan: e.target.value })}
                  placeholder="Selaras Renstra, Renja, Pohon Kinerja & Cascading"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Indikator Tujuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData1b4.indikatorTujuan}
                  onChange={(e) => setFormData1b4({ ...formData1b4, indikatorTujuan: e.target.value })}
                  placeholder="Contoh: Indeks Pembangunan Manusia (IPM)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold text-blue-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sasaran Strategis <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData1b4.sasaranStrategis}
                  onChange={(e) => setFormData1b4({ ...formData1b4, sasaranStrategis: e.target.value })}
                  placeholder="Rumusan sasaran strategis kepala dinas..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Indikator Sasaran</label>
                <input
                  type="text"
                  value={formData1b4.sasaranCatatan}
                  onChange={(e) => setFormData1b4({ ...formData1b4, sasaranCatatan: e.target.value })}
                  placeholder="Indikator Makro: Pertumbuhan Ekonomi & TPT"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Daftar Program & Indikator (1 Baris = 1 Program)</span>
                  <span className="text-[10px] text-blue-600 font-normal">Format: Kode: Nama Program | Indikator: Uraian</span>
                </label>
                <textarea
                  value={formData1b4.programRawText}
                  onChange={(e) => setFormData1b4({ ...formData1b4, programRawText: e.target.value })}
                  placeholder="p1: Program Pelatihan Kerja | Indikator: Tingkat Produktivitas Tenaga Kerja&#10;p2: Program Penempatan Tenaga Kerja | Indikator: Persentase Naker Ditempatkan"
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-[11px] leading-relaxed"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIs1b4ModalOpen(false)}
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

      {/* 5. MODAL: KKE 1.b.5 MATRIKS PENYELARASAN */}
      {is1b5ModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editing1b5 ? 'Edit Baris Matriks Penyelarasan (KKE 1.b.5)' : 'Tambah Baris Matriks Penyelarasan'}
                </h3>
                <p className="text-xs text-slate-500">
                  Penyelarasan Sasaran, Indikator, dan Anggaran SAKIP
                </p>
              </div>
              <button
                onClick={() => setIs1b5ModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave1b5Form} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sasaran Strategis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData1b5.sasaranStrategis || ''}
                  onChange={(e) => setFormData1b5({ ...formData1b5, sasaranStrategis: e.target.value })}
                  placeholder="Meningkatnya Kesiapan Tenaga Kerja..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Indikator Kinerja Utama (IKU) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData1b5.indikatorKinerjaUtama || ''}
                  onChange={(e) => setFormData1b5({ ...formData1b5, indikatorKinerjaUtama: e.target.value })}
                  placeholder="Persentase naker terlatih bersertifikasi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Angka / Satuan</label>
                  <input
                    type="text"
                    value={formData1b5.target || ''}
                    onChange={(e) => setFormData1b5({ ...formData1b5, target: e.target.value })}
                    placeholder="Contoh: 59.06%"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Pelaksana</label>
                  <input
                    type="text"
                    value={formData1b5.unitPelaksana || ''}
                    onChange={(e) => setFormData1b5({ ...formData1b5, unitPelaksana: e.target.value })}
                    placeholder="UPTD BLK / Bidang PTK"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program / Kegiatan Terkait</label>
                <input
                  type="text"
                  value={formData1b5.programKegiatan || ''}
                  onChange={(e) => setFormData1b5({ ...formData1b5, programKegiatan: e.target.value })}
                  placeholder="Program Pelatihan Kerja & Produktivitas"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIs1b5ModalOpen(false)}
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

      {/* 6. MODAL: KKE 2.b.1 KUES */}
      {is2b1ModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editing2b1 ? 'Edit Pertanyaan Kuesioner (KKE 2.b.1)' : 'Tambah Pertanyaan Kuesioner'}
                </h3>
                <p className="text-xs text-slate-500">
                  Pengukuran Kinerja Berkala Triwulan Dinas Transnaker
                </p>
              </div>
              <button
                onClick={() => setIs2b1ModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave2b1Form} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pertanyaan Evaluasi Kuesioner <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData2b1.q || ''}
                  onChange={(e) => setFormData2b1({ ...formData2b1, q: e.target.value })}
                  placeholder="Apakah dinas memiliki sistem repositori digital..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan Realisasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData2b1.status || ''}
                  onChange={(e) => setFormData2b1({ ...formData2b1, status: e.target.value })}
                  placeholder="Ya, diverifikasi oleh Kasubag Perencanaan..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skor Penilaian</label>
                <input
                  type="text"
                  value={formData2b1.skor || ''}
                  onChange={(e) => setFormData2b1({ ...formData2b1, skor: e.target.value })}
                  placeholder="A (Sangat Baik) / BB (Baik) / dll"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold text-emerald-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIs2b1ModalOpen(false)}
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

      {/* 7. MODAL: KKE 2.c.1 KUES */}
      {is2c1ModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editing2c1 ? 'Edit Pertanyaan Pemanfaatan (KKE 2.c.1)' : 'Tambah Pertanyaan Pemanfaatan'}
                </h3>
                <p className="text-xs text-slate-500">
                  Pemanfaatan Capaian Kinerja dalam Pengambilan Kebijakan
                </p>
              </div>
              <button
                onClick={() => setIs2c1ModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave2c1Form} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pertanyaan Evaluasi Pemanfaatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData2c1.q || ''}
                  onChange={(e) => setFormData2c1({ ...formData2c1, q: e.target.value })}
                  placeholder="Apakah hasil capaian kinerja digunakan sebagai bahan penyusunan..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tindak Lanjut / Status Pemanfaatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData2c1.status || ''}
                  onChange={(e) => setFormData2c1({ ...formData2c1, status: e.target.value })}
                  placeholder="Ya, menjadi baseline perumusan target Renja..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skor / Tingkat Kematangan</label>
                <input
                  type="text"
                  value={formData2c1.skor || ''}
                  onChange={(e) => setFormData2c1({ ...formData2c1, skor: e.target.value })}
                  placeholder="A (Sangat Baik) / BB (Baik)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold text-emerald-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIs2c1ModalOpen(false)}
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
