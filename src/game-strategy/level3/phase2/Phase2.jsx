import React,{useState,useEffect,useCallback,useMemo,useRef} from'react';
import{INTRO_DIALOGUE,SEGMENTS,TREE_TASKS,SOLAR_TASKS,WIND_TASKS,TOTAL_TREES_TO_PLANT,PANEL_ORIENTATIONS,WIND_SPEED_SEQUENCE,DATA_POPUPS,COMPARISON_DATA,REALIZATION_LINES,TRANSITION_LINE,PHASE2_QUIZ,PHASE2_BADGE,calculateP2Stars,CO2_REDUCTION_LEVELS,ENV_HOTSPOTS,TREE_ANALYSIS,GROWTH_TIMELINE,SCANNER_APPLIANCES,LIVE_COMPARISON,BATTERY_DATA,WEATHER_SCENARIOS,TRANSFORMATION_BEFORE,TRANSFORMATION_AFTER,FINAL_TEACHER_DIALOGUE,LEVEL4_TRANSITION_TEXT,LEARNING_OUTCOMES,PANEL_TYPES,TURBINE_TYPES}from'./phase2Data';
import{HouseScene3D,Scene3DCanvas,DroneIntroCamera,GARDEN_TREE_SPOTS,DEBRIS_POSITIONS,playAction,playSuccess,playCorrect,playWrong,playSFX,playDig,playWater,playInstall,playWire,playSweep}from'./Phase2Core';
import'./Phase2.css';

