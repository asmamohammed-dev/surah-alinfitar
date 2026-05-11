/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Award,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  SkipBack,
  SkipForward
} from 'lucide-react';

// Types
type Screen = 'welcome' | 'listening' | 'ordering' | 'meanings' | 'results';

interface Verse {
  id: number;
  text: string;
}

interface MeaningPair {
  id: number;
  word: string;
  meaning: string;
}

const VERSES: Verse[] = [
  { id: 1, text: "إِذَا السَّمَاءُ انفَطَرَتْ" },
  { id: 2, text: "وَإِذَا الْكَوَاكِبُ انتَثَرَتْ" },
  { id: 3, text: "وَإِذَا الْبِحَارُ فُجِّرَتْ" },
  { id: 4, text: "وَإِذَا الْقُبُورُ بُعْثِرَتْ" },
];

const FULL_VERSES: Verse[] = [
  { id: 1, text: "إِذَا السَّمَاءُ انفَطَرَتْ" },
  { id: 2, text: "وَإِذَا الْكَوَاكِبُ انتَثَرَتْ" },
  { id: 3, text: "وَإِذَا الْبِحَارُ فُجِّرَتْ" },
  { id: 4, text: "وَإِذَا الْقُبُورُ بُعْثِرَتْ" },
  { id: 5, text: "عَلِمَتْ نَفْسٌ مَّا قَدَّمَتْ وَأَخَّرَتْ" },
  { id: 6, text: "يَا أَيُّهَا الإِنسَانُ مَا غَرَّكَ بِرَبِّكَ الْكَرِيمِ" },
  { id: 7, text: "الَّذِي خَلَقَكَ فَسَوَّاكَ فَعَدَلَكَ" },
  { id: 8, text: "فِي أَيِّ صُورَةٍ مَّا شَاء رَكَّبَكَ" },
  { id: 9, text: "كَلاَّ بَلْ تُكَذِّبُونَ بِالدِّينِ" },
  { id: 10, text: "وَإِنَّ عَلَيْكُمْ لَحَافِظِينَ" },
  { id: 11, text: "كِرَامًا كَاتِبِينَ" },
  { id: 12, text: "يَعْلَمُونَ مَا تَفْعَلُونَ" },
  { id: 13, text: "إِنَّ الأَبْرَارَ لَفِي نَعِيمٍ" },
  { id: 14, text: "وَإِنَّ الْفُجَّارَ لَفِي جَحِيمٍ" },
  { id: 15, text: "يَصْلَوْنَهَا يَوْمَ الدِّينِ" },
  { id: 16, text: "وَمَا هُمْ عَنْهَا بِغَائِبِينَ" },
  { id: 17, text: "وَمَا أَدْرَاكَ مَا يَوْمُ الدِّينِ" },
  { id: 18, text: "ثُمَّ مَا أَدْرَاكَ مَا يَوْمُ الدِّينِ" },
  { id: 19, text: "يَوْمَ لا تَمْلِكُ نَفْسٌ لِّنَفْسٍ شَيْئًا وَالأَمْرُ يَوْمَئِذٍ لِلَّهِ" },
];

