import * as XLSX from 'xlsx';
import {
  CapaianKinerjaItem,
  DokumenSAKIPItem,
  LKECriteriaItem,
  LKEEvaluationComponent,
  User,
} from '../types/sakip';
import {
  INITIAL_CAPAIAN_KINERJA,
  INITIAL_DOKUMEN_SAKIP,
  INITIAL_LKE_COMPONENTS,
  INITIAL_LKE_CRITERIA,
  INITIAL_USERS,
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'lapak_kinerja_users_v2',
  CURRENT_USER: 'lapak_kinerja_current_user_v2',
  CAPAIAN: 'lapak_kinerja_capaian_v2',
  LKE_COMPONENTS: 'lapak_kinerja_lke_comp_v2',
  LKE_CRITERIA: 'lapak_kinerja_lke_crit_v2',
  DOKUMEN: 'lapak_kinerja_dokumen_v2',
  CUSTOM_SHEETS: 'lapak_kinerja_custom_sheets_v2',
};

export interface CustomUploadedSheet {
  id: string;
  fileName: string;
  sheetNames: string[];
  activeSheet: string;
  data: Record<string, (string | number)[][]>;
  uploadedAt: string;
}

// Safe in-memory fallback for environments where localStorage is restricted or blocked
const memoryCache: Record<string, string> = {};

const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      console.warn('localStorage read error, using memory fallback:', e);
    }
    return memoryCache[key] ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('localStorage write error, using memory fallback:', e);
    }
    memoryCache[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
    delete memoryCache[key];
  },
};

export const StorageService = {
  getUsers(): User[] {
    const data = safeStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]) {
    safeStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser(): User {
    const data = safeStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) {
      const defaultUser = INITIAL_USERS[0];
      safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS[0];
    }
  },

  setCurrentUser(user: User) {
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getCapaianKinerja(): CapaianKinerjaItem[] {
    const data = safeStorage.getItem(STORAGE_KEYS.CAPAIAN);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.CAPAIAN, JSON.stringify(INITIAL_CAPAIAN_KINERJA));
      return INITIAL_CAPAIAN_KINERJA;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_CAPAIAN_KINERJA;
    }
  },

  saveCapaianKinerja(items: CapaianKinerjaItem[]) {
    safeStorage.setItem(STORAGE_KEYS.CAPAIAN, JSON.stringify(items));
  },

  getLKEComponents(): LKEEvaluationComponent[] {
    const data = safeStorage.getItem(STORAGE_KEYS.LKE_COMPONENTS);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.LKE_COMPONENTS, JSON.stringify(INITIAL_LKE_COMPONENTS));
      return INITIAL_LKE_COMPONENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LKE_COMPONENTS;
    }
  },

  saveLKEComponents(items: LKEEvaluationComponent[]) {
    safeStorage.setItem(STORAGE_KEYS.LKE_COMPONENTS, JSON.stringify(items));
  },

  getLKECriteria(): LKECriteriaItem[] {
    const data = safeStorage.getItem(STORAGE_KEYS.LKE_CRITERIA);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.LKE_CRITERIA, JSON.stringify(INITIAL_LKE_CRITERIA));
      return INITIAL_LKE_CRITERIA;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LKE_CRITERIA;
    }
  },

  saveLKECriteria(items: LKECriteriaItem[]) {
    safeStorage.setItem(STORAGE_KEYS.LKE_CRITERIA, JSON.stringify(items));
  },

  getDokumenSAKIP(): DokumenSAKIPItem[] {
    const data = safeStorage.getItem(STORAGE_KEYS.DOKUMEN);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.DOKUMEN, JSON.stringify(INITIAL_DOKUMEN_SAKIP));
      return INITIAL_DOKUMEN_SAKIP;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_DOKUMEN_SAKIP;
    }
  },

  saveDokumenSAKIP(docs: DokumenSAKIPItem[]) {
    safeStorage.setItem(STORAGE_KEYS.DOKUMEN, JSON.stringify(docs));
  },

  getCustomSheets(): CustomUploadedSheet[] {
    const data = safeStorage.getItem(STORAGE_KEYS.CUSTOM_SHEETS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveCustomSheets(sheets: CustomUploadedSheet[]) {
    safeStorage.setItem(STORAGE_KEYS.CUSTOM_SHEETS, JSON.stringify(sheets));
  },

  // Export Capaian to real .xlsx file
  exportCapaianToExcel(items: CapaianKinerjaItem[], fileName = 'Capaian_Kinerja_Transnaker_Luwu_Utara.xlsx') {
    const worksheetData = items.map((item) => ({
      'No.': item.no,
      'Kategori Kinerja': item.kategoriKinerja,
      'Nomenklatur Program': item.nomenklaturProgram,
      'Indikator Kinerja': item.indikatorKinerja,
      'Satuan': item.satuan,
      'Target': item.target,
      'Realisasi Capaian': item.realisasiCapaian,
      'Tingkat Capaian (%)': item.tingkatCapaian,
      'Periode': item.periode,
      'Sumber Data': item.sumberData,
      'Penanggung Jawab': item.penanggungJawab,
      'Bukti Dukung': item.buktiDukung,
      'Catatan': item.catatan || '',
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Capaian Kinerja');
    XLSX.writeFile(wb, fileName);
  },

  // Export LKE Rekap to Excel
  exportLKEToExcel(components: LKEEvaluationComponent[], criteria: LKECriteriaItem[], fileName = 'LKE_SAKIP_Transnaker_Luwu_Utara.xlsx') {
    const wb = XLSX.utils.book_new();

    const rekapData = components.map((c) => ({
      'Komponen Penilaian': c.nama,
      'Bobot (%)': c.bobot,
      'Nilai Capaian': c.nilai,
      'Persentase Capaian (%)': c.capaianPersen,
      'Deskripsi': c.deskripsi,
    }));
    const wsRekap = XLSX.utils.json_to_sheet(rekapData);
    XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap LKE');

    const critData = criteria.map((cr) => ({
      'Kode': cr.kode,
      'Komponen': cr.komponen,
      'Sub Komponen': cr.subKomponenNama || '',
      'Kriteria Evaluasi': cr.kriteria,
      'Bobot': cr.bobot ?? '',
      'Jawaban': cr.jawaban,
      'Nilai Capaian': cr.nilai,
      'Catatan': cr.catatan,
      'Link Evidence': cr.linkEvidence || '',
    }));
    const wsCrit = XLSX.utils.json_to_sheet(critData);
    XLSX.utils.book_append_sheet(wb, wsCrit, 'Data LKE Kriteria');

    XLSX.writeFile(wb, fileName);
  },

  // Read uploaded Excel file into sheet data matrix
  async parseExcelFile(file: File): Promise<{ sheetNames: string[]; data: Record<string, (string | number)[][]> }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const sheetNames = workbook.SheetNames;
          const data: Record<string, (string | number)[][]> = {};

          sheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 });
            data[sheetName] = rows;
          });

          resolve({ sheetNames, data });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  },

  // Reset to initial state
  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CAPAIAN);
    localStorage.removeItem(STORAGE_KEYS.LKE_COMPONENTS);
    localStorage.removeItem(STORAGE_KEYS.LKE_CRITERIA);
    localStorage.removeItem(STORAGE_KEYS.DOKUMEN);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_SHEETS);
  },
};
