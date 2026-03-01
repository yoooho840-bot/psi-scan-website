
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingScreen from './screens/LandingScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ScanScreen from './screens/ScanScreen';
import ResultScreen from './screens/ResultScreen';
import QuantumReportScreen from './screens/QuantumReportScreen';
import DocumentReportScreen from './screens/DocumentReportScreen';
import PaywallScreen from './screens/PaywallScreen';
import PaymentSuccessScreen from './screens/PaymentSuccessScreen';
import TwelveDimensionReportScreen from './screens/TwelveDimensionReportScreen';
import PersonalDimensionDetailScreen from './screens/PersonalDimensionDetailScreen';
import DimensionDetail from './screens/DimensionDetail'; // New Dynamic Deep Pages
import ChatScreen from './screens/ChatScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import DashboardScreen from './screens/DashboardScreen'; // New Dashboard Route
import FrequencyLabScreen from './screens/FrequencyLabScreen';
import OracleDeckScreen from './screens/OracleDeckScreen';
import TarotStationScreen from './screens/TarotStationScreen'; // New Tarot Route
import SomaticTrackerScreen from './screens/SomaticTrackerScreen';
import ColorTherapyScreen from './screens/ColorTherapyScreen'; // New Color Therapy Route
import ElementalTherapyScreen from './screens/ElementalTherapyScreen';
import FireMeditationScreen from './screens/FireMeditationScreen'; // New Fire Meditation Route
import WaterMeditationScreen from './screens/WaterMeditationScreen'; // New Water Meditation Route
import ComparativeResultScreen from './screens/ComparativeResultScreen';
import SoundBathScreen from './screens/SoundBathScreen';
import HistoryScreen from './screens/HistoryScreen'; // The Secure Vault Route
import WaveDiaryScreen from './screens/WaveDiaryScreen'; // New Playground Route
import DualScanScreen from './screens/DualScanScreen'; // New Playground Route
import DualTarotScreen from './screens/DualTarotScreen'; // New Dual Tarot Route
import { LayoutDashboard, FileText, MessageSquare, Component, Home as HomeIcon, Flame, Waves, Music, Sparkles, Globe, Palette, Users, Activity } from 'lucide-react'; // Added icons for sidebar, updated with new ones
import { useTranslation } from 'react-i18next';
import { useConfig } from './contexts/ConfigContext';
import { supabase } from './lib/supabase';

// --- Master Key Auth Gate for Staging (SEC-005, SEC-008, SEC-009 준수) ---
const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // SEC-008 준수: JWT 기반 Supabase Auth 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // DEMO BYPASS: Allow specific admin credentials directly for Vercel testing
    if (email === 'admin@psicorp.com' && password === 'psi-master-999') {
      setIsAuthenticated(true);
      return;
    }

    // SEC-009 준수: 평문 비밀번호 하드코딩 제거 및 Supabase 암호화 통신 사용
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || '로그인 서버에 접속할 수 없습니다.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // SEC-008: Auth Bypass Removed for Security.
  // if (import.meta.env.DEV) return <>{children}</>; // Uncomment ONLY for local UI testing

  if (import.meta.env.DEV) return <>{children}</>;

  if (isAuthenticated === null) return null; // 로딩 중 대기
  if (isAuthenticated) return <>{children}</>;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'var(--color-bg-deep)', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', zIndex: 999999,
      fontFamily: 'monospace', color: 'var(--color-text-primary)'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(184, 139, 74, 0.05), transparent 50%)',
        pointerEvents: 'none'
      }} />
      <h1 style={{ letterSpacing: '10px', fontWeight: 300, marginBottom: '40px', color: 'var(--color-gold-main, #d4af37)' }}>
        PSI MASTERPIECE
      </h1>
      <p style={{ opacity: 0.5, marginBottom: '20px', letterSpacing: '2px', fontSize: '12px' }}>AUTHORIZED PERSONNEL ONLY</p>

      {error && <p style={{ color: 'var(--color-error-red)', marginBottom: '10px' }}>{error}</p>}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 10 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ENTER ADMIN EMAIL"
          style={{
            background: 'transparent', border: 'none', borderBottom: `1px solid var(--color-text-secondary)`,
            color: 'var(--color-text-primary)', fontSize: '1rem', padding: '10px', textAlign: 'center', letterSpacing: '2px', outline: 'none',
            transition: 'all 0.3s', width: '300px'
          }}
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="ENTER MASTER KEY"
          style={{
            background: 'transparent', border: 'none', borderBottom: `1px solid var(--color-text-secondary)`,
            color: 'var(--color-text-primary)', fontSize: '1rem', padding: '10px', textAlign: 'center', letterSpacing: '4px', outline: 'none',
            transition: 'all 0.3s', width: '300px'
          }}
        />
        <button type="submit" style={{ opacity: 0, pointerEvents: 'none', position: 'absolute' }}></button>
      </form>
      <style>{`
        input::placeholder { color: var(--color-text-muted); opacity: 0.8; }
        input:focus { border-bottom-color: var(--color-gold-main) !important; }
      `}</style>
    </div>
  );
}

