import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getTranslation } from '../translations';
import HexNode from '../components/HexNode';
import Particles from '../components/Particles';

// Adjust Y positions slightly to fit better within 100vh
const levelData = [
  { id: 1, title: 'Energy Intro', icon: '\u{1F50B}', type: 'info', x: 20, y: 75, color: 'blue' },
  { id: 2, title: 'Energy Meter', icon: '\u{26A1}', type: 'activity', x: 50, y: 60, color: 'green' },
  { id: 3, title: 'Carbon Crisis', icon: '\u{1F525}', type: 'challenge', x: 80, y: 45, color: 'red' },
  { id: 4, title: 'Solar Revolution', icon: '\u{2600}\u{FE0F}', type: 'activity', x: 50, y: 30, color: 'amber' },
  { id: 5, title: 'Smart Home', icon: '\u{1F3E0}', type: 'boss', x: 20, y: 15, color: 'green' }
];

// ═══ PRE-LEVEL-1 CONCEPT CARDS ═══
const CONCEPT_CARDS = [
  {
    icon: '🌱',
    title: 'Sustainability',
    color: '#22c55e',
    tagline: 'Building a Future That Lasts',
    description: 'Sustainability means meeting our present needs — energy, food, shelter — without compromising the ability of future generations to meet theirs.',
    keyPoints: [
      'Balance between economic growth, environmental care, and social well-being',
      'Using renewable resources instead of depleting finite ones',
      'Every small action — saving electricity, reducing waste — contributes to a sustainable world',
    ],
    example: 'Using solar panels instead of coal-powered electricity ensures clean energy for decades without polluting the air.',
  },
  {
    icon: '🏭',
    title: 'Decarbonization',
    color: '#3b82f6',
    tagline: 'Removing Carbon from Our Energy',
    description: 'Decarbonization is the process of reducing carbon dioxide (CO₂) emissions produced by burning fossil fuels for energy, transport, and industry.',
    keyPoints: [
      'Fossil fuels (coal, oil, gas) release CO₂ when burned — this traps heat and causes global warming',
      'Switching to renewable energy (solar, wind, hydro) eliminates carbon at the source',
      'Energy-efficient appliances, electric vehicles, and smart grids all help decarbonize',
    ],
    example: 'Replacing a coal power plant with a solar farm eliminates thousands of tonnes of CO₂ every year.',
  },
  {
    icon: '🎯',
    title: 'Net Zero',
    color: '#f59e0b',
    tagline: 'Balancing What We Emit',
    description: 'Net Zero means balancing the total greenhouse gases emitted with the total amount removed from the atmosphere, so the net emissions equal zero.',
    keyPoints: [
      'It doesn\'t mean zero emissions — it means whatever we emit, we also absorb or offset',
      'Trees, oceans, and carbon capture technology help remove CO₂ from the air',
      'India has pledged to achieve Net Zero by 2070, joining the global fight against climate change',
    ],
    example: 'A home that generates its own solar energy and plants trees to offset remaining emissions is working toward Net Zero.',
  },
];

