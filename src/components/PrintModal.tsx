import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { CapaianKinerjaItem } from '../types/sakip';
import { KopDinasPrint, PrintFooterOfficial } from './KopDinasPrint';
import { StorageService } from '../services/storage';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CapaianKinerjaItem[];
}

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container - hide actions during print */}
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Actions Header (hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold">Pratinjau Cetak Laporan Resmi SAKIP</h3>
              <p className="text-[11px] text-slate-300">
                Format Surat Resmi Dinas Transmigrasi dan Tenaga Kerja Kabupaten Luwu Utara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => StorageService.exportCapaianToExcel(items)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print / PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl w-full print:shadow-none print:p-0 print:max-w-none text-black">
            {/* Kop Surat Pemkab Luwu Utara */}
            <KopDinasPrint
              title="REKAPITULASI DATA CAPAIAN KINERJA PADA DINAS TRANSMIGRASI DAN TENAGA KERJA"
              subTitle="KABUPATEN LUWU UTARA"
              periode="Triwulan 3 Tahun 2026"
            />

            {/* Official Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse border border-black font-sans">
                <thead>
                  <tr className="bg-gray-100 text-black font-bold border-b border-black text-center">
                    <th className="border border-black p-1.5 w-6">No.</th>
                    <th className="border border-black p-1.5 w-16">Kategori Kinerja</th>
                    <th className="border border-black p-1.5 w-32">Nomenklatur Program</th>
                    <th className="border border-black p-1.5 min-w-[150px]">Indikator Kinerja</th>
                    <th className="border border-black p-1.5 w-12">Satuan</th>
                    <th className="border border-black p-1.5 w-12">Target</th>
                    <th className="border border-black p-1.5 w-14">Realisasi Capaian</th>
                    <th className="border border-black p-1.5 w-14">Tingkat Capaian (%)</th>
                    <th className="border border-black p-1.5 w-16">Periode</th>
                    <th className="border border-black p-1.5 w-24">Sumber Data</th>
                    <th className="border border-black p-1.5 w-28">Penanggung Jawab</th>
                    <th className="border border-black p-1.5 w-24">Bukti Dukung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black text-black">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="border border-black p-1 text-center font-medium">{item.no}</td>
                      <td className="border border-black p-1 text-center font-semibold">
                        {item.kategoriKinerja}
                      </td>
                      <td className="border border-black p-1">{item.nomenklaturProgram}</td>
                      <td className="border border-black p-1 font-medium">{item.indikatorKinerja}</td>
                      <td className="border border-black p-1 text-center">{item.satuan}</td>
                      <td className="border border-black p-1 text-right font-mono">{item.target}</td>
                      <td className="border border-black p-1 text-right font-mono font-semibold">
                        {item.realisasiCapaian}
                      </td>
                      <td className="border border-black p-1 text-center font-mono font-bold">
                        {item.tingkatCapaian}
                      </td>
                      <td className="border border-black p-1 text-center">{item.periode}</td>
                      <td className="border border-black p-1">{item.sumberData}</td>
                      <td className="border border-black p-1">{item.penanggungJawab}</td>
                      <td className="border border-black p-1 font-mono text-[9px]">{item.buktiDukung}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Signature and 7 Ketentuan Pengisian */}
            <PrintFooterOfficial />
          </div>
        </div>
      </div>
    </div>
  );
};
