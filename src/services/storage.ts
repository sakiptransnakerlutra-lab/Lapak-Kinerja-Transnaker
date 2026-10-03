import * as XLSX from 'xlsx';
import {
  CapaianKinerjaItem,
  DokumenSAKIPItem,
  LKECriteriaItem,
  LKEEvaluationComponent,
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
import {
  INITIAL_CAPAIAN_KINERJA,
  INITIAL_DOKUMEN_SAKIP,
  INITIAL_LKE_COMPONENTS,
  INITIAL_LKE_CRITERIA,
  INITIAL_USERS,
  INITIAL_KKE_PD,
  INITIAL_KKE_JUKNIS,
  INITIAL_KKE_PENJELASAN,
  INITIAL_KKE_1B4,
  INITIAL_KKE_1B5,
  INITIAL_KKE_2B1,
  INITIAL_KKE_2C1,
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'lapak_kinerja_users_v2',
  CURRENT_USER: 'lapak_kinerja_current_user_v2',
  CAPAIAN: 'lapak_kinerja_capaian_v2',
  LKE_COMPONENTS: 'lapak_kinerja_lke_comp_v2',
  LKE_CRITERIA: 'lapak_kinerja_lke_crit_v2',
  DOKUMEN: 'lapak_kinerja_dokumen_v2',
  CUSTOM_SHEETS: 'lapak_kinerja_custom_sheets_v2',
  KKE_PD: 'lapak_kinerja_kke_pd_v2',
  KKE_JUKNIS: 'lapak_kinerja_kke_juknis_v2',
  KKE_PENJELASAN: 'lapak_kinerja_kke_penjelasan_v2',
  KKE_1B4: 'lapak_kinerja_kke_1b4_v2',
  KKE_1B5: 'lapak_kinerja_kke_1b5_v2',
  KKE_2B1: 'lapak_kinerja_kke_2b1_v2',
  KKE_2C1: 'lapak_kinerja_kke_2c1_v2',
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
      const parsed: User[] = JSON.parse(data);
      let modified = false;
      let hasAdmin = false;

      const updated = parsed.map((u) => {
        if (u.role === 'admin') {
          hasAdmin = true;
          if (u.email !== 'sakip.transnakerlutra@gmail.com' || u.password !== 'Admin12345') {
            modified = true;
            return {
              ...u,
              name: 'Administrator SAKIP',
              email: 'sakip.transnakerlutra@gmail.com',
              password: 'Admin12345',
            };
          }
        } else if (!u.password) {
          modified = true;
          return {
            ...u,
            password: 'Operator123',
          };
        }
        return u;
      });

      if (!hasAdmin) {
        updated.unshift(INITIAL_USERS[0]);
        modified = true;
      }

      if (modified) {
        safeStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      }
      return updated;
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
      const user: User = JSON.parse(data);
      if (user.role === 'admin' && (user.email !== 'sakip.transnakerlutra@gmail.com' || user.password !== 'Admin12345')) {
        const updatedAdmin = { ...user, name: 'Administrator SAKIP', email: 'sakip.transnakerlutra@gmail.com', password: 'Admin12345' };
        safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedAdmin));
        return updatedAdmin;
      }
      return user;
    } catch {
      return INITIAL_USERS[0];
    }
  },

  setCurrentUser(user: User) {
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getIsLoggedIn(): boolean {
    const data = safeStorage.getItem('lapak_kinerja_is_logged_in_v2');
    return data !== null ? data === 'true' : true;
  },

  setIsLoggedIn(status: boolean) {
    safeStorage.setItem('lapak_kinerja_is_logged_in_v2', status ? 'true' : 'false');
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
    localStorage.removeItem(STORAGE_KEYS.KKE_PD);
    localStorage.removeItem(STORAGE_KEYS.KKE_JUKNIS);
    localStorage.removeItem(STORAGE_KEYS.KKE_PENJELASAN);
    localStorage.removeItem(STORAGE_KEYS.KKE_1B4);
    localStorage.removeItem(STORAGE_KEYS.KKE_1B5);
    localStorage.removeItem(STORAGE_KEYS.KKE_2B1);
    localStorage.removeItem(STORAGE_KEYS.KKE_2C1);
  },

  // KKE PD (Kertas Kerja Evaluasi Perangkat Daerah)
  getKKEPD(): KKEPDItem[] {
    const data = safeStorage.getItem(STORAGE_KEYS.KKE_PD);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.KKE_PD, JSON.stringify(INITIAL_KKE_PD));
      return INITIAL_KKE_PD;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_KKE_PD;
    }
  },
  saveKKEPD(items: KKEPDItem[]) {
    safeStorage.setItem(STORAGE_KEYS.KKE_PD, JSON.stringify(items));
  },

  // KKE Juknis
  getKKEJuknis(): KKEJuknisData {
    const data = safeStorage.getItem(STORAGE_KEYS.KKE_JUKNIS);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.KKE_JUKNIS, JSON.stringify(INITIAL_KKE_JUKNIS));
      return INITIAL_KKE_JUKNIS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_KKE_JUKNIS;
    }
  },
  saveKKEJuknis(data: KKEJuknisData) {
    safeStorage.setItem(STORAGE_KEYS.KKE_JUKNIS, JSON.stringify(data));
  },

  // KKE Penjelasan
  getKKEPenjelasan(): KKEPenjelasanData {
    const data = safeStorage.getItem(STORAGE_KEYS.KKE_PENJELASAN);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.KKE_PENJELASAN, JSON.stringify(INITIAL_KKE_PENJELASAN));
      return INITIAL_KKE_PENJELASAN;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_KKE_PENJELASAN;
    }
  },
  saveKKEPenjelasan(data: KKEPenjelasanData) {
    safeStorage.setItem(STORAGE_KEYS.KKE_PENJELASAN, JSON.stringify(data));
  },

  // KKE 1.b.4 (Cascading)
  getKKE1b4(): KKE1b4Item[] {
    const data = safeStorage.getItem(STORAGE_KEYS.KKE_1B4);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.KKE_1B4, JSON.stringify(INITIAL_KKE_1B4));
      return INITIAL_KKE_1B4;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_KKE_1B4;
    }
  },
  saveKKE1b4(items: KKE1b4Item[]) {
    safeStorage.setItem(STORAGE_KEYS.KKE_1B4, JSON.stringify(items));
  },

  // KKE 1.b.5 (Matriks Penyelarasan)
  getKKE1b5(): KKE1b5Item[] {
    const data = safeStorage.getItem(STORAGE_KEYS.KKE_1B5);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.KKE_1B5, JSON.stringify(INITIAL_KKE_1B5));
      return INITIAL_KKE_1B5;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_KKE_1B5;
    }
  },
  saveKKE1b5(items: KKE1b5Item[]) {
    safeStorage.setItem(STORAGE_KEYS.KKE_1B5, JSON.stringify(items));
  },

  // KKE 2.b.1 (Kuesioner Pengukuran Kinerja)
  getKKE2b1(): KKE2b1Item[] {
    const data = safeStorage.getItem(STORAGE_KEYS.KKE_2B1);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.KKE_2B1, JSON.stringify(INITIAL_KKE_2B1));
      return INITIAL_KKE_2B1;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_KKE_2B1;
    }
  },
  saveKKE2b1(items: KKE2b1Item[]) {
    safeStorage.setItem(STORAGE_KEYS.KKE_2B1, JSON.stringify(items));
  },

  // KKE 2.c.1 (Kuesioner Pemanfaatan Data Kinerja)
  getKKE2c1(): KKE2c1Item[] {
    const data = safeStorage.getItem(STORAGE_KEYS.KKE_2C1);
    if (!data) {
      safeStorage.setItem(STORAGE_KEYS.KKE_2C1, JSON.stringify(INITIAL_KKE_2C1));
      return INITIAL_KKE_2C1;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_KKE_2C1;
    }
  },
  saveKKE2c1(items: KKE2c1Item[]) {
    safeStorage.setItem(STORAGE_KEYS.KKE_2C1, JSON.stringify(items));
  },
};
