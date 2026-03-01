import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, ShieldAlert, Cpu, Sparkles, Activity } from 'lucide-react';

interface ChatMessage {
    id: number;
    sender: 'admin' | 'orchestrator' | 'bio' | 'tarot';
    text: string;
}

const CouncilChamberScreen: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, sender: 'orchestrator', text: '마스터 관제 시스템 가동. 원장님, 입장하셨군요. 이 공간은 오직 최고 관리자만을 위한 3대 브레인의 심층 회의실입니다. 안건을 던져 주시면 저희가 관점별로 찢어서 분석해 드립니다. 무슨 주제로 공명을 시작해 볼까요?' }
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
                            setMessages(prev => [...prev, { id: Date.now() + 3, sender: 'orchestrator', text: data.orchestrator_conclusion }]);
                            setIsTyping(false);
                        }, 1500);
                    }, 1500);
                }, 1500);
            }, 800);

        } catch (error) {
            console.error('Council Error:', error);
            setMessages(prev => [...prev, { id: Date.now(), sender: 'orchestrator', text: '⚠️ 브레인 연산 과부하 발생. 잠시 후 안건을 다시 상정해 주십시오.' }]);
            setIsTyping(false);
        }
    };

    const renderAgentBubble = (msg: ChatMessage) => {
        if (msg.sender === 'admin') {
            return (
                <div key={msg.id} style={{ alignSelf: 'flex-end', maxWidth: '85%', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gold-main)', marginBottom: '4px', textAlign: 'right' }}>원장님 (Admin)</div>
                    <div style={{ background: 'var(--color-gold-main)', color: '#000', padding: '12px 16px', borderRadius: '16px 16px 0 16px', fontSize: '0.95rem' }}>
                        {msg.text}
                    </div>
                </div>
            );
        }

        let agentConfig = { icon: <ShieldAlert size={16} />, color: '#FFF', name: 'Unknown', bg: '#222' };
        if (msg.sender === 'orchestrator') agentConfig = { icon: <ShieldAlert size={16} />, color: 'var(--color-gold-main)', name: '마스터 관제 봇 (Orchestrator)', bg: 'rgba(218,165,32,0.1)' };
        if (msg.sender === 'bio') agentConfig = { icon: <Activity size={16} />, color: '#00d2ff', name: '서브봇 A (프로파일러)', bg: 'rgba(0, 210, 255, 0.1)' };
        if (msg.sender === 'tarot') agentConfig = { icon: <Sparkles size={16} />, color: '#bf5af2', name: '서브봇 B (타로 멘토)', bg: 'rgba(191, 90, 242, 0.1)' };

        return (
            <div key={msg.id} style={{ alignSelf: 'flex-start', maxWidth: '85%', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: agentConfig.color, marginBottom: '4px' }}>
                    {agentConfig.icon} {agentConfig.name}
                </div>
                <div style={{ background: agentConfig.bg, border: `1px solid ${agentConfig.color}40`, color: '#e2e8f0', padding: '14px 18px', borderRadius: '0 16px 16px 16px', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {msg.text}
                </div>
            </div>
        );
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-deep)' }}>
            <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'var(--color-bg-panel)', zIndex: 10 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1rem', margin: 0, color: 'var(--color-gold-main)', letterSpacing: '2px' }}>AI 마스터 회의장</h2>
                    <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>Super-Ego Council Chamber</p>
                </div>
                <div style={{ width: 24 }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                {messages.map(renderAgentBubble)}
                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={14} className="animate-pulse" /> 에이전트 브레인 동기화 연산 중...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '15px 20px', background: 'var(--color-bg-panel)', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="안건 제기 (예: 이번 달 유료 전환율을 어떻게 더 올릴까?)"
                    disabled={isTyping}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '25px', padding: '12px 20px', color: '#FFF', fontSize: '0.95rem', outline: 'none' }}
                />
                <button type="submit" disabled={isTyping || !input.trim()} style={{ background: 'var(--color-gold-main)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', cursor: isTyping ? 'not-allowed' : 'pointer', opacity: isTyping ? 0.5 : 1 }}>
                    <Send size={20} style={{ marginLeft: '4px' }} />
                </button>
            </form>
        </div>
    );
};

export default CouncilChamberScreen;