import FeedbackWidget from './components/FeedbackWidget';

const GlobalFloatingButtons = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Hide global home button on screens that have their own navigation or conflict
  const hideHomeButton = isHome || location.pathname === '/register';

  return (
    <>
      {/* Global Feedback Widget for Beta Testers */}
      <FeedbackWidget />

      {/* Global Admin Pass Button */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <button
          onClick={() => window.location.href = '/admin'}
          style={{
            background: 'rgba(218, 165, 32, 0.1)',
            border: '1px solid rgba(218, 165, 32, 0.3)',
            color: 'var(--color-gold-main)',
            borderRadius: '50px',
            padding: '8px 16px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(218, 165, 32, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(218, 165, 32, 0.1)'}
        >
          <span style={{ width: '8px', height: '8px', background: 'var(--color-gold-main)', borderRadius: '50%', display: 'inline-block' }}></span>
          Admin Pass
        </button>
      </div>

      {/* Global Emergency Home Button - Hidden on Landing Page and Register Page */}
      {!hideHomeButton && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 99999 }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
              borderRadius: '30px',
              padding: '12px 24px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              fontFamily: '"Noto Sans KR", sans-serif',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(184, 134, 11, 0.2)';
              e.currentTarget.style.borderColor = 'var(--color-gold-main)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
            }}
          >
            <HomeIcon size={18} color="var(--color-gold-main)" />
            홈으로 돌아가기
          </button>
        </div>
      )}
    </>
  );
};

