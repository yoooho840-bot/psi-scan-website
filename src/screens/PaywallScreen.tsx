import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowLeft, BadgeCheck } from 'lucide-react';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import type { PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { supabase } from '../lib/supabase';

// Test Client Key from Toss Payments
const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
const customerKey = 'user_' + Math.random().toString(36).substring(2, 10); // Random for non-auth user testing

const PaywallScreen: React.FC = () => {
    const navigate = useNavigate();


    const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
    const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null);

    // Plan Selection State
    type PlanType = 'free' | 'daily' | 'monthly' | 'monthly3' | 'monthly6' | 'yearly';
    const [planType, setPlanType] = useState<PlanType>('monthly');
    const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false);

    useEffect(() => {
        // SEC-010: Check trials from DB securely
        const checkTrial = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data } = await supabase.from('users').select('free_trials_used').eq('id', session.user.id).single();
                if (data && data.free_trials_used > 0) setHasUsedFreeTrial(true);
            }
        };
        checkTrial();
    }, []);

    // Calculate Prices
    const baseMonthly = 29000;
    const getPrice = (plan: PlanType) => {
        switch (plan) {
            case 'free': return 0;
            case 'daily': return 9900;
            case 'monthly': return baseMonthly;
            case 'monthly3': return Math.floor(baseMonthly * 3 * 0.95); // 5% discount
            case 'monthly6': return Math.floor(baseMonthly * 6 * 0.94); // 6% discount
            case 'yearly': return Math.floor(baseMonthly * 12 * 0.93);  // 7% discount
            default: return baseMonthly;
        }
    };
    const price = getPrice(planType);

    // Admin Override state
    const [showAdminInput, setShowAdminInput] = useState(false);
    const [adminCode, setAdminCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const initializeWidget = async () => {
            try {
                // Only initialize and render payment widgets if not a free plan
                if (planType !== 'free') {
                    const paymentWidget = await loadPaymentWidget(clientKey, customerKey);

                    // Render payment methods (Card, KakaoPay, TossPay, etc)
                    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                        '#payment-widget',
                        { value: price },
                        { variantKey: 'DEFAULT' }
                    );

                    // Render Toss standard agreement widget
                    paymentWidget.renderAgreement(
                        '#agreement',
                        { variantKey: 'AGREEMENT' }
                    );
                    paymentMethodsWidgetRef.current = paymentMethodsWidget;
                    paymentWidgetRef.current = paymentWidget;
                } else {
                    // If planType is free, ensure payment widgets are not rendered or are hidden
                    // No explicit destroy method for renderPaymentMethods, but re-rendering will handle it.
                    // For now, just clear refs if switching to free.
                    if (paymentMethodsWidgetRef.current) {
                        // paymentMethodsWidgetRef.current.destroy(); // No destroy method available directly
                        paymentMethodsWidgetRef.current = null;
                    }
                    if (paymentWidgetRef.current) {
                        // paymentWidgetRef.current.destroy(); // No destroy method available directly
                        paymentWidgetRef.current = null;
                    }
                }
            } catch (error) {
                console.error("Toss Payment Widget render error:", error);
            }
        };

        initializeWidget();
    }, [price, planType]); // Added planType to dependencies

    const handlePaymentRequest = async () => {
        if (planType === 'free') {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Backend call to increment free trial (Secure RPC or Edge Function recommended)
                await supabase.from('users').update({ free_trials_used: 1 }).eq('id', session.user.id);
            }
            navigate('/result', { replace: true });
            return;
        }

        alert('사전 신청해 주셔서 감사합니다!\n현재 PG(결제) 시스템 심사 및 연동 중이며, 영업일 기준 2~3일 내 정식 오픈될 예정입니다. 오픈 시 우선 안내해 드리겠습니다.');
        return;

        /*
        const paymentWidget = paymentWidgetRef.current;
        if (!paymentWidget) return;

        const orderId = 'order_' + Math.random().toString(36).substring(2, 10);

        let orderName = '';
        switch (planType) {
            case 'daily': orderName = '심층 에너지 필드 스캔 (24시간 무제한권)'; break;
            case 'monthly': orderName = '심층 에너지 필드 스캔 (개인 1개월 무제한)'; break;
            case 'monthly3': orderName = '심층 에너지 필드 스캔 (개인 3개월 무제한)'; break;
            case 'monthly6': orderName = '심층 에너지 필드 스캔 (개인 6개월 무제한)'; break;
            case 'yearly': orderName = '심층 에너지 필드 스캔 (개인 1년 무제한)'; break;
            default: orderName = '심층 에너지 필드 스캔 결제';
        }

        try {
            await paymentWidget.requestPayment({
                orderId: orderId,
                orderName: orderName,
                customerName: 'Psi Scan User',
                customerEmail: 'scanned@psiscan.com',
                successUrl: `${window.location.origin}/payment-success`,
                failUrl: `${window.location.origin}/paywall`,
            });
        } catch (error) {
            console.error("Payment failed or cancelled:", error);
        }
        */
    };

    const submitAdminCode = async () => {
        if (!adminCode) return;

        // Static Admin Overrides (SEC-005: In production these must be handled via Backend, but for beta, migrating off localStorage is priority)
        if (adminCode === "QUANTUM-VIP-2026" || adminCode === "CEO-INVITE-777") {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase.from('users').update({ subscription_status: 'pro' }).eq('id', session.user.id);
            }
            navigate('/result', { replace: true });
            return;
        }

        // B2B License Verification via Backend
        setIsVerifying(true);
        try {
            const response = await fetch('http://localhost:3000/api/b2b/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey: adminCode })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`[${data.salonName}] 프리미엄 비즈니스 라이선스가 인증되었습니다.`);
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase.from('users').update({ b2b_mode: true, b2b_salon_name: data.salonName, subscription_status: 'b2b_pro' }).eq('id', session.user.id);
                }
                navigate('/result', { replace: true });
            } else {
                alert(data.message || "유효하지 않은 라이선스 키입니다.");
                setAdminCode('');
            }
        } catch (error) {
            console.error("Verification error:", error);
            alert("서버 연결에 실패했습니다. 관리자에게 문의하세요.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="screen" style={{ overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', background: '#0A0B10' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '10px 0' }}>
                    <ArrowLeft size={20} />
                    <span style={{ fontSize: '1rem' }}>결과 보류</span>
                </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(218, 165, 32, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: '1px solid rgba(218, 165, 32, 0.5)' }}>
                    <Lock size={24} color="#DAA520" />
                </div>
                <h1 style={{ fontSize: '1.4rem', color: '#FFF', marginBottom: '8px' }}>심층 에너지 필드 스캔 완료</h1>
                <p style={{ color: '#bbb', fontSize: '0.85rem', lineHeight: '1.5', padding: '0 20px' }}>
                    안면 생체 데이터와 음파 정보의 심층 리딩 연산이 종료되었습니다.<br />
                    서버 컴퓨팅 비용(스캔 검사비) 부과 후 최종 리포트가 해제됩니다.
                </p>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Basic Options */}
                <div style={{ display: 'flex', gap: '5px' }}>
                    <div
                        onClick={() => {
                            if (!hasUsedFreeTrial) setPlanType('free');
                        }}
                        style={{
                            flex: 1, padding: '10px 5px', borderRadius: '12px', cursor: hasUsedFreeTrial ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'all 0.2s', opacity: hasUsedFreeTrial ? 0.5 : 1,
                            border: planType === 'free' ? '2px solid #9C27B0' : '1px solid rgba(255,255,255,0.1)',
                            background: planType === 'free' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(255,255,255,0.02)'
                        }}>
                        <div style={{ fontSize: '0.8rem', color: '#BBB', marginBottom: '5px' }}>무료 체험</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#FFF' }}>0원</div>
                        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '5px' }}>{hasUsedFreeTrial ? '완료됨' : '최초 1회 한정'}</div>
                    </div>

                    <div
                        onClick={() => setPlanType('daily')}
                        style={{
                            flex: 1, padding: '10px 5px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                            border: planType === 'daily' ? '2px solid #DAA520' : '1px solid rgba(255,255,255,0.1)',
                            background: planType === 'daily' ? 'rgba(218, 165, 32, 0.1)' : 'rgba(255,255,255,0.02)'
                        }}>
                        <div style={{ fontSize: '0.8rem', color: '#BBB', marginBottom: '5px' }}>24H 에너지 패스</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#FFF' }}>9,900</div>
                        <div style={{ fontSize: '0.7rem', color: '#DAA520', marginTop: '5px', fontWeight: 'bold' }}>구독시 차액 페이백</div>
                    </div>
                </div>

                {/* Subscription Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(76, 175, 80, 0.4)', borderRadius: '12px', padding: '10px', background: 'rgba(76, 175, 80, 0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#4CAF50', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>✨ 무제한 스캔 정기 구독 플랜</div>

                    {[
                        { type: 'monthly', title: '1개월', price: getPrice('monthly'), discount: '', best: false },
                        { type: 'monthly3', title: '3개월', price: getPrice('monthly3'), discount: '5% 할인', best: true },
                        { type: 'monthly6', title: '6개월', price: getPrice('monthly6'), discount: '6% 할인', best: false },
                        { type: 'yearly', title: '1년', price: getPrice('yearly'), discount: '7% 할인', best: false },
                    ].map((plan) => (
                        <div
                            key={plan.type}
                            onClick={() => setPlanType(plan.type as PlanType)}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                                border: planType === plan.type ? '2px solid #4CAF50' : '1px solid rgba(255,255,255,0.1)',
                                background: planType === plan.type ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255,255,255,0.02)'
                            }}>
                            {plan.best && <div style={{ position: 'absolute', top: 0, left: 0, background: '#4CAF50', color: '#FFF', fontSize: '0.6rem', padding: '2px 6px', borderBottomRightRadius: '6px', fontWeight: 'bold' }}>BEST</div>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginLeft: plan.best ? '20px' : '0' }}>
                                <span style={{ fontSize: '0.95rem', color: '#FFF', fontWeight: 'bold' }}>{plan.title} 무제한</span>
                                {plan.discount && <span style={{ fontSize: '0.75rem', color: '#4CAF50' }}>매월 29,000원 기준 <strong>{plan.discount}</strong></span>}
                            </div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF' }}>
                                ₩ {plan.price.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: '20px', border: planType.startsWith('monthly') || planType === 'yearly' ? '1px solid rgba(76, 175, 80, 0.4)' : planType === 'free' ? '1px solid rgba(156, 39, 176, 0.4)' : '1px solid rgba(218, 165, 32, 0.4)', borderRadius: '15px', background: 'rgba(255,255,255,0.02)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <BadgeCheck size={18} color={planType.startsWith('monthly') || planType === 'yearly' ? "#4CAF50" : planType === 'free' ? "#9C27B0" : "#DAA520"} />
                            {planType.startsWith('monthly') || planType === 'yearly' ? '무제한 리추얼 구독 혜택' : planType === 'free' ? '첫 방문 무료 체험' : '24시간 무제한 이용권'}
                        </h3>
                        <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>
                            {planType.startsWith('monthly') || planType === 'yearly' ? '기간 내 매일 마음 건강 파동 일기 시스템 개방' : planType === 'free' ? '기초 에너지 필드 리딩 체험' : '정밀 분석 서버망 24시간 동안 무제한 스캔'}
                        </p>
                    </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px 0', color: '#DDD', fontSize: '0.85rem' }}>
                    {planType.startsWith('monthly') || planType === 'yearly' ? (
                        <>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <ShieldCheck size={16} color="#4CAF50" />
                                <span><strong style={{ color: '#FFF' }}>무제한</strong> 생체/음성 스캔 파동 일기</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <ShieldCheck size={16} color="#4CAF50" />
                                <span>디지털 삿구르 및 오라클 카드 전면 개방</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <ShieldCheck size={16} color="#4CAF50" />
                                <span>과거 AI 분석 리포트 누적 기록 조회 가능</span>
                            </li>
                        </>
                    ) : planType === 'free' ? (
                        <>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <ShieldCheck size={16} color="#9C27B0" />
                                <span>나의 오라 에너지 컬러 확인 (1회)</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <ShieldCheck size={16} color="#9C27B0" />
                                <span>오늘의 내 파동 매칭 <b style={{ color: '#E040FB' }}>무의식 타로 3장 풀이 오픈</b></span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', opacity: 0.5 }}>
                                <ShieldCheck size={16} color="#888" />
                                <span style={{ textDecoration: 'line-through' }}>심층 AI 리포트 및 치유 챔버 개방 (유료)</span>
                            </li>
                        </>
                    ) : (
                        <>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <ShieldCheck size={16} color="#DAA520" />
                                <span>오늘 하루 (24H) 횟수 제한 없이 스캔 무제한</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <ShieldCheck size={16} color="#DAA520" />
                                <span>심층 튜닝, 불멍 등 <b style={{ color: '#DAA520' }}>프리미엄 힐링 챔버 전면 개방</b></span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <ShieldCheck size={16} color="#DAA520" />
                                <span><b style={{ color: '#FFF', background: 'rgba(218, 165, 32, 0.2)', padding: '2px 4px', borderRadius: '4px' }}>24시간 내 구독 업그레이드 시 차액결제 혜택!</b></span>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            {/* Submit UI Wrapper */}
            <div style={{ background: planType !== 'free' ? '#FFF' : 'transparent', borderRadius: '12px', padding: planType !== 'free' ? '5px' : '0', marginBottom: '20px' }}>
                <div id="payment-widget" style={{ width: '100%', display: planType !== 'free' ? 'block' : 'none' }} />
                <div id="agreement" style={{ width: '100%', display: planType !== 'free' ? 'block' : 'none' }} />
                <button
                    onClick={handlePaymentRequest}
                    style={{
                        width: planType !== 'free' ? '94%' : '100%',
                        margin: planType !== 'free' ? '0 auto 15px auto' : '0 0 15px 0',
                        padding: '16px',
                        background: planType === 'free' ? 'linear-gradient(135deg, #9C27B0, #6A1B9A)' : 'linear-gradient(135deg, #3182f6, #0e5bce)',
                        border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: planType === 'free' ? '0 4px 14px rgba(156, 39, 176, 0.4)' : '0 4px 14px rgba(49, 130, 246, 0.4)'
                    }}
                >
                    {planType === 'free' ? '0원으로 분석 결과 보기' : `${price.toLocaleString()}원 안전결제 수락`}
                </button>
            </div>

            <div style={{ textAlign: 'center', paddingBottom: '30px' }}>
                {!showAdminInput ? (
                    <button
                        onClick={() => setShowAdminInput(true)}
                        style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}>
                        제휴 매장 라이선스 키 또는 VIP 코드 입력
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                        <input
                            type="text"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value)}
                            placeholder="PSI-XXXX... / VIP 코드"
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #444', background: '#111', color: '#FFF', fontSize: '0.9rem' }}
                        />
                        <button
                            onClick={submitAdminCode}
                            disabled={isVerifying}
                            style={{ padding: '8px 15px', borderRadius: '6px', background: '#DAA520', color: '#000', border: 'none', fontWeight: 'bold', cursor: isVerifying ? 'wait' : 'pointer', fontSize: '0.9rem', opacity: isVerifying ? 0.7 : 1 }}
                        >
                            {isVerifying ? '확인 중..' : '코드 적용'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaywallScreen;
