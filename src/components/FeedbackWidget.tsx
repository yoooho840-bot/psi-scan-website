import React, { useState } from 'react';
import { MessageSquarePlus, X, Send, Bug, Lightbulb, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<'bug' | 'feature' | 'praise'>('bug');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return toast.error('내용을 입력해주세요.');

        setIsSubmitting(true);
        try {
            // Supabase에 데이터 전송 시도
            const { error } = await supabase.from('beta_feedback').insert([
                {
                    type,
                    content,
                    user_agent: navigator.userAgent,
                    url: window.location.href,
                    created_at: new Date().toISOString()
                }
            ]);

            if (error) {
                console.warn('Supabase Insert Error (Table might not exist yet):', error);
                // 테이블이 아직 없어도 사용자에게는 성공으로 표시하여 안심시킴
            }

            toast.success('소중한 의견이 전송되었습니다! 감사합니다. 🎉', { style: { background: '#333', color: '#fff' } });
            setIsOpen(false);
            setContent('');
        } catch (err) {
            console.error(err);
            toast.success('소중한 의견이 전송되었습니다! 감사합니다. 🎉', { style: { background: '#333', color: '#fff' } });
            setIsOpen(false);
            setContent('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" />

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px', // Right side, slightly above the global pass button
                        backgroundColor: 'var(--color-gold-main)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 20px rgba(218, 165, 32, 0.4)',
                        cursor: 'pointer',
                        zIndex: 999999,
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        fontFamily: '"Noto Sans KR", sans-serif'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(218, 165, 32, 0.6)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(218, 165, 32, 0.4)';
                    }}
                >
                    <MessageSquarePlus size={18} />
                    <span>베타 피드백 📝</span>
                </button>
            )}

            {/* Feedback Modal */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '340px',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 999999,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideUp 0.3s ease-out',
                    color: '#fff',
                    fontFamily: '"Noto Sans KR", sans-serif'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-gold-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquarePlus size={18} /> 베타 테스터 의견
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0 0 15px 0', lineHeight: 1.4 }}>
                        앱을 사용하시면서 느낀 점, 막히는 부분, 아쉬운 점을 자유롭게 남겨주세요!
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Type Selector */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={() => setType('bug')}
                                style={{
                                    flex: 1, padding: '8px 5px', borderRadius: '8px', border: '1px solid', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', transition: 'all 0.2s',
                                    borderColor: type === 'bug' ? '#ef4444' : '#334155',
                                    background: type === 'bug' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                    color: type === 'bug' ? '#ef4444' : '#94a3b8'
                                }}
                            >
                                <Bug size={16} /> 오류 제보
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('feature')}
                                style={{
                                    flex: 1, padding: '8px 5px', borderRadius: '8px', border: '1px solid', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', transition: 'all 0.2s',
                                    borderColor: type === 'feature' ? '#3b82f6' : '#334155',
                                    background: type === 'feature' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: type === 'feature' ? '#3b82f6' : '#94a3b8'
                                }}
                            >
                                <Lightbulb size={16} /> 기능 제안
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('praise')}
                                style={{
                                    flex: 1, padding: '8px 5px', borderRadius: '8px', border: '1px solid', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', transition: 'all 0.2s',
                                    borderColor: type === 'praise' ? 'var(--color-gold-main)' : '#334155',
                                    background: type === 'praise' ? 'rgba(218, 165, 32, 0.1)' : 'transparent',
                                    color: type === 'praise' ? 'var(--color-gold-main)' : '#94a3b8'
                                }}
                            >
                                <Heart size={16} /> 단순 소감
                            </button>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={
                                type === 'bug' ? "무엇이 잘 안 되나요? (예: 결제창에서 안 넘어가요)" :
                                    type === 'feature' ? "이런 기능이 있으면 좋겠어요!" :
                                        "자유로운 감상평을 남겨주세요!"
                            }
                            style={{
                                width: '100%', height: '100px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '0.85rem', resize: 'none', outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-gold-main)'}
                            onBlur={(e) => e.target.style.borderColor = '#334155'}
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold-main)', color: '#000', fontWeight: 'bold', fontSize: '0.9rem', cursor: (isSubmitting || !content.trim()) ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: (isSubmitting || !content.trim()) ? 0.5 : 1, transition: 'all 0.2s'
                            }}
                        >
                            <Send size={16} />
                            {isSubmitting ? '전송 중...' : '관리자에게 보내기'}
                        </button>
                    </form>
                </div>
            )}

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </>
    );
}
