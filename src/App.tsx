import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  LKETab,
  User,
  CapaianKinerjaItem,
  LKEEvaluationComponent,
  LKECriteriaItem,
  DokumenSAKIPItem,
} from './types/sakip';
import { StorageService } from './services/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PrintModal } from './components/PrintModal';
import { DashboardCapaian } from './views/DashboardCapaian';
import { DashboardMonitoring } from './views/DashboardMonitoring';
import { PenilaianMandiri } from './views/PenilaianMandiri';
import { DataLKEView } from './views/DataLKEView';
import { DokumenSAKIPView } from './views/DokumenSAKIPView';
import { KelolaOperatorView } from './views/KelolaOperatorView';
import { LoginView } from './views/LoginView';

export default function App() {
  // Authentication & Users
  const [allUsers, setAllUsers] = useState<User[]>(() => StorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => StorageService.getIsLoggedIn());

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard-capaian');
  const [activeLKETab, setActiveLKETab] = useState<LKETab>('penjelasan');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  // Search & Print
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Data
  const [capaianItems, setCapaianItems] = useState<CapaianKinerjaItem[]>(() =>
    StorageService.getCapaianKinerja()
  );
  const [lkeComponents, setLkeComponents] = useState<LKEEvaluationComponent[]>(() =>
    StorageService.getLKEComponents()
  );
  const [lkeCriteria, setLkeCriteria] = useState<LKECriteriaItem[]>(() =>
    StorageService.getLKECriteria()
  );
  const [documents, setDocuments] = useState<DokumenSAKIPItem[]>(() =>
    StorageService.getDokumenSAKIP()
  );

  // Save Handlers
  const handleSaveCapaian = (newItems: CapaianKinerjaItem[]) => {
    setCapaianItems(newItems);
    StorageService.saveCapaianKinerja(newItems);
  };

  const handleSaveLKEComponents = (newComp: LKEEvaluationComponent[]) => {
    setLkeComponents(newComp);
    StorageService.saveLKEComponents(newComp);
  };

  const handleSaveLKECriteria = (newCrit: LKECriteriaItem[]) => {
    setLkeCriteria(newCrit);
    StorageService.saveLKECriteria(newCrit);
  };

  const handleSaveDocuments = (newDocs: DokumenSAKIPItem[]) => {
    setDocuments(newDocs);
    StorageService.saveDokumenSAKIP(newDocs);
  };

  const handleSaveUsers = (newUsers: User[]) => {
    setAllUsers(newUsers);
    StorageService.saveUsers(newUsers);
  };

  const handleSwitchUser = (targetUser: User) => {
    setCurrentUser(targetUser);
    StorageService.setCurrentUser(targetUser);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    StorageService.setIsLoggedIn(false);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    setIsLoggedIn(true);
    StorageService.setIsLoggedIn(true);
  };

  const handleRegisterUser = (newUser: User) => {
    const updated = [...allUsers, newUser];
    handleSaveUsers(updated);
  };

  // Breadcrumb helper
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard-capaian':
        return { label: 'Dashboard', sub: 'Capaian Kinerja (19 IKP)' };
      case 'dashboard-monitoring':
        return { label: 'Dashboard', sub: 'Monitoring Kinerja' };
      case 'evaluasi-mandiri':
        return { label: 'Evaluasi Kinerja', sub: 'Penilaian Mandiri SAKIP' };
      case 'evaluasi-lke':
        return { label: 'Evaluasi Kinerja', sub: 'Data LKE SAKIP' };
      case 'dokumen-sakip':
        return { label: 'Dokumen SAKIP', sub: 'Arsip & Eviden Digital' };
      case 'kelola-operator':
        return { label: 'Pengaturan Sistem', sub: 'Kelola Akun Operator' };
      default:
        return { label: 'Dashboard' };
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        allUsers={allUsers}
        onRegister={handleRegisterUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Sidebar (Navy Blue matching user screenshot) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeLKETab={activeLKETab}
        setActiveLKETab={setActiveLKETab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <Header
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          allUsers={allUsers}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          searchQuery={globalSearchQuery}
          setSearchQuery={setGlobalSearchQuery}
          breadcrumb={getBreadcrumb()}
          onLogout={handleLogout}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard-capaian' && (
            <DashboardCapaian
              items={capaianItems}
              onSaveItems={handleSaveCapaian}
              currentUser={currentUser}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              globalSearchQuery={globalSearchQuery}
            />
          )}

          {activeTab === 'dashboard-monitoring' && (
            <DashboardMonitoring
              items={capaianItems}
              lkeComponents={lkeComponents}
              onNavigateToCapaian={() => setActiveTab('dashboard-capaian')}
            />
          )}

          {activeTab === 'evaluasi-mandiri' && (
            <PenilaianMandiri
              components={lkeComponents}
              onSaveComponents={handleSaveLKEComponents}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'evaluasi-lke' && (
            <DataLKEView
              activeSubTab={activeLKETab}
              setActiveSubTab={setActiveLKETab}
              components={lkeComponents}
              onSaveComponents={handleSaveLKEComponents}
              criteria={lkeCriteria}
              onSaveCriteria={handleSaveLKECriteria}
              currentUser={currentUser}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              globalSearchQuery={globalSearchQuery}
            />
          )}

          {activeTab === 'dokumen-sakip' && (
            <DokumenSAKIPView
              documents={documents}
              onSaveDocuments={handleSaveDocuments}
              currentUser={currentUser}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              globalSearchQuery={globalSearchQuery}
            />
          )}

          {activeTab === 'kelola-operator' && (
            <KelolaOperatorView
              users={allUsers}
              onSaveUsers={handleSaveUsers}
              currentUser={currentUser}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <p>
              LAPAK KINERJA • Sistem Akuntabilitas Kinerja Instansi Pemerintah (SAKIP) Dinas Transmigrasi dan Tenaga Kerja
            </p>
            <p className="text-slate-400">
              Pemerintah Kabupaten Luwu Utara • Masamba
            </p>
          </div>
        </footer>
      </div>

      {/* Official Print Modal with Kop Surat Luwu Utara */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        items={capaianItems}
      />
    </div>
  );
}