const MEANINGS: MeaningPair[] = [
  { id: 1, word: "انفطرت", meaning: "انشقت عند قيام الساعة" },
  { id: 2, word: "انتثرت", meaning: "تفرقت وتساقطت" },
  { id: 3, word: "فجرت", meaning: "فتحت بعضها على بعض فصارت بحراً واحداً" },
  { id: 4, word: "بعثرت", meaning: "قُلب ترابها وأُخرج موتاها" },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });
  
  // Audio State
  const [currentVerseId, setCurrentVerseId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  // Ordering State
  const [userOrder, setUserOrder] = useState<Verse[]>([]);
  const [remainingVerses, setRemainingVerses] = useState<Verse[]>([...VERSES].sort(() => Math.random() - 0.5));

  // Meanings State
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);

  // Screens Map for Progress Bar
  const SCREENS: { id: Screen, label: string }[] = [
    { id: 'welcome', label: 'البداية' },
    { id: 'listening', label: 'الاستماع' },
    { id: 'ordering', label: 'الترتيب' },
    { id: 'meanings', label: 'المعاني' },
    { id: 'results', label: 'النتيجة' }
  ];

  const currentStep = SCREENS.findIndex(s => s.id === screen);

  // Audio Logic
  const playVerse = (id: number) => {
    if (audioInstance) {
      audioInstance.pause();
    }

    const verseNum = id.toString().padStart(3, '0');
    // Using a reliable source for Quran audio
    const audioUrl = `https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/082${verseNum}.mp3`;
    const newAudio = new Audio(audioUrl);
    
    newAudio.onplay = () => setIsPlaying(true);
    newAudio.onpause = () => setIsPlaying(false);
    newAudio.onended = () => {
      setIsPlaying(false);
      setCurrentVerseId(null);
    };
    newAudio.onerror = () => {
      setFeedback({ type: 'error', message: "عذراً، تعذر تحميل الملف الصوتي." });
      setIsPlaying(false);
      setCurrentVerseId(null);
    };

    newAudio.play();
    setAudioInstance(newAudio);
    setCurrentVerseId(id);
  };

  const toggleVerse = (id: number) => {
    if (currentVerseId === id && isPlaying) {
      audioInstance?.pause();
    } else {
      playVerse(id);
    }
  };

  const repeatVerse = (id: number) => {
    playVerse(id);
  };

  // Cleanup audio on screen change or unmount
  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [screen]);

  // Feedback timer
  useEffect(() => {
    if (feedback.type) {
      const timer = setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const resetGame = () => {
    setScreen('welcome');
    setScore(0);
    setUserOrder([]);
    setRemainingVerses([...VERSES].sort(() => Math.random() - 0.5));
    setMatchedIds([]);
    setSelectedWord(null);
  };

  const handleNextScreen = (next: Screen) => {
    setScreen(next);
  };

  // Ordering Logic
  const handleAddToOrder = (verse: Verse) => {
    const nextExpectedId = userOrder.length + 1;
    if (verse.id === nextExpectedId) {
      setUserOrder([...userOrder, verse]);
      setRemainingVerses(remainingVerses.filter(v => v.id !== verse.id));
      setFeedback({ type: 'success', message: "أحسنت! ترتيب صحيح." });
      setScore(prev => prev + 10);
    } else {
      setFeedback({ type: 'error', message: "فكر قليلاً! ما هي الآية التي تسبقها؟" });
    }
  };

  // Meanings Logic
  const handleWordSelect = (id: number) => {
    setSelectedWord(id);
  };

  const handleMeaningSelect = (id: number) => {
    if (selectedWord === id) {
      setMatchedIds([...matchedIds, id]);
      setSelectedWord(null);
      setFeedback({ type: 'success', message: "إجابة دقيقة!" });
      setScore(prev => prev + 15);
    } else if (selectedWord !== null) {
      setFeedback({ type: 'error', message: "حاول مرة أخرى، اقرأ الكلمة والمعنى جيداً." });
      setSelectedWord(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-blue-800 to-sky-700 font-sans text-white relative overflow-hidden flex flex-col items-center justify-center p-4 pt-24">
      {/* Decorative Stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="star absolute w-1 h-1 bg-white opacity-40 shadow-[0_0_5px_white]"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Progress Bar Container */}
      <div className="fixed top-0 left-0 w-full p-4 z-50 flex justify-center">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 flex items-center justify-between gap-4">
          {SCREENS.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center gap-1 flex-1 relative">
              {/* Line between dots */}
              {idx < SCREENS.length - 1 && (
                <div className={`absolute top-2.5 left-1/2 w-full h-[2px] -z-10 transition-colors duration-500 ${
                  idx < currentStep ? 'bg-amber-400' : 'bg-white/20'
                }`} />
              )}
              
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                  idx <= currentStep 
                    ? 'bg-amber-400 border-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]' 
                    : 'bg-indigo-900 border-white/20'
                }`}
              >
                {idx < currentStep && <CheckCircle2 size={12} className="text-indigo-900" />}
              </div>
              <span className={`text-[10px] md:text-xs font-bold transition-colors ${
                idx <= currentStep ? 'text-amber-400' : 'text-blue-200/40'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <motion.div 
        layout
        className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative z-10"
      >
        <AnimatePresence mode="wait">
          {/* Feedback Overlay */}
          {feedback.type && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className={`absolute top-0 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full shadow-lg flex items-center gap-3 border ${
                feedback.type === 'success' ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <Lightbulb size={20} />}
              <span className="font-bold">{feedback.message}</span>
            </motion.div>
          )}

          {screen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="p-8 text-center flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/20 mb-2">
                <BookOpen size={48} className="text-indigo-900" />
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                سورة الانفطار
              </h1>
              <p className="text-xl text-blue-100 max-w-md">
                أهلاً بك يا بطل! هل أنت مستعد لرحلة استكشاف معاني سورة الانفطار؟
              </p>
              <button
                id="start-button"
                onClick={() => handleNextScreen('listening')}
                className="group relative px-10 py-4 bg-amber-500 hover:bg-amber-400 text-indigo-900 font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 text-xl"
              >
                لـنـبـدأ الآن
                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {screen === 'listening' && (
            <motion.div
              key="listening"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="p-6 md:p-8 flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Volume2 className="text-amber-400" />
                  استمع وتدبر الآيات الكريمة
                </h2>
                <div className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold">قرآن كريم</div>
              </div>

              {/* Player UI */}
              <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-3 custom-scrollbar">
                {FULL_VERSES.map((verse) => (
                  <motion.div
                    key={verse.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      currentVerseId === verse.id 
                        ? 'bg-amber-400/20 border-amber-400 scale-[1.02] shadow-lg shadow-amber-400/5' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleVerse(verse.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          currentVerseId === verse.id && isPlaying
                            ? 'bg-indigo-600 text-white shadow-inner'
                            : 'bg-amber-400 text-indigo-900 hover:bg-amber-300 shadow-md'
                        }`}
                      >
                        {currentVerseId === verse.id && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="translate-x-[-1px]" fill="currentColor" />}
                      </button>
                      <button
                        onClick={() => repeatVerse(verse.id)}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                        title="تكرار الآية"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                    
                    <div className="flex-1 text-right">
                      <span className={`text-xl font-serif block ${
                        currentVerseId === verse.id ? 'text-amber-300 font-bold' : 'text-white/90'
                      }`}>
                        {verse.text}
                      </span>
                      <span className="text-[10px] text-blue-200/40 font-mono mt-1 block">آية {verse.id}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-center">
                <button
                  onClick={() => handleNextScreen('ordering')}
                  className="px-12 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-bold flex items-center gap-2 shadow-lg group transition-all"
                >
                  انتقل للتحدي الأول
                  <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'ordering' && (
            <motion.div
              key="ordering"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="text-amber-400" />
                  رتب الآيات الكريمة
                </h2>
                <div className="bg-white/20 px-4 py-1 rounded-full text-sm">المستوى ١ من ٢</div>
              </div>
              
              <div className="space-y-3 mb-8 min-h-[160px] border-2 border-dashed border-white/20 rounded-2xl p-4 bg-black/10">
                {userOrder.length === 0 && (
                  <p className="text-center text-blue-300 py-10 italic">اختر الآية الصحيحة لتضعها هنا بترتيبها الصحيح</p>
                )}
                {userOrder.map((verse, i) => (
                  <motion.div
                    key={verse.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/80 p-3 rounded-xl border border-emerald-400 flex items-center justify-between"
                  >
                    <span className="text-lg">{verse.text}</span>
                    <span className="bg-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {verse.id}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {remainingVerses.map((verse) => (
                  <button
                    key={verse.id}
                    onClick={() => handleAddToOrder(verse)}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-right transition-all hover:border-amber-400/50 hover:translate-y-[-2px]"
                  >
                    {verse.text}
                  </button>
                ))}
              </div>

              {userOrder.length === VERSES.length && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={() => handleNextScreen('meanings')}
                    className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                  >
                    المستوى التالي
                    <ChevronLeft />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {screen === 'meanings' && (
            <motion.div
              key="meanings"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <BookOpen className="text-amber-400" />
                  صل الكلمة بمعناها
                </h2>
                <div className="bg-white/20 px-4 py-1 rounded-full text-sm">المستوى ٢ من ٢</div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                {/* Words Column */}
                <div className="space-y-4">
                  <h3 className="text-blue-300 text-sm font-bold mb-2">الكلمة</h3>
                  {MEANINGS.map((item) => (
                    <button
                      key={`word-${item.id}`}
                      disabled={matchedIds.includes(item.id)}
                      onClick={() => handleWordSelect(item.id)}
                      className={`w-full p-4 rounded-xl text-center font-bold transition-all border-2 ${
                        matchedIds.includes(item.id) 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 opacity-50 cursor-default' 
                          : selectedWord === item.id 
                            ? 'bg-amber-400 border-amber-500 text-indigo-900 scale-105 ring-4 ring-amber-400/20' 
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {item.word}
                    </button>
                  ))}
                </div>

                {/* Meanings Column */}
                <div className="space-y-4">
                  <h3 className="text-blue-300 text-sm font-bold mb-2">المعنى</h3>
                  {[...MEANINGS].sort(() => Math.random() - 0.5).map((item) => (
                    <button
                      key={`meaning-${item.id}`}
                      disabled={matchedIds.includes(item.id)}
                      onClick={() => handleMeaningSelect(item.id)}
                      className={`w-full p-3 rounded-xl text-right text-sm transition-all border-2 min-h-[64px] flex items-center justify-end px-4 ${
                        matchedIds.includes(item.id) 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 opacity-50 cursor-default' 
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {item.meaning}
                    </button>
                  ))}
                </div>
              </div>

              {matchedIds.length === MEANINGS.length && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 flex justify-center"
                >
                  <button
                    onClick={() => handleNextScreen('results')}
                    className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-indigo-900 font-bold rounded-2xl shadow-xl flex items-center gap-2"
                  >
                    رؤية النتيجة النهائية
                    <Award />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {screen === 'results' && (
            <motion.div
              key="results"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-10 text-center"
            >
              <motion.div
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="w-32 h-32 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-8 relative"
              >
                <Award size={64} className="text-indigo-900" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-400 rounded-full blur-xl -z-10"
                />
              </motion.div>

              <h2 className="text-4xl font-serif font-bold mb-4">ممتاز يا بطل!</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-sm mx-auto">
                لقد أنجزت جميع المهام بنجاح وفهمت معاني آيات سورة الانفطار العظيمة.
              </p>

              <div className="bg-indigo-900/50 p-6 rounded-3xl border border-white/10 mb-10 inline-block px-12">
                <div className="text-blue-300 text-sm mb-1 uppercase tracking-widest font-bold">نقاطك الكلية</div>
                <div className="text-5xl font-bold text-amber-400">{score} </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <button
                  onClick={resetGame}
                  className="w-full md:w-auto px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <RefreshCcw size={20} />
                  إعادة المحاولة
                </button>
                <a
                  href="/"
                  className="w-full md:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 text-white"
                >
                  الخروج
                  <XCircle size={20} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-blue-200/50 text-sm flex items-center gap-2"
      >
        <span>التربية الإسلامية - الصف الرابع الابتدائي</span>
        <div className="w-1 h-1 bg-blue-200/50 rounded-full" />
        <span>سورة الانفطار</span>
      </motion.div>
    </div>
  );
}