const HubScreen = () => {
  const { carbonCoins, currentLevel, language } = useGame();
  const t = getTranslation(language);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showConceptCards, setShowConceptCards] = useState(false);
  const [conceptIndex, setConceptIndex] = useState(0);
  const [conceptAnim, setConceptAnim] = useState('enter');
  const navigate = useNavigate();

  const getStatus = (nodeId) => {
    if (nodeId < currentLevel) return 'completed';
    if (nodeId === currentLevel) return 'unlocked';
    return 'locked';
  };

  const handleNodeClick = (node) => {
    if (getStatus(node.id) !== 'locked') setSelectedNode(node);
  };

  const handleStartMission = () => {
    const nodeId = selectedNode?.id;
    setSelectedNode(null);
    if (nodeId === 1) {
      // Show concept cards before Level 1
      setShowConceptCards(true);
      setConceptIndex(0);
      setConceptAnim('enter');
    } else {
      navigate(`/level${nodeId}`);
    }
  };

  const handleNextConcept = () => {
    if (conceptIndex < CONCEPT_CARDS.length - 1) {
      setConceptAnim('exit');
      setTimeout(() => {
        setConceptIndex(i => i + 1);
        setConceptAnim('enter');
      }, 300);
    } else {
      setShowConceptCards(false);
      navigate('/level1');
    }
  };

  const handleSkipConcepts = () => {
    setShowConceptCards(false);
    navigate('/level1');
  };

  return (
    <motion.div 
      className="w-full h-screen overflow-hidden flex flex-col items-center justify-between text-white z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ backgroundColor: '#0a1628' }}
    >
      <Particles count={25} />

      {/* Top HUD (Fixed Height) */}
      <div 
        className="w-full h-14 shrink-0 flex items-center justify-between px-4 z-30 shadow-md border-b"
        style={{ backgroundColor: '#050a15', borderColor: '#1e293b' }}
      >
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-[0_0_8px_#22c55e]" style={{ backgroundColor: '#22c55e', color: '#050a15' }}>{'\u{1F30D}'}</div>
           <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-[#9ca3af]" style={{ fontFamily: 'Nunito, sans-serif' }}>{t?.hub?.planetaryHealth || 'Planetary Health'}</span>
              <div className="w-24 h-1.5 rounded-full overflow-hidden bg-[#050a15] border border-white/20">
                 <div className="h-full rounded-full transition-all duration-1000 bg-[#22c55e]" style={{ width: '15%' }} />
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-[#f59e0b]/20 border-[#f59e0b]">
           <span className="text-sm animate-pulse drop-shadow-[0_0_5px_#f59e0b]">{'\u{1FA99}'}</span>
           <span className="font-bold text-sm text-[#f59e0b]" style={{ fontFamily: 'Fredoka, sans-serif' }}>{carbonCoins}</span>
        </div>
      </div>

      {/* Map Area (Flex 1 to fill remaining space) */}
      <div className="flex-1 w-full relative overflow-hidden">
         <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Background dashed path */}
            <motion.path
               d="M 20 75 L 50 60 L 80 45 L 50 30 L 20 15"
               fill="none"
               stroke="rgba(255,255,255,0.05)"
               strokeWidth="1"
               strokeDasharray="2, 2"
               vectorEffect="non-scaling-stroke"
            />
            {/* Active filled path */}
            <motion.path
               d="M 20 75 L 50 60 L 80 45 L 50 30 L 20 15"
               fill="none"
               stroke="#22c55e"
               strokeWidth="0.6"
               strokeLinecap="round"
               strokeLinejoin="round"
               vectorEffect="non-scaling-stroke"
               initial={{ pathLength: 0 }}
               animate={{ pathLength: currentLevel / levelData.length }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' }}
            />
         </svg>

         {levelData.map((node) => {
            const status = getStatus(node.id);
            const levelT = t?.hub?.levels?.[node.id];
            const title = levelT?.title || node.title;
            return (
              <div key={node.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                <HexNode 
                  status={status}
                  icon={status === 'locked' ? '\u{1F512}' : node.icon}
                  title={status === 'locked' ? (t?.hub?.locked || 'Locked') : title}
                  color={node.color}
                  onClick={() => handleNodeClick(node)}
                />
              </div>
            );
         })}
      </div>

      {/* Bottom Padding */}
      <div className="h-4 shrink-0 w-full" />

      {/* Modal Popup overlay */}
      <AnimatePresence>
        {selectedNode && (
           <motion.div 
             className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#050a15]/80"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
           >
             <motion.div 
               className="w-full max-w-sm rounded-[20px] border-2 p-5 relative shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-[#0a1628]"
               style={{ borderColor: '#3b82f6' }}
               initial={{ scale: 0.9, y: 10, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.9, y: 10, opacity: 0 }}
             >
               <button 
                  onClick={() => setSelectedNode(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[#9ca3af] hover:text-white bg-white/10 active:scale-95 transition-all"
               >
                 {'\u{2715}'}
               </button>
               
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border bg-[#3b82f6]/20 border-[#3b82f6]">
                   {selectedNode.icon}
                 </div>
                 <div className="flex flex-col">
                   <h3 className="text-xl font-bold tracking-wide text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                     {t?.hub?.levels?.[selectedNode.id]?.title || selectedNode.title}
                   </h3>
                   <span className="text-[10px] uppercase tracking-widest text-[#3b82f6]">
                     {t?.hub?.mission || 'Mission'} {selectedNode.id}
                   </span>
                 </div>
               </div>
               
               <p className="text-[#cbd5e1] mb-6 border-l-2 pl-3 text-sm border-white/20">
                  {t?.hub?.levels?.[selectedNode.id]?.desc || 'This mission explores how household appliances consume electricity and their carbon footprint.'}
               </p>
               
               <button 
                 className="w-full py-2.5 rounded-lg font-bold tracking-wide transition-all shadow-lg active:scale-95 text-white bg-[#3b82f6]"
                 style={{ fontFamily: 'Fredoka, sans-serif', boxShadow: 'inset 0 0 10px rgba(255,255,255,0.2)' }}
                 onClick={handleStartMission}
               >
                 {t?.hub?.startMission || 'START MISSION \u{2192}'}
               </button>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ PRE-LEVEL-1 CONCEPT CARDS OVERLAY ═══ */}
      <AnimatePresence>
        {showConceptCards && (
          <motion.div
            className="absolute inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #050a15 0%, #0a1628 50%, #052e16 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Floating particles */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 4 + Math.random() * 4,
                    height: 4 + Math.random() * 4,
                    borderRadius: '50%',
                    background: CONCEPT_CARDS[conceptIndex].color,
                    opacity: 0.3,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.div
              key={conceptIndex}
              className={`w-full max-w-lg relative`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={conceptAnim === 'enter' ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Header badge */}
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 16px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: CONCEPT_CARDS[conceptIndex].color,
                  background: `${CONCEPT_CARDS[conceptIndex].color}20`,
                  border: `1px solid ${CONCEPT_CARDS[conceptIndex].color}40`,
                  fontFamily: 'Fredoka, sans-serif',
                }}>
                  📖 Key Concept {conceptIndex + 1} of {CONCEPT_CARDS.length}
                </span>
              </div>

              {/* Card */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: `2px solid ${CONCEPT_CARDS[conceptIndex].color}50`,
                borderRadius: 20,
                padding: '32px 28px',
                backdropFilter: 'blur(12px)',
                boxShadow: `0 0 40px ${CONCEPT_CARDS[conceptIndex].color}20`,
              }}>
                {/* Icon */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <motion.span
                    style={{ fontSize: 56, display: 'inline-block', filter: `drop-shadow(0 0 20px ${CONCEPT_CARDS[conceptIndex].color}80)` }}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                  >
                    {CONCEPT_CARDS[conceptIndex].icon}
                  </motion.span>
                </div>

                {/* Title */}
                <h2 style={{
                  textAlign: 'center',
                  fontSize: 28,
                  fontWeight: 800,
                  color: CONCEPT_CARDS[conceptIndex].color,
                  fontFamily: 'Fredoka, sans-serif',
                  marginBottom: 4,
                  textShadow: `0 0 20px ${CONCEPT_CARDS[conceptIndex].color}40`,
                }}>
                  {CONCEPT_CARDS[conceptIndex].title}
                </h2>

                <p style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#9ca3af',
                  fontStyle: 'italic',
                  letterSpacing: '0.1em',
                  marginBottom: 16,
                }}>
                  {CONCEPT_CARDS[conceptIndex].tagline}
                </p>

                {/* Description */}
                <p style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: '#e2e8f0',
                  marginBottom: 16,
                  textAlign: 'center',
                }}>
                  {CONCEPT_CARDS[conceptIndex].description}
                </p>

                {/* Key Points */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 16,
                }}>
                  {CONCEPT_CARDS[conceptIndex].keyPoints.map((point, i) => (
                    <motion.div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        marginBottom: i < CONCEPT_CARDS[conceptIndex].keyPoints.length - 1 ? 10 : 0,
                      }}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                    >
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: `${CONCEPT_CARDS[conceptIndex].color}30`,
                        color: CONCEPT_CARDS[conceptIndex].color,
                        fontSize: 11,
                        fontWeight: 800,
                        marginTop: 2,
                      }}>
                        ✓
                      </span>
                      <span style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{point}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Example */}
                <div style={{
                  background: `${CONCEPT_CARDS[conceptIndex].color}10`,
                  border: `1px solid ${CONCEPT_CARDS[conceptIndex].color}30`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <span style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>
                    <strong style={{ color: CONCEPT_CARDS[conceptIndex].color }}>Example: </strong>
                    {CONCEPT_CARDS[conceptIndex].example}
                  </span>
                </div>
              </div>

              {/* Progress dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                {CONCEPT_CARDS.map((_, i) => (
                  <div key={i} style={{
                    width: i === conceptIndex ? 28 : 10,
                    height: 10,
                    borderRadius: 5,
                    background: i === conceptIndex ? CONCEPT_CARDS[conceptIndex].color : i < conceptIndex ? `${CONCEPT_CARDS[i].color}80` : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease',
                    boxShadow: i === conceptIndex ? `0 0 10px ${CONCEPT_CARDS[conceptIndex].color}50` : 'none',
                  }} />
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 16 }}>
                <button
                  onClick={handleNextConcept}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: 12,
                    border: 'none',
                    background: `linear-gradient(135deg, ${CONCEPT_CARDS[conceptIndex].color}, ${CONCEPT_CARDS[conceptIndex].color}cc)`,
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: 'Fredoka, sans-serif',
                    cursor: 'pointer',
                    boxShadow: `0 4px 15px ${CONCEPT_CARDS[conceptIndex].color}40`,
                    transition: 'transform 0.2s',
                    letterSpacing: '0.05em',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {conceptIndex === CONCEPT_CARDS.length - 1 ? 'Start Level 1 →' : 'Next Concept →'}
                </button>
                <button
                  onClick={handleSkipConcepts}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    padding: '6px 12px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  Skip (I know this) ▸
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HubScreen;
