"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CampaignHistory from './components/CampaignHistory';
import CampaignForm from './components/CampaignForm';
import UserInfo from './components/UserInfo';
import WalletInfo from './components/WalletInfo';
import StatsBar from './components/StatsBar';
import ConfirmationModal from './components/ConfirmationModal';

// Icons
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;


// Credit Packages Component
const CreditPackages = () => {
  const packages = [
    { name: 'S', price: 1000, color: 'bg-green-500' },
    { name: 'M', price: 2000, color: 'bg-blue-500' },
    { name: 'L', price: 3000, color: 'bg-purple-500' },
    { name: 'XL', price: 4000, color: 'bg-yellow-500' },
    { name: 'XXL', price: 5000, color: 'bg-red-500' },
  ];

  const handleTopUp = (price) => {
    const message = `สวัสดีครับ สนใจเติมเครดิตแพ็กเกจ ${price.toLocaleString()} บาทครับ`;
    const telegramUrl = `https://t.me/agentacsms?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-center mb-8 text-orange-500">เลือกแพ็กเกจเติมเครดิต</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div key={pkg.name} className="bg-white/90 border border-gray-200 rounded-2xl shadow-lg p-6 text-center flex flex-col items-center hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className={`text-4xl font-bold ${pkg.color} text-white w-20 h-20 rounded-full flex items-center justify-center mb-4`}>
              {pkg.name}
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-4">{pkg.price.toLocaleString()} บาท</p>
            <button
              onClick={() => handleTopUp(pkg.price)}
              className="mt-auto w-full bg-orange-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105"
            >
              เติมเครดิต
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [recipientsText, setRecipientsText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [senderNames, setSenderNames] = useState([]);
  const [selectedSender, setSelectedSender] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credit, setCredit] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [profile, setProfile] = useState(null);
  const [formError, setFormError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const current = {
    bg: '',
    card: 'bg-white border border-orange-100 shadow',
    text: 'text-gray-900',
    btn: 'bg-orange-500 text-white hover:bg-orange-600',
    count: 'text-orange-700',
    label: 'text-orange-600',
  };

  const fetchInitialData = async () => {
    try {
      const [campaignsRes, sendersRes, creditRes, profileRes] = await Promise.all([
        fetch('/api/get-campaigns'),
        fetch('/api/get-senders'),
        fetch('/api/get-credit'),
        fetch('/api/get-profile'),
      ]);
      
      const campaignsData = await campaignsRes.json();
      if (campaignsData.success) setCampaigns(campaignsData.campaigns);

      const sendersData = await sendersRes.json();
      if (sendersData.success && sendersData.senders.length > 0) {
        setSenderNames(sendersData.senders);
        setSelectedSender(sendersData.senders[0]);
      }

      const creditData = await creditRes.json();
      if (creditData.success) setCredit(creditData.credit);

      const profileData = await profileRes.json();
      if (profileData.success) setProfile(profileData.profile);

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  // Unified onChange handler for CampaignForm
  const handleFormChange = (field, value) => {
    setFormError('');
    if (field === 'campaignName') setCampaignName(value);
    else if (field === 'recipientsText') setRecipientsText(value);
    else if (field === 'messageText') setMessageText(value);
    else if (field === 'selectedSender') setSelectedSender(value);
  };

  // Open PIN modal instead of sending directly
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!campaignName || !recipientsText || !messageText || !selectedSender) {
      setFormError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    setPinInput('');
    setIsModalOpen(true);
  };

  const handleOpenModal = (event) => {
    event.preventDefault();
    if (!campaignName || !recipientsText || !messageText || !selectedSender) {
      setAlert({ message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง', type: 'error' });
      return;
    }
    setPinInput('');
    setIsModalOpen(true);
  };

  const handleConfirmSend = async () => {
    const recipients = recipientsText.split('\n').map(r => r.trim()).filter(r => r);
    setIsLoading(true);
    setAlert({ message: '', type: '' });
    try {
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          recipients,
          messageText,
          senderName: selectedSender,
          pin: pinInput
        }),
      });
      const result = await response.json();
      if (result.success) {
        setAlert({ message: result.message, type: 'success' });
        setCampaignName('');
        setRecipientsText('');
        setMessageText('');
        fetchInitialData();
      } else {
        setAlert({ message: result.message, type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (campaignId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแคมเปญนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
        return;
    }
    setIsLoading(true);
    setAlert({ message: '', type: '' });
    try {
      const response = await fetch('/api/delete-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      const result = await response.json();
      if (result.success) {
        setAlert({ message: result.message, type: 'success' });
        fetchInitialData();
      } else {
        setAlert({ message: result.message, type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCampaign = async (formData) => {
    setIsLoading(true);
    setAlert({ message: '', type: '' });
    try {
      const recipients = formData.recipientsText.split('\n').map(r => r.trim()).filter(r => r);
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.campaignName,
          recipients,
          messageText: formData.messageText,
          senderName: formData.selectedSender,
          url: formData.url,
          pin: formData.pin,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setAlert({ message: result.message, type: 'success' });
        fetchInitialData();
      } else {
        setAlert({ message: result.message, type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSend}
        campaignName={campaignName}
        recipientCount={recipientsText.split('\n').map(r => r.trim()).filter(r => r).length}
        pin={pinInput}
        setPin={setPinInput}
        isLoading={isLoading}
        theme="professional"
      />
      <div className={`min-h-screen ${current.bg} ${current.text} font-sans transition-all duration-300 flex`}> 
        
        {/* Mobile Overlay */}
        <div 
          className={`fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMenuOpen(false)}
        ></div>

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-full w-64 bg-white/95 border-r border-[var(--color-border)] shadow-xl z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-end p-2 md:hidden">
            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-200">
              <XIcon />
            </button>
          </div>
          <div className="flex flex-col gap-6 md:gap-8 p-4 md:py-8">
            <UserInfo profile={profile} currentTheme="professional" />
            <WalletInfo profile={profile} currentTheme="professional" />
            <div className="flex flex-col w-full justify-center items-center gap-4 md:gap-8 mt-4">
              <button onClick={() => { setActiveTab('create'); setIsMenuOpen(false); }} className={`w-full px-8 py-3 rounded-2xl font-bold border-2 shadow-lg transition-all text-xl ${activeTab === 'create' ? 'bg-[var(--color-primary)] text-white border-lime-400 scale-105 ring-2 ring-lime-300' : 'bg-white text-[var(--color-text-main)] border-transparent hover:border-orange-400 hover:bg-orange-50 hover:scale-105'}`}>สร้างแคมเปญใหม่</button>
              <button onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} className={`w-full px-8 py-3 rounded-2xl font-bold border-2 shadow-lg transition-all text-xl ${activeTab === 'history' ? 'bg-[var(--color-primary)] text-white border-lime-400 scale-105 ring-2 ring-lime-300' : 'bg-white text-[var(--color-text-main)] border-transparent hover:border-orange-400 hover:bg-orange-50 hover:scale-105'}`}>ประวัติแคมเปญ</button>
              <button onClick={() => { setActiveTab('topup'); setIsMenuOpen(false); }} className={`w-full px-8 py-3 rounded-2xl font-bold border-2 shadow-lg transition-all text-xl ${activeTab === 'topup' ? 'bg-[var(--color-primary)] text-white border-lime-400 scale-105 ring-2 ring-lime-300' : 'bg-white text-[var(--color-text-main)] border-transparent hover:border-orange-400 hover:bg-orange-50 hover:scale-105'}`}>เติมเครดิต</button>
              <button onClick={() => { setActiveTab('contact'); setIsMenuOpen(false); }} className={`w-full px-8 py-3 rounded-2xl font-bold border-2 shadow-lg transition-all text-xl ${activeTab === 'contact' ? 'bg-[var(--color-primary)] text-white border-lime-400 scale-105 ring-2 ring-lime-300' : 'bg-white text-[var(--color-text-main)] border-transparent hover:border-orange-400 hover:bg-orange-50 hover:scale-105'}`}>ติดต่อเรา</button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col w-full">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-white/90 sticky top-0 z-20">
            <button onClick={() => setIsMenuOpen(true)} className="p-2">
              <MenuIcon />
            </button>
            <h1 className="text-xl font-bold text-orange-500 -translate-x-1/2 left-1/2 relative">AUTOSMSAPI</h1>
          </header>

          {/* Main Content */}
          <main className="flex-1 min-h-screen bg-[var(--color-bg-main)] p-4 sm:p-8 lg:p-12">
            <div className="hidden md:flex flex-col items-center mb-10">
              <h1 className="text-6xl font-extrabold tracking-wide animate-pulse mb-4 drop-shadow-lg" style={{letterSpacing: '0.18em', color: '#F07300'}}>AUTOSMSAPI</h1>
            </div>
            {alert.message && (<div className={`p-5 mb-8 rounded-2xl font-semibold border-2 shadow-xl text-center ${alert.type === 'success' ? `bg-green-900/60 text-green-300 border-green-700` : `bg-red-900/60 text-red-300 border-red-700`} animate-pulse`}>{alert.message}</div>)}
            
            {/* Tab Content */}
            {activeTab === 'create' && (
              <div className="max-w-2xl mx-auto w-full">
                <StatsBar recipientsText={recipientsText} messageText={messageText} />
                <CampaignForm
                  campaignName={campaignName}
                  recipientsText={recipientsText}
                  messageText={messageText}
                  selectedSender={selectedSender}
                  senderNames={senderNames}
                  onChange={handleFormChange}
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                  theme="professional"
                  error={formError}
                />
              </div>
            )}
            {activeTab === 'history' && (
              <div className="max-w-3xl mx-auto w-full">
                <CampaignHistory campaigns={campaigns} onDelete={handleDelete} onRefresh={fetchInitialData} theme="professional" />
              </div>
            )}
            {activeTab === 'topup' && (
              <CreditPackages />
            )}
            {activeTab === 'contact' && (
              <div className={`max-w-xl mx-auto rounded-2xl shadow-2xl p-12 border-4 border-blue-900 bg-black/95 text-center mt-12 animate-fade-in`}>
                <h2 className="text-3xl font-bold mb-6 text-blue-300 drop-shadow">ติดต่อเรา</h2>
                <div className="text-lg text-white">Line: <a href="https://t.me/agentacsms" className="text-lime-400 hover:underline">@agsms</a></div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
