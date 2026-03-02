import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, ShieldAlert, Cpu, Sparkles, Activity } from 'lucide-react';

interface ChatMessage {
    id: number;
    sender: 'admin' | 'orchestrator' | 'bio' | 'tarot' | 'legal';
    text: string;
}

const CouncilChamberScreen: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, sender: 'orchestrator', text: '마스터 관제 시스템 가동. 원장님, 입장하셨군요.\\n이 공간은 오직 최고 관리자만을 위한 4대 브레인의 심층 토론실입니다.\\n안건을 던져 주시면 저희가 관점별로 나누어 분석해 드립니다.\\n무슨 주제로 대화를 시작해 볼까요?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const adminMessage = input;
        setMessages(prev => [...prev, { id: Date.now(), sender: 'admin', text: adminMessage }]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/council', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: adminMessage }),
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();

            // Simulate the delay between bots speaking
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now(), sender: 'orchestrator', text: data.orchestrator_initial }]);
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bio', text: data.sub_bot_a_argument }]);
                    setTimeout(() => {
                        setMessages(prev => [...prev, { id: Date.now() + 2, sender: 'tarot', text: data.sub_bot_b_argument }]);
                        setTimeout(() => {
                            setMessages(prev => [...prev, { id: Date.now() + 3, sender: 'legal', text: data.sub_bot_c_argument }]);
                            setTimeout(() => {
                                setMessages(prev => [...prev, { id: Date.now() + 4, sender: 'orchestrator', text: data.orchestrator_conclusion }]);
                                setIsTyping(false);
                            }, 1500);
                        }, 1500);
                    }, 1500);
                }, 1500);
            }, 800);

        } catch (error) {
            console.error('Council Error:', error);
            setMessages(prev => [...prev, { id: Date.now() + 1000, sender: 'orchestrator', text: '⚠️ 브레인 연산 과부하 발생. 잠시 후 안건을 다시 상정해 주십시오.' }]);
            setIsTyping(false);
        }
    };

    const renderAgentBubble = (msg: ChatMessage) => {
        if (msg.sender === 'admin') {
            return (
                <div key={msg.id} style={{ alignSelf: 'flex-end', width: 'fit-content', maxWidth: '85%', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold-main)', marginBottom: '6px', fontWeight: 'bold' }}>원장님 (Admin)</div>
                    <div style={{ background: 'var(--color-gold-main)', color: '#111', padding: '16px 22px', borderRadius: '20px 20px 0 20px', fontSize: '1rem', boxShadow: '0 4px 15px rgba(218, 165, 32, 0.2)', wordBreak: 'keep-all', lineHeight: 1.5 }}>
                        {msg.text}
                    </div>
                </div>
            );
        }

        let agentConfig = { icon: <ShieldAlert size={18} />, color: '#FFF', name: 'Unknown', bg: '#222' };
        if (msg.sender === 'orchestrator') agentConfig = { icon: <ShieldAlert size={18} />, color: 'var(--color-gold-main)', name: '마스터 관제 봇', bg: 'rgba(218,165,32,0.08)' };
        if (msg.sender === 'bio') agentConfig = { icon: <Activity size={18} />, color: '#00d2ff', name: '서브봇 A (에너지 분석가)', bg: 'rgba(0, 210, 255, 0.08)' };
        if (msg.sender === 'tarot') agentConfig = { icon: <Sparkles size={18} />, color: '#bf5af2', name: '서브봇 B (심리 해석가)', bg: 'rgba(191, 90, 242, 0.08)' };
        if (msg.sender === 'legal') agentConfig = { icon: <ShieldAlert size={18} />, color: '#ff3b30', name: '서브봇 C (리스크 관리자)', bg: 'rgba(255, 59, 48, 0.08)' };

        return (
            <div key={msg.id} style={{ alignSelf: 'flex-start', width: 'fit-content', maxWidth: '85%', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: agentConfig.color, marginBottom: '6px', fontWeight: 'bold' }}>
                    {agentConfig.icon} {agentConfig.name}
                </div>
                <div style={{ background: agentConfig.bg, border: `1px solid ${agentConfig.color}30`, color: 'var(--color-text-primary)', padding: '18px 24px', borderRadius: '0 20px 20px 20px', fontSize: '1rem', lineHeight: 1.7, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    {msg.text.split(/(?<=[.:!])\s+/).map((sentence, idx) => (
                        <p key={idx} style={{ margin: '0 0 10px 0', wordBreak: 'keep-all' }}>{sentence.trim()}</p>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-deep)' }}>
            <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-panel)', zIndex: 10 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1rem', margin: 0, color: 'var(--color-gold-main)', letterSpacing: '2px' }}>AI 마스터 회의장</h2>
                    <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>Super-Ego Council Chamber</p>
                </div>
                <div style={{ width: 24 }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column' }}>
                    {messages.map(renderAgentBubble)}
                    {isTyping && (
                        <div style={{ alignSelf: 'flex-start', color: 'var(--color-text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'var(--color-bg-surface)', borderRadius: '20px', marginTop: '10px' }}>
                            <Cpu size={18} className="animate-pulse" color="var(--color-gold-main)" /> 에이전트 브레인 동기화 및 안건 분석 중...
                        </div>
                    )}
                    <div ref={messagesEndRef} style={{ height: '40px' }} />
                </div>
            </div>

            <div style={{ background: 'var(--color-bg-panel)', borderTop: '1px solid var(--color-border-subtle)', padding: '20px' }}>
                <form onSubmit={handleSend} style={{ width: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '15px' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="안건 제기 (예: 이번 달 유료 전환율을 어떻게 더 올릴까?)"
                        disabled={isTyping}
                        style={{ flex: 1, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border-subtle)', borderRadius: '30px', padding: '16px 24px', color: 'var(--color-text-primary)', fontSize: '1.05rem', outline: 'none', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)' }}
                    />
                    <button type="submit" disabled={isTyping || !input.trim()} style={{ background: 'var(--color-gold-main)', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111', cursor: isTyping ? 'not-allowed' : 'pointer', opacity: isTyping ? 0.5 : 1, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)' }}>
                        <Send size={24} style={{ marginLeft: '4px' }} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CouncilChamberScreen;
