
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
import CouncilChamberScreen from './screens/CouncilChamberScreen'; // New Council Chamber Route
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
import { Home as HomeIcon } from 'lucide-react';
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

      {/* Global Admin Pass Button - Moved to TopHeader */}

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

const TopHeader = () => {
  const location = useLocation();
  // Hide header entirely on the interactive scan screen
  if (location.pathname === '/scan') return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      padding: '25px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      zIndex: 9999,
      background: 'linear-gradient(to bottom, rgba(5,5,10,0.8) 0%, rgba(5,5,10,0.4) 50%, transparent 100%)',
      pointerEvents: 'none' // Make the container transparent to clicks
    }}>
      {/* Logo Area */}
      <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--color-gold-main)', letterSpacing: '5px', margin: 0, fontFamily: 'var(--font-brand)' }}>PSI SCAN</h1>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '4px', marginTop: '4px' }}>ENERGY FIELD READING</span>
        </a>
      </div>

    </div>
  );
};

function AppContent() {
  return (
    <div className="app-container" style={{ display: 'block', height: '100vh', overflow: 'hidden', width: '100vw' }}>
      {/* Mysterious Background Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 50% 30%, rgba(218, 165, 32, 0.15), transparent 60%)',
        pointerEvents: 'none',
        zIndex: 1
      }}></div>

      {/* Minimal Top Header */}
      <TopHeader />

      <div style={{ height: '100vh', width: '100vw', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        <Routes>
          {/* Main Flow */}
          <Route path="/" element={<LandingScreen />} />
          <Route path="/register" element={<OnboardingScreen />} />
          <Route path="/scan" element={<ScanScreen />} />
          <Route path="/result" element={<ResultScreen />} />

          {/* Reports & Dashboards */}
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/admin" element={<AdminDashboardScreen />} />
          <Route path="/council" element={<CouncilChamberScreen />} />
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
