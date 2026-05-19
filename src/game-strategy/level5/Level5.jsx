import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import House from '../House';
import Level5Player, { l5PlayerState } from './Level5Player';
import Level2Appliances, { getProximityLevels } from '../level2/Level2Appliances';
import Level5Environment from './Level5Environment';
import { useGame } from '../../context/GameContext';
import {
  L5, L5_TOPICS, L5_QUIZ, STORY_STAGES, SHOP_DISPLAYS, SHOP_DISPLAY_MAP, SHOP_DISPLAY_IDS,
  METER_DIALOGUE, TEACHER_DIALOGUE, NEWSPAPER_HEADLINE, NEWSPAPER_SUBTEXT, ROOF_DIALOGUE, PHASE2_TOPIC_IDS,
  BIOGAS_DIALOGUE, PHASE3_TOPIC_IDS,
  calculateL5Stars, LEVEL5_BADGE, ENTRY_DIALOGUE, FINAL_DIALOGUE, CONFIDENCE_MESSAGES,
} from './level5Data';
import { L2_APPLIANCE_IDS } from '../level2/level2Data';
import Level5PhaseExplainer from './Level5PhaseExplainer';
import Level5Quiz from './Level5Quiz';
import LevelIntro from '../LevelIntro';
import './Level5.css';

// ═══ AUDIO ═══
let audioCtx = null;
function getAC() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playClick() { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.setValueAtTime(600,c.currentTime);g.gain.setValueAtTime(0.06,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.08);o.start(c.currentTime);o.stop(c.currentTime+0.08);} catch(e){} }
function playSuccess() { [523,659,784,1047].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,c.currentTime+i*0.12);g.gain.setValueAtTime(0.08,c.currentTime+i*0.12);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.12+0.3);o.start(c.currentTime+i*0.12);o.stop(c.currentTime+i*0.12+0.3);} catch(e){} }); }
function playComplete() { [523,659,784,880,1047].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,c.currentTime+i*0.08);g.gain.setValueAtTime(0.06,c.currentTime+i*0.08);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.08+0.2);o.start(c.currentTime+i*0.08);o.stop(c.currentTime+i*0.08+0.2);} catch(e){} }); }
function playDiscover() { [330,440,550].forEach((f,i) => { try { const c=getAC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(f,c.currentTime+i*0.1);g.gain.setValueAtTime(0.06,c.currentTime+i*0.1);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.1+0.2);o.start(c.currentTime+i*0.1);o.stop(c.currentTime+i*0.1+0.2);} catch(e){} }); }

// ═══ 3D SCENE ═══
function CamRef({r}){const{camera}=useThree();useEffect(()=>{r.current=camera},[camera,r]);return null;}
function Scene({ nearest, onZone, onNearest, onInteract, camRef, storyStage, meterVisited, newspaperPickedUp, shopVisible, inspectedDisplays, roofVisited, biogasVisited }) {
  const allIds = useMemo(() => [...L2_APPLIANCE_IDS, 'electricity_meter', 'newspaper', ...SHOP_DISPLAY_IDS, 'roof_panels', 'biogas_plant'], []);
  const appStates = useMemo(() => {
    const s = {};
    L2_APPLIANCE_IDS.forEach(id => { s[id] = { on: true }; });
    return s;
  }, []);
  const proxLevels = useMemo(() => getProximityLevels(l5PlayerState.x, l5PlayerState.z, L2_APPLIANCE_IDS), [nearest]);
  return (<><CamRef r={camRef}/>
    <Level5Environment timeOfDay="noon" batteryPct={50} weatherFactor={1.0} nearestAppliance={nearest} storyStage={storyStage} meterVisited={meterVisited} newspaperPickedUp={newspaperPickedUp} shopVisible={shopVisible} inspectedDisplays={inspectedDisplays} roofVisited={roofVisited} biogasVisited={biogasVisited} />
    <House/>
    <Level2Appliances applianceStates={appStates} nearestAppliance={nearest} taskTargetIds={null} proximityLevels={proxLevels}/>
    <Level5Player onZoneChange={onZone} onNearestApplianceChange={onNearest} onInteract={onInteract} applianceIdList={allIds}/>
  </>);
}

