import React from 'react';
import {
  Search,
  Printer,
  ShieldCheck,
  User as UserIcon,
  Menu,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from '../types/sakip';

interface HeaderProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onOpenPrintModal: () => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  breadcrumb: { label: string; sub?: string };
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  allUsers,
  onOpenPrintModal,
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  breadcrumb,
  onLogout,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="truncate">{breadcrumb.label}</span>
              {breadcrumb.sub && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-800 font-semibold truncate">{breadcrumb.sub}</span>
                </>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {breadcrumb.sub || breadcrumb.label}
            </h1>
          </div>
        </div>

        {/* Right: Quick Search, Role Switcher, Print Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Quick Search Input */}
          <div className="relative hidden md:block w-52 lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari data, IKK, dokumen..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 px-1 rounded bg-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Role Toggle Selector (as shown in user mockup) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                const adminUser =
                  allUsers.find((u) => u.email === 'sakip.transnakerlutra@gmail.com') ||
                  allUsers.find((u) => u.role === 'admin') ||
                  allUsers[0];
                onSwitchUser(adminUser);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                isAdmin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Ganti ke peran Administrator (Hak akses penuh kelola & hapus)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => {
                const opUser = allUsers.find((u) => u.role === 'operator') || allUsers[1];
                if (opUser) onSwitchUser(opUser);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                !isAdmin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Ganti ke peran Operator (Hak akses lihat, input & edit)"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Operator</span>
            </button>
          </div>

          {/* Cetak Button (matching user mockup) */}
          <button
            onClick={onOpenPrintModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-2xs transition-colors"
            title="Cetak Laporan Resmi SAKIP (Format Kop Surat Luwu Utara)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          {/* Current User Quick Info & Logout */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-950 text-white text-xs font-bold flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left text-[11px] leading-tight max-w-[120px]">
              <p className="font-semibold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-slate-400 capitalize truncate">{currentUser.unit || currentUser.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              title="Keluar / Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