export default function Phase2({onComplete}){
const[phase,setPhase]=useState('intro');
const[introStep,setIntroStep]=useState(0);
const[segIdx,setSegIdx]=useState(0);
const[segPhase,setSegPhase]=useState('intro');
const[taskIdx,setTaskIdx]=useState(0);
const[co2,setCo2]=useState(CO2_REDUCTION_LEVELS.initial);
const[trees,setTrees]=useState([]);
const[currentSpot,setCurrentSpot]=useState(0);
const[treeGrowth,setTreeGrowth]=useState(0);
const[panelsPlaced,setPanelsPlaced]=useState(0);
const[panelAngle,setPanelAngle]=useState(0);
const[orientIdx,setOrientIdx]=useState(0);
const[showOrient,setShowOrient]=useState(false);
const[sunProgress,setSunProgress]=useState(0);
const[energyFlowing,setEnergyFlowing]=useState(false);
const[turbineInstalled,setTurbineInstalled]=useState(false);
const[windSpeed,setWindSpeed]=useState(0);
const[windSeqIdx,setWindSeqIdx]=useState(0);
const[feedback,setFeedback]=useState(null);
const[showData,setShowData]=useState(false);
const[compStep,setCompStep]=useState(0);
const[realStep,setRealStep]=useState(0);
const[quizIdx,setQuizIdx]=useState(0);
const[quizSel,setQuizSel]=useState(null);
const[quizScore,setQuizScore]=useState(0);
const[showExp,setShowExp]=useState(false);
const[stars,setStars]=useState(0);
const[segsComplete,setSegsComplete]=useState(0);
const[completedSegs,setCompletedSegs]=useState({trees:false,solar:false,wind:false});
const[debrisCleared,setDebrisCleared]=useState([]);
const[activeHotspot,setActiveHotspot]=useState(0);
const[showTreeAnalysis,setShowTreeAnalysis]=useState(false);
const[selectedTreeType,setSelectedTreeType]=useState(0);
const[scannedAppliances,setScannedAppliances]=useState([]);
const[showScanner,setShowScanner]=useState(false);
const[fieldTurbines,setFieldTurbines]=useState([false,false,false]);
const[fieldTurbineIdx,setFieldTurbineIdx]=useState(0);
const[batteryCharge,setBatteryCharge]=useState(0);
const[batteryActive,setBatteryActive]=useState(false);
const[powerMode,setPowerMode]=useState('grid');
const[weatherIdx,setWeatherIdx]=useState(0);
const[showWeather,setShowWeather]=useState(false);
const[growthPhaseIdx,setGrowthPhaseIdx]=useState(0);
const[showTransformation,setShowTransformation]=useState(false);
const[transStep,setTransStep]=useState(0);
const[finalDialogIdx,setFinalDialogIdx]=useState(0);
const[teacherLine,setTeacherLine]=useState(null);
const[showPanelSelect,setShowPanelSelect]=useState(false);
const[showTurbineSelect,setShowTurbineSelect]=useState(false);
const[wiringVisible,setWiringVisible]=useState(false);
const[inverterInstalled,setInverterInstalled]=useState(false);
const[soilScanned,setSoilScanned]=useState(0);
const[diggingHoles,setDiggingHoles]=useState([]);
const[seedsPlanted,setSeedsPlanted]=useState([]);
const[ladderFetched,setLadderFetched]=useState(false);
const[arjunOnRoof,setArjunOnRoof]=useState(false);
const[climbStep,setClimbStep]=useState(0); // 0=ground, 1=lower, 2=mid, 3=top → on roof
const autoTimerRef=useRef(null);
const teacherTimerRef=useRef(null);
const handleInteractRef=useRef(null);
const handleOrientConfirmRef=useRef(null);

const segId=SEGMENTS[segIdx]?.id;
const segColor=SEGMENTS[segIdx]?.color||'#22c55e';
const tasks=segId==='trees'?TREE_TASKS:segId==='solar'?SOLAR_TASKS:WIND_TASKS;
const task=tasks[taskIdx];

const showFB=useCallback((t,type='info',dur=3000)=>{
  setFeedback({text:t,type});setTimeout(()=>setFeedback(null),dur);
},[]);

const greenLevel=useMemo(()=>Math.min(1,trees.filter(t=>t.growth>=3).length/TOTAL_TREES_TO_PLANT),[trees]);

// Show teacher line when task changes
useEffect(()=>{
  if(segPhase!=='playing'||!task)return;
  if(task.teacherLine){setTeacherLine(task.teacherLine);clearTimeout(teacherTimerRef.current);teacherTimerRef.current=setTimeout(()=>setTeacherLine(null),6000);}
  else setTeacherLine(null);
  return()=>clearTimeout(teacherTimerRef.current);
},[taskIdx,segPhase]);

useEffect(()=>{
  if(segPhase!=='playing'||!task?.auto)return;
  const dur=task.autoDur||6000;
  autoTimerRef.current=setTimeout(()=>{showFB(task.feedback,'success');playAction();advanceTask();},dur);
  return()=>clearTimeout(autoTimerRef.current);
},[taskIdx,segPhase]);

useEffect(()=>{
  if(segId!=='solar'||!energyFlowing)return;
  let p=0;const iv=setInterval(()=>{p+=0.02;setSunProgress(p);if(p>=1){clearInterval(iv);setSunProgress(1);}},100);
  return()=>clearInterval(iv);
},[energyFlowing]);

useEffect(()=>{
  if(segId!=='wind'||!turbineInstalled||segPhase!=='playing')return;
  let idx=0;
  const run=()=>{const seq=WIND_SPEED_SEQUENCE[idx%WIND_SPEED_SEQUENCE.length];setWindSpeed(seq.speed);setWindSeqIdx(idx);idx++;if(idx<=WIND_SPEED_SEQUENCE.length)autoTimerRef.current=setTimeout(run,seq.duration);};
  run();return()=>clearTimeout(autoTimerRef.current);
},[turbineInstalled,segPhase]);

// Growth animation for observe_growth tasks
useEffect(()=>{
  if(segId!=='trees'||segPhase!=='playing'||!task)return;
  if(task.id==='observe_growth_y1'){setTrees(p=>p.map(t=>({...t,growth:Math.min(2,t.growth+1)})));}
  if(task.id==='observe_growth_y5'){setTrees(p=>p.map(t=>({...t,growth:3})));}
  if(task.id==='observe_growth_y10'){setTrees(p=>p.map(t=>({...t,growth:4,absorbing:true})));}
},[taskIdx,segPhase]);

function advanceTask(){
  const next=taskIdx+1;
  if(next>=tasks.length){setSegPhase('data');setShowData(true);playSuccess();}
  else setTaskIdx(next);
}

function handleInteract(){
  if(segPhase!=='playing'||!task||task.auto)return;
  playAction();
  if(segId==='trees'){
    if(task.id==='survey'){
      setActiveHotspot(p=>{
        const next=p+1;
        if(next>=ENV_HOTSPOTS.length){showFB(task.feedback,'success');advanceTask();return 0;}
        else{showFB(ENV_HOTSPOTS[next]?.detail||'','info');return next;}
      });
    }
    else if(task.id==='clear_debris'){
      playSweep();
      setDebrisCleared(p=>{
        const next=[...p,p.length];
        if(next.length>=DEBRIS_POSITIONS.length){showFB(task.feedback,'success');advanceTask();}
        else showFB(`Cleared ${next.length}/${DEBRIS_POSITIONS.length} debris piles`,'info');
        return next;
      });
    }
    else if(task.id==='analyze_soil'){
      setSoilScanned(p=>{
        const n=p+1;
        if(n>=ENV_HOTSPOTS.length){showFB(task.feedback,'success');advanceTask();}
        else{setActiveHotspot(n);showFB(ENV_HOTSPOTS[n]?.detail||'Scanning...','info');}
        return n;
      });
    }
    else if(task.id==='select_trees'){setShowTreeAnalysis(true);}
    else if(task.id==='dig_holes'){playDig();const sp=GARDEN_TREE_SPOTS[trees.length]||GARDEN_TREE_SPOTS[0];setDiggingHoles(p=>[...p,sp]);showFB(task.feedback,'success');advanceTask();}
    else if(task.id.startsWith('plant_tree')){
      const idx=trees.length;
      const pos=GARDEN_TREE_SPOTS[idx]||GARDEN_TREE_SPOTS[0];
      setSeedsPlanted(p=>[...p,idx]);
      setTrees(p=>[...p,{pos,growth:1,absorbing:false}]);
      showFB(task.feedback,'success');advanceTask();
    }
    else if(task.id==='setup_irrigation'){playInstall();showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='water_trees'){playWater();setTrees(p=>p.map(t=>({...t,growth:Math.min(2,t.growth+1)})));showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='measure_results'){showFB(task.feedback,'success');advanceTask();}
  }else if(segId==='solar'){
    if(task.id==='assess_roof'){showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='energy_scan'){setShowScanner(true);}
    else if(task.id==='choose_panel_type'){setShowPanelSelect(true);}
    // Multi-step ladder: fetch → carry → climb (3 steps) → on roof
    else if(task.id==='fetch_ladder'){
      playAction();
      showFB('Arjun found the ladder inside the house!','success');
      advanceTask();
    }
    else if(task.id==='carry_ladder_out'){
      playAction();setLadderFetched(true);setClimbStep(0);
      showFB('Ladder placed securely against the house wall!','success');
      advanceTask();
    }
    else if(task.id==='climb_roof'){
      // Multi-step: press E 3 times to climb — bottom → mid → top → on roof
      playInstall();
      setClimbStep(prev=>{
        const next=prev+1;
        if(next>=3){
          setArjunOnRoof(true);
          showFB(task.feedback,'success');
          advanceTask();
          return 3;
        }else{
          const msgs=['Climbing... grip the rungs! (step 1/3)','Halfway up! Keep climbing! (step 2/3)','Almost there! One more step!'];
          showFB(msgs[next-1]||'Climbing...','info');
          return next;
        }
      });
    }
    else if(task.id==='install_mounting'){playInstall();showFB(task.feedback,'success');advanceTask();}
    else if(task.id.startsWith('place_panel')){
      playInstall();
      const panelNum=panelsPlaced+1;
      setPanelsPlaced(p=>p+1);
      showFB(`Panel ${panelNum} secured on the roof!`,'success');
      advanceTask();
    }
    else if(task.id==='wire_panels'){playWire();setWiringVisible(true);showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='orient')setShowOrient(true);
    else if(task.id==='solar_mode'){setPowerMode('solar');showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='install_battery'){playInstall();setBatteryActive(true);setInverterInstalled(true);showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='peak_hour'){setBatteryActive(true);showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='climb_down'){
      // Multi-step climb down: 3 presses
      playAction();
      setClimbStep(prev=>{
        const next=prev-1;
        if(next<=0){
          setArjunOnRoof(false);setClimbStep(0);
          showFB(task.feedback,'success');
          advanceTask();
          return 0;
        }else{
          const msgs=['Climbing down carefully... (step 1/3)','Almost at the bottom... (step 2/3)'];
          showFB(msgs[3-next-1]||'Climbing down...','info');
          return next;
        }
      });
    }
  }else if(segId==='wind'){
    if(task.id==='field_survey'){showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='wind_analysis'){showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='choose_turbine'){setShowTurbineSelect(true);}
    else if(task.id==='prepare_foundation'){playDig();showFB(task.feedback,'success');advanceTask();}
    else if(task.id.startsWith('install_turbine')){
      setFieldTurbineIdx(prev=>{
        setFieldTurbines(p=>{const n=[...p];n[prev]=true;return n;});
        return prev+1;
      });
      setTurbineInstalled(true);
      showFB(task.feedback,'success');advanceTask();
    }
    else if(task.id==='connect_grid'){playWire();showFB(task.feedback,'success');advanceTask();}
    else if(task.id==='weather_scenarios'){setShowWeather(true);}
  }
}

function handleOrientConfirm(){
  const o=PANEL_ORIENTATIONS[orientIdx];setPanelAngle(o.angle);setShowOrient(false);
  if(o.correct){playCorrect();showFB('Panels aligned south — maximum sunlight!','success');}
  else{playWrong();showFB(`${o.label} facing — only ${Math.round(o.efficiency*100)}% efficiency`,'warning');}
  advanceTask();setTimeout(()=>setEnergyFlowing(true),1500);
}

// Keep refs always pointing to the latest function (fixes stale closures in keydown listener)
handleInteractRef.current=handleInteract;
handleOrientConfirmRef.current=handleOrientConfirm;

function handleDataClose(){
  setShowData(false);
  const nextSeg=segIdx+1;
  setSegsComplete(p=>p+1);
  setCompletedSegs(prev=>({...prev,[segId]:true}));
  setCo2(segId==='trees'?CO2_REDUCTION_LEVELS.afterTrees:segId==='solar'?CO2_REDUCTION_LEVELS.afterSolar:CO2_REDUCTION_LEVELS.afterWind);
  if(nextSeg>=SEGMENTS.length){setPhase('transformation');setTransStep(0);setWiringVisible(false);setInverterInstalled(false);setLadderFetched(false);setArjunOnRoof(false);setClimbStep(0);}
  else{setWiringVisible(false);setInverterInstalled(false);setLadderFetched(false);setArjunOnRoof(false);setClimbStep(0);setSegIdx(nextSeg);setTaskIdx(0);setSegPhase('intro');setPanelsPlaced(0);setPanelAngle(0);setOrientIdx(0);setSunProgress(0);setEnergyFlowing(false);setTurbineInstalled(false);setWindSpeed(0);setCurrentSpot(p=>p+1);setShowScanner(false);setScannedAppliances([]);setPowerMode('grid');setBatteryCharge(0);setBatteryActive(false);setFieldTurbineIdx(0);}
}

function handlePlantMore(){
  if(currentSpot+1<TOTAL_TREES_TO_PLANT){setCurrentSpot(p=>p+1);setTaskIdx(0);setSegPhase('playing');}
  else{setSegPhase('data');setShowData(true);playSuccess();}
}

function handleQuizSelect(idx){
  if(quizSel!==null)return;setQuizSel(idx);setShowExp(true);
  if(idx===PHASE2_QUIZ[quizIdx].correctIndex){playCorrect();setQuizScore(p=>p+1);}else playWrong();
}

function handleQuizNext(){
  const next=quizIdx+1;
  if(next>=PHASE2_QUIZ.length){setStars(calculateP2Stars(segsComplete,SEGMENTS.length,quizScore,PHASE2_QUIZ.length));setPhase('complete');playSuccess();}
  else{setQuizIdx(next);setQuizSel(null);setShowExp(false);}
}

const showOrientRef=useRef(showOrient);
showOrientRef.current=showOrient;

useEffect(()=>{
  const h=e=>{
    if(e.key==='e'||e.key==='E'){if(handleInteractRef.current)handleInteractRef.current();}
    if(e.key==='ArrowLeft'&&showOrientRef.current)setOrientIdx(p=>(p-1+4)%4);
    if(e.key==='ArrowRight'&&showOrientRef.current)setOrientIdx(p=>(p+1)%4);
    if(e.key==='Enter'&&showOrientRef.current){if(handleOrientConfirmRef.current)handleOrientConfirmRef.current();}
  };
  window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
},[]);

// ─── Character animation + camera config (maps current task → position, action, camera) ───
// ALL cameras now focus OUTSIDE the house — on garden, rooftop exterior, or open field
const charState=useMemo(()=>{
  const def={pos:[0,0,14],action:'idle',angle:0,pPos:[0,0,0],pType:'none',pActive:false,cam:{orbit:true,orbitRadius:28,orbitHeight:12}};
  if(segPhase!=='playing'||!task) return def;
  const tid=task.id;
  let pos=[0,0,14],action='idle',angle=0,pPos=[0,0,0],pType='none',pActive=false;
  let cam={orbit:true,orbitRadius:28,orbitHeight:12};
  if(segId==='trees'){
    // All tree cameras focus on the GARDEN area (outside the house walls)
    if(tid==='survey'){
      const h=ENV_HOTSPOTS[Math.min(activeHotspot,ENV_HOTSPOTS.length-1)];
      const hPos=h?[h.pos[0],0,h.pos[2]]:[-14,0,-10];
      pos=[hPos[0]+2,0,hPos[2]+2];action='scan';angle=Math.atan2(hPos[0],hPos[2]);
      cam={target:[hPos[0],1,hPos[2]],offset:[8,6,10]};
    }
    else if(tid==='clear_debris'){
      const dIdx=Math.min(debrisCleared.length,DEBRIS_POSITIONS.length-1);
      const dp=DEBRIS_POSITIONS[dIdx]||DEBRIS_POSITIONS[0];
      pos=[dp[0]+1,0,dp[2]+1];action='sweep';angle=Math.atan2(-1,-1);pPos=[dp[0],0.1,dp[2]];pType='sweep';pActive=true;
      cam={target:[dp[0],0.5,dp[2]],offset:[5,4,7]};
    }
    else if(tid==='analyze_soil'){
      const h=ENV_HOTSPOTS[Math.min(soilScanned,ENV_HOTSPOTS.length-1)];
      const hPos=h?[h.pos[0],0,h.pos[2]]:[-14,0,-10];
      pos=[hPos[0]+1.5,0,hPos[2]+1.5];action='scan';angle=Math.atan2(-1.5,-1.5);
      cam={target:[hPos[0],1,hPos[2]],offset:[6,5,8]};
    }
    else if(tid==='select_trees'){pos=[0,0,16];action='observe';angle=Math.PI;cam={orbit:true,orbitRadius:30,orbitHeight:12};}
    else if(tid==='dig_holes'){
      const sp=GARDEN_TREE_SPOTS[trees.length]||GARDEN_TREE_SPOTS[0];
      pos=[sp[0]+1,0,sp[2]+1];action='dig';angle=Math.atan2(-1,-1);pPos=[sp[0],0.1,sp[2]];pType='dig';pActive=true;
      cam={target:[sp[0],0.5,sp[2]],offset:[4,3,5]};
    }
    else if(tid.startsWith('plant_tree')){
      const sp=GARDEN_TREE_SPOTS[trees.length]||GARDEN_TREE_SPOTS[0];
      pos=[sp[0]+1,0,sp[2]+1];action='plant';angle=Math.atan2(-1,-1);pPos=[sp[0],0.1,sp[2]];pType='dig';pActive=true;
      cam={target:[sp[0],0.5,sp[2]],offset:[4,3,5]};
    }
    else if(tid==='setup_irrigation'){
      const sp=GARDEN_TREE_SPOTS[0];
      pos=[sp[0]+2,0,sp[2]];action='install';angle=Math.atan2(-2,0);
      cam={target:[sp[0],0.5,sp[2]],offset:[6,4,8]};
    }
    else if(tid==='water_trees'){
      const sp=GARDEN_TREE_SPOTS[0];
      pos=[sp[0]+1.5,0,sp[2]+1];action='water';angle=Math.atan2(-1.5,-1);pPos=[sp[0],0.2,sp[2]];pType='water';pActive=true;
      cam={target:[sp[0],1,sp[2]],offset:[5,4,6]};
    }
    else if(tid.startsWith('observe_growth')){pos=[0,0,20];action='observe';angle=Math.PI;cam={orbit:true,orbitRadius:30,orbitHeight:14};}
    else if(tid==='measure_results'){pos=[0,0,16];action='scan';angle=Math.PI;cam={target:[0,3,0],offset:[12,8,14]};}
  }else if(segId==='solar'){
    // Solar cameras focus on EXTERIOR wall, ladder, rooftop — never inside house
    if(tid==='assess_roof'){
      // Stand outside looking at roof from front
      pos=[0,0,-14];action='scan';angle=Math.PI;
      cam={target:[0,4,0],offset:[0,6,16]};
    }
    else if(tid==='energy_scan'){
      // Stand outside the house looking in through window concept
      pos=[0,0,-14];action='scan';angle=Math.PI;
      cam={target:[0,2,0],offset:[0,8,18]};
    }
    else if(tid==='calculate_load'){pos=[0,0,-14];action='observe';angle=Math.PI;cam={target:[0,3,0],offset:[0,8,18]};}
    else if(tid==='choose_panel_type'){pos=[0,0,-14];action='observe';angle=Math.PI;cam={target:[0,3,0],offset:[0,8,18]};}
    // Ladder tasks — Arjun goes to storage → carries ladder to wall → climbs
    else if(tid==='fetch_ladder'){
      // Arjun walks to side of house where storage is
      pos=[-6,0,-10];action='walk';angle=Math.PI*0.7;
      cam={target:[-6,1.5,-10],offset:[6,4,8]};
    }
    else if(tid==='carry_ladder_out'){
      // Arjun carries ladder to the house wall exterior
      pos=[-10.5,0,-3];action='walk';angle=0;
      cam={target:[-10.5,2,-3],offset:[8,5,8]};
    }
    else if(tid==='climb_roof'){
      // Multi-step climb: position moves up the ladder
      const climbY=climbStep*1.1;
      pos=[-10.5,climbY,-3];action='climb';angle=Math.PI;
      cam={target:[-10.5,climbY+1,-3],offset:[6,3,6]};
    }
    else if(tid==='install_mounting'){
      pos=[-5,3.3,-4];action='install';angle=0;pPos=[-5,3.4,-4];pType='sparks';pActive=true;
      cam={target:[-5,3.5,-4],offset:[5,3,6]};
    }
    else if(tid.startsWith('place_panel')){
      const pi=panelsPlaced;const pp=[[-5,3.35,-4],[-1.5,3.35,-4],[2,3.35,-4],[5.5,3.35,-4]];
      const tp=pp[Math.min(pi,3)];pos=[tp[0],tp[1],tp[2]+1];action='install';angle=0;pPos=[tp[0],tp[1]+0.1,tp[2]];pType='sparks';pActive=true;
      cam={target:[tp[0],4,tp[2]],offset:[4,3,6]};
    }
    else if(tid==='wire_panels'){
      pos=[0,3.3,-4];action='install';angle=0;pPos=[0,3.3,-4.5];pType='sparks';pActive=true;
      cam={target:[0,4,-4],offset:[5,3,6]};
    }
    else if(tid==='orient'){pos=[-3,3.3,-4];action='install';angle=0;cam={target:[0,4,-4],offset:[0,5,10]};}
    else if(tid==='sun_sim'){pos=[0,0,16];action='observe';angle=Math.PI;cam={orbit:true,orbitRadius:25,orbitHeight:14};}
    else if(tid==='solar_mode'){
      pos=[0,0,-14];action='install';angle=Math.PI;
      cam={target:[0,3,0],offset:[0,6,16]};
    }
    else if(tid==='install_battery'){
      // Battery is outside, near house wall
      pos=[12,0,0];action='install';angle=-Math.PI/2;pPos=[11,0.5,0];pType='sparks';pActive=true;
      cam={target:[11,1.5,0],offset:[6,4,6]};
    }
    else if(tid==='peak_hour'){
      pos=[12,0,2];action='observe';angle=-Math.PI/2;
      cam={target:[11,1.5,0],offset:[6,4,6]};
    }
    else if(tid==='climb_down'){
      const climbY=Math.max(0,(2-climbStep)*1.1);
      pos=[-10.5,climbY,-3];action='climb';angle=0;
      cam={target:[-10.5,climbY+1,-3],offset:[6,3,6]};
    }
  }else if(segId==='wind'){
    // Wind cameras focus on the OPEN FIELD far from house
    if(tid==='field_survey'){pos=[-20,0,-16];action='walk';angle=0.5;cam={target:[-20,2,-16],offset:[12,8,12]};}
    else if(tid==='wind_analysis'){pos=[-22,0,-18];action='scan';angle=0;cam={target:[-22,3,-18],offset:[10,7,10]};}
    else if(tid==='choose_turbine'){pos=[-20,0,-16];action='observe';angle=0;cam={target:[-20,3,-16],offset:[10,8,12]};}
    else if(tid==='prepare_foundation'){
      const fp=[-25,0,-20];pos=[fp[0]+3,0,fp[2]+2];action='dig';angle=Math.atan2(-3,-2);pPos=[fp[0],0.1,fp[2]];pType='concrete';pActive=true;
      cam={target:[fp[0],2,fp[2]],offset:[12,8,12]};
    }
    else if(tid.startsWith('install_turbine')){
      const fi=fieldTurbineIdx;const fps=[[-25,0,-20],[25,0,-18],[-22,0,22]];
      const fp=fps[Math.min(fi,2)];pos=[fp[0]+4,0,fp[2]+2];action='install';angle=Math.atan2(-4,-2);
      cam={target:[fp[0],5,fp[2]],offset:[12,10,12]};
    }
    else if(tid==='connect_grid'){
      pos=[-15,0,-12];action='install';angle=0.5;pPos=[-15,0.1,-12];pType='sparks';pActive=true;
      cam={target:[-15,1,-12],offset:[8,6,8]};
    }
    else if(tid==='wind_test'){pos=[-20,0,-10];action='observe';angle=0;cam={orbit:true,orbitRadius:40,orbitHeight:14};}
    else if(tid==='weather_scenarios'){pos=[-20,0,-10];action='observe';angle=0;cam={orbit:true,orbitRadius:40,orbitHeight:14};}
    else if(tid==='combined_solar_wind'){pos=[0,0,20];action='observe';angle=Math.PI;cam={orbit:true,orbitRadius:35,orbitHeight:16};}
    else if(tid==='night_mode'){pos=[0,0,20];action='observe';angle=Math.PI;cam={orbit:true,orbitRadius:35,orbitHeight:14};}
    else if(tid==='storm_mode'){pos=[0,0,20];action='observe';angle=Math.PI;cam={orbit:true,orbitRadius:35,orbitHeight:14};}
  }
  return {pos,action,angle,pPos,pType,pActive,cam};
},[segPhase,segId,task,taskIdx,debrisCleared.length,soilScanned,trees.length,panelsPlaced,fieldTurbineIdx,activeHotspot,climbStep]);

// Shared scene props
const sceneProps={segment:segId,trees,plantSpots:GARDEN_TREE_SPOTS,currentSpot,co2Active:trees.some(t=>t.absorbing),greenLevel,
  panelsPlaced,panelAngle,sunProgress,energyFlowing,windSpeed,
  treesComplete:completedSegs.trees,solarComplete:completedSegs.solar,
  debrisCleared,hotspots:ENV_HOTSPOTS,activeHotspot:(segId==='trees'&&(task?.id==='survey'||task?.id==='analyze_soil'))?activeHotspot:-1,
  fieldTurbines,batteryCharge,batteryActive,wiringVisible,inverterInstalled,
  // Character & animation
  characterPos:charState.pos,characterAction:charState.action,characterAngle:charState.angle,
  particlePos:charState.pPos,particleType:charState.pType,particlesActive:charState.pActive,
  // Ladder only shows after carry_ladder_out task
  showLadder:segId==='solar'&&segPhase==='playing'&&ladderFetched,
  showVehicle:segId==='wind'&&segPhase==='playing',
  vehicleArriving:segId==='wind'&&task?.id==='prepare_foundation',
  showWorkers:segId==='wind'&&segPhase==='playing'&&(task?.id?.startsWith('install_turbine')||task?.id==='connect_grid'),
  irrigationVisible:segId==='trees'&&trees.length>0&&(task?.id==='setup_irrigation'||task?.id==='water_trees'||task?.id?.startsWith('observe_growth')||task?.id==='measure_results'),
  // Camera config — per-task focused camera (no constant rotation)
  cameraConfig:charState.cam,
  // Digging & planting visuals
  diggingHoles,seedsPlanted,
};

// ═══ INTRO — Cinematic drone shot + dialogue ═══
if(phase==='intro'){
  return(
  <div className="l3p2-container">
    <Scene3DCanvas>
      <HouseScene3D {...sceneProps} />
      <DroneIntroCamera active={true} />
    </Scene3DCanvas>
    <div className="l3p2-intro-overlay">
      <div className="l3p2-intro-teacher">🧑‍🏫</div>
      {INTRO_DIALOGUE.slice(0,introStep+1).map((l,i)=>(
        <div key={i} className={`l3p2-intro-line ${l.speaker==='teacher'?'teacher':''}`} style={{animationDelay:`${i*0.3}s`}}>
          {l.speaker==='teacher'?'🧑‍🏫 ':''}{l.text}
        </div>
      ))}
      {introStep<INTRO_DIALOGUE.length-1?(
        <button className="l3p2-intro-btn" onClick={()=>{setIntroStep(p=>p+1);playAction();}}>Continue →</button>
      ):(
        <>
          <div className="l3p2-intro-paths">
            {SEGMENTS.map(s=>(
              <div key={s.id} className="l3p2-path-card" style={{'--c':s.color}} onClick={()=>{setPhase('segments');setSegIdx(0);setSegPhase('intro');playAction();}}>
                <div className="l3p2-path-icon">{s.icon}</div>
                <div className="l3p2-path-label">{s.title.split('—')[0]}</div>
              </div>
            ))}
          </div>
          <button className="l3p2-intro-btn" onClick={()=>{setPhase('segments');playAction();}}>Begin Exploration →</button>
        </>
      )}
    </div>
  </div>);
}

// ═══ SEGMENT INTRO ═══
if(phase==='segments'&&segPhase==='intro'){
  const seg=SEGMENTS[segIdx];
  return(
  <div className="l3p2-container">
    <Scene3DCanvas><HouseScene3D {...sceneProps} /></Scene3DCanvas>
    <div className="l3p2-seg-intro">
      <div className="l3p2-seg-card">
        <div className="l3p2-seg-icon">{seg.icon}</div>
        <div className="l3p2-seg-title">{seg.title}</div>
        <div className="l3p2-seg-sub">{seg.subtitle}</div>
        <div className="l3p2-seg-desc">{seg.description}</div>
        <button className="l3p2-seg-start" style={{background:`linear-gradient(135deg,${seg.color},${seg.color}dd)`}}
          onClick={()=>{setSegPhase('playing');setTaskIdx(0);playAction();}}>
          Start {seg.title.split('—')[0]} →
        </button>
      </div>
    </div>
  </div>);
}

// ═══ MAIN GAMEPLAY ═══
if(phase==='segments'&&(segPhase==='playing'||segPhase==='data')){
  const seg=SEGMENTS[segIdx];
  const co2Color=co2>70?'#ef4444':co2>40?'#f59e0b':'#22c55e';
  const dataPopup=DATA_POPUPS[segId];

  return(
  <div className="l3p2-container">
    <Scene3DCanvas><HouseScene3D {...sceneProps} /></Scene3DCanvas>

    {/* HUD */}
    <div className="l3p2-hud-top">
      <button className="l3p2-back-btn" onClick={onComplete}>← Back</button>
      <div className="l3p2-hud-title">Phase 2 — Solutions to Reduce CO₂</div>
      <div className="l3p2-hud-segment" style={{borderColor:seg.color}}>{seg.icon} {seg.title.split('—')[0]}</div>
    </div>

    {/* CO2 Meter */}
    <div className="l3p2-co2-panel">
      <div className="l3p2-co2-header">CO₂ Level</div>
      <div className="l3p2-co2-bar"><div className="l3p2-co2-fill" style={{width:`${co2}%`,background:co2Color}}/></div>
      <div className="l3p2-co2-val" style={{color:co2Color}}>{co2}%</div>
      <div className="l3p2-co2-label">Atmospheric CO₂</div>
    </div>

    {/* Task Panel */}
    {segPhase==='playing'&&task&&(
      <div className="l3p2-task-bar" style={{'--seg-color':seg.color}}>
        <div className="l3p2-task-seg">{seg.icon} {seg.title.split('—')[0]}</div>
        <div className="l3p2-task-title">{task.icon} {task.label}</div>
        <div className="l3p2-task-inst">{task.instruction}</div>
        <div className="l3p2-task-steps">
          {tasks.map((t,i)=>(
            <div key={t.id} className={`l3p2-step ${i<taskIdx?'done':i===taskIdx?'active':''}`}>
              <div className="l3p2-step-dot">{i<taskIdx?'✓':''}</div>
              {t.icon} {t.label}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Teacher speech bubble */}
    {teacherLine&&(<div className="l3p2-teacher-bubble"><span className="l3p2-teacher-emoji">🧑‍🏫</span><span className="l3p2-teacher-text">{teacherLine}</span></div>)}

    {/* Interact prompt */}
    {segPhase==='playing'&&task&&!task.auto&&!showOrient&&!showScanner&&!showTreeAnalysis&&!showPanelSelect&&!showTurbineSelect&&!showWeather&&(
      <div className="l3p2-prompt">Press <span className="l3p2-key">E</span> {
        task.id==='climb_roof'?`Climb the ladder (step ${climbStep+1}/3)`:
        task.id==='climb_down'?`Climb down safely (step ${4-climbStep}/3)`:
        task.instruction
      }</div>
    )}

    {/* Auto-task progress timer */}
    {segPhase==='playing'&&task&&task.auto&&(<div className="l3p2-progress-timer"><div className="l3p2-progress-fill" style={{animationDuration:`${task.autoDur||6000}ms`}}/></div>)}

    {/* Wind speed meter — dark theme */}
    {segId==='wind'&&turbineInstalled&&segPhase==='playing'&&(
      <div style={{position:'absolute',bottom:20,right:12,background:'rgba(8,8,8,.92)',border:'1px solid rgba(59,130,246,.3)',
        borderRadius:16,padding:'14px 18px',zIndex:20,backdropFilter:'blur(8px)',minWidth:160,boxShadow:'0 0 20px rgba(59,130,246,.08)'}}>
        <div style={{fontSize:11,color:'#60a5fa',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Wind Speed</div>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:28,fontWeight:800,color:windSpeed>6?'#4ade80':windSpeed>3?'#fbbf24':'#f87171'}}>
          {windSpeed} m/s
        </div>
        <div style={{fontSize:12,color:'#888'}}>{WIND_SPEED_SEQUENCE[windSeqIdx%WIND_SPEED_SEQUENCE.length]?.label}</div>
        <div style={{width:'100%',height:8,background:'rgba(255,255,255,.08)',borderRadius:4,marginTop:6,overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:4,width:`${Math.min(100,windSpeed*8)}%`,
            background:windSpeed>6?'#4ade80':windSpeed>3?'#fbbf24':'#f87171',transition:'width 0.5s'}}/>
        </div>
      </div>
    )}

    {/* Orientation UI */}
    {showOrient&&(
      <div className="l3p2-orient-overlay">
        <div className="l3p2-orient-card">
          <div className="l3p2-orient-title">🧭 Orient Solar Panels</div>
          <p style={{fontSize:13,color:'#999',marginBottom:12}}>Use ← → arrows or click to choose direction</p>
          <div className="l3p2-orient-compass">
            {PANEL_ORIENTATIONS.map((o,i)=>(
              <button key={o.label} className={`l3p2-orient-btn ${i===orientIdx?'selected':''} ${i===orientIdx&&o.correct?'correct':''}`}
                onClick={()=>setOrientIdx(i)}>{o.icon} {o.label}</button>
            ))}
          </div>
          <div className="l3p2-orient-eff" style={{color:PANEL_ORIENTATIONS[orientIdx].efficiency>=0.9?'#4ade80':
            PANEL_ORIENTATIONS[orientIdx].efficiency>=0.5?'#fbbf24':'#f87171'}}>
            {Math.round(PANEL_ORIENTATIONS[orientIdx].efficiency*100)}% Efficiency
          </div>
          <button className="l3p2-orient-confirm" onClick={handleOrientConfirm}>Confirm Direction →</button>
        </div>
      </div>
    )}

    {/* Tree Analysis Hologram */}
    {showTreeAnalysis&&(
      <div className="l3p2-orient-overlay">
        <div className="l3p2-tree-analysis-card">
          <div className="l3p2-orient-title">🌿 Tree Analysis — Holographic Preview</div>
          <div className="l3p2-tree-grid">
            {TREE_ANALYSIS.map((t,i)=>(
              <div key={t.id} className={`l3p2-tree-option ${i===selectedTreeType?'selected':''}`}
                onClick={()=>setSelectedTreeType(i)} style={{'--tc':t.color}}>
                <div style={{fontSize:32}}>{t.icon}</div>
                <div style={{fontWeight:700,color:'#fff',fontSize:14}}>{t.name}</div>
                <div style={{fontSize:11,color:'#aaa'}}>{t.futureSize}</div>
                <div className="l3p2-tree-stats">
                  <div>🌡️ {t.coolingImpact}</div>
                  <div>💨 CO₂: {t.co2Absorption}</div>
                  <div>🌥️ Shadow: {t.shadowRadius}</div>
                  <div>💨 Airflow: {t.airflow}</div>
                </div>
                <div className="l3p2-tree-rating">{'⭐'.repeat(t.rating)}{'☆'.repeat(5-t.rating)}</div>
                <div style={{fontSize:11,color:t.color,fontWeight:600,marginTop:4}}>{t.verdict}</div>
              </div>
            ))}
          </div>
          <button className="l3p2-orient-confirm" style={{marginTop:16,background:'linear-gradient(135deg,#22c55e,#16a34a)'}}
            onClick={()=>{setShowTreeAnalysis(false);showFB(`Selected ${TREE_ANALYSIS[selectedTreeType].name} — great choice!`,'success');playCorrect();advanceTask();}}>
            Confirm Selection →
          </button>
        </div>
      </div>
    )}

    {/* Energy Scanner */}
    {/* Panel Type Selection */}
    {showPanelSelect&&(
      <div className="l3p2-orient-overlay"><div className="l3p2-orient-card" style={{maxWidth:500}}>
        <div className="l3p2-orient-title">⚡ Choose Panel Type</div>
        <div style={{display:'flex',gap:12,margin:'16px 0'}}>
          {PANEL_TYPES.map((pt,i)=>(
            <div key={pt.id} className="l3p2-tree-option" style={{'--tc':pt.color,flex:1,cursor:'pointer'}} onClick={()=>{setShowPanelSelect(false);playCorrect();showFB(`${pt.name} selected — ${pt.efficiency} efficiency!`,'success');advanceTask();}}>
              <div style={{fontSize:32}}>{pt.icon}</div>
              <div style={{fontWeight:700,color:'#fff',fontSize:14}}>{pt.name}</div>
              <div style={{fontSize:12,color:'#aaa'}}>{pt.efficiency} efficient</div>
              <div style={{fontSize:11,color:'#888',marginTop:4}}>{pt.description}</div>
              <div style={{fontSize:12,color:pt.color,fontWeight:600,marginTop:6}}>Cost: {pt.cost}</div>
            </div>
          ))}
        </div>
      </div></div>
    )}

    {/* Turbine Type Selection */}
    {showTurbineSelect&&(
      <div className="l3p2-orient-overlay"><div className="l3p2-orient-card" style={{maxWidth:500}}>
        <div className="l3p2-orient-title">⚙️ Choose Turbine Type</div>
        <div style={{display:'flex',gap:12,margin:'16px 0'}}>
          {TURBINE_TYPES.map((tt)=>(
            <div key={tt.id} className={`l3p2-tree-option ${tt.recommended?'selected':''}`} style={{'--tc':'#3b82f6',flex:1,cursor:'pointer'}} onClick={()=>{setShowTurbineSelect(false);playCorrect();showFB(`${tt.name} selected!`,'success');advanceTask();}}>
              <div style={{fontSize:32}}>{tt.icon}</div>
              <div style={{fontWeight:700,color:'#fff',fontSize:14}}>{tt.name}</div>
              <div style={{fontSize:12,color:'#aaa'}}>Efficiency: {tt.efficiency}</div>
              <div style={{fontSize:11,color:'#888',marginTop:4}}>{tt.description}</div>
              {tt.recommended&&<div style={{fontSize:11,color:'#4ade80',fontWeight:700,marginTop:4}}>✓ RECOMMENDED</div>}
            </div>
          ))}
        </div>
      </div></div>
    )}

    {/* Weather Scenarios */}
    {showWeather&&(
      <div className="l3p2-orient-overlay"><div className="l3p2-orient-card" style={{maxWidth:520}}>
        <div className="l3p2-orient-title">🌤️ Weather Scenarios</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,margin:'16px 0'}}>
          {WEATHER_SCENARIOS.map((ws)=>(
            <div key={ws.id} className="l3p2-tree-option" style={{'--tc':ws.skyColor,cursor:'pointer',padding:12}} onClick={()=>{setWeatherIdx(WEATHER_SCENARIOS.indexOf(ws));playAction();}}>
              <div style={{fontSize:28}}>{ws.icon}</div>
              <div style={{fontWeight:700,color:'#fff',fontSize:13}}>{ws.label}</div>
              <div style={{display:'flex',gap:8,marginTop:6,fontSize:11}}>
                <span style={{color:'#fbbf24'}}>☀️{ws.solarOutput}%</span>
                <span style={{color:'#60a5fa'}}>🌬️{ws.windOutput}%</span>
              </div>
              <div style={{fontSize:10,color:'#888',marginTop:4}}>{ws.learning}</div>
            </div>
          ))}
        </div>
        <button className="l3p2-orient-confirm" style={{background:'linear-gradient(135deg,#3b82f6,#2563eb)'}} onClick={()=>{setShowWeather(false);showFB(task.feedback,'success');playSuccess();advanceTask();}}>Complete Weather Analysis →</button>
      </div></div>
    )}

    {showScanner&&(
      <div className="l3p2-orient-overlay">
        <div className="l3p2-scanner-card">
          <div className="l3p2-orient-title">🔍 Energy Scanner — Tap Each Appliance</div>
          <div className="l3p2-scanner-grid">
            {SCANNER_APPLIANCES.map((a)=>{
              const scanned=scannedAppliances.includes(a.id);
              return(
              <div key={a.id} className={`l3p2-scanner-item ${scanned?'scanned':''} ${a.category}`}
                onClick={()=>{if(!scanned){setScannedAppliances(p=>[...p,a.id]);playAction();}}}>
                <div style={{fontSize:28}}>{a.icon}</div>
                <div style={{fontWeight:700,color:'#fff',fontSize:13}}>{a.name}</div>
                {scanned?(
                  <div className="l3p2-scanner-reveal">
                    <div style={{color:a.wireColor,fontWeight:800,fontSize:16}}>{a.watts}W</div>
                    <div style={{fontSize:11,color:'#ccc'}}>CO₂: {a.co2Daily}/day</div>
                    <div style={{fontSize:11,color:'#ccc'}}>Bill: {a.billMonthly}/mo</div>
                    <div style={{fontSize:10,color:'#888',marginTop:4}}>{a.scanReveal}</div>
                  </div>
                ):(
                  <div style={{fontSize:12,color:'#666',marginTop:6}}>Tap to scan</div>
                )}
              </div>
            );})}
          </div>
          {scannedAppliances.length>=SCANNER_APPLIANCES.length&&(
            <button className="l3p2-orient-confirm" style={{marginTop:12,background:'linear-gradient(135deg,#f59e0b,#d97706)'}}
              onClick={()=>{setShowScanner(false);showFB('Energy map complete! AC & Geyser consume the most.','success');playSuccess();advanceTask();}}>
              Complete Scan →
            </button>
          )}
        </div>
      </div>
    )}

    {/* Solar Power Mode Indicator */}
    {segId==='solar'&&powerMode==='solar'&&segPhase==='playing'&&(
      <div className="l3p2-power-mode">
        <div className="l3p2-power-badge solar">☀️ SOLAR ACTIVE</div>
        <div className="l3p2-power-stats">
          <div className="l3p2-pw-row"><span>CO₂</span><span style={{color:'#4ade80'}}>{LIVE_COMPARISON.solar.co2}</span></div>
          <div className="l3p2-pw-row"><span>Bill</span><span style={{color:'#4ade80'}}>{LIVE_COMPARISON.solar.bill}</span></div>
          <div className="l3p2-pw-row"><span>Source</span><span style={{color:'#fbbf24'}}>{LIVE_COMPARISON.solar.source}</span></div>
        </div>
      </div>
    )}

    {/* Data Popup */}
    {showData&&dataPopup&&(
      <div className="l3p2-data-popup" style={{'--seg-color':seg.color}}>
        <div className="l3p2-data-title">{dataPopup.icon} {dataPopup.title}</div>
        {dataPopup.facts.map((f,i)=>(<div key={i} className="l3p2-data-fact">{f}</div>))}
        <div className="l3p2-data-conclusion">{dataPopup.conclusion}</div>
        <button className="l3p2-data-close" onClick={handleDataClose}>
          {segIdx+1>=SEGMENTS.length?'View Comparison →':`Next: ${SEGMENTS[segIdx+1]?.title.split('—')[0]} →`}
        </button>
      </div>
    )}

    {/* Feedback Toast */}
    {feedback&&(<div className={`l3p2-feedback ${feedback.type}`}>{feedback.text}</div>)}

  </div>);
}

// ═══ TRANSFORMATION CINEMATIC ═══
if(phase==='transformation'){
  return(
  <div className="l3p2-container">
    <div className="l3p2-comp-overlay">
      <div className="l3p2-comp-title" style={{fontSize:28}}>🏡 House Transformation</div>
      <div className="l3p2-comp-subtitle">See what your actions have achieved</div>
      <div className="l3p2-transform-split">
        <div className="l3p2-transform-col before">
          <div className="l3p2-transform-header" style={{color:'#ef4444'}}>❌ BEFORE</div>
          {TRANSFORMATION_BEFORE.map((item,i)=>(
            <div key={i} className="l3p2-transform-item" style={{animationDelay:`${i*0.2}s`,'--item-color':item.color}}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="l3p2-transform-arrow">→</div>
        <div className="l3p2-transform-col after">
          <div className="l3p2-transform-header" style={{color:'#22c55e'}}>✅ AFTER</div>
          {TRANSFORMATION_AFTER.map((item,i)=>(
            <div key={i} className="l3p2-transform-item" style={{animationDelay:`${(i+6)*0.2}s`,'--item-color':item.color}}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="l3p2-learning-grid">
        {LEARNING_OUTCOMES.map((lo,i)=>(
          <div key={i} className="l3p2-learning-card" style={{animationDelay:`${i*0.15}s`}}>
            <div style={{fontSize:28}}>{lo.icon}</div>
            <div style={{fontWeight:700,color:'#fff',fontSize:14}}>{lo.title}</div>
            {lo.points.map((p,j)=><div key={j} style={{fontSize:11,color:'#aaa'}}>• {p}</div>)}
          </div>
        ))}
      </div>
      <button className="l3p2-comp-continue" onClick={()=>{setPhase('comparison');setCompStep(0);playAction();}}>View CO₂ Comparison →</button>
    </div>
  </div>);
}

// ═══ COMPARISON ═══
if(phase==='comparison'){
  return(
  <div className="l3p2-container">
    <div className="l3p2-comp-overlay">
      <div className="l3p2-comp-title">📊 CO₂ Reduction Comparison</div>
      <div className="l3p2-comp-subtitle">Which solution reduces CO₂ the fastest?</div>
      <div className="l3p2-comp-bars">
        {COMPARISON_DATA.map((d,i)=>(
          <div key={d.id} className="l3p2-comp-row" style={{animationDelay:`${i*0.3}s`,transform:'translateX(-20px)'}}>
            <div className="l3p2-comp-icon">{d.icon}</div>
            <div className="l3p2-comp-info">
              <div className="l3p2-comp-label">{d.label} — {d.speed}</div>
              <div className="l3p2-comp-bar-outer"><div className="l3p2-comp-bar-fill" style={{width:`${d.barWidth}%`,background:d.color}}>{d.reductionPercent}%</div></div>
              <div className="l3p2-comp-detail">{d.co2PerYear}/yr • Cost: {d.cost} • Best for: {d.bestFor}</div>
            </div>
          </div>
        ))}
      </div>
      <table className="l3p2-comp-table">
        <thead><tr><th>Solution</th><th>Speed</th><th>CO₂/Year</th><th>Time to Effect</th></tr></thead>
        <tbody>{COMPARISON_DATA.map(d=>(<tr key={d.id}><td>{d.icon} {d.label}</td><td>{d.speed}</td><td>{d.co2PerYear}</td><td>{d.timeToEffect}</td></tr>))}</tbody>
      </table>
      <div className="l3p2-comp-winner">
        <div className="l3p2-comp-winner-icon">☀️🏆</div>
        <div className="l3p2-comp-winner-text">Solar Energy — Fastest & Most Practical for Homes!</div>
      </div>
      <button className="l3p2-comp-continue" onClick={()=>{setPhase('realization');setRealStep(0);playAction();}}>Continue →</button>
    </div>
  </div>);
}

// ═══ REALIZATION — FINAL TEACHER SCENE ═══
if(phase==='realization'){
  const dialogues=FINAL_TEACHER_DIALOGUE||REALIZATION_LINES;
  return(
  <div className="l3p2-container">
    <div className="l3p2-real-overlay">
      <div className="l3p2-intro-teacher" style={{fontSize:64,filter:'drop-shadow(0 0 40px rgba(255,200,0,.6))',marginBottom:8}}>🧑‍🏫</div>
      <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:2,marginBottom:12}}>Final Teacher Scene</div>
      {dialogues.slice(0,realStep+1).map((l,i)=>(
        <div key={i} className={`l3p2-real-line ${l.speaker==='teacher'?'teacher':''}`} style={{animationDelay:`${i*0.3}s`}}>
          {l.speaker==='teacher'?'🧑‍🏫 ':''}{l.text}
        </div>
      ))}
      {realStep<dialogues.length-1?(
        <button className="l3p2-real-btn" onClick={()=>{setRealStep(p=>p+1);playAction();}}>...</button>
      ):(<button className="l3p2-real-btn" onClick={()=>{setPhase('quiz');playAction();}}>Take the Quiz →</button>)}
    </div>
  </div>);
}

// ═══ QUIZ ═══
if(phase==='quiz'){
  const q=PHASE2_QUIZ[quizIdx];
  return(
  <div className="l3p2-container">
    <div className="l3p2-quiz-overlay">
      <div className="l3p2-quiz-card">
        <div className="l3p2-quiz-progress">🧠 Question {quizIdx+1} of {PHASE2_QUIZ.length}</div>
        <div className="l3p2-quiz-q">{q.question}</div>
        {q.options.map((opt,i)=>{
          let cls='l3p2-quiz-opt';
          if(quizSel!==null){if(i===q.correctIndex)cls+=' correct';else if(i===quizSel)cls+=' wrong';}
          return<button key={i} className={cls} onClick={()=>handleQuizSelect(i)} disabled={quizSel!==null}>{opt}</button>;
        })}
        {showExp&&(<>
          <div className="l3p2-quiz-exp">{quizSel===q.correctIndex?'✅ Correct! ':'❌ Not quite. '}{q.explanation}</div>
          <button className="l3p2-quiz-next" onClick={handleQuizNext}>{quizIdx+1>=PHASE2_QUIZ.length?'Finish Quiz →':'Next Question →'}</button>
        </>)}
      </div>
    </div>
  </div>);
}

// ═══ TRANSITION — LEVEL 4 SOLAR REVOLUTION ═══
if(phase==='transition'){
  return(
  <div className="l3p2-container">
    <div className="l3p2-transition">
      <div className="l3p2-trans-icon">☀️</div>
      <div className="l3p2-trans-beam"></div>
      <div className="l3p2-trans-text">{LEVEL4_TRANSITION_TEXT}</div>
      <div style={{fontSize:14,color:'#999',maxWidth:400,textAlign:'center',marginTop:8}}>The solar energy beam fills the screen. The environment fully brightens.</div>
      <button className="l3p2-trans-btn" onClick={onComplete}>Continue to Level 4 →</button>
    </div>
  </div>);
}

// ═══ COMPLETE ═══
if(phase==='complete'){
  const coins=PHASE2_BADGE.coins+stars*10+segsComplete*15;
  return(
  <div className="l3p2-container">
    <div className="l3p2-done-overlay">
      <div className="l3p2-done-card">
        <div className="l3p2-done-badge">{PHASE2_BADGE.icon}</div>
        <div className="l3p2-done-title">Phase 2 Complete!</div>
        <div className="l3p2-done-sub">{PHASE2_BADGE.description}</div>
        <div className="l3p2-done-stars">
          {[1,2,3].map(s=>(<span key={s} className={`l3p2-star ${s<=stars?'earned':''}`} style={{animationDelay:`${s*0.3}s`}}>⭐</span>))}
        </div>
        <div className="l3p2-done-stats">
          <div className="l3p2-stat"><div className="l3p2-stat-val">{segsComplete}/{SEGMENTS.length}</div><div className="l3p2-stat-lbl">Segments</div></div>
          <div className="l3p2-stat"><div className="l3p2-stat-val">{quizScore}/{PHASE2_QUIZ.length}</div><div className="l3p2-stat-lbl">Quiz</div></div>
          <div className="l3p2-stat"><div className="l3p2-stat-val">+{coins}</div><div className="l3p2-stat-lbl">Coins</div></div>
        </div>
        <div className="l3p2-done-coins">🪙 +{coins} Carbon Coins earned!</div>
        <button className="l3p2-done-btn" onClick={()=>{setPhase('transition');playSuccess();}}>Continue →</button>
      </div>
    </div>
  </div>);
}

return null;
}
