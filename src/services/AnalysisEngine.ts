// src/services/AnalysisEngine.ts

export interface PreScanSurvey {
    sleepQuality: number; // 1 (Worst) to 5 (Best)
    stressLevel: number; // 1 (Lowest) to 5 (Highest)
    vitality: number; // 1 (Exhausted) to 5 (Energetic)
    mentalState: '우울' | '불안' | '공황장애' | '강박증' | '중독증' | '무기력' | '평온함' | '기타';
}

export interface ScanInputData {
    birthDate: string; // YYYY-MM-DD
    birthTime: string; // HH:MM
    survey: PreScanSurvey;
    vsaScore: number; // 0-100 from Mic
    factCount: number; // from FaceMesh
}

export interface CalculatedResult {
    chakras: {
        root: number;
        sacral: number;
        solarPlexus: number;
        heart: number;
        throat: number;
        thirdEye: number;
        crown: number;
    };
    auraColor: string;
    stressIndex: number;
    overallEnergy: number;
    primaryIssue: string;
}

export class AnalysisEngine {

    /**
     * Determine a base deterministic random number (0-1) from a string seed.
     * Useful for deriving base chakra stats from birthdate.
     */
    private static seedRandom(seedStr: string): number {
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            const char = seedStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    }

    public static calculateResults(input: ScanInputData): CalculatedResult {
        console.log("🌌 [AnalysisEngine] Real Data Integration Input:", JSON.parse(JSON.stringify(input)));
        // 1. Base Destiny (Bazi/Numerology simulation)
        const seed1 = this.seedRandom(input.birthDate + input.birthTime + "A");
        const seed2 = this.seedRandom(input.birthDate + input.birthTime + "B");
        const seed3 = this.seedRandom(input.birthDate + input.birthTime + "C");

        // Base chakras around 50-80 based on birth date constraints
        let baseRoot = 50 + (seed1 * 30);
        let baseSacral = 50 + (seed2 * 30);
        let baseSolarPlexus = 50 + (seed3 * 30);
        let baseHeart = 50 + (this.seedRandom(input.birthDate + "D") * 30);
        let baseThroat = 50 + (this.seedRandom(input.birthDate + "E") * 30);
        let baseThirdEye = 50 + (this.seedRandom(input.birthDate + "F") * 30);
        let baseCrown = 50 + (this.seedRandom(input.birthDate + "G") * 30);

        // 2. Apply Survey Modifiers (Crucial for User's "Real" Feedback Feeling)

        // Vitality heavily affects Root(1) and Sacral(2)
        const vitalityMod = (input.survey.vitality - 3) * 10; // -20 to +20
        baseRoot += vitalityMod;
        baseSacral += vitalityMod;

        // Stress affects Heart(4) and Solar Plexus(3)
        const stressMod = (input.survey.stressLevel - 3) * -10; // High stress (-20) to Low stress (+20)
        baseHeart += stressMod;
        baseSolarPlexus += stressMod;

        // Sleep affects Third Eye(6) and Crown(7)
        const sleepMod = (input.survey.sleepQuality - 3) * 10; // Bad sleep (-20) to Good sleep (+20)
        baseThirdEye += sleepMod;
        baseCrown += sleepMod;

        // 3. Apply Specific Mental State Filters
        let primaryIssue = '균형 상태';
        switch (input.survey.mentalState) {
            case '우울': // Depression: Low life force (Root/Heart)
                baseRoot -= 15; baseHeart -= 20; baseThroat -= 10;
                primaryIssue = '심장 차크라(감정/수용) 및 뿌리(생명력) 침체';
                break;
            case '불안': // Anxiety: Hyperactive fearful energy (Root low, Third eye erratic/low)
                baseRoot -= 20; baseSolarPlexus -= 15; baseThirdEye -= 15;
                primaryIssue = '뿌리 차크라 물리적 기반 불안정 및 명치(소화/긴장) 과부하';
                break;
            case '공황장애': // Panic: Heart and Throat blockage
                baseHeart -= 25; baseThroat -= 20; baseCrown -= 15;
                primaryIssue = '가슴(Heart) 및 목(Throat) 차크라 급성 수축 및 호흡 불안정';
                break;
            case '강박증': // OCD: Overactive/Blocked Third Eye and Solar Plexus
                baseThirdEye -= 20; baseSolarPlexus -= 20;
                primaryIssue = '제3의 눈(사고) 과부하 및 강한 통제 욕구 충돌';
                break;
            case '중독증': // Addiction: Sacral (pleasure) imbalance, Root low
                baseSacral -= 25; baseRoot -= 20;
                primaryIssue = '천골(쾌락/도파민) 차크라 과결핍 및 현실 뿌리 이탈';
                break;
            case '무기력': // Lethargy: Everything low, especially Solar Plexus (Willpower)
                baseSolarPlexus -= 25; baseSacral -= 15; baseRoot -= 15;
                primaryIssue = '태양신경총(의지력/자신감) 차크라 고갈 상태';
                break;
        }

        // 4. Apply Live Sensor (VSA) Data
        // VSA Score (0-100) reflects vocal cord tension and micro-tremors from the live scan
        // Higher VSA (e.g. > 60) represents vocal stress/tension.
        const vsaTensionMod = (50 - input.vsaScore) * 0.3; // High VSA lowers Throat/Heart further
        baseThroat += vsaTensionMod;
        baseHeart += vsaTensionMod;

        // Ensure all chakras remain within 10 - 99 bounds
        const clamp = (val: number) => Math.floor(Math.max(10, Math.min(99, val)));

        const finalChakras = {
            root: clamp(baseRoot),
            sacral: clamp(baseSacral),
            solarPlexus: clamp(baseSolarPlexus),
            heart: clamp(baseHeart),
            throat: clamp(baseThroat),
            thirdEye: clamp(baseThirdEye),
            crown: clamp(baseCrown),
        };

        // 5. Calculate Global Metrics
        const total = finalChakras.root + finalChakras.sacral + finalChakras.solarPlexus + finalChakras.heart + finalChakras.throat + finalChakras.thirdEye + finalChakras.crown;
        const overallEnergy = clamp(total / 7);

        // Stress Index calculation: Higher physical/mental stress survey + High VSA + Low Chakras = High Stress Index
        let baseStress = (input.survey.stressLevel / 5) * 40; // up to 40
        baseStress += ((5 - input.survey.sleepQuality) / 5) * 20; // up to 20
        baseStress += ((5 - input.survey.vitality) / 5) * 20; // up to 20
        baseStress += (input.vsaScore / 100) * 20; // up to 20 (from mic tension)

        let stressIndex = clamp(baseStress);

        // Modify Aura color based on dominant states and overall energy
        let auraColor = '#D4AF37'; // Default Gold

        if (stressIndex > 80 || input.survey.mentalState === '공황장애' || input.survey.mentalState === '불안') {
            auraColor = '#EF4444'; // Red (High Alert/Danger)
        } else if (input.survey.mentalState === '우울' || input.survey.mentalState === '무기력') {
            auraColor = '#64748B'; // Slate/Greyish (Depleted, Stagnant)
        } else if (input.survey.mentalState === '강박증') {
            auraColor = '#F59E0B'; // Amber/Orange (Overactive mind, anxious)
        } else if (overallEnergy < 40) {
            auraColor = '#3B82F6'; // Blue (Low energy, needs rest)
        } else if (overallEnergy > 80 && stressIndex < 40) {
            auraColor = '#A855F7'; // Purple (Spiritual balance, high vibration)
        } else if (finalChakras.heart > 80) {
            auraColor = '#22C55E'; // Green (Heart dominant)
        } else {
            // General combinations
            if (finalChakras.thirdEye > 70) auraColor = '#6366F1'; // Indigo
            else if (finalChakras.sacral > 70) auraColor = '#F97316'; // Orange
        }

        return {
            chakras: finalChakras,
            auraColor,
            stressIndex,
            overallEnergy,
            primaryIssue
        };
    }
}
