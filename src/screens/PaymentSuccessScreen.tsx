import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const PaymentSuccessScreen: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [errorMessage, setErrorMessage] = useState('');

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!paymentKey || !orderId || !amount) {
                setStatus('failed');
                setErrorMessage('결제 정보가 유효하지 않습니다.');
                return;
            }

            try {
                // Call our backend to verify the payment with Toss
                const response = await fetch('/api/payments/toss-success', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Update local state to unlock content
                    localStorage.setItem('hasPaidAccount', 'true');
                    setStatus('success');

                    // Redirect to results after 2 seconds
                    setTimeout(() => {
                        navigate('/result', { replace: true });
                    }, 2000);
                } else {
                    setStatus('failed');
                    setErrorMessage(data.message || '결제 검증에 실패했습니다.');
                }
            } catch (err) {
                console.error("Payment Verification Error:", err);
                setStatus('failed');
                setErrorMessage('서버와 통신할 수 없습니다.');
            }
        };

        verifyPayment();
    }, [paymentKey, orderId, amount, navigate]);

    return (
        <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', background: '#0A0B10' }}>
            {status === 'processing' && (
                <>
                    <div style={{ width: '60px', height: '60px', border: '3px solid rgba(218, 165, 32, 0.3)', borderTopColor: '#DAA520', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
                    <h2 style={{ color: '#FFF' }}>결제 승인 대기 중...</h2>
                    <p style={{ color: '#888' }}>잠시만 기다려주세요.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle size={64} color="#4CAF50" style={{ marginBottom: '20px' }} />
                    <h2 style={{ color: '#FFF', marginBottom: '10px' }}>결제가 완료되었습니다!</h2>
                    <p style={{ color: '#bbb' }}>12D 매트릭스 전체 리포트를 불러오는 중입니다...</p>
                </>
            )}

            {status === 'failed' && (
                <>
                    <AlertTriangle size={64} color="#f44336" style={{ marginBottom: '20px' }} />
                    <h2 style={{ color: '#FFF', marginBottom: '10px' }}>결제 실패</h2>
                    <p style={{ color: '#f44336', marginBottom: '30px' }}>{errorMessage}</p>
                    <button
                        onClick={() => navigate('/paywall', { replace: true })}
                        style={{ padding: '12px 24px', background: '#333', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        다시 시도하기
                    </button>
                </>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccessScreen;
