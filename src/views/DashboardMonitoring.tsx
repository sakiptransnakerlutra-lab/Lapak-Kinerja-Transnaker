import React, { useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Building,
  Target,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { CapaianKinerjaItem, LKEEvaluationComponent } from '../types/sakip';

interface DashboardMonitoringProps {
  items: CapaianKinerjaItem[];
  lkeComponents: LKEEvaluationComponent[];
  onNavigateToCapaian: () => void;
}

export const DashboardMonitoring: React.FC<DashboardMonitoringProps> = ({
  items,
  lkeComponents,
  onNavigateToCapaian,
}) => {
  // Aggregate stats by Kategori
  const kategoriStats = useMemo(() => {
    const categories = ['IKK', 'IKD', 'SDGs / TPB', 'Program'] as const;
    return categories.map((kat) => {
      const list = items.filter((i) => i.kategoriKinerja === kat);
      const total = list.length;
      const achieved = list.filter((i) => i.tingkatCapaian >= 100).length;
      const avg = total > 0 ? list.reduce((a, b) => a + b.tingkatCapaian, 0) / total : 0;
      return {
        kategori: kat,
        total,
        achieved,
        avg: avg.toFixed(1),
      };
    });
  }, [items]);

  // Aggregate stats by Penanggung Jawab
  const bidangStats = useMemo(() => {
    const map = new Map<string, { total: number; achieved: number; sum: number }>();
    items.forEach((item) => {
      const key = item.penanggungJawab || 'Lainnya';
      const cur = map.get(key) || { total: 0, achieved: 0, sum: 0 };
      cur.total += 1;
      if (item.tingkatCapaian >= 100) cur.achieved += 1;
      cur.sum += item.tingkatCapaian;
      map.set(key, cur);
    });

    return Array.from(map.entries()).map(([bidang, val]) => ({
      bidang,
      total: val.total,
      achieved: val.achieved,
      avg: (val.sum / (val.total || 1)).toFixed(1),
      persenTuntas: Math.round((val.achieved / (val.total || 1)) * 100),
    }));
  }, [items]);

  // Critical items needing attention (tingkatCapaian < 80)
  const criticalItems = useMemo(() => {
    return items.filter((i) => i.tingkatCapaian < 80).sort((a, b) => a.tingkatCapaian - b.tingkatCapaian);
  }, [items]);

  // Top performing items
  const topItems = useMemo(() => {
    return items.filter((i) => i.tingkatCapaian >= 100).sort((a, b) => b.tingkatCapaian - a.tingkatCapaian);
  }, [items]);

  // SAKIP Total Score
  const totalSAKIPScore = useMemo(() => {
    return lkeComponents.reduce((acc, curr) => acc + curr.nilai, 0);
  }, [lkeComponents]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b172c] via-[#102a4e] to-[#1e3a66] text-white rounded-2xl p-6 shadow-md border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold border border-blue-400/30">
              <Activity className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
              <span>Monitoring Real-Time Akuntabilitas Kinerja Instansi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Pemantauan Kinerja & Progres SAKIP 2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dinas Transmigrasi dan Tenaga Kerja Kabupaten Luwu Utara terus menjaga ketercapaian target
              strategis, transparansi dokumen dukung, serta pemenuhan 5 komponen evaluasi akuntabilitas kinerja.
            </p>
          </div>

          {/* SAKIP Score Pill Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl flex items-center gap-4 lg:w-72 flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center flex-shrink-0 text-amber-300">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                Estimasi Skor SAKIP
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-white">{totalSAKIPScore.toFixed(2)}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                  Predikat BB
                </span>
              </div>
              <p className="text-[10px] text-slate-300 mt-1">Sangat Baik (Posisi Transnaker)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Cards per Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kategoriStats.map((stat) => (
          <div
            key={stat.kategori}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {stat.kategori}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {stat.achieved}/{stat.total} Tuntas
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">{stat.avg}%</span>
                <span className="text-xs text-slate-500">Rata-rata Capaian</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    parseFloat(stat.avg) >= 100
                      ? 'bg-emerald-500'
                      : parseFloat(stat.avg) >= 75
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(parseFloat(stat.avg), 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Bidang Performance & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitoring per Bidang */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Pemantauan Capaian Berdasarkan Bidang & UPTD
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Triwulan 3</span>
          </div>

          <div className="mt-4 space-y-4">
            {bidangStats.map((b) => (
              <div key={b.bidang} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[240px] sm:max-w-xs">
                    {b.bidang}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">{b.achieved}/{b.total} IKP</span>
                    <span className="font-bold text-slate-900 font-mono">{b.avg}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.persenTuntas >= 80
                        ? 'bg-emerald-500'
                        : b.persenTuntas >= 50
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(b.persenTuntas, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Early Warning / Perlu Perhatian */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Indikator Perlu Perhatian & Tindak Lanjut
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                {criticalItems.length} Indikator
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {criticalItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-amber-200/80 bg-amber-50/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 line-clamp-1">
                      {item.indikatorKinerja}
                    </span>
                    <span className="font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[11px] flex-shrink-0 ml-2">
                      {item.tingkatCapaian}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    <span className="font-semibold">{item.penanggungJawab}</span> • Target: {item.target}{' '}
                    {item.satuan} • Realisasi: {item.realisasiCapaian} {item.satuan}
                  </p>
                  {item.catatan && (
                    <p className="text-[10px] text-amber-900 italic pt-0.5">
                      Catatan: {item.catatan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Kaji kendala dan siapkan dokumen dukung tambahan sebelum Triwulan 4.
            </span>
            <button
              onClick={onNavigateToCapaian}
              className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 text-[11px]"
            >
              <span>Buka Capaian</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Triwulan Milestone Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <span>Siklus Pelaporan & Evaluasi SAKIP Tahunan</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-900">Triwulan 1</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-slate-600 text-[11px]">Penandatanganan PK, penetapan IKU, dan monev TW 1.</p>
            <span className="text-[10px] font-semibold text-emerald-700 mt-2 block">STATUS: SELESAI</span>
          </div>

          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-900">Triwulan 2</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-slate-600 text-[11px]">Pengukuran semester 1 dan tindak lanjut rekomendasi LHE.</p>
            <span className="text-[10px] font-semibold text-emerald-700 mt-2 block">STATUS: SELESAI</span>
          </div>

          <div className="p-3 rounded-lg border border-blue-400 bg-blue-50/80 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-blue-900">Triwulan 3 (Saat ini)</span>
              <Activity className="w-4 h-4 text-blue-600 animate-spin" />
            </div>
            <p className="text-slate-700 text-[11px]">Verifikasi dokumen eviden, pengisian KKE & rekap LKE.</p>
            <span className="text-[10px] font-bold text-blue-700 mt-2 block">STATUS: AKTIF BERJALAN</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-700">Triwulan 4 & LKjIP</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-slate-500 text-[11px]">Penyusunan LKjIP tahunan dan evaluasi akuntabilitas oleh Inspektorat.</p>
            <span className="text-[10px] font-semibold text-slate-400 mt-2 block">STATUS: MENDATANG</span>
          </div>
        </div>
      </div>
    </div>
  );
};