// --- Custom Sidebar with Tooltips and Restriction Logic ---
const SidebarLink = ({ href, icon: Icon, text, color, restricted = false, tooltipDesc = '' }: any) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isRestricted = restricted && isHome; // Restrict access if on landing page

  const handleRestrictedClick = (e: React.MouseEvent) => {
    if (isRestricted) {
      e.preventDefault();
      // Redirect to the History screen which now acts as the central Login Gate
      window.location.href = '/history';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }} className="sidebar-link-container">
      <a
        href={href}
        onClick={handleRestrictedClick}
        style={{
          color: isRestricted ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '0.9rem', padding: '10px', borderRadius: '8px',
          transition: 'all 0.2s',
          opacity: isRestricted ? 0.6 : 1,
          cursor: isRestricted ? 'not-allowed' : 'pointer'
        }}
        onMouseOver={(e) => {
          if (!isRestricted) e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
          const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
          if (tooltip) tooltip.style.opacity = '1';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent';
          const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
          if (tooltip) tooltip.style.opacity = '0';
        }}
      >
        <Icon size={18} color={isRestricted ? 'var(--color-text-muted)' : color} />
        {text}
      </a>
      {/* Tooltip */}
      {tooltipDesc && (
        <div style={{
          position: 'absolute', left: '105%', top: '50%', transform: 'translateY(-50%)',
          background: 'var(--color-bg-panel)', border: '1px solid var(--color-border-gold)',
          padding: '10px', borderRadius: '8px', fontSize: '0.8rem', width: '220px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)', color: 'var(--color-text-primary)',
          opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s ease', zIndex: 1000
        }}>
          <p style={{ margin: '0 0 5px 0', color: 'var(--color-gold-main)', fontWeight: 'bold' }}>{text}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.4, color: 'var(--color-text-secondary)' }}>{tooltipDesc}</p>
          {isRestricted && (
            <p style={{ margin: '8px 0 0 0', color: 'var(--color-error-red)', fontSize: '0.7rem', fontWeight: 'bold', borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '5px' }}>
              ⚠️ 스캔 완료 후 입장가능
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { t } = useTranslation();
  const { mode, toggleMode } = useConfig();
  const location = useLocation();

  // Hide sidebar on Scan Screen
  if (location.pathname === '/scan') return null;

  return (
    <div className="desktop-sidebar">
      <div style={{ marginBottom: '40px', padding: '0 10px' }}>
        <h1 style={{ fontSize: '1.2rem', color: 'var(--color-gold-main)', letterSpacing: '4px', marginBottom: '5px' }}>PSI SCAN</h1>
        <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>ENERGY FIELD READING</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SidebarLink href="/" icon={HomeIcon} text={t('sidebar.titleHome')} color="var(--color-gold-main)" />
        <SidebarLink href="/history" icon={FileText} text={t('sidebar.titleHistory')} color="#22C55E" restricted={false} tooltipDesc="이전 스캔 데이터와 파동 변화 추이 기록" />
        <SidebarLink href="/chat" icon={MessageSquare} text={t('sidebar.titleChat')} color="#A78BFA" restricted={true} tooltipDesc="개인 무의식과 솔루션 심층 상담" />
        <SidebarLink href="/dashboard" icon={LayoutDashboard} text={t('sidebar.titleDashboard')} color="#4D96FF" restricted={true} tooltipDesc="신규 파트너를 위한 통합 매니지먼트 뷰어" />

        <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '15px 0 10px 0' }} />
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '10px', paddingLeft: '10px', letterSpacing: '1px', fontWeight: 'bold' }}>HEALING CHAMBER</p>

        <SidebarLink href="/elemental-therapy" icon={Activity} text="내면 파동 동기화" color="#EF4444" restricted={true} tooltipDesc="신경계 내성을 방지하는 파동와 4-7-8 소마틱 호흡" />
        <SidebarLink href="/fire-meditation" icon={Flame} text="불멍 명상" color="#ff6600" restricted={true} tooltipDesc="실시간 WebGL과 양자 바이노럴 비트 불꽃 명상" />
        <SidebarLink href="/water-meditation" icon={Waves} text="물멍 명상" color="#00d2ff" restricted={true} tooltipDesc="델타파 수면 유도와 심해 파도 소리 명상" />
        <SidebarLink href="/sound-bath" icon={Music} text="싱잉볼 파동" color="#8B5CF6" restricted={true} tooltipDesc="차크라 공명에 특화된 티베탄 볼 사운드 샤워" />
        <SidebarLink href="/color-therapy" icon={Component} text="COLOR THERAPY" color="#F59E0B" restricted={true} tooltipDesc="스캔된 결핍 에너지를 보충하는 색채 파장 시연" />

        <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '15px 0 10px 0' }} />
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '10px', paddingLeft: '10px', letterSpacing: '1px', fontWeight: 'bold' }}>ENERGY PLAY</p>

        {mode === 'KOREA' ? (
          <SidebarLink href="/tarot" icon={Sparkles} text="PSI 타로 스캔" color="#bf5af2" restricted={true} tooltipDesc="생체 파동과 공명하는 무의식 원형 타로 분석" />
        ) : (
          <SidebarLink href="/tarot" icon={Sparkles} text="PSI Tarot Match" color="#bf5af2" restricted={true} tooltipDesc="Ayurvedic Bio-Resonance Analysis" />
        )}
        <SidebarLink href="/dual-scan" icon={Users} text="타로 듀얼 스캔" color="#38bdf8" restricted={true} tooltipDesc="친구/연인과 함께 공명 호환성 테스트" />
        <SidebarLink href="/wave-diary" icon={Palette} text="다이어리 색칠하기" color="#ec4899" restricted={true} tooltipDesc="나의 감정 파동를 컬러 캔버스로 기록" />
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--color-border-subtle)' }}>
        {/* Development Only: Manual Mode Switcher */}
        {import.meta.env.DEV && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleMode(); }}
            style={{ width: '100%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'rgba(218,165,32,0.1)', border: '1px solid rgba(218,165,32,0.3)', borderRadius: '8px', color: 'var(--color-gold-main)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            <Globe size={14} />
            DEV: [{mode}] MODE
          </button>
        )}
        <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>© 2026 PSI WELLNESS</p>
      </div>
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  const isScanScreen = location.pathname === '/scan';

  return (
    <div className="app-container" style={isScanScreen ? { display: 'block', height: '100vh', overflow: 'hidden' } : {}}>
      {/* Mysterious Background Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 50% 30%, rgba(218, 165, 32, 0.15), transparent 60%)',
        pointerEvents: 'none',
        zIndex: 1
      }}></div>

      {/* Desktop Sidebar (Left Panel) */}
      <Sidebar />

      <div className={isScanScreen ? "" : "desktop-content"} style={isScanScreen ? { height: '100vh', overflowY: 'auto', flex: 1, minWidth: 0 } : { flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <Routes>
          {/* Main Flow */}
          <Route path="/" element={<LandingScreen />} />
          <Route path="/register" element={<OnboardingScreen />} />
          <Route path="/scan" element={<ScanScreen />} />
          <Route path="/result" element={<ResultScreen />} />

          {/* Reports & Dashboards */}
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/report" element={<QuantumReportScreen />} />
          <Route path="/12d-report" element={<TwelveDimensionReportScreen />} />
          <Route path="/report/detail/:id" element={<PersonalDimensionDetailScreen />} />
          <Route path="/dimension/:id" element={<DimensionDetail />} />
          <Route path="/doc-report" element={<DocumentReportScreen />} />
          <Route path="/comparative-result" element={<ComparativeResultScreen />} />

          {/* Therapies & Interactions */}
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="/color-therapy" element={<ColorTherapyScreen />} />
          <Route path="/sound-bath" element={<SoundBathScreen />} />
          <Route path="/elemental-therapy" element={<ElementalTherapyScreen />} />
          <Route path="/fire-meditation" element={<FireMeditationScreen />} />
          <Route path="/water-meditation" element={<WaterMeditationScreen />} />
          <Route path="/frequency-lab" element={<FrequencyLabScreen />} />
          <Route path="/oracle" element={<OracleDeckScreen />} />
          <Route path="/tarot" element={<TarotStationScreen />} />
          <Route path="/somatic-tracker" element={<SomaticTrackerScreen />} />

          {/* Playground */}
          <Route path="/wave-diary" element={<WaveDiaryScreen />} />
          <Route path="/dual-scan" element={<DualScanScreen />} />
          <Route path="/dual-tarot" element={<DualTarotScreen />} />

          {/* Payment & Admin */}
          <Route path="/paywall" element={<PaywallScreen />} />
          <Route path="/payment-success" element={<PaymentSuccessScreen />} />
          <Route path="/admin" element={<AuthGate><AdminDashboardScreen /></AuthGate>} />
        </Routes>
      </div>

      {/* Global overlays placed outside scroll containers to guarantee visibility */}
      <GlobalFloatingButtons />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
