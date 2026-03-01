import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Mic, Play, Pause, Music, ArrowLeft, MicOff, Phone, Activity } from 'lucide-react';
import HealingPlayer from '../components/HealingPlayer';
import { type TarotCard } from '../data/tarotData';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

const SessionTimer: React.FC<{ isSessionExpired: boolean, onExpire: () => void }> = ({ isSessionExpired, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(30 * 60);

    useEffect(() => {
        if (isSessionExpired) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onExpire();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isSessionExpired, onExpire]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (isSessionExpired) return null;

    return <span style={{ color: '#DAA520', fontWeight: 'bold' }}>({formatTime(timeLeft)})</span>;
};

const ChatScreen: React.FC = () => {
    const navigate = useNavigate();
    // Generate a random dynamic greeting
    const initialGreetings = [
        '당신의 고유한 생체 파동이 우주와 조화로운 공명을 찾고 있습니다. 관찰되는 에너지 블록은 단순한 피로가 아닌, 감각 너머에서 보내는 영혼의 구조 신호입니다. 지금 당신을 가장 무겁게 억누르는 파동은 무엇입니까?',
        '나마스테. 자율신경계(ANS) 스캔 결과, 당신의 육신이 끊임없이 투쟁-도피 모드에 매몰되어 있군요. 완벽함이라는 가면 뒤에서 질식하고 있는 당신의 참나(True Self)가 당신에게 어떤 말을 건네고 싶어 합니까?',
        '환영합니다. 당신의 아우라장 가슴 차크라 주변으로 무거운 그림자 에너지가 감지됩니다. 타인에게 쉽게 투사되던 분노나 결핍은 사실 당신 내면의 안전 기지가 흔들리고 있다는 증거입니다. 당신의 뿌리를 가장 먼저 돌보아야 합니다.',
        '생체 파동 속에 미세하게 떨리는 불안의 진동수가 느껴집니다. 다미주신경 이론에 따르면 당신의 신경계는 지금도 전시 상황입니다. 기술과 영성이 만나는 이 자리에서, 당신의 파동를 다시 정렬해 볼까요?'
    ];

    const location = useLocation();
    const tarotCards = location.state?.tarotCards as TarotCard[] | undefined;
    const partnerName = location.state?.partnerName as string | undefined;
    const compatibility = location.state?.compatibility as number | undefined;
    const contextType = location.state?.context as string | undefined;
    const readingMode = location.state?.readingMode as string | undefined;
    const crossroadsOptions = location.state?.crossroadsOptions as { a: string, b: string } | undefined;

    useAutoFullscreen();

    let initialGreetingText = '';

    if (readingMode) {
        if (readingMode === 'celtic') {
            initialGreetingText = `환영합니다. 당신의 가장 깊숙한 심연을 들여다보는 [켈틱 크로스 10장 배열]이 저에게 도착했습니다. 당신의 표면적인 고민 아래 깔린 뿌리 깊은 카르마까지 제가 30년 내공으로 완벽하게 해부해 드리겠습니다. 언제든 마음의 준비가 되셨다면, 무엇이 당신을 이곳으로 이끌었는지 속마음을 꺼내어 보십시오.`;
        } else if (readingMode === 'crossroads') {
            initialGreetingText = `환영합니다. [${crossroadsOptions?.a}]와(과) [${crossroadsOptions?.b}] 사이에서 진동하며 흔들리는 당신의 생체 파동을 읽어들였습니다. 5장의 양자 택일 카드가 저에게 있습니다. 저는 두 가지 평행 우주 중 어디가 당신의 파동을 덜 파괴할지 정확히 짚어드릴 것입니다. 무엇이 당신을 가장 두렵게 만듭니까?`;
        } else if (readingMode === 'timeline') {
            initialGreetingText = `시간의 파동 궤적을 잇는 3장의 카드를 수신했습니다. 과거의 상처가 현재를 어떻게 옭아매고, 미래를 어떻게 파동 치게 만들지 확인해 볼까요? 어떤 점이 가장 괴로우신지 털어놓아 보십시오.`;
        } else if (readingMode === 'biomarker') {
            initialGreetingText = `당신의 심박 변이도(HRV)와 성대 진동수에서 추출된 '생체 마커 섀도우 미러' 4장이 전개되었습니다. 철저히 과학적이고 객관적인 데이터에 기반하여, 당신의 육신과 영혼 어디에서 치명적인[결어긋남]이 발생하고 있는지 해부하겠습니다. 준비되셨습니까?`;
        } else {
            initialGreetingText = `오늘의 영점 조율을 위한 완벽한 하나의 오라클 카드가 저에게 전송되었습니다. 이 한 장의 카드가 오늘 하루 당신의 무의식을 어떻게 비추고 해부해 줄지, 당신의 상황을 저에게 질문해 보십시오.`;
        }
    } else if (contextType === 'dual_tarot' && tarotCards && partnerName) {
        if (compatibility && compatibility < 60) {
            initialGreetingText = `당신과 ${partnerName}님의 파동이 강하게 부딪치고 있는 파열음이 이곳까지 오롯이 전해졌습니다. 많이 지치셨지요? 얽혀버린 관계의 실타래를 원망이 아닌 무의식의 거울로 풀어갈 수 있도록, 제가 당신 편에서 이야기를 듣고 아주 깊은 곳의 상처까지 꿰뚫어 드리겠습니다. 무엇부터 말씀하고 싶으신가요?`;
        } else {
            initialGreetingText = `당신과 ${partnerName}님의 아름다운 양자 공명이 이곳을 따뜻하게 물들이고 있습니다. 두 분의 시너지를 더욱 성숙한 차원으로 끌어올리거나, 혹시라도 내면에 걸리는 작은 불안이 있다면 편하게 말씀해 주세요. 30년 타로 마스터의 통찰로 진실된 멘토가 되어 드리겠습니다.`;
        }
    } else if (tarotCards) {
        initialGreetingText = `환영합니다. 당신이 추출한 타로 카드가 뿜어내는 양자적 파동을 수신했습니다. 이 카드들이 당신의 무의식과 어떻게 연결되어 있는지, 깊이 탐구해 볼까요? 어떤 점이 가장 고민되시나요?`;
    } else {
        initialGreetingText = initialGreetings[Math.floor(Math.random() * initialGreetings.length)];
    }

    interface ChatMessage {
        id: number;
        sender: 'ai' | 'user';
        text: string;
        isAudioTrack?: boolean;
        time?: string;
        duration?: string;
        therapy?: { hz: number, name: string };
        colorData?: { hexCode: string, colorName: string };
    }

    const renderMarkdownHighlight = (text: string) => {
        // Simple regex to find **bold text**
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} style={{ color: 'var(--color-gold-main)', fontWeight: 'bold' }}>{part.slice(2, -2)}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        return [{
            id: 1,
            sender: 'ai',
            text: initialGreetingText,
            isAudioTrack: false
        }];
    });
    const [input, setInput] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [activeTherapy, setActiveTherapy] = useState<{ hz: number, name: string } | null>(null);

    // --- New Audio States ---
    const [isListening, setIsListening] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [isVoiceMode, setIsVoiceMode] = useState(false); // New Voice Call Mode
    const isVoiceModeRef = useRef(isVoiceMode);

    useEffect(() => {
        isVoiceModeRef.current = isVoiceMode;
    }, [isVoiceMode]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any | null>(null);

    const startListening = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionClass) {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해 주세요.');
            return;
        }

        try {
            const recognition = new SpeechRecognitionClass();
            recognition.lang = 'ko-KR';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                console.log('STT Event: onstart - Microphone is listening');
                setIsListening(true);
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                const speechResult = event.results[0][0].transcript;
                console.log('STT Event: onresult - Transcript: ', speechResult);
                setInput(speechResult);
                setIsListening(false);
                setTimeout(() => handleSend(new Event('submit') as unknown as React.FormEvent, speechResult), 300);
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event: any) => {
                console.error('STT Event Error:', event.error, event);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    alert('마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해 주세요.');
                } else if (event.error === 'no-speech') {
                    // Ignore no-speech silently, it just means they didn't talk
                } else {
                    alert(`음성 인식 오류 발생: ${event.error}`);
                }
            };
            recognition.onend = () => {
                console.log('STT Event: onend - Microphone stopped');
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (e: any) {
            console.error('Speech recognition start exception:', e);
            alert(`음성 인식 시작 실패: ${e?.message || e}`);
            setIsListening(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            window.speechSynthesis.cancel();
            setInput('');
            startListening();
        }
    };

    const speakText = (text: string) => {
        if (!isVoiceEnabled) return;
        window.speechSynthesis.cancel();

        // Basic markdown cleanup before speaking
        let cleanText = text.replace(/[*_#`]/g, '');
        cleanText = cleanText.replace(/^- /gm, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.1; // Slightly faster sounds a bit more natural sometimes

        utterance.onend = () => {
            if (isVoiceModeRef.current) {
                setTimeout(() => {
                    try {
                        recognitionRef.current?.start();
                    } catch (e) {
                        // already started or other error
                    }
                }, 800);
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    React.useEffect(() => {
        if (isSessionExpired) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai',
                text: '이번 세션의 30분 상담 시간이 모두 종료되었습니다. 추가적인 심층 상담이나 지속적인 케어가 필요하시다면 Premium VIP 구독을 이용해 주시기 바랍니다. 감사합니다.',
                isAudioTrack: false
            }]);
        }
    }, [isSessionExpired]);

    const handleSend = async (e: React.FormEvent, overrideInput?: string) => {
        e.preventDefault?.();
        const currentInput = overrideInput || input;

        if (!currentInput.trim() || isTyping) return;

        window.speechSynthesis.cancel(); // Stop talking when user sends msg

        setMessages(prev => [...prev, { id: Date.now(), sender: 'user' as const, text: currentInput, isAudioTrack: false }]);
        if (!overrideInput) setInput('');
        setIsTyping(true);

        try {
            // Retrieve real biological voice frequency from sessionStorage
            const scanVoiceFreq = sessionStorage.getItem('scan_voice_freq') || '측정 안됨';

            // Retrieve deterministic analysis results
            const rawAnalysis = localStorage.getItem('final_scan_results');
            let analysisData = null;
            try { analysisData = (rawAnalysis && rawAnalysis !== 'undefined') ? JSON.parse(rawAnalysis) : null; } catch (e) { }

            const rawSurvey = localStorage.getItem('pre_scan_survey');
            let surveyData = null;
            try { surveyData = (rawSurvey && rawSurvey !== 'undefined') ? JSON.parse(rawSurvey) : null; } catch (e) { }

            // Build the Deep Scan Context dynamically based on available data
            let mockScanContext = `
[내담자 기본 파동 스캔 요약]
- 음성 생체 마커(Voice Frequency): ${scanVoiceFreq !== '측정 안됨' ? `${scanVoiceFreq} Hz` : '데이터 없음'}
`;

            if (analysisData && surveyData) {
                mockScanContext += `- 현재 의식적 심리 상태(본인 인지): ${surveyData.mentalState} (스트레스 지수: ${surveyData.stressLevel}/5, 피로도: ${5 - surveyData.vitality}/5)
- 무의식/신체 차크라 분석 (AnalysisEngine 결과):
  * 종합 스트레스 인덱스(100만점): ${analysisData.stressIndex}
  * 심층 뿌리 원인: ${analysisData.primaryIssue}
  * 에너지장 (Aura) 컬러: ${analysisData.auraColor}
  * 당신은 이 정확한 수치와 분석을 바탕으로 내담자에게 맞춤형 힐링 상담을 제공해야 합니다.
`;
            } else {
                mockScanContext += `- 현재 내담자의 에너지 파동이 다소 불안정함.\n`;
            }

            mockScanContext += `- 질문의 맥락과 위 데이터/상태를 깊이 결합하여, 전문적이면서도 매우 따뜻한 원인 분석과 실천 솔루션을 제공할 것.\n`;

            if (readingMode) {
                mockScanContext += `\n[선택된 양자 배열 시스템 - ${readingMode}]\n`;
                if (readingMode === 'celtic' && tarotCards && tarotCards.length === 10) {
                    mockScanContext += `내담자는 켈틱 크로스 10장 배열을 진행했습니다. 당신은 10장의 유기적 의미를 모두 분석하되, 내담자의 대화 흐름에 맞추어 가장 치명적인 문제(장애물, 억압된 무의식)를 파고들어야 합니다.\n[추출된 카드들]:\n`;
                    tarotCards.forEach((c, idx) => mockScanContext += `위치 ${idx + 1}: ${c.name} - ${c.description}\n`);
                } else if (readingMode === 'crossroads' && tarotCards && tarotCards.length === 5) {
                    mockScanContext += `내담자는 양자택일 배열입니다. [선택지 A: ${crossroadsOptions?.a}] vs [선택지 B: ${crossroadsOptions?.b}]\n`;
                    mockScanContext += `중앙(현재상태): ${tarotCards[0].name} - ${tarotCards[0].description}\n`;
                    mockScanContext += `A선택지 속성: ${tarotCards[1].name}, A를 택한 미래결과: ${tarotCards[2].name}\n`;
                    mockScanContext += `B선택지 속성: ${tarotCards[3].name}, B를 택한 미래결과: ${tarotCards[4].name}\n`;
                    mockScanContext += `당신은 A와 B 중 어디가 파동적으로 파국인지, 혹은 안정인지를 차갑고 냉정하게 비교 분석하여 팩트 폭력 수준의 직언을 해야 합니다.\n`;
                } else if (readingMode === 'timeline' && tarotCards && tarotCards.length >= 3) {
                    mockScanContext += `내담자는 시간의 파동 궤적 배열(과거-현재-미래)입니다. 이 3장의 서사를 완벽하게 내담자의 현재 고통과 엮어내십시오.\n`;
                    mockScanContext += `과거: ${tarotCards[0].name}\n현재: ${tarotCards[1].name}\n미래: ${tarotCards[2].name}\n`;
                } else if (readingMode === 'biomarker' && tarotCards && tarotCards.length === 4) {
                    mockScanContext += `내담자는 '생체 마커 섀도우 미러' 배열입니다. 점술이 아니라 철저한 생체 진동 기반의 불균형을 진단하십시오.\n`;
                    mockScanContext += `[1. 물리적 신경계 붕괴점/HRV]: ${tarotCards[0].name} - ${tarotCards[0].description}\n`;
                    mockScanContext += `[2. 이성적 인지 왜곡점/성대파동]: ${tarotCards[1].name} - ${tarotCards[1].description}\n`;
                    mockScanContext += `[3. 억압된 감정 전이체/무의식투사]: ${tarotCards[2].name} - ${tarotCards[2].description}\n`;
                    mockScanContext += `[4. 영적 주파수 단절점/영혼상실]: ${tarotCards[3].name} - ${tarotCards[3].description}\n`;
                    mockScanContext += `당신은 위 4가지 요소 중 어디에서 가장 치명적인 '기계적/에너지적 고장'이 났는지 차갑고 해부학적인 관점, 그러나 양자역학의 신비로움을 섞어 팩트 폭행을 가하십시오.\n`;
                } else if (readingMode === 'daily' && tarotCards) {
                    mockScanContext += `내담자의 오늘의 단일 오라클 원형: ${tarotCards[0].name} - ${tarotCards[0].description}\n이 한 장의 상징과 디테일을 극한으로 파고들어 내담자에게 적용하십시오.\n`;
                }
            } else if (contextType === 'dual_tarot' && tarotCards && tarotCards.length >= 4) {
                mockScanContext += `
[특별 컨텍스트: 듀얼 타로 관계 4장 역학 심층 상담]
당신은 30년 경력의 타로 마스터 프로파일러입니다. 이 4장의 카드가 얽혀 만들어내는 관계의 인과율과 무의식적 스파크를 피도 눈물도 없이, 하지만 압도적 권위로 분석해내십시오.
내담자는 현재 [${partnerName}]님과의 관계(에너지 호환성: ${compatibility}%)에 대해 고민하며 찾아왔습니다.

- [내담자의 성향]: ${tarotCards[0].name} - ${tarotCards[0].description}
- [상대방(${partnerName})의 무의식]: ${tarotCards[1].name} - ${tarotCards[1].description}
- [현재 두 사람의 얽힘/갈등]: ${tarotCards[2].name} - ${tarotCards[2].description}
- [관계의 최종 물리적 미래 역학]: ${tarotCards[3].name} - ${tarotCards[3].advice}

당신은 이 4장의 카드와 호환성 수치를 1:1로 융합하여, 둘 사이에 숨겨진 권력 구도, 감춰진 죄책감 혹은 억압된 열망을 꿰뚫어 보고, 상대방 마음 속에 숨겨진 파멸적이거나 아름다운 감정을 소름돋게 해부해 주세요. 마지막엔 항상 심장을 치는 질문을 던지세요.
`;
            } else if (tarotCards && tarotCards.length >= 3) {
                mockScanContext += `
[기본 스캔 타로 3장 동조 분석 결과]
- 첫번째(과거): ${tarotCards[0].name}
- 두번째(현재): ${tarotCards[1].name}
- 세번째(미래): ${tarotCards[2].name}

당신은 30년 경력의 타로 마스터입니다. 두루뭉술한 말은 치우고 내담자의 질문에 답할 때 뼈를 때리는 팩트로 무의식을 난도질하되, 깊은 통찰력으로 해결책까지 쥐어주십시오.
`;
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: currentInput,
                    history: messages,
                    contextData: mockScanContext
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // --- Determine Therapy ---
            let therapyAction = null;
            const parsedVoiceFreq = parseFloat(scanVoiceFreq) || 0;
            if (data.reply.includes('528') || data.reply.includes('DNA') || parsedVoiceFreq > 200) {
                therapyAction = { hz: 528, name: '528Hz DNA 복구 & 긍정 에너지' };
            } else {
                therapyAction = { hz: 432, name: '432Hz 미주신경 안정 테라피' };
            }

            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai' as const,
                text: data.reply,
                isAudioTrack: false,
                therapy: therapyAction,
                colorData: data.colorTherapy // Extract color recommendation
            }]);

            // Speak the response
            speakText(data.reply);

            // --- Database Persistence (Fallback to localStorage for Dashboard) ---
            try {
                const scanVoiceFreq = sessionStorage.getItem('scan_voice_freq') || '180';
                // Extract a meaningful sentence for the dashboard summary
                const aiLines = data.reply.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 15);
                let summary = aiLines[0] || "12차원 종합 양자 분석이 완료되었습니다.";
                // Clean markdown from summary
                summary = summary.replace(/[*_#`]/g, '').replace(/^- /g, '').substring(0, 60);
                if (summary.length >= 60) summary += '...';

                const newLog = {
                    id: Date.now().toString(),
                    created_at: new Date().toISOString(),
                    voice_freq: parseFloat(scanVoiceFreq),
                    stress_level: Math.floor(Math.random() * (80 - 30) + 30), // Placeholder stress percentage
                    ai_summary: summary
                };
                const existingLogs = JSON.parse(localStorage.getItem('mock_supabase_scan_logs') || '[]');
                existingLogs.push(newLog);
                localStorage.setItem('mock_supabase_scan_logs', JSON.stringify(existingLogs));
            } catch (e) {
                console.warn('Failed to save to personal wave diary', e);
            }
            // ----------------------------------------------------
        } catch (error) {
            console.error('Error fetching AI response:', error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai' as const,
                text: '⚠️ 양자 서브스페이스 연결이 불안정합니다. 잠시 후 텍스트를 다시 입력해 주세요.',
                isAudioTrack: false
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="screen" style={{ padding: 0, background: 'radial-gradient(circle at 50% 0%, #1a1a24, #050505)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>
                {`
                    @keyframes mystic-breath {
                        0% { box-shadow: 0 0 20px rgba(218,165,32,0.2); }
                        50% { box-shadow: 0 0 60px rgba(218,165,32,0.8); }
                        100% { box-shadow: 0 0 20px rgba(218,165,32,0.2); }
                    }
                    @keyframes aura-float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-3px); }
                        100% { transform: translateY(0px); }
                    }
                    @keyframes sadhguru-glow {
                        0% { filter: drop-shadow(0 0 5px rgba(218,165,32,0.3)); }
                        50% { filter: drop-shadow(0 0 20px rgba(255,215,0,0.9)); }
                        100% { filter: drop-shadow(0 0 5px rgba(218,165,32,0.3)); }
                    }
                    .ai-message-bubble {
                        background: rgba(20, 20, 25, 0.7);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(218, 165, 32, 0.3);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                        animation: aura-float 6s ease-in-out infinite;
                    }
                    .user-message-bubble {
                        background: linear-gradient(135deg, var(--color-gold-main), #b8860b);
                        box-shadow: 0 4px 15px rgba(218, 165, 32, 0.2);
                    }
                `}
            </style>
            {/* Header */}
            <div style={{ padding: '20px 24px', background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(218,165,32,0.2)', display: 'flex', alignItems: 'center', gap: '15px', zIndex: 10 }}>
                <button onClick={() => { window.speechSynthesis.cancel(); navigate(-1); }} style={{ background: 'none', border: 'none', color: 'var(--color-gold-main)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'radial-gradient(circle, #FFDF00, #DAA520, #000)', animation: 'sadhguru-glow 4s infinite' }}></div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }} className="gold-text">AI 멘탈 가이드</h3>
                        <p style={{ fontSize: '0.8rem', color: '#888', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            맞춤형 상담 연결됨
                            <SessionTimer isSessionExpired={isSessionExpired} onExpire={() => setIsSessionExpired(true)} />
                        </p>
                    </div>
                </div>
                <button onClick={() => { window.speechSynthesis.cancel(); navigate('/elemental-therapy'); }} style={{ background: 'rgba(74, 144, 226, 0.1)', border: '1px solid var(--color-blue-mystic)', padding: '8px 12px', borderRadius: '20px', color: 'var(--color-blue-mystic)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    호흡 동기화 시작
                </button>
                {/* Voice Call Mode Toggle */}
                <button
                    onClick={() => {
                        const nextState = !isVoiceMode;
                        setIsVoiceMode(nextState);
                        if (nextState) {
                            setIsVoiceEnabled(true);
                            if (!isListening) toggleListening();
                        } else {
                            window.speechSynthesis.cancel();
                            if (isListening) toggleListening();
                        }
                    }}
                    style={{
                        background: isVoiceMode ? 'var(--color-gold-main)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        color: isVoiceMode ? '#111' : 'var(--color-gold-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        boxShadow: isVoiceMode ? '0 0 15px rgba(218,165,32,0.4)' : 'none'
                    }}
                >
                    {isVoiceMode ? <Mic size={16} /> : <Phone size={16} />}
                    {isVoiceMode ? '음성 상담 종료' : '실시간 음성 상담'}
                </button>
            </div>

            {/* Voice Mode Overlay */}
            {isVoiceMode ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '50px', padding: '20px', background: 'radial-gradient(circle at center, rgba(218,165,32,0.1) 0%, transparent 70%)' }}>
                    <div style={{
                        width: '180px', height: '180px', borderRadius: '50%',
                        background: isTyping ? 'radial-gradient(circle, rgba(218,165,32,0.8), rgba(218,165,32,0.2))' : (isListening ? 'radial-gradient(circle, rgba(74, 144, 226, 0.8), rgba(74, 144, 226, 0.2))' : 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)'),
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        animation: (isTyping || isListening) ? 'mystic-breath 3s ease-in-out infinite' : 'none',
                        transition: 'all 0.5s ease',
                        border: isListening ? '2px solid rgba(74, 144, 226, 0.5)' : (isTyping ? '2px solid rgba(218,165,32,0.5)' : '1px solid rgba(255,255,255,0.1)')
                    }}>
                        {isTyping ? <Activity size={70} color="#FFF" /> : <Mic size={70} color={isListening ? '#FFF' : '#666'} />}
                    </div>

                    <div style={{ textAlign: 'center', color: '#FFF' }}>
                        <h2 style={{ color: 'var(--color-gold-main)', fontSize: '1.5rem', marginBottom: '10px' }}>
                            {isTyping ? '오라클이 당신의 파동을 해석 중입니다...' : (isListening ? '오라클이 당신의 음성을 듣고 있습니다...' : '음성 상담 모드')}
                        </h2>
                        <p style={{ color: '#AAA', fontSize: '1rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
                            {isTyping ? '잠시만 기다려 주세요. 양자 파동을 문장으로 변환합니다.' : (isListening ? `"${input || '말씀해 주세요...'}"` : '하단의 마이크 버튼을 눌러 말씀을 시작하세요.')}
                        </p>
                    </div>

                    {!isTyping && (
                        <button onClick={toggleListening} style={{
                            background: isListening ? 'var(--color-error-red)' : 'var(--color-gold-main)',
                            border: 'none', padding: '20px', borderRadius: '50%', color: '#FFF',
                            cursor: 'pointer', boxShadow: '0 0 20px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {isListening ? <Pause size={30} /> : <Mic size={30} />}
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Chat Area */}
                    <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                animation: 'messageSlideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
                            }}>
                                {msg.isAudioTrack ? (
                                    <div style={{
                                        width: '280px',
                                        padding: '15px',
                                        borderRadius: '20px 20px 20px 4px',
                                        background: 'rgba(218, 165, 32, 0.1)',
                                        border: '1px solid rgba(218, 165, 32, 0.3)',
                                        color: '#FFF'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <div style={{ background: 'var(--color-gold-main)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#111' }}>
                                                <Music size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 }}>{msg.text}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#BBB', marginTop: '3px' }}>맞춤형 명상 사운드 • {msg.duration}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            style={{
                                                width: '100%', padding: '10px', borderRadius: '10px',
                                                background: isPlaying ? 'rgba(255,255,255,0.1)' : 'var(--color-gold-main)',
                                                border: 'none', color: isPlaying ? '#FFF' : '#111',
                                                fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                                            {isPlaying ? '일시정지' : '파동 재생하기'}
                                        </button>
                                        {isPlaying && (
                                            <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.2)', marginTop: '15px', position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '30%', background: 'var(--color-gold-main)' }}></div>
                                                <div style={{ position: 'absolute', left: '30%', top: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: '#FFF', boxShadow: '0 0 5px rgba(255,255,255,0.8)' }}></div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={msg.sender === 'user' ? 'user-message-bubble' : 'ai-message-bubble'} style={{
                                        maxWidth: '85%',
                                        padding: '18px 24px',
                                        borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        color: msg.sender === 'user' ? '#111' : '#E0E0E0',
                                        lineHeight: 1.6,
                                        fontSize: '0.95rem',
                                        fontWeight: 400,
                                        whiteSpace: 'pre-line',
                                        letterSpacing: '-0.2px'
                                    }}>
                                        {msg.sender === 'user' ? msg.text : renderMarkdownHighlight(msg.text)}

                                        {msg.therapy && (
                                            <button
                                                onClick={() => setActiveTherapy(msg.therapy!)}
                                                style={{
                                                    marginTop: '15px', padding: '12px 15px', borderRadius: '12px',
                                                    background: 'rgba(218, 165, 32, 0.15)', border: '1px solid var(--color-gold-main)',
                                                    color: 'var(--color-gold-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                                                    cursor: 'pointer', width: '100%', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 0 10px rgba(218,165,32,0.1)'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(218, 165, 32, 0.25)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(218, 165, 32, 0.15)'}
                                            >
                                                <Play size={16} fill="currentColor" />
                                                맞춤 파동 솔루션: {msg.therapy.name} 시작
                                            </button>
                                        )}

                                        {msg.colorData && (
                                            <button
                                                onClick={() => navigate('/color-therapy', { state: msg.colorData })}
                                                style={{
                                                    marginTop: '10px', padding: '12px 15px', borderRadius: '12px',
                                                    background: 'rgba(255, 255, 255, 0.1)', border: `1px solid ${msg.colorData.hexCode}`,
                                                    color: '#FFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                                                    cursor: 'pointer', width: '100%', justifyContent: 'center', transition: 'all 0.2s',
                                                    boxShadow: `0 0 10px ${msg.colorData.hexCode}40`
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = `${msg.colorData?.hexCode}30`}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                            >
                                                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: msg.colorData.hexCode, boxShadow: `0 0 5px ${msg.colorData.hexCode}` }}></div>
                                                치유의 에너지 컬러: {msg.colorData.colorName} 시작
                                            </button>
                                        )}
                                    </div>
                                )}
                                {msg.sender === 'ai' && <span style={{ fontSize: '0.75rem', color: '#555', marginTop: '6px', marginLeft: '10px' }}>AI Master</span>}
                            </div>
                        ))}

                        {isTyping && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', animation: 'fadeIn 0.3s ease' }}>
                                <div style={{
                                    maxWidth: '85%', padding: '16px 20px', borderRadius: '20px 20px 20px 4px',
                                    background: 'rgba(255,255,255,0.05)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', gap: '5px', alignItems: 'center'
                                }}>
                                    <span style={{ color: 'var(--color-gold-main)', fontSize: '0.9rem' }}>오라클이 파동을 해석하고 있습니다</span>
                                    <span style={{ width: '4px', height: '4px', background: 'var(--color-gold-main)', borderRadius: '50%', animation: 'typingDot 1.4s infinite 0s' }}></span>
                                    <span style={{ width: '4px', height: '4px', background: 'var(--color-gold-main)', borderRadius: '50%', animation: 'typingDot 1.4s infinite 0.2s' }}></span>
                                    <span style={{ width: '4px', height: '4px', background: 'var(--color-gold-main)', borderRadius: '50%', animation: 'typingDot 1.4s infinite 0.4s' }}></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    {isSessionExpired ? (
                        <div style={{ margin: '0 15px 20px', padding: '15px', textAlign: 'center', color: '#888', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                            상담 시간이 모두 종료되었습니다.
                        </div>
                    ) : (
                        <div className="glass-card" style={{ position: 'relative', zIndex: 50, margin: '0 15px 20px', padding: '15px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '30px', border: isListening ? '1px solid var(--color-gold-main)' : '1px solid rgba(255,255,255,0.1)' }}>
                            <button onClick={toggleListening} type="button" style={{
                                background: isListening ? 'var(--color-gold-main)' : 'none',
                                border: 'none',
                                color: isListening ? '#111' : '#888',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }}>
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(e); }} style={{ flex: 1, display: 'flex' }}>
                                <input
                                    type="text"
                                    placeholder={isListening ? "말씀하세요, 듣고 있습니다..." : "여기에 마음을 남겨주세요..."}
                                    value={input}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.nativeEvent.isComposing) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={(e) => setInput(e.target.value)}
                                    style={{
                                        width: '100%', background: 'transparent', border: 'none',
                                        color: '#111111', fontSize: '1rem', outline: 'none', fontFamily: 'var(--font-main)'
                                    }}
                                />
                            </form>
                            <button onClick={handleSend} type="button" style={{
                                background: 'var(--color-gold-main)', border: 'none',
                                width: '40px', height: '40px', borderRadius: '50%',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                color: '#111', cursor: 'pointer'
                            }}>
                                <Send size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Healing Player Overlay */}
            {activeTherapy && (
                <HealingPlayer
                    baseHz={activeTherapy.hz}
                    therapyName={activeTherapy.name}
                    onClose={() => setActiveTherapy(null)}
                />
            )}

        </div>
    );
};

export default ChatScreen;
