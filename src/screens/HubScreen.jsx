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
  { id: 5, title: 'City Grid', icon: '\u{1F3D9}\u{FE0F}', type: 'boss', x: 20, y: 15, color: 'red' }
];

const HubScreen = () => {
  const { carbonCoins, currentLevel, language } = useGame();
  const t = getTranslation(language);
  const [selectedNode, setSelectedNode] = useState(null);
  const navigate = useNavigate();

  const getStatus = (nodeId) => {
    if (nodeId < currentLevel) return 'completed';
    if (nodeId === currentLevel) return 'unlocked';
    return 'locked';
  };

  const handleNodeClick = (node) => {
    if (getStatus(node.id) !== 'locked') setSelectedNode(node);
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
         <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none">
            {/* Background dashed path */}
            <motion.path
               d="M 20% 75% L 50% 60% L 80% 45% L 50% 30% L 20% 15%"
               fill="none"
               stroke="rgba(255,255,255,0.05)"
               strokeWidth="6"
               strokeDasharray="10, 10"
            />
            {/* Active filled path */}
            <motion.path
               d="M 20% 75% L 50% 60% L 80% 45% L 50% 30% L 20% 15%"
               fill="none"
               stroke="#22c55e"
               strokeWidth="3"
               strokeLinecap="round"
               strokeLinejoin="round"
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
                 onClick={() => { setSelectedNode(null); navigate(`/level${selectedNode.id}`); }}
               >
                 {t?.hub?.startMission || 'START MISSION \u{2192}'}
               </button>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HubScreen;
