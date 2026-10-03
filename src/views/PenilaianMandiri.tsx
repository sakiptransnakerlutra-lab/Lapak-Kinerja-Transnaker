import React, { useState } from 'react';
import {
  CheckCircle2,
  Award,
  TrendingUp,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { LKEEvaluationComponent, User } from '../types/sakip';
import { StorageService } from '../services/storage';

interface PenilaianMandiriProps {
  components: LKEEvaluationComponent[];
  onSaveComponents: (components: LKEEvaluationComponent[]) => void;
  currentUser: User;
}

export const PenilaianMandiri: React.FC<PenilaianMandiriProps> = ({
  components,
  onSaveComponents,
  currentUser,
}) => {
  const [localComponents, setLocalComponents] = useState<LKEEvaluationComponent[]>(components);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculate total score
  const totalScore = localComponents.reduce((acc, c) => acc + c.nilai, 0);

  // Predicate determination
  const getPredicate = (score: number) => {
    if (score > 90)
      return {
        predikat: 'AA',
        label: 'Sangat Memuaskan / Leading',
        color: 'text-emerald-700 bg-emerald-100 border-emerald-300',
        desc: 'Manajemen kinerja berorientasi hasil yang unggul, terintegrasi penuh secara digital dan berkelanjutan.',
      };
    if (score > 80)
      return {
        predikat: 'A',
        label: 'Memuaskan',
        color: 'text-blue-700 bg-blue-100 border-blue-300',
        desc: 'Sistem akuntabilitas handal, memiliki tata kelola data kinerja prima dan budaya kinerja kuat.',
      };
    if (score > 70)
      return {
        predikat: 'BB',
        label: 'Sangat Baik (Posisi Saat Ini)',
        color: 'text-indigo-700 bg-indigo-100 border-indigo-300',
        desc: 'Akuntabilitas kinerja sudah baik, memiliki sistem yang dapat diandalkan, perlu pemantapan cascading dan integrasi anggaran.',
      };
    if (score > 60)
      return {
        predikat: 'B',
        label: 'Baik',
        color: 'text-amber-700 bg-amber-100 border-amber-300',
        desc: 'Akuntabilitas kinerja sudah cukup baik, namun masih perlu perbaikan pada pengukuran berkala dan pemanfaatan monev.',
      };
    if (score > 50)
      return {
        predikat: 'CC',
        label: 'Cukup',
        color: 'text-orange-700 bg-orange-100 border-orange-300',
        desc: 'Perlu perbaikan mendasar pada perumusan sasaran, penentuan indikator outcome, dan evaluasi berkala.',
      };
    return {
      predikat: 'C',
      label: 'Kurang',
      color: 'text-red-700 bg-red-100 border-red-300',
      desc: 'Sistem akuntabilitas kinerja belum terbangun secara memadai.',
    };
  };

  const currentPred = getPredicate(totalScore);

  const handleUpdateComponentPercent = (compId: string, newPercent: number) => {
    const updated = localComponents.map((c) => {
      if (c.id === compId) {
        const clamped = Math.max(0, Math.min(100, newPercent));
        const newNilai = Number(((c.bobot * clamped) / 100).toFixed(2));
        return {
          ...c,
          capaianPersen: clamped,
          nilai: newNilai,
        };
      }
      return c;
    });
    setLocalComponents(updated);
  };

  const handleSave = () => {
    onSaveComponents(localComponents);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    const initial = StorageService.getLKEComponents();
    setLocalComponents(initial);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner with Live Predicate */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulasi Penilaian Mandiri SAKIP (Self-Assessment)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Instrumen Penilaian Mandiri Akuntabilitas Kinerja
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Gunakan lembar simulasi ini untuk mengevaluasi tingkat kematangan pemenuhan SAKIP pada
              Dinas Transmigrasi dan Tenaga Kerja sesuai PermenPAN-RB No. 88 Tahun 2021.
            </p>
          </div>

          {/* Current Live Score Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center gap-5 lg:w-80">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Nilai AKIP
              </span>
              <span className="text-3xl font-extrabold text-blue-900 font-mono">
                {totalScore.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">dari 100.00</span>
            </div>

            <div className="h-10 w-[1px] bg-slate-300" />

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Predikat Akuntabilitas
              </span>
              <span
                className={`inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-black border ${currentPred.color}`}
              >
                {currentPred.predikat}
              </span>
              <p className="text-[11px] font-semibold text-slate-800 mt-1 leading-tight">
                {currentPred.label}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            {savedSuccess ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 inline" /> Penilaian mandiri berhasil disimpan ke database!
              </span>
            ) : (
              'Sesuaikan persentase capaian di bawah ini untuk melihat proyeksi nilai akhir.'
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Penilaian</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Components Sliders / Scorers */}
      <div className="space-y-4">
        {localComponents.map((comp, idx) => {
          return (
            <div
              key={comp.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{comp.nama}</h3>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Bobot {comp.bobot}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 pl-8">{comp.deskripsi}</p>
                </div>

                <div className="flex items-center gap-4 pl-8 sm:pl-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Nilai Tertimbang
                    </span>
                    <span className="text-lg font-bold text-blue-900 font-mono">
                      {comp.nilai.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400"> / {comp.bobot}</span>
                  </div>

                  <div className="text-right pl-3 border-l border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Persentase
                    </span>
                    <span className="text-base font-bold text-emerald-700 font-mono">
                      {comp.capaianPersen}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider for percentage */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Tingkat Pemenuhan Kriteria:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={comp.capaianPersen}
                      onChange={(e) =>
                        handleUpdateComponentPercent(comp.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-0.5 border border-slate-300 rounded font-mono text-center font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <span>%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={comp.capaianPersen}
                  onChange={(e) =>
                    handleUpdateComponentPercent(comp.id, parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />

                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>0% (Belum Ada)</span>
                  <span>50% (Sebagian Terpenuhi)</span>
                  <span>75% (Baik / Memadai)</span>
                  <span>100% (Sempurna / Unggul)</span>
                </div>
              </div>

              {/* Sub-components breakdown if present */}
              {comp.subKomponen && comp.subKomponen.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {comp.subKomponen.map((sub, sIdx) => (
                    <div key={sIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                      <p className="font-semibold text-slate-800 text-[11px] truncate" title={sub.nama}>
                        {sub.nama}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>Bobot: {sub.bobot}%</span>
                        <span className="font-mono font-semibold text-blue-800">
                          Skor: {sub.nilai.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Target Roadmap to achieve Predicate A */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 text-xs space-y-2">
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <Info className="w-4 h-4 text-blue-700" />
          <span>Rekomendasi Strategis Menuju Predikat A (Memuaskan &gt;80.00)</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-700 leading-relaxed text-[11px]">
          <li>
            <strong>Perencanaan Kinerja:</strong> Perkuat cascading perjanjian kinerja eselon IV/sub-koordinator
            agar terhubung dengan IKU Kepala Dinas.
          </li>
          <li>
            <strong>Pengukuran Kinerja:</strong> Integrasikan data capaian berkala dari BPJS Ketenagakerjaan
            dan BPS secara digital tiap triwulan.
          </li>
          <li>
            <strong>Pelaporan Kinerja:</strong> Tambahkan analisis mendalam mengenai keterkaitan efisiensi
            anggaran belanja program dengan output lapangan kerja dan kawasan transmigrasi.
          </li>
          <li>
            <strong>Evaluasi Internal:</strong> Perbanyak monev internal tindak lanjut LHE SAKIP bersama
            seluruh Kepala Seksi dan Kepala UPTD BLK.
          </li>
        </ul>
      </div>
    </div>
  );
};
