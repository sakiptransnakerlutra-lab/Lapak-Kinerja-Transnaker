import React, { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield,
  Activity,
  CheckCircle2,
  FolderArchive,
  BarChart3,
  Award,
} from 'lucide-react';
import { ActiveTab, LKETab, User } from '../types/sakip';
import logoLuwuUtara from '../assets/logo_luwu_utara.png';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeLKETab: LKETab;
  setActiveLKETab: (tab: LKETab) => void;
  currentUser: User;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeLKETab,
  setActiveLKETab,
  currentUser,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [evaluasiOpen, setEvaluasiOpen] = useState(true);
  const [dataLKEOpen, setDataLKEOpen] = useState(true);

  const isAdmin = currentUser.role === 'admin';

  const handleNav = (tab: ActiveTab, lkeSub?: LKETab) => {
    setActiveTab(tab);
    if (lkeSub) {
      setActiveLKETab(lkeSub);
    }
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  const isLKEActive = activeTab === 'evaluasi-lke';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0b172c] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out border-r border-[#172a4b] lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-[#182949] flex items-center gap-3">
          {/* Logo Asli Luwu Utara yang diunggah pengguna */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              src={logoLuwuUtara}
              alt="Logo Kabupaten Luwu Utara"
              className="h-12 w-auto object-contain filter-none"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-sm tracking-wide text-white">LAPAK KINERJA</span>
              <span className="bg-blue-600/80 text-[10px] font-bold px-1.5 py-0.2 rounded text-blue-100 uppercase tracking-wider border border-blue-400/40">
                SAKIP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
              Dinas Transnaker Luwu Utara
            </p>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs scrollbar-thin scrollbar-thumb-slate-700">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Menu Navigasi
            </p>

            {/* Menu: Dashboard (Expandable) */}
            <div className="space-y-1">
              <button
                onClick={() => setDashboardOpen(!dashboardOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab.startsWith('dashboard')
                    ? 'text-white bg-blue-600/20 text-blue-300'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-xs">Dashboard</span>
                </div>
                {dashboardOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {dashboardOpen && (
                <div className="pl-9 pr-1 space-y-1">
                  <button
                    onClick={() => handleNav('dashboard-capaian')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md font-medium text-xs transition-colors flex items-center justify-between ${
                      activeTab === 'dashboard-capaian'
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>Capaian Kinerja</span>
                    <span className="text-[10px] opacity-75">19 IKP</span>
                  </button>

                  <button
                    onClick={() => handleNav('dashboard-monitoring')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md font-medium text-xs transition-colors flex items-center justify-between ${
                      activeTab === 'dashboard-monitoring'
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>Monitoring</span>
                    <Activity className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Menu: Evaluasi Kinerja (Expandable) */}
            <div className="space-y-1 mt-2">
              <button
                onClick={() => setEvaluasiOpen(!evaluasiOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab.startsWith('evaluasi')
                    ? 'text-white bg-blue-600/20 text-blue-300'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-xs">Evaluasi Kinerja</span>
                </div>
                {evaluasiOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {evaluasiOpen && (
                <div className="pl-6 space-y-1">
                  {/* Submenu: Penilaian Mandiri */}
                  <button
                    onClick={() => handleNav('evaluasi-mandiri')}
                    className={`w-full text-left py-1.5 px-3 rounded-md font-medium text-xs transition-colors flex items-center gap-2 ${
                      activeTab === 'evaluasi-mandiri'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Penilaian Mandiri</span>
                  </button>

                  {/* Submenu: Data LKE (Expandable with sub-submenus) */}
                  <div className="space-y-0.5 pt-1">
                    <button
                      onClick={() => {
                        setDataLKEOpen(!dataLKEOpen);
                        handleNav('evaluasi-lke', activeLKETab);
                      }}
                      className={`w-full flex items-center justify-between py-1.5 px-3 rounded-md font-medium text-xs transition-colors ${
                        isLKEActive
                          ? 'text-blue-300 font-semibold bg-white/5'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FolderArchive className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Data LKE</span>
                      </div>
                      {dataLKEOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    {dataLKEOpen && (
                      <div className="pl-6 pr-1 space-y-0.5 border-l border-slate-700/50 ml-4 py-1">
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
                        ].map((sub) => {
                          const isActive = isLKEActive && activeLKETab === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleNav('evaluasi-lke', sub.id)}
                              className={`w-full text-left py-1 px-2.5 rounded text-[11px] transition-colors truncate block ${
                                isActive
                                  ? 'bg-blue-600 text-white font-medium shadow-2xs'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              }`}
                              title={sub.label}
                            >
                              • {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu: Dokumen SAKIP */}
            <div className="mt-2">
              <button
                onClick={() => handleNav('dokumen-sakip')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'dokumen-sakip'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-xs">Dokumen SAKIP</span>
                </div>
                <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                  XLSX/PDF
                </span>
              </button>
            </div>
          </div>

          {/* Section: Pengaturan Sistem */}
          <div className="pt-2 border-t border-[#172a4b]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Pengaturan Sistem
            </p>

            <button
              onClick={() => handleNav('kelola-operator')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'kelola-operator'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-xs">Kelola Operator</span>
              </div>
              {isAdmin ? (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/30">
                  Admin
                </span>
              ) : (
                <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                  Lihat
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer: User Profile & Logout (matching user screenshot) */}
        <div className="p-3 border-t border-[#182949] bg-[#081223] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-400/30">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 capitalize truncate">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Operator Bidang'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors flex-shrink-0"
            title="Keluar / Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
