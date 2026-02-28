import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, FileText, Lock, LayoutGrid, MessageCircle, Flame, Sparkles, CheckCircle, Music, Volume2 } from 'lucide-react';

const AdminDashboardScreen: React.FC = () => {
    const navigate = useNavigate();

    const menuItems = [
        { path: '/dashboard', label: '마이페이지', icon: <LayoutGrid size={20} />, desc: '메인 대시보드' },
        { path: '/elemental-therapy', label: '명상 (불멍/물멍)', icon: <Flame size={20} />, desc: '자연 소리와 시각 명상' },
        { path: '/frequency-lab', label: '사운드 힐링 (주파수)', icon: <Music size={20} />, desc: '마음을 편안하게 하는 주파수 소리' },
        { path: '/sound-bath', label: '사운드 힐링 (싱잉볼)', icon: <Volume2 size={20} />, desc: '편안한 싱잉볼 연주' },
        { path: '/color-therapy', label: '컬러 힐링', icon: <Sparkles size={20} />, desc: '색채를 통한 시각적 휴식' },
        { path: '/chat', label: 'AI 맞춤 상담', icon: <MessageCircle size={20} />, desc: 'AI 가이드와의 멘탈 케어 대화' },
        { path: '/report', label: '나의 분석 리포트', icon: <FileText size={20} />, desc: '상세 검사 결과 및 솔루션' },
        { path: '/paywall', label: '프리미엄 결제', icon: <Lock size={20} />, desc: '프리미엄 리포트 확인하기' },
    ];


    return (
        <div className="screen" style={{ padding: '20px', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
                <ShieldCheck size={48} color="var(--color-gold-main)" style={{ margin: '0 auto 10px' }} />
                <h1 style={{ fontSize: '1.8rem', marginBottom: '5px' }} className="gold-text">관리자 대시보드</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>모든 화면으로 직접 이동할 수 있는 프리패스 공간입니다.</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={() => {
                            localStorage.setItem('isSubscribed', 'true');
                            alert('프리미엄 회원 모드 활성화!');
                            window.location.reload();
                        }}
                        style={{ background: 'rgba(218,165,32,0.1)', border: '1px solid #DAA520', color: '#DAA520', padding: '10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <CheckCircle size={14} /> 프리미엄 시뮬레이션
                    </button>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            alert('모든 로컬 데이터 초기화 완료');
                            window.location.reload();
                        }}
                        style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', padding: '10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                        데이터 리셋
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', paddingBottom: '30px' }}>
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(item.path)}
                        className="glass-card"
                        style={{
                            padding: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '1px solid rgba(218, 165, 32, 0.2)',
                            background: 'rgba(218, 165, 32, 0.05)'
                        }}
                    >
                        <div style={{
                            width: '40px', height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(218, 165, 32, 0.15)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            color: 'var(--color-gold-main)'
                        }}>
                            {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px', color: 'var(--color-text-primary)' }}>{item.label}</h3>
                            <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                        </div>
                        <ArrowRight size={20} color="var(--color-text-secondary)" />
                    </div>
                ))}
            </div>

            <button
                onClick={() => window.location.href = '/'}
                style={{
                    width: '100%', padding: '15px',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px', color: 'var(--color-text-primary)',
                    cursor: 'pointer'
                }}
            >
                메인 랜딩페이지로 돌아가기
            </button>
        </div>
    );
};

export default AdminDashboardScreen;
