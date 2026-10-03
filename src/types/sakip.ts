export type UserRole = 'admin' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unit: string;
  nip?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CapaianKinerjaItem {
  id: number;
  no: number;
  kategoriKinerja: 'IKK' | 'IKD' | 'SDGs / TPB' | 'Program';
  nomenklaturProgram: string;
  indikatorKinerja: string;
  satuan: string;
  target: number;
  realisasiCapaian: number;
  tingkatCapaian: number;
  periode: string;
  sumberData: string;
  penanggungJawab: string;
  buktiDukung: string; // Link Evidence / Bukti Dukung
  linkEvidence?: string;
  catatan?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface LKEEvaluationComponent {
  id: string;
  nama: string;
  bobot: number;
  nilai: number;
  capaianPersen: number;
  deskripsi: string;
  subKomponen?: {
    nama: string;
    bobot: number;
    nilai: number;
  }[];
}

export interface LKECriteriaItem {
  id: string;
  noUrut: number;
  kode: string;
  komponen: string;
  subKomponenKode: string;
  subKomponenNama: string;
  kriteria: string;
  bobot?: number;
  jawaban: string; // 'Ya' | 'Tdk' | 'Ada dan Berkualitas' | 'Ada/Tidak' | 'B' | 'BB' | 'A' | 'CC'
  nilai: number;
  persen?: number;
  catatan: string;
  linkEvidence: string; // Link Evidence (Google Drive, BPK, etc.)
  penjelasanCatatan?: string;
}

export interface DokumenSAKIPItem {
  id: string;
  judul: string;
  nomorSurat?: string;
  kategori: 'Renstra' | 'IKU' | 'RKT / PK' | 'LKjIP' | 'LHE AKIP' | 'KKE / LKE' | 'SOP & Kebijakan' | 'Bukti Dukung';
  tahun: number;
  tipeFile: 'xlsx' | 'pdf' | 'docx' | 'link';
  ukuranFile?: string;
  url: string;
  fileDataUrl?: string; // for uploaded files
  uploadedBy: string;
  uploadedAt: string;
  deskripsi?: string;
  triwulan?: string;
  downloadsCount: number;
}

export type ActiveTab =
  | 'dashboard-capaian'
  | 'dashboard-monitoring'
  | 'evaluasi-mandiri'
  | 'evaluasi-lke'
  | 'dokumen-sakip'
  | 'kelola-operator';

export type LKETab =
  | 'penjelasan'
  | 'rekap'
  | 'data-lke'
  | 'kke-pd'
  | 'kke-juknis'
  | 'kke-penjelasan'
  | 'kke-1b4'
  | 'kke-1b5'
  | 'kke-2b1'
  | 'kke-2c1'
  | 'uploaded-sheet';
