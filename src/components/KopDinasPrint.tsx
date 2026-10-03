import React from 'react';
import logoLuwuUtara from '../assets/logo_luwu_utara.png';

interface KopDinasPrintProps {
  title?: string;
  subTitle?: string;
  periode?: string;
  showSignature?: boolean;
}

export const KopDinasPrint: React.FC<KopDinasPrintProps> = ({
  title = 'REKAPITULASI DATA CAPAIAN KINERJA PADA DINAS TRANSMIGRASI DAN TENAGA KERJA',
  subTitle = 'KABUPATEN LUWU UTARA',
  periode = 'Triwulan 3 Tahun 2026',
  showSignature = true,
}) => {
  return (
    <div className="font-serif text-black leading-tight">
      {/* Official Government Kop Surat */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-black relative">
        <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
          {/* Logo Asli Luwu Utara */}
          <img
            src={logoLuwuUtara}
            alt="Logo Pemerintah Kabupaten Luwu Utara"
            className="w-16 h-auto object-contain filter-none"
          />
        </div>

        <div className="flex-1 text-center px-4">
          <p className="text-base font-bold tracking-wider uppercase text-gray-900">
            Pemerintah Kabupaten Luwu Utara
          </p>
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-gray-950 mt-0.5">
            Dinas Transmigrasi dan Tenaga Kerja
          </h1>
          <p className="text-xs text-gray-800 mt-1">
            Kantor Gabungan Dinas Lantai 2, Jalan Simpurusiang No. 27 Masamba
          </p>
          <p className="text-xs text-gray-700">
            Telp. (0473) 21003, Fax (0473) 21536, Website:{' '}
            <span className="underline">www.luwuutarakab.go.id</span>, Kode Pos 92961
          </p>
        </div>

        <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-blue-900 flex flex-col items-center justify-center text-center p-1 bg-blue-50">
            <span className="text-[9px] font-black text-blue-950">SAKIP</span>
            <span className="text-[7px] text-blue-800 uppercase font-semibold">Transnaker</span>
          </div>
        </div>
      </div>
      {/* Decorative double border */}
      <div className="border-b border-black mt-0.5 mb-4"></div>

      {/* Document Title */}
      <div className="text-center my-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-900 underline">
          {title}
        </h2>
        {subTitle && (
          <p className="text-xs font-bold text-gray-800 uppercase mt-0.5">{subTitle}</p>
        )}
        {periode && (
          <p className="text-xs font-semibold text-gray-700 italic mt-0.5">Periode: {periode}</p>
        )}
      </div>
    </div>
  );
};

export const PrintFooterOfficial: React.FC = () => {
  return (
    <div className="mt-8 pt-4 font-serif text-black page-break-inside-avoid">
      <div className="grid grid-cols-2 gap-8 text-xs">
        {/* Ketentuan Pengisian */}
        <div className="border border-gray-400 p-2.5 rounded bg-gray-50/50">
          <p className="font-bold underline mb-1">Ketentuan Pengisian:</p>
          <ol className="list-decimal pl-4 space-y-0.5 text-[11px] leading-snug text-gray-800">
            <li>Data diisi berdasarkan kondisi riil pelaksanaan kegiatan.</li>
            <li>Target mengacu pada dokumen perencanaan atau Perjanjian Kinerja.</li>
            <li>Realisasi harus didukung dokumen yang sah.</li>
            <li>Setiap data wajib mencantumkan periode pelaporan.</li>
            <li>Satuan data harus sesuai dengan indikator kinerja.</li>
            <li>Sumber data dan bukti dukung wajib dicantumkan.</li>
            <li>Data disampaikan oleh penanggung jawab sesuai batas waktu yang telah ditetapkan.</li>
          </ol>
        </div>

        {/* Tanda Tangan Resmi Kepala Dinas */}
        <div className="text-center flex flex-col items-center justify-between pl-8">
          <div>
            <p className="text-xs">Masamba, 10 September 2026</p>
            <p className="text-xs font-bold mt-0.5">Kepala Dinas Transmigrasi & Tenaga Kerja</p>
            <p className="text-xs font-semibold text-gray-700">Kabupaten Luwu Utara</p>
          </div>

          <div className="my-8 relative">
            {/* Simulating official round stamp & signature */}
            <div className="w-24 h-24 rounded-full border-2 border-blue-700 border-dashed opacity-40 absolute -left-6 -top-5 flex items-center justify-center rotate-12 pointer-events-none">
              <span className="text-[7px] text-blue-800 font-bold uppercase text-center">
                Dinas Transmigrasi & Tenaga Kerja * Luwu Utara *
              </span>
            </div>
            <div className="font-serif italic text-blue-900 text-lg opacity-85 select-none font-bold">
              Ir. Arief R. Palallo
            </div>
          </div>

          <div>
            <p className="text-xs font-extrabold underline uppercase">Ir. ARIEF R. PALALLO, MM</p>
            <p className="text-[11px] text-gray-800">Pkt : Pembina Utama Muda</p>
            <p className="text-[11px] text-gray-800">NIP : 19660925 199703 1 001</p>
          </div>
        </div>
      </div>
    </div>
  );
};