// ═══ CONTROLS HELP ═══
function ControlsHelp(){const[s,setS]=useState(false);
  return(<><button className="l5-help-btn" onClick={()=>setS(true)}>?</button>{s&&<div className="l5-controls-overlay" onClick={()=>setS(false)}><div className="l5-controls-card" onClick={e=>e.stopPropagation()}><div className="l5-controls-title">{L5.grad} Controls</div>{[['W/\u2191','Forward'],['S/\u2193','Backward'],['A/\u2190','Turn Left'],['D/\u2192','Turn Right'],['Q','Look Up'],['Z','Look Down'],['E','Interact']].map(([k,l])=><div key={k} className="l5-ctrl-row"><span><span className="l5-key">{k}</span></span><span>{l}</span></div>)}<button className="l5-controls-got-it" onClick={()=>setS(false)}>Got it!</button></div></div>}</>);
}

// ═══ MAIN ═══
export default function Level5() {
  const navigate = useNavigate();
  const { addCarbonCoins, completeLevel, unlockLevel } = useGame();
  const camRef = useRef(null);

  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [phase, setPhase] = useState('entry'); // entry | play | explainer | quiz | reward

  // Story state
  const [storyStage, setStoryStage] = useState('discover');
  const [meterVisited, setMeterVisited] = useState(false);
  const [newspaperPickedUp, setNewspaperPickedUp] = useState(false);
  const [shopVisible, setShopVisible] = useState(false);
  const [inspectedDisplays, setInspectedDisplays] = useState([]);
  const [activeTopicId, setActiveTopicId] = useState(null);

  // Phase 2 state
  const [phase2TopicsCompleted, setPhase2TopicsCompleted] = useState([]);
  const [roofVisited, setRoofVisited] = useState(false);

  // Phase 3 state
  const [phase3TopicsCompleted, setPhase3TopicsCompleted] = useState([]);
  const [biogasVisited, setBiogasVisited] = useState(false);

  // Dialogue
  const [dialogue, setDialogue] = useState(null); // { lines, title, icon }
  const [dialogueIdx, setDialogueIdx] = useState(0);

  // HUD
  const [zone, setZone] = useState('Outside');
  const [nearest, setNearest] = useState(null);
  const [confidenceMsg, setConfidenceMsg] = useState('');

  // Quiz/Reward
  const [quizResult, setQuizResult] = useState(null);
  const [stars, setStars] = useState(0);

  // Intro animation
  const [introStep, setIntroStep] = useState(0);
  useEffect(() => {
    if (phase !== 'entry') return;
    const t1 = setTimeout(() => setIntroStep(1), 500);
    const t2 = setTimeout(() => setIntroStep(2), 1800);
    const t3 = setTimeout(() => setIntroStep(3), 3500);
    const t4 = setTimeout(() => setIntroStep(4), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [phase]);

  // ─── Interaction handler ───
  const handleInteract = useCallback((id) => {
    if (dialogue) return; // Don't interact during dialogue

    // Stage: discover → check meter
    if (id === 'electricity_meter' && !meterVisited) {
      playDiscover();
      setMeterVisited(true);
      setDialogue({ lines: METER_DIALOGUE, title: 'Electricity Meter', icon: L5.zap });
      setDialogueIdx(0);
      return;
    }

    // Stage: newspaper
    if (id === 'newspaper' && !newspaperPickedUp) {
      playDiscover();
      setNewspaperPickedUp(true);
      setShopVisible(true);
      setStoryStage('shop');
      setDialogue({ lines: [NEWSPAPER_HEADLINE, NEWSPAPER_SUBTEXT, 'A new appliance shop has opened nearby! Go check it out.'], title: 'Newspaper', icon: L5.paper });
      setDialogueIdx(0);
      return;
    }

    // Stage: shop display interactions
    if (id.startsWith('shop_') && SHOP_DISPLAY_MAP[id] && !inspectedDisplays.includes(id)) {
      playClick();
      if (storyStage === 'shop') setStoryStage('learn');
      setActiveTopicId(SHOP_DISPLAY_MAP[id].topicId);
      setPhase('explainer');
      return;
    }

    // Stage: roof panel interaction (Phase 2)
    if (id === 'roof_panels' && storyStage === 'roof' && !roofVisited) {
      playDiscover();
      setRoofVisited(true);
      setStoryStage('phase2');
      const firstTopic = PHASE2_TOPIC_IDS.find(t => !phase2TopicsCompleted.includes(t));
      if (firstTopic) { setActiveTopicId(firstTopic); setPhase('explainer'); }
      return;
    }

    // Stage: biogas plant interaction (Phase 3)
    if (id === 'biogas_plant' && storyStage === 'biogas' && !biogasVisited) {
      playDiscover();
      setBiogasVisited(true);
      setStoryStage('phase3');
      const firstTopic = PHASE3_TOPIC_IDS.find(t => !phase3TopicsCompleted.includes(t));
      if (firstTopic) { setActiveTopicId(firstTopic); setPhase('explainer'); }
      return;
    }
  }, [dialogue, meterVisited, newspaperPickedUp, inspectedDisplays, storyStage, roofVisited, phase2TopicsCompleted, biogasVisited, phase3TopicsCompleted]);

  // ─── Dialogue advance ───
  const advanceDialogue = useCallback(() => {
    if (!dialogue) return;
    if (dialogueIdx < dialogue.lines.length - 1) {
      setDialogueIdx(i => i + 1);
    } else {
      // Dialogue complete → advance story
      if (storyStage === 'discover' && meterVisited) {
        setDialogue({ lines: TEACHER_DIALOGUE, title: 'Energy Teacher', icon: L5.teacher });
        setDialogueIdx(0);
        setStoryStage('teacher');
      } else if (storyStage === 'teacher') {
        setDialogue(null);
        setStoryStage('newspaper');
      } else {
        setDialogue(null);
      }
    }
  }, [dialogue, dialogueIdx, storyStage, meterVisited]);

  // ─── Topic complete ───
  const handleTopicComplete = useCallback((topicId) => {
    playSuccess();
    const msg = CONFIDENCE_MESSAGES[Math.floor(Math.random() * CONFIDENCE_MESSAGES.length)];
    setConfidenceMsg(msg);
    setTimeout(() => setConfidenceMsg(''), 3000);

    // Phase 2 topic?
    if (PHASE2_TOPIC_IDS.includes(topicId)) {
      const newCompleted = [...phase2TopicsCompleted, topicId];
      setPhase2TopicsCompleted(newCompleted);
      const nextTopic = PHASE2_TOPIC_IDS.find(t => !newCompleted.includes(t));
      if (nextTopic) {
        setActiveTopicId(nextTopic);
      } else {
        // All Phase 2 done → trigger biogas transition
        setActiveTopicId(null);
        setPhase('play');
        setDialogue({ lines: BIOGAS_DIALOGUE, title: 'Energy Teacher', icon: L5.teacher });
        setDialogueIdx(0);
        setStoryStage('biogas');
      }
      return;
    }

    // Phase 3 topic?
    if (PHASE3_TOPIC_IDS.includes(topicId)) {
      const newCompleted = [...phase3TopicsCompleted, topicId];
      setPhase3TopicsCompleted(newCompleted);
      const nextTopic = PHASE3_TOPIC_IDS.find(t => !newCompleted.includes(t));
      if (nextTopic) {
        setActiveTopicId(nextTopic);
      } else {
        // All Phase 3 done → quiz
        setActiveTopicId(null);
        setPhase('play');
        setStoryStage('quiz');
      }
      return;
    }

    // Phase 1: shop display topic
    const display = SHOP_DISPLAYS.find(d => d.topicId === topicId);
    if (display) {
      setInspectedDisplays(prev => prev.includes(display.id) ? prev : [...prev, display.id]);
    }
    setActiveTopicId(null);
    setPhase('play');
    // Check if all Phase 1 displays done → trigger roof transition
    const newCount = inspectedDisplays.length + 1;
    if (newCount >= SHOP_DISPLAYS.length) {
      // Show roof dialogue to start Phase 2
      setDialogue({ lines: ROOF_DIALOGUE, title: 'Energy Teacher', icon: L5.teacher });
      setDialogueIdx(0);
      setStoryStage('roof');
    }
  }, [inspectedDisplays, phase2TopicsCompleted]);

  const handleQuizComplete = useCallback(result => {
    setQuizResult(result);
    const s = calculateL5Stars(inspectedDisplays.length, result.score, result.total);
    setStars(s);
    setPhase('reward');
  }, [inspectedDisplays.length]);

  const handleFinish = useCallback(() => {
    addCarbonCoins(LEVEL5_BADGE.coins + stars * 20);
    completeLevel(5);
    unlockLevel(6);
    navigate('/hub');
  }, [stars, addCarbonCoins, completeLevel, unlockLevel, navigate]);

  const currentStoryStage = STORY_STAGES.find(s => s.id === storyStage);
  const allInspected = inspectedDisplays.length >= SHOP_DISPLAYS.length && phase2TopicsCompleted.length >= PHASE2_TOPIC_IDS.length && phase3TopicsCompleted.length >= PHASE3_TOPIC_IDS.length;

  // ═══ RENDER: LEVEL INTRO ═══
  if (showLevelIntro) {
    return (
      <LevelIntro levelNumber={5} levelTitle="Smart Appliance Evolution" levelIcon={'\u2B50'}
        objective="Walk through your neighborhood, discover BEE Star Ratings, and become a smart appliance buyer."
        learningOutcome="You will learn to read energy labels, calculate lifecycle costs, and save Rs.15,000-25,000/year."
        terms={[
          { icon: '\u2B50', name: 'BEE Star Rating', definition: 'A 1-5 star rating by the Bureau of Energy Efficiency. More stars = less electricity.', example: '5-star AC uses 30-50% less power' },
          { icon: '\u26A1', name: 'Energy Efficiency', definition: 'How much useful work vs electricity consumed.', example: '5-star AC: 95% vs 1-star: 65%' },
          { icon: '\u{1F4B0}', name: 'Lifecycle Cost', definition: 'Purchase + electricity + maintenance over lifetime.', example: 'Cheap fridge costs Rs.84,000 over 15 years!' },
        ]}
        onComplete={() => setShowLevelIntro(false)}
      />
    );
  }

  // ═══ RENDER: ENTRY ═══
  if (phase === 'entry') {
    return (
      <div className="l5-container">
        <div className="l5-intro-overlay">
          <div className={`l5-intro-icon ${introStep >= 2 ? 'visible' : ''}`}>{L5.star}</div>
          <h1 className={`l5-intro-title ${introStep >= 3 ? 'visible' : ''}`}>SMART APPLIANCE EVOLUTION</h1>
          <div className={`l5-intro-subtitle ${introStep >= 3 ? 'visible' : ''}`}>Level 5 — Star Ratings</div>
          <div className={`l5-intro-dialogue ${introStep >= 3 ? 'visible' : ''}`}>
            <div className="l5-intro-avatar">{'\u{1F9D1}\u200D\u{1F393}'}</div>
            <p className="l5-intro-quote">"{ENTRY_DIALOGUE.join(' ')}"</p>
          </div>
          <button className={`l5-intro-start-btn ${introStep >= 4 ? 'visible' : ''}`}
            onClick={() => setPhase('play')}>Begin Level 5 {'\u2192'}</button>
        </div>
      </div>
    );
  }

  // ═══ RENDER: QUIZ ═══
  if (phase === 'quiz') {
    return <div className="l5-container"><Level5Quiz onComplete={handleQuizComplete} /></div>;
  }

  // ═══ RENDER: REWARD ═══
  if (phase === 'reward' && quizResult) {
    const coins = LEVEL5_BADGE.coins + stars * 20;
    return (
      <div className="l5-container">
        <div className="l5-reward-overlay">
          <div className="l5-reward-card">
            <div className="l5-reward-badge">{LEVEL5_BADGE.icon}</div>
            <div className="l5-reward-title">{LEVEL5_BADGE.title}</div>
            <div className="l5-reward-subtitle">{LEVEL5_BADGE.description}</div>
            <div className="l5-reward-stars">
              {[1,2,3].map(s => (<span key={s} className={`l5-reward-star ${s<=stars?'earned':'empty'}`} style={{animationDelay:`${s*0.3}s`}}>{L5.star}</span>))}
            </div>
            <div className="l5-reward-stats">
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Displays</div><div className="l5-reward-stat-value">{inspectedDisplays.length}/5</div></div>
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Quiz</div><div className="l5-reward-stat-value">{quizResult.score}/{quizResult.total}</div></div>
              <div className="l5-reward-stat"><div className="l5-reward-stat-label">Stars</div><div className="l5-reward-stat-value">{stars}/3</div></div>
            </div>
            <div className="l5-reward-coins"><span>{L5.coin}</span><span>+{coins} Carbon Coins</span></div>
            <button className="l5-reward-btn" onClick={handleFinish}>Return to Hub {'\u2192'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ RENDER: 3D PLAY ═══
  return (
    <div className="l5-container">
      {/* 3D Canvas */}
      <div className="l5-canvas-wrapper">
        <Canvas camera={{ fov: 55, near: 0.1, far: 200 }} shadows>
          <Suspense fallback={null}>
            <Scene nearest={nearest} onZone={setZone} onNearest={setNearest} onInteract={handleInteract}
              camRef={camRef} storyStage={storyStage} meterVisited={meterVisited}
              newspaperPickedUp={newspaperPickedUp} shopVisible={shopVisible} inspectedDisplays={inspectedDisplays} roofVisited={roofVisited} biogasVisited={biogasVisited} />
          </Suspense>
        </Canvas>
      </div>

      {/* HUD Top */}
      <div className="l5-hud-top">
        <button className="l5-back-btn" onClick={() => navigate('/hub')}>{'\u2190'} Back</button>
        <div className="l5-hud-title">{L5.star} Smart Appliance Evolution</div>
        <div className="l5-hud-room">{zone}</div>
      </div>

      {/* Objective Bar */}
      {currentStoryStage && (
        <div className="l5-objective-bar">
          <div className="l5-objective-icon">{currentStoryStage.icon}</div>
          <div className="l5-objective-text">{currentStoryStage.objective}</div>
          {storyStage === 'learn' && (
            <div className="l5-objective-count">{inspectedDisplays.length}/{SHOP_DISPLAYS.length}</div>
          )}
        </div>
      )}

      {/* Story Progress */}
      <div className="l5-story-progress">
        {STORY_STAGES.slice(0, -1).map((s, i) => {
          const stageOrder = ['discover','teacher','newspaper','shop','learn','roof','phase2','biogas','phase3'];
          const ci = stageOrder.indexOf(storyStage);
          const si = stageOrder.indexOf(s.id);
          return <div key={s.id} className={`l5-story-dot ${si < ci ? 'done' : si === ci ? 'active' : ''}`} title={s.name} />;
        })}
      </div>

      {/* Dialogue Pop-up */}
      {dialogue && (
        <div className="l5-dialogue-overlay" onClick={advanceDialogue}>
          <div className="l5-dialogue-card">
            <div className="l5-dialogue-header">
              <span className="l5-dialogue-icon">{dialogue.icon}</span>
              <span className="l5-dialogue-title">{dialogue.title}</span>
            </div>
            <div className="l5-dialogue-text">{dialogue.lines[dialogueIdx]}</div>
            <div className="l5-dialogue-hint">
              {dialogueIdx < dialogue.lines.length - 1 ? 'Click to continue...' : 'Click to close'}
            </div>
          </div>
        </div>
      )}

      {/* Confidence Message */}
      {confidenceMsg && (
        <div className="l5-confidence-msg"><span>{L5.sparkle}</span> {confidenceMsg}</div>
      )}

      {/* Quiz button when all inspected */}
      {allInspected && storyStage === 'quiz' && phase !== 'explainer' && (
        <button className="l5-quiz-start-btn" onClick={() => { playComplete(); setPhase('quiz'); }}>
          {L5.brain} Take Final Quiz {'\u2192'}
        </button>
      )}

      {/* Explainer Overlay (on top of 3D scene) */}
      {phase === 'explainer' && activeTopicId && (
        <Level5PhaseExplainer topicId={activeTopicId}
          onComplete={() => handleTopicComplete(activeTopicId)} />
      )}

      <ControlsHelp />
    </div>
  );
}
