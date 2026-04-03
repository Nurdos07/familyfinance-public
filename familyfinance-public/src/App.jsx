import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#0b1120", sidebar:"#0f1729", card:"#131d33", cardAlt:"#172035",
  border:"rgba(255,255,255,0.07)", text:"#e8eaf2", muted:"#7b87a8",
  accent:"#1ecb8f", orange:"#f97316", red:"#ef4444",
  blue:"#3b82f6", purple:"#8b5cf6", yellow:"#f59e0b", pink:"#ec4899",
};

const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SH  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CATS_E     = ["Groceries","Housing","Transport","Health","Entertainment","Education","Shopping","Utilities","Vacation","Other"];
const CATS_I     = ["Salary","Rental 1","Rental 2","Business","Investments","Other"];
const CAT_CLR    = ["#1ecb8f","#f97316","#3b82f6","#8b5cf6","#ec4899","#f59e0b","#06b6d4","#10b981","#ef4444","#84cc16"];
const G_ICONS    = ["✈️","🚗","📚","💰","🎯","🌟","⌚","🏠","🏔️","🏢","💵","🎉","💎","🚘","📖","🏎️","🎓","🐕","🌴","💻"];
const MEMBER_COLORS = ["#3b82f6","#ec4899","#f97316","#1ecb8f","#8b5cf6","#f59e0b","#06b6d4","#ef4444"];

const fmtPct = n => Math.round(n)+"%";
const fmtD   = d => { try { return new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}); } catch { return d; } };
const daysTo = d => Math.ceil((new Date(d)-new Date())/86400000);
// Simple dollar formatter — amounts stored as plain numbers (e.g. 500 = $500)
const fmtAmt = n => "$"+Math.abs(Math.round(n)).toLocaleString("en-US");

function nextDate(dom,vy,vm,isCur){ const c=new Date(vy,vm,dom); if(isCur&&c<new Date()) return new Date(vy,vm+1,dom); return c; }
function ld(k,d){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch{ return d; } }
function sv(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }

// ── Onboarding ────────────────────────────────────────
const SUGGESTED_ROLES = ["Head of Household","Main Earner","Partner","Student","Child","Teenager","Parent","Grandparent","Other"];

function OnboardingFlow({onComplete}){
  const [step, setStep] = useState(1); // 1=welcome, 2=family size, 3=member names, 4=pin
  const [groupName,  setGroupName]  = useState("");
  const [memberCount,setMemberCount]= useState(null);
  const [members,    setMembers]    = useState([]);
  const [pin,        setPin]        = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinErr,     setPinErr]     = useState("");

  const COUNTS = [2,3,4,5,6,7,8];

  const initMembers = count => {
    const defaults = ["Person 1","Person 2","Person 3","Person 4","Person 5","Person 6","Person 7","Person 8"];
    setMembers(Array.from({length:count},(_,i)=>({name:defaults[i],role:SUGGESTED_ROLES[i]||"Member",color:MEMBER_COLORS[i]})));
  };

  const updateMember = (i,field,val) => setMembers(m=>m.map((x,j)=>j===i?{...x,[field]:val}:x));

  const finishSetup = () => {
    if(pin.length<4){ setPinErr("PIN must be 4 digits"); return; }
    if(pin!==pinConfirm){ setPinErr("PINs don't match"); return; }
    const setup = { groupName:groupName||"My Family", members, pin, done:true };
    sv("sf_pub_setup", setup);
    sv("sf_pub_pin_ok","");
    onComplete(setup);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:500}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#1ecb8f,#0ea572)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:"#fff",fontWeight:900,margin:"0 auto 12px"}}>$</div>
          <h1 style={{margin:"0 0 4px",fontSize:22,fontWeight:900,color:C.text}}>FamilyFinance</h1>
          <p style={{margin:0,fontSize:12,color:C.muted}}>Smart finance tracking for your household</p>
        </div>

        {/* Step indicator */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:28}}>
          {[1,2,3,4].map(s=>(
            <div key={s} style={{width:s===step?24:8,height:8,borderRadius:99,background:s<=step?C.accent:"rgba(255,255,255,0.1)",transition:"all 0.3s"}}/>
          ))}
        </div>

        <div style={{background:C.card,borderRadius:20,padding:"1.5rem",border:"1px solid rgba(255,255,255,0.07)"}}>

          {/* STEP 1: Welcome */}
          {step===1&&(
            <div>
              <h2 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:C.text}}>Welcome! 👋</h2>
              <p style={{margin:"0 0 20px",fontSize:12,color:C.muted}}>Let's set up your family finance dashboard in 2 minutes.</p>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>What should we call your group?</label>
                <input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="e.g. The Johnson Family, Our Household..." style={{width:"100%",padding:"10px 13px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:C.cardAlt,color:C.text,fontSize:13,boxSizing:"border-box"}}/>
                <p style={{margin:"4px 0 0",fontSize:10,color:C.muted}}>You can change this later in Settings.</p>
              </div>
              <button onClick={()=>setStep(2)} style={{width:"100%",padding:"12px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#1ecb8f,#0ea572)",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Get Started →</button>
            </div>
          )}

          {/* STEP 2: Family size */}
          {step===2&&(
            <div>
              <h2 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:C.text}}>How many people are in your household?</h2>
              <p style={{margin:"0 0 20px",fontSize:12,color:C.muted}}>This includes everyone who shares finances — family members, partners, roommates.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
                {COUNTS.map(n=>(
                  <button key={n} onClick={()=>{setMemberCount(n);initMembers(n);}} style={{padding:"14px 0",borderRadius:12,border:`2px solid ${memberCount===n?C.accent:"rgba(255,255,255,0.08)"}`,background:memberCount===n?"rgba(30,203,143,0.12)":C.cardAlt,color:memberCount===n?C.accent:C.text,fontSize:18,fontWeight:800,cursor:"pointer",transition:"all 0.15s"}}>{n}</button>
                ))}
              </div>
              <p style={{margin:"0 0 16px",fontSize:11,color:C.muted,textAlign:"center"}}>Don't worry — you can add or remove members anytime.</p>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setStep(1)} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:C.muted,fontSize:12,cursor:"pointer"}}>← Back</button>
                <button onClick={()=>memberCount&&setStep(3)} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:memberCount?"linear-gradient(135deg,#1ecb8f,#0ea572)":"rgba(255,255,255,0.05)",color:memberCount?"#fff":C.muted,fontSize:13,fontWeight:800,cursor:memberCount?"pointer":"default"}}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Member names */}
          {step===3&&(
            <div>
              <h2 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:C.text}}>Name your household members</h2>
              <p style={{margin:"0 0 16px",fontSize:12,color:C.muted}}>Add names and roles so everyone knows who's who.</p>
              <div style={{maxHeight:320,overflowY:"auto",marginBottom:16}}>
                {members.map((m,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:9}}>
                    <div style={{width:34,height:34,borderRadius:50,background:`linear-gradient(135deg,${m.color},${m.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13,flexShrink:0}}>{m.name?m.name[0].toUpperCase():"?"}</div>
                    <input value={m.name} onChange={e=>updateMember(i,"name",e.target.value)} placeholder={`Member ${i+1}`} style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:C.cardAlt,color:C.text,fontSize:12}}/>
                    <select value={m.role} onChange={e=>updateMember(i,"role",e.target.value)} style={{width:130,padding:"7px 8px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:C.cardAlt,color:C.text,fontSize:11}}>
                      {SUGGESTED_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setStep(2)} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:C.muted,fontSize:12,cursor:"pointer"}}>← Back</button>
                <button onClick={()=>setStep(4)} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1ecb8f,#0ea572)",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 4: PIN setup */}
          {step===4&&(
            <div>
              <h2 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:C.text}}>Set a family PIN</h2>
              <p style={{margin:"0 0 20px",fontSize:12,color:C.muted}}>This PIN protects your dashboard. Share it with your household members.</p>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Choose a 4-digit PIN</label>
                <input type="password" maxLength={4} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))} placeholder="••••" style={{width:"100%",padding:"12px 13px",borderRadius:10,border:`1px solid ${pin.length===4?"rgba(30,203,143,0.4)":"rgba(255,255,255,0.1)"}`,background:C.cardAlt,color:C.text,fontSize:22,letterSpacing:"0.3em",textAlign:"center",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:10,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Confirm PIN</label>
                <input type="password" maxLength={4} value={pinConfirm} onChange={e=>setPinConfirm(e.target.value.replace(/\D/g,""))} placeholder="••••" style={{width:"100%",padding:"12px 13px",borderRadius:10,border:`1px solid ${pinConfirm.length===4&&pinConfirm===pin?"rgba(30,203,143,0.4)":pinConfirm.length===4?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.1)"}`,background:C.cardAlt,color:C.text,fontSize:22,letterSpacing:"0.3em",textAlign:"center",boxSizing:"border-box"}}/>
              </div>
              {pinErr&&<p style={{color:C.red,fontSize:11,margin:"0 0 10px",textAlign:"center"}}>{pinErr}</p>}
              <div style={{background:"rgba(30,203,143,0.07)",border:"1px solid rgba(30,203,143,0.15)",borderRadius:9,padding:"8px 12px",marginBottom:16}}>
                <p style={{margin:0,fontSize:10,color:C.accent}}>✓ Your data stays in your browser — we never see your financial information.</p>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setStep(3)} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:C.muted,fontSize:12,cursor:"pointer"}}>← Back</button>
                <button onClick={finishSetup} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#1ecb8f,#0ea572)",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Launch Dashboard 🚀</button>
              </div>
            </div>
          )}

        </div>
        <p style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.08)",marginTop:16}}>FamilyFinance · Free & Private · No account needed</p>
      </div>
    </div>
  );
}

// ── PIN Lock ──────────────────────────────────────────
function PinLock({correctPin, onUnlock}){
  const [pin,   setPin]   = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const press = d => {
    if(pin.length>=4) return;
    const next=pin+d; setPin(next); setError(false);
    if(next.length===4){
      if(next===correctPin){ sv("sf_pub_pin_ok","1"); onUnlock(); }
      else { setShake(true); setError(true); setTimeout(()=>{ setPin(""); setShake(false); },700); }
    }
  };
  const del=()=>{ setPin(p=>p.slice(0,-1)); setError(false); };
  const rows=[["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{textAlign:"center",width:280}}>
        <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#1ecb8f,#0ea572)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:"#fff",fontWeight:900,margin:"0 auto 16px"}}>$</div>
        <h1 style={{color:C.text,fontSize:18,fontWeight:800,margin:"0 0 4px"}}>FamilyFinance</h1>
        <p style={{color:C.muted,fontSize:11,margin:"0 0 28px"}}>Enter your family PIN to continue</p>
        <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:28,animation:shake?"shake 0.4s ease":"none"}}>
          {[0,1,2,3].map(i=><div key={i} style={{width:13,height:13,borderRadius:50,background:pin.length>i?(error?C.red:C.accent):"rgba(255,255,255,0.15)",transition:"background 0.15s"}}/>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,maxWidth:220,margin:"0 auto"}}>
          {rows.flat().map((d,i)=>d===""?<div key={i}/>:<button key={i} onClick={()=>d==="⌫"?del():press(d)} style={{height:54,borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.05)",color:C.text,fontSize:d==="⌫"?17:20,fontWeight:600,cursor:"pointer"}} onMouseDown={e=>e.currentTarget.style.background="rgba(30,203,143,0.15)"} onMouseUp={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>{d}</button>)}
        </div>
        {error&&<p style={{color:C.red,fontSize:11,marginTop:16,fontWeight:600}}>Incorrect PIN. Try again.</p>}
        <p style={{color:"rgba(255,255,255,0.08)",fontSize:10,marginTop:28}}>FamilyFinance · Private & Secure</p>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-8px)}80%{transform:translateX(4px)}} button:active{transform:scale(0.93)!important}`}</style>
    </div>
  );
}

// ── Form helpers ──────────────────────────────────────
const INP_S={width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"#172035",color:"#e8eaf2",fontSize:12,boxSizing:"border-box"};
const SEL_S={width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"#172035",color:"#e8eaf2",fontSize:12};
function FInp({value,onChange,type="text",placeholder=""}){ return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={INP_S}/>; }
function FSel({value,onChange,opts}){ return <select value={value} onChange={e=>onChange(e.target.value)} style={SEL_S}>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>; }
function FRow({label,children}){ return <div style={{marginBottom:9}}><label style={{fontSize:9,color:"#7b87a8",display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>{label}</label>{children}</div>; }
function TxForm({data,onChange,members}){
  return (
    <>
      <FRow label="Type"><FSel value={data.type} onChange={v=>onChange({...data,type:v,category:v==="income"?CATS_I[0]:CATS_E[0]})} opts={[{v:"expense",l:"Expense"},{v:"income",l:"Income"}]}/></FRow>
      <FRow label="Amount ($)"><FInp value={data.amount} onChange={v=>onChange({...data,amount:v})} type="number" placeholder="0.00"/></FRow>
      <FRow label="Category"><FSel value={data.category} onChange={v=>onChange({...data,category:v})} opts={(data.type==="income"?CATS_I:CATS_E).map(o=>({v:o,l:o}))}/></FRow>
      <FRow label="Member"><FSel value={data.person} onChange={v=>onChange({...data,person:v})} opts={[...members.map(m=>({v:m.name,l:m.name})),{v:"Family",l:"Family"}]}/></FRow>
      <FRow label="Date"><FInp value={data.date} onChange={v=>onChange({...data,date:v})} type="date"/></FRow>
      <FRow label="Status"><FSel value={data.status} onChange={v=>onChange({...data,status:v})} opts={["Paid","Overdue","Pending"].map(o=>({v:o,l:o}))}/></FRow>
      <FRow label="Notes (optional)"><FInp value={data.notes||""} onChange={v=>onChange({...data,notes:v})} placeholder="e.g. Walmart grocery run..."/></FRow>
    </>
  );
}
function Modal({title,onClose,onSave,saveLabel="Save",children}){
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99,padding:"20px 0",overflowY:"auto"}}>
      <div style={{background:"#131d33",borderRadius:16,padding:"1.3rem",width:410,maxWidth:"93vw",border:"1px solid rgba(255,255,255,0.09)",boxShadow:"0 25px 60px rgba(0,0,0,0.5)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{margin:0,fontSize:14,fontWeight:800,color:"#e8eaf2"}}>{title}</h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.07)",border:"none",color:"#7b87a8",cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {children}
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={onClose} style={{flex:1,padding:"9px",borderRadius:9,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#7b87a8",cursor:"pointer",fontSize:12}}>Cancel</button>
          <button onClick={onSave}  style={{flex:2,padding:"9px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#1ecb8f,#0ea572)",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:800}}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Charts ────────────────────────────────────────────
function Spark({data,color,w=88,h=30}){
  if(!data||data.length<2) return null;
  const mx=Math.max(...data),mn=Math.min(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rng)*h}`).join(" ");
  return <svg width={w} height={h} style={{overflow:"visible"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/></svg>;
}
function MBar({data,h=120}){
  const mx=Math.max(...data.flatMap(d=>[d.inc||0,d.exp||0]),1);
  const bw=Math.floor(280/data.length/2.8);
  return <svg width="100%" height={h} viewBox={`0 0 300 ${h}`} preserveAspectRatio="xMidYMid meet">{data.map((d,i)=>{ const x=(i/data.length)*280+10,ih=((d.inc||0)/mx)*(h-20),eh=((d.exp||0)/mx)*(h-20); return <g key={i}>{ih>0&&<rect x={x} y={h-20-ih} width={bw} height={ih} fill={C.accent} rx={2} opacity={d.active?1:0.45}/>}{eh>0&&<rect x={x+bw+2} y={h-20-eh} width={bw} height={eh} fill={C.orange} rx={2} opacity={d.active?1:0.45}/>}<text x={x+bw} y={h-4} textAnchor="middle" fontSize={7} fill={d.active?C.accent:C.muted} fontWeight={d.active?"bold":"normal"}>{d.label}</text></g>; })}</svg>;
}
function Donut({sl,size=120}){
  const total=sl.reduce((s,d)=>s+d.v,0)||1; let ang=-90;
  const r=44,cx=size/2,cy=size/2;
  const paths=sl.filter(d=>d.v>0).map(d=>{ const deg=(d.v/total)*360,s1=(ang*Math.PI)/180,e1=((ang+deg)*Math.PI)/180,x1=cx+r*Math.cos(s1),y1=cy+r*Math.sin(s1),x2=cx+r*Math.cos(e1),y2=cy+r*Math.sin(e1); ang+=deg; return {...d,path:`M${cx} ${cy}L${x1} ${y1}A${r} ${r} 0 ${deg>180?1:0} 1 ${x2} ${y2}Z`}; });
  return <svg width={size} height={size}>{paths.map((p,i)=><path key={i} d={p.path} fill={p.c} stroke={C.card} strokeWidth="2"/>)}<circle cx={cx} cy={cy} r={r*0.52} fill={C.card}/></svg>;
}
function PB({pct,color=C.accent,h=7}){
  const p=Math.min(100,Math.max(0,Math.round(pct)));
  return <div style={{background:"rgba(255,255,255,0.07)",borderRadius:99,height:h}}><div style={{width:`${p}%`,height:"100%",background:p>=100?C.accent:p>85?C.yellow:color,borderRadius:99,transition:"width 0.5s"}}/></div>;
}
function Pill({bg,tc,ch}){ return <span style={{background:bg,color:tc,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,whiteSpace:"nowrap"}}>{ch}</span>; }

const SL  = {fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0 0 3px"};
const CRD = {background:C.card,borderRadius:15,border:"1px solid rgba(255,255,255,0.07)",padding:"1rem"};
const SV  = (c=C.text,s=20)=>({fontSize:s,fontWeight:700,margin:0,color:c,fontFamily:"'Courier New',monospace"});

const AI_SYSTEM=`You are an elite family financial strategist and advisor. You combine wisdom from the greatest financial minds:

PHILOSOPHY & STRATEGY:
- Warren Buffett: long-term thinking, compounding, value investing, "never lose money"
- Charlie Munger: mental models, inversion thinking, "avoid stupidity"
- Naval Ravikant: wealth creation through leverage, specific knowledge, equity vs time
- Robert Kiyosaki: assets vs liabilities, cash flows, financial literacy
- Ray Dalio: diversification, economic cycles, principles
- Morgan Housel: psychology of money, long-term behavior, life-money balance
- Nassim Taleb: antifragility, black swans, risk management

PRACTICAL STRATEGIES:
- Rule of 72: divide 72 by return % = years to double money
- 50/30/20 budgeting as baseline
- Automate savings — "pay yourself first"
- Dollar-cost averaging for investments
- Emergency fund: 3-6 months of expenses
- Debt avalanche vs snowball methods

HOW TO RESPOND:
- Always be specific and structured
- Give numbers, percentages, timelines
- Suggest 2-3 strategies with pros/cons
- Add unexpected life hacks most people don't know
- End every response with a concrete next action step
- Respond in English, energetically and clearly`;

// ── Main App ──────────────────────────────────────────
function buildSeedTx(members){
  const rows=[]; let id=1;
  const now=new Date();
  const primary  = members[0]?.name||"Person 1";
  const secondary= members[1]?.name||"Person 2";
  for(let delta=-3;delta<=0;delta++){
    const b=new Date(now.getFullYear(),now.getMonth()+delta,1);
    const yr=b.getFullYear(),mo=b.getMonth();
    const p=n=>String(n).padStart(2,"0");
    const dt=day=>`${yr}-${p(mo+1)}-${p(day)}`;
    const j=()=>0.96+Math.random()*0.08;
    rows.push(
      {id:id++,type:"income", amount:Math.round(5000*j()),   category:"Salary",    person:primary,   date:dt(5),  notes:`${primary} salary`,       status:"Paid"},
      {id:id++,type:"income", amount:Math.round(3500*j()),   category:"Salary",    person:secondary,  date:dt(5),  notes:`${secondary} salary`,      status:"Paid"},
      {id:id++,type:"income", amount:1800,                    category:"Rental 1",  person:"Family",   date:dt(1),  notes:"Rental property income",   status:"Paid"},
      {id:id++,type:"expense",amount:Math.round(600*j()),    category:"Groceries", person:secondary,  date:dt(8),  notes:"Weekly groceries",         status:"Paid"},
      {id:id++,type:"expense",amount:Math.round(280*j()),    category:"Utilities", person:"Family",   date:dt(10), notes:"Electric, water, internet", status:delta===0?"Overdue":"Paid"},
      {id:id++,type:"expense",amount:180,                    category:"Transport", person:primary,    date:dt(12), notes:"Gas & parking",            status:"Paid"},
      {id:id++,type:"expense",amount:Math.round(220*j()),    category:"Entertainment",person:members[2]?.name||"Family",date:dt(18),notes:"Dining out, movies",status:"Paid"},
      {id:id++,type:"expense",amount:800,                    category:"Education", person:members[2]?.name||"Family",date:dt(20),notes:"Tuition payment",      status:"Paid"},
      {id:id++,type:"expense",amount:Math.round(320*j()),    category:"Shopping",  person:secondary,  date:dt(22), notes:"Clothes & accessories",    status:"Paid"},
      {id:id++,type:"expense",amount:Math.round(120*j()),    category:"Health",    person:"Family",   date:dt(16), notes:"Doctor, pharmacy",         status:"Paid"},
    );
  }
  return rows;
}

function AppInner({setup, onSignOut, onReset}){
  const NOW=new Date(),NY=NOW.getFullYear(),NM=NOW.getMonth();
  const MEMBERS = setup.members;
  const MCLR    = Object.fromEntries(MEMBERS.map(m=>[m.name,m.color]));

  const [vy,setVy]=useState(NY);
  const [vm,setVm]=useState(NM);
  const isCur=vy===NY&&vm===NM;
  const isFut=new Date(vy,vm,1)>new Date(NY,NM+1,0);
  const [isMobile,setIsMobile]=useState(()=>window.innerWidth<768);
  const [showSidebar,setShowSidebar]=useState(false);
  useEffect(()=>{ const fn=()=>setIsMobile(window.innerWidth<768); window.addEventListener("resize",fn); return()=>window.removeEventListener("resize",fn); },[]);

  const [page,   setPage]  =useState("dashboard");
  const [tx,     setTx]    =useState(()=>ld("sf_pub2_tx",  buildSeedTx(MEMBERS)));
  const [bud,    setBud]   =useState(()=>ld("sf_pub2_bud", {Groceries:800,Housing:1500,Transport:400,Health:300,Entertainment:500,Education:1000,Shopping:600,Utilities:350,Vacation:2000,Other:300}));
  const [goals,  setGoals] =useState(()=>ld("sf_pub2_goals",[{id:1,icon:"🏠",name:"Family Vacation Fund",target:5000,current:1200,deadline:"2026-12-01",done:false,cat:"Travel",note:"Annual family vacation"}]));
  const [sched,  setSched] =useState(()=>ld("sf_pub2_sched",[
    {id:1,name:`${MEMBERS[0]?.name||"Person 1"} Salary`,  type:"income", amount:5000,dom:5, icon:"💼"},
    {id:2,name:`${MEMBERS[1]?.name||"Person 2"} Salary`,  type:"income", amount:3500,dom:5, icon:"💼"},
    {id:3,name:"Rental Income",                            type:"income", amount:1800,dom:1, icon:"🏠"},
    {id:4,name:"Groceries",                                type:"expense",amount:600,  dom:8, icon:"🛒"},
    {id:5,name:"Utilities",                                type:"expense",amount:280,  dom:10,icon:"⚡"},
    {id:6,name:"Education",                                type:"expense",amount:800,  dom:20,icon:"🎓"},
    {id:7,name:"Transport",                                type:"expense",amount:180,  dom:12,icon:"⛽"},
    {id:8,name:"Vacation Fund",                            type:"expense",amount:500,  dom:28,icon:"✈️"},
  ]));

  const [sAdd,   setSAdd]  =useState(false);
  const [txEd,   setTxEd]  =useState(null);
  const [gAdd,   setGAdd]  =useState(false);
  const [gEd,    setGEd]   =useState(null);
  const [scEd,   setScEd]  =useState(null);
  const [fp,     setFp]    =useState("All");
  const [chat,   setChat]  =useState([{r:"ai",t:`Hello! 👋 I'm your FamilyFinance AI Advisor.\n\nI combine strategies from Buffett, Naval, Kiyosaki, Dalio, Munger and the world's best financial minds.\n\nI have full context about your household finances and can search the web for real-time data.\n\nAsk me anything about budgeting, investing, or financial strategy!`}]);
  const [cin,    setCin]   =useState("");
  const [cld,    setCld]   =useState(false);
  const [webSrch,setWebSrch]=useState(true);
  const cRef=useRef(null);

  const eTx={type:"expense",amount:"",category:"Groceries",person:MEMBERS[0]?.name||"Family",date:`${vy}-${String(vm+1).padStart(2,"0")}-${String(NOW.getDate()).padStart(2,"0")}`,notes:"",status:"Paid"};
  const eG={icon:"🎯",name:"",target:"",current:"0",deadline:"2026-12-31",cat:"Savings",done:false,note:""};
  const [ntx,setNtx]=useState(eTx);
  const [sf, setSf2]=useState({});
  const [gf, setGf] =useState(eG);
  const [etxForm,setEtxForm]=useState({});

  useEffect(()=>sv("sf_pub2_tx",  tx),  [tx]);
  useEffect(()=>sv("sf_pub2_bud", bud), [bud]);
  useEffect(()=>sv("sf_pub2_goals",goals),[goals]);
  useEffect(()=>sv("sf_pub2_sched",sched),[sched]);
  useEffect(()=>{ cRef.current?.scrollIntoView({behavior:"smooth"}); },[chat]);

  const goM=d=>{ const nd=new Date(vy,vm+d,1); setVy(nd.getFullYear()); setVm(nd.getMonth()); };

  const mtx=tx.filter(t=>{ const d=new Date(t.date+"T00:00:00"); return d.getFullYear()===vy&&d.getMonth()===vm; });
  const TINC=mtx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const TEXP=mtx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const TBAL=TINC-TEXP;
  const SPCT=TINC>0?(TBAL/TINC)*100:0;
  const ebc=CATS_E.map((c,i)=>({label:c,c:CAT_CLR[i],v:mtx.filter(t=>t.type==="expense"&&t.category===c).reduce((s,t)=>s+t.amount,0)})).filter(d=>d.v>0);
  const emap={}; mtx.filter(t=>t.type==="expense").forEach(t=>{emap[t.category]=(emap[t.category]||0)+t.amount;});
  const ibc=CATS_I.map((c,i)=>({label:c,c:CAT_CLR[i],v:mtx.filter(t=>t.type==="income"&&t.category===c).reduce((s,t)=>s+t.amount,0)})).filter(d=>d.v>0);
  const bars=Array.from({length:6},(_,i)=>{ const off=vm-5+i,rm=((off%12)+12)%12,ry=vy+Math.floor(off/12); const sl=tx.filter(t=>{ const d=new Date(t.date+"T00:00:00"); return d.getFullYear()===ry&&d.getMonth()===rm; }); return {label:MONTHS_SH[rm],inc:sl.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),exp:sl.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),active:rm===vm&&ry===vy}; });
  const scRows=sched.map(s=>{ const nd=nextDate(s.dom,vy,vm,isCur); return {...s,nd,days:isCur?daysTo(nd):null}; }).sort((a,b)=>isCur?(a.days??99)-(b.days??99):a.dom-b.dom);
  const gDone=goals.filter(g=>g.done||g.current>=g.target).length;
  const gTotT=goals.reduce((s,g)=>s+g.target,0);
  const gTotC=goals.reduce((s,g)=>s+g.current,0);
  const filtTx=mtx.filter(t=>fp==="All"||t.person===fp).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const mstats=MEMBERS.map(m=>({name:m.name,color:m.color,role:m.role,inc:mtx.filter(t=>t.type==="income"&&t.person===m.name).reduce((s,t)=>s+t.amount,0),exp:mtx.filter(t=>t.type==="expense"&&t.person===m.name).reduce((s,t)=>s+t.amount,0)}));

  const addTx=()=>{ if(!ntx.amount||isNaN(+ntx.amount)) return; setTx(p=>[...p,{...ntx,id:Date.now(),amount:+ntx.amount}]); setNtx(eTx); setSAdd(false); };
  const delTx=id=>setTx(p=>p.filter(t=>t.id!==id));
  const saveEditTx=()=>{ setTx(p=>p.map(t=>t.id===txEd?{...etxForm,id:t.id,amount:+etxForm.amount}:t)); setTxEd(null); };
  const saveGoal=()=>{ if(!gf.name||!gf.target) return; if(gEd){ setGoals(g=>g.map(x=>x.id===gEd?{...gf,id:x.id,target:+gf.target,current:+gf.current}:x)); setGEd(null); } else { setGoals(g=>[...g,{...gf,id:Date.now(),target:+gf.target,current:+gf.current||0}]); setGAdd(false); } setGf(eG); };
  const saveSched=()=>{ setSched(s=>s.map(x=>x.id===scEd?{...sf,amount:+sf.amount,dom:+sf.dom}:x)); setScEd(null); };

  const sendChat=async()=>{
    if(!cin.trim()||cld) return;
    const msg=cin.trim(); setCin("");
    setChat(p=>[...p,{r:"user",t:msg}]);
    setCld(true);
    const ctx=`HOUSEHOLD: ${setup.groupName} | Members: ${MEMBERS.map(m=>`${m.name} (${m.role})`).join(", ")} | ${MONTHS[vm]} ${vy}: Income=$${Math.round(TINC).toLocaleString()}, Expenses=$${Math.round(TEXP).toLocaleString()}, Balance=$${Math.round(TBAL).toLocaleString()}, Savings rate=${fmtPct(SPCT)} | Top expenses: ${ebc.map(c=>`${c.label}=$${Math.round(c.v).toLocaleString()}`).join(", ")} | Goals: ${gDone}/${goals.length} complete`;
    try {
      const tools=webSrch?[{type:"web_search_20250305",name:"web_search"}]:[];
      const body=JSON.stringify({
        model:"claude-3-5-haiku-20241022",
        max_tokens:1500,
        system:AI_SYSTEM+"\n\n"+ctx,
        tools:tools.length?tools:undefined,
        messages:[
          ...chat.filter((_,i)=>i>0).map(m=>({role:m.r==="ai"?"assistant":"user",content:m.t})),
          {role:"user",content:msg+(webSrch?" (search the web for current data if needed)":"")}
        ]
      });
      const r=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body
      });
      if(!r.ok && r.status===0){
        setChat(p=>[...p,{r:"ai",t:"❌ Could not reach the server. Make sure the app is deployed on Vercel (not running locally without the API function)."}]);
        setCld(false); return;
      }
      let d;
      try { d=await r.json(); }
      catch { setChat(p=>[...p,{r:"ai",t:"❌ Server returned an invalid response. Check Vercel logs."}]); setCld(false); return; }
      if(d.error||d.type==="error"){
        const e=typeof d.error==="string"?d.error:(d.error?.message||JSON.stringify(d));
        setChat(p=>[...p,{r:"ai",t:"❌ "+e}]); setCld(false); return;
      }
      const text=d.content?.map(c=>c.type==="text"?c.text:"").filter(Boolean).join("")||"No response.";
      setChat(p=>[...p,{r:"ai",t:text}]);
    } catch(e){
      setChat(p=>[...p,{r:"ai",t:"❌ Error: "+e.message+". If testing locally, the AI only works on the deployed Vercel app."}]);
    }
    setCld(false);
  };

  const [activeUser,setActiveUser]=useState(MEMBERS[0]?.name||"Family");

  const NAV=[{k:"dashboard",l:"Dashboard",i:"◻"},{k:"goals",l:"Goals",i:"🎯"},{k:"schedule",l:"Schedule",i:"📅"},{k:"transactions",l:"Transactions",i:"↕"},{k:"income",l:"Income",i:"↑"},{k:"expenses",l:"Expenses",i:"↓"},{k:"family",l:"Members",i:"◎"},{k:"reports",l:"Reports",i:"≡"},{k:"budgets",l:"Budgets",i:"◈"},{k:"advisor",l:"AI Advisor",i:"✦"},{k:"settings",l:"Settings",i:"⚙"}];

  const Banner=()=>(<div style={{marginBottom:10}}>{isFut&&<div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,padding:"7px 12px",display:"flex",gap:8,alignItems:"center"}}><span>📅</span><p style={{margin:0,fontSize:11,color:C.blue}}>Future month — {MONTHS[vm]} {vy}</p></div>}{!isCur&&!isFut&&<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"7px 12px",display:"flex",gap:8,alignItems:"center"}}><span style={{color:C.muted}}>◌</span><p style={{margin:0,fontSize:11,color:C.muted}}>History: <b style={{color:C.text}}>{MONTHS[vm]} {vy}</b> · <span style={{color:C.accent,cursor:"pointer"}} onClick={()=>{setVy(NY);setVm(NM);}}>Back to current →</span></p></div>}</div>);

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"system-ui,sans-serif",fontSize:13}}>
      {isMobile&&showSidebar&&<div onClick={()=>setShowSidebar(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:40}}/>}

      {/* SIDEBAR */}
      <div style={{width:214,background:C.sidebar,borderRight:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",flexShrink:0,position:isMobile?"fixed":"sticky",top:0,left:0,height:"100vh",overflowY:"auto",zIndex:50,transform:isMobile&&!showSidebar?"translateX(-100%)":"translateX(0)",transition:"transform 0.25s ease"}}>
        <div style={{padding:"0.85rem",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#1ecb8f,#0ea572)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"#fff",fontWeight:900,flexShrink:0}}>$</div>
          <div><p style={{margin:0,fontWeight:800,fontSize:12,color:C.text}}>FamilyFinance</p><p style={{margin:0,fontSize:9,color:C.muted}}>{setup.groupName}</p></div>
        </div>
        {/* Member switcher */}
        <div style={{padding:"0.5rem 0.75rem",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <p style={{...SL,marginBottom:5}}>Active Member</p>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {MEMBERS.map(m=><button key={m.name} onClick={()=>setActiveUser(m.name)} style={{padding:"3px 7px",borderRadius:6,border:`1px solid ${activeUser===m.name?m.color:"rgba(255,255,255,0.07)"}`,background:activeUser===m.name?`${m.color}22`:"transparent",color:activeUser===m.name?m.color:C.muted,fontSize:9,fontWeight:700,cursor:"pointer"}}>{m.name}</button>)}
          </div>
        </div>
        {/* Month nav */}
        <div style={{padding:"0.6rem 0.75rem",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
            <button onClick={()=>goM(-1)} style={{background:C.cardAlt,border:"1px solid rgba(255,255,255,0.07)",color:C.muted,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:14}}>‹</button>
            <div style={{textAlign:"center"}}><p style={{margin:0,fontSize:11,fontWeight:700,color:C.text}}>{MONTHS_SH[vm]} {vy}</p><p style={{margin:0,fontSize:8,color:isCur?C.accent:C.muted}}>{isCur?"● current":"◌ history"}</p></div>
            <button onClick={()=>goM(1)} style={{background:C.cardAlt,border:"1px solid rgba(255,255,255,0.07)",color:C.muted,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:14}}>›</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2}}>
            {MONTHS_SH.map((m,i)=>{ const sel=i===vm,cur=i===NM&&vy===NY; return <button key={m} onClick={()=>setVm(i)} style={{padding:"3px 1px",borderRadius:5,border:`1px solid ${sel?C.accent:"transparent"}`,fontSize:9,cursor:"pointer",background:sel?"rgba(30,203,143,0.13)":"transparent",color:cur?C.accent:C.text,fontWeight:sel?700:400,textAlign:"center"}}>{m}</button>; })}
          </div>
        </div>
        {/* Goals strip */}
        <div style={{padding:"0.45rem 0.75rem",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:9,color:C.muted}}>Goals {vy}</span><span style={{fontSize:9,fontWeight:700,color:C.accent}}>{gDone}/{goals.length}</span></div>
          <PB pct={(gDone/Math.max(goals.length,1))*100}/>
        </div>
        <nav style={{padding:"0.3rem",flex:1}}>
          {NAV.map(n=><div key={n.k} onClick={()=>{setPage(n.k);setShowSidebar(false);}} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,marginBottom:1,cursor:"pointer",background:page===n.k?"rgba(30,203,143,0.11)":"transparent",color:page===n.k?C.accent:C.muted,fontWeight:page===n.k?700:400,fontSize:12,transition:"all 0.12s"}}><span style={{fontSize:12,minWidth:14,textAlign:"center"}}>{n.i}</span>{n.l}{n.k==="advisor"&&<span style={{marginLeft:"auto",background:"rgba(30,203,143,0.18)",color:C.accent,fontSize:8,padding:"1px 5px",borderRadius:4,fontWeight:700}}>AI</span>}</div>)}
        </nav>
        <div style={{padding:"0.6rem",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{background:C.cardAlt,borderRadius:9,padding:"0.6rem",marginBottom:6}}>
            <p style={{...SL,marginBottom:4}}>{MONTHS[vm]}</p>
            {[{l:"Income",v:fmtAmt(TINC),c:C.accent},{l:"Expenses",v:fmtAmt(TEXP),c:C.orange},{l:"Balance",v:fmtAmt(TBAL),c:TBAL>=0?C.accent:C.red}].map(x=><div key={x.l} style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:C.muted}}>{x.l}</span><span style={{fontSize:10,color:x.c,fontWeight:700}}>{x.v}</span></div>)}
          </div>
          <button onClick={onSignOut} style={{width:"100%",padding:"7px",borderRadius:8,border:"1px solid rgba(249,115,22,0.3)",background:"rgba(249,115,22,0.06)",color:C.orange,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>🔒 Sign Out</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,width:isMobile?"100%":undefined}}>
        <div style={{padding:isMobile?"0.65rem 0.85rem":"0.85rem 1.3rem",borderBottom:"1px solid rgba(255,255,255,0.07)",background:C.sidebar,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {isMobile&&<button onClick={()=>setShowSidebar(s=>!s)} style={{background:"rgba(255,255,255,0.07)",border:"none",color:C.text,borderRadius:8,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,flexShrink:0}}>☰</button>}
            <div>
              <p style={{margin:0,fontSize:10,color:C.muted}}>Family Finance Tracker · <span style={{color:MCLR[activeUser]||C.muted}}>{activeUser}</span></p>
              <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                {!isMobile&&<h1 style={{margin:0,fontSize:18,fontWeight:800,color:C.text}}>Available Balance</h1>}
                <span style={SV(TBAL>=0?C.accent:C.red,isMobile?16:19)}>{fmtAmt(TBAL)}</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setSAdd(true)} style={{background:"linear-gradient(135deg,#1ecb8f,#0ea572)",color:"#fff",border:"none",borderRadius:9,padding:isMobile?"6px 10px":"7px 14px",fontSize:isMobile?10:11,fontWeight:700,cursor:"pointer"}}>{isMobile?"+ Add":"+ Transaction"}</button>
            <div style={{width:34,height:34,borderRadius:50,background:`linear-gradient(135deg,${MCLR[activeUser]||C.accent},${MCLR[activeUser]||"#0ea572"})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13,flexShrink:0}}>{activeUser[0]}</div>
          </div>
        </div>

        <div style={{flex:1,padding:isMobile?"0.75rem":"1rem 1.2rem",overflowY:"auto",paddingBottom:isMobile?"80px":undefined}}>

          {/* DASHBOARD */}
          {page==="dashboard"&&(
            <div>
              <Banner/>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:isMobile?8:10,marginBottom:12}}>
                <div style={{background:"linear-gradient(135deg,#1ecb8f,#0ea572)",borderRadius:14,padding:"1rem",gridColumn:isMobile?"1/-1":"auto"}}><p style={{margin:"0 0 3px",fontSize:9,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Est. Annual Income</p><p style={SV("#fff",16)}>{fmtAmt(TINC*12)}</p></div>
                <div style={CRD}><p style={SL}>Income</p><p style={SV(C.accent,17)}>{fmtAmt(TINC)}</p><div style={{marginTop:5}}><Spark data={bars.map(b=>b.inc)} color={C.accent}/></div></div>
                <div style={CRD}><p style={SL}>Expenses</p><p style={SV(C.orange,17)}>{fmtAmt(TEXP)}</p><div style={{marginTop:5}}><Spark data={bars.map(b=>b.exp)} color={C.orange}/></div></div>
                <div style={CRD}><p style={SL}>Savings Rate</p><p style={SV(C.blue,17)}>{fmtPct(SPCT)}</p><div style={{marginTop:5}}><PB pct={SPCT} color={C.blue}/><p style={{margin:"3px 0 0",fontSize:9,color:C.muted}}>Target: 20%</p></div></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1.5fr 1fr 1fr",gap:isMobile?8:10,marginBottom:12}}>
                <div style={CRD}><p style={{...SL,marginBottom:8}}>Income Sources</p>{ibc.length>0?ibc.map(d=><div key={d.label} style={{display:"flex",alignItems:"center",marginBottom:7}}><span style={{fontSize:10,color:C.muted,minWidth:80}}>{d.label}</span><div style={{flex:1,margin:"0 7px",background:"rgba(255,255,255,0.05)",borderRadius:99,height:5}}><div style={{width:`${TINC>0?(d.v/TINC)*100:0}%`,height:"100%",background:d.c,borderRadius:99}}/></div><span style={{fontSize:10,fontWeight:700,color:C.accent,minWidth:75,textAlign:"right"}}>{fmtAmt(d.v)}</span></div>):<p style={{margin:0,fontSize:10,color:C.muted}}>No income for {MONTHS_SH[vm]}</p>}</div>
                <div style={CRD}><p style={SL}>Expenses</p>{ebc.length>0?<><div style={{display:"flex",justifyContent:"center",margin:"5px 0"}}><Donut sl={ebc} size={110}/></div>{ebc.slice(0,4).map(d=><div key={d.label} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0"}}><span style={{display:"flex",alignItems:"center",gap:4,color:C.muted}}><span style={{width:6,height:6,borderRadius:50,background:d.c,display:"inline-block"}}/>{d.label}</span><span style={{color:C.text,fontWeight:600}}>{fmtAmt(d.v)}</span></div>)}</>:<p style={{fontSize:10,color:C.muted}}>No expenses</p>}</div>
                <div style={{...CRD,display:"flex",flexDirection:"column",gap:8}}>
                  <div><p style={SL}>Alerts</p>{isCur&&mtx.filter(t=>t.status==="Overdue").length>0&&<div style={{borderLeft:`3px solid ${C.orange}`,background:"rgba(249,115,22,0.07)",borderRadius:"0 5px 5px 0",padding:"4px 7px",marginBottom:4}}><p style={{margin:0,fontSize:10,color:C.orange}}>{mtx.filter(t=>t.status==="Overdue").length} overdue payment(s)!</p></div>}{!isCur&&<p style={{margin:0,fontSize:10,color:C.muted}}>Alerts for current month only</p>}</div>
                  <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:7}}><p style={{...SL,marginBottom:3}}>Goals {vy}</p><p style={{margin:"0 0 3px",fontSize:10,color:C.muted}}><b style={{color:C.accent}}>{gDone}</b> of {goals.length} complete</p><PB pct={(gDone/Math.max(goals.length,1))*100}/></div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr",gap:isMobile?8:10}}>
                <div style={CRD}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><p style={{...SL,margin:0}}>6-Month Overview</p><div style={{display:"flex",gap:10}}>{[{l:"Income",c:C.accent},{l:"Expenses",c:C.orange}].map(x=><span key={x.l} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,color:C.muted}}><span style={{width:7,height:7,borderRadius:2,background:x.c,display:"inline-block"}}/>{x.l}</span>)}</div></div><MBar data={bars} h={115}/></div>
                <div style={CRD}><p style={SL}>Upcoming Payments</p>{scRows.slice(0,6).map(s=><div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>{s.icon}</span><div><p style={{margin:0,fontSize:10,fontWeight:600,color:C.text,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</p><p style={{margin:0,fontSize:9,color:s.days!==null&&s.days<=3?C.red:C.muted}}>{s.dom}th · {isCur?(s.days!==null&&s.days<=0?"Today":`${s.days}d`):"-"}</p></div></div><span style={{fontSize:10,fontWeight:700,color:s.type==="income"?C.accent:C.orange}}>{s.type==="income"?"+":"-"}{fmtAmt(s.amount)}</span></div>)}</div>
              </div>
            </div>
          )}

          {/* GOALS */}
          {page==="goals"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:isMobile?8:10,marginBottom:12}}>
                {[{l:"Total Goals",v:goals.length,c:C.text},{l:"Completed",v:gDone,c:C.accent},{l:"Saved",v:fmtAmt(gTotC),c:C.blue},{l:"Progress",v:fmtPct((gTotC/Math.max(gTotT,1))*100),c:C.purple}].map(s=><div key={s.l} style={CRD}><p style={SL}>{s.l}</p><p style={SV(s.c,17)}>{s.v}</p></div>)}
              </div>
              <div style={{...CRD,marginBottom:11}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><p style={{margin:0,fontSize:12,fontWeight:700,color:C.text}}>Overall Progress {vy}</p><span style={{fontSize:11,fontWeight:700,color:C.accent}}>{fmtAmt(gTotC)} / {fmtAmt(gTotT)}</span></div><PB pct={(gTotC/Math.max(gTotT,1))*100}/></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <p style={{margin:0,fontSize:12,fontWeight:700,color:C.text}}>Family Goals {vy} — {goals.length} total</p>
                <button onClick={()=>{setGf(eG);setGAdd(true);}} style={{background:"linear-gradient(135deg,#1ecb8f,#0ea572)",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Add Goal</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:11}}>
                {goals.map((g,idx)=>{
                  const pct=Math.min(100,(g.current/Math.max(g.target,1))*100);
                  const done=g.done||g.current>=g.target;
                  const days=daysTo(g.deadline);
                  const urgent=days<=30&&!done;
                  return(
                    <div key={g.id} style={{...CRD,border:`1px solid ${done?"rgba(30,203,143,0.3)":urgent?"rgba(239,68,68,0.22)":"rgba(255,255,255,0.07)"}`,position:"relative"}}>
                      <div style={{position:"absolute",top:8,right:8,fontSize:8,color:C.muted}}>#{idx+1}</div>
                      <div style={{display:"flex",gap:8,marginBottom:8}}>
                        <div style={{width:38,height:38,borderRadius:10,background:done?"rgba(30,203,143,0.12)":"rgba(59,130,246,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{g.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{margin:"0 0 3px",fontSize:12,fontWeight:700,color:done?C.accent:C.text,textDecoration:done?"line-through":"none"}}>{g.name}</p>
                          <div style={{display:"flex",gap:4}}><span style={{fontSize:9,color:C.muted,background:"rgba(255,255,255,0.05)",padding:"1px 5px",borderRadius:4}}>{g.cat}</span>{done?<span style={{fontSize:9,color:C.accent,background:"rgba(30,203,143,0.12)",padding:"1px 5px",borderRadius:4}}>✓ Done</span>:urgent?<span style={{fontSize:9,color:C.red,background:"rgba(239,68,68,0.1)",padding:"1px 5px",borderRadius:4}}>⚡ {days}d</span>:<span style={{fontSize:9,color:C.muted,background:"rgba(255,255,255,0.05)",padding:"1px 5px",borderRadius:4}}>{days}d left</span>}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:C.muted}}>Saved: <b style={{color:C.text}}>{fmtAmt(g.current)}</b></span><span style={{fontSize:10,color:C.muted}}>Target: {fmtAmt(g.target)}</span></div>
                      {g.note&&<p style={{margin:"0 0 4px",fontSize:9,color:C.muted,fontStyle:"italic"}}>{g.note}</p>}
                      <div style={{marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:9,color:C.muted}}>{fmtPct(pct)}</span><span style={{fontSize:9,color:C.muted}}>by {fmtD(g.deadline)}</span></div><PB pct={pct} color={done?C.accent:C.blue}/></div>
                      {!done&&days>0&&<p style={{margin:"0 0 5px",fontSize:9,color:C.muted}}>Monthly needed: <b style={{color:C.yellow}}>{fmtAmt(Math.ceil((g.target-g.current)/Math.max(Math.ceil(days/30),1)))}</b></p>}
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>{setGf({...g,target:String(g.target),current:String(g.current)});setGEd(g.id);}} style={{flex:1,padding:"4px 0",borderRadius:6,border:"1px solid rgba(255,255,255,0.07)",background:"transparent",color:C.muted,fontSize:9,cursor:"pointer"}}>Edit</button>
                        <button onClick={()=>{const a=prompt("Add amount ($):");if(a&&!isNaN(+a))setGoals(gg=>gg.map(x=>x.id===g.id?{...x,current:Math.min(x.target,x.current+(+a))}:x));}} style={{flex:1,padding:"4px 0",borderRadius:6,border:`1px solid ${C.accent}`,background:"rgba(30,203,143,0.07)",color:C.accent,fontSize:9,fontWeight:700,cursor:"pointer"}}>+ Deposit</button>
                        <button onClick={()=>setGoals(gg=>gg.map(x=>x.id===g.id?{...x,done:!x.done}:x))} style={{flex:1,padding:"4px 0",borderRadius:6,border:`1px solid ${done?C.muted:C.blue}`,background:done?"transparent":"rgba(59,130,246,0.07)",color:done?C.muted:C.blue,fontSize:9,cursor:"pointer"}}>{done?"Undo":"✓ Done"}</button>
                        <button onClick={()=>setGoals(gg=>gg.filter(x=>x.id!==g.id))} style={{padding:"4px 7px",borderRadius:6,border:"1px solid rgba(239,68,68,0.3)",background:"transparent",color:C.red,fontSize:9,cursor:"pointer"}}>✕</button>
                      </div>
                    </div>
                  );
                })}
                <div onClick={()=>{setGf(eG);setGAdd(true);}} style={{...CRD,border:"2px dashed rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,cursor:"pointer",minHeight:150,opacity:0.5}}><span style={{fontSize:22,color:C.muted}}>+</span><p style={{margin:0,fontSize:10,color:C.muted}}>New Goal</p></div>
              </div>
            </div>
          )}

          {/* SCHEDULE */}
          {page==="schedule"&&(
            <div>
              <Banner/>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:isMobile?8:10,marginBottom:12}}>
                {[{l:"Planned Income",v:fmtAmt(sched.filter(s=>s.type==="income").reduce((a,s)=>a+s.amount,0)),c:C.accent},{l:"Planned Expenses",v:fmtAmt(sched.filter(s=>s.type==="expense").reduce((a,s)=>a+s.amount,0)),c:C.orange},{l:"Planned Balance",v:fmtAmt(sched.filter(s=>s.type==="income").reduce((a,s)=>a+s.amount,0)-sched.filter(s=>s.type==="expense").reduce((a,s)=>a+s.amount,0)),c:C.blue}].map(s=><div key={s.l} style={CRD}><p style={SL}>{s.l}</p><p style={SV(s.c,16)}>{s.v}</p></div>)}
              </div>
              <div style={CRD}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead><tr style={{background:C.cardAlt}}>{["","Name","Type","Amount","Day","Next Date","Countdown",""].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:9,color:C.muted,borderBottom:"1px solid rgba(255,255,255,0.07)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                  <tbody>{scRows.map(s=><tr key={s.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"7px 10px",fontSize:14}}>{s.icon}</td><td style={{padding:"7px 10px",color:C.text,fontWeight:600}}>{s.name}</td><td style={{padding:"7px 10px"}}><Pill bg={s.type==="income"?"rgba(30,203,143,0.13)":"rgba(249,115,22,0.13)"} tc={s.type==="income"?C.accent:C.orange} ch={s.type==="income"?"Income":"Expense"}/></td><td style={{padding:"7px 10px",fontWeight:700,color:s.type==="income"?C.accent:C.orange}}>{s.type==="income"?"+":"-"}{fmtAmt(s.amount)}</td><td style={{padding:"7px 10px",color:C.muted}}>{s.dom}th</td><td style={{padding:"7px 10px",color:C.muted}}>{s.nd.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td><td style={{padding:"7px 10px",color:s.days!==null&&s.days<=3?C.red:s.days!==null&&s.days<=7?C.yellow:C.muted,fontWeight:s.days!==null&&s.days<=7?700:400}}>{isCur?(s.days!==null&&s.days<=0?"Today":`${s.days}d`):"-"}</td><td style={{padding:"7px 10px"}}><button onClick={()=>{setSf2({...s});setScEd(s.id);}} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.07)",color:C.muted,borderRadius:5,padding:"2px 7px",fontSize:9,cursor:"pointer"}}>Edit</button></td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* TRANSACTIONS */}
          {page==="transactions"&&(
            <div>
              <Banner/>
              <div style={{display:"flex",gap:9,marginBottom:10,alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:9,color:C.muted}}>Member:</span><select value={fp} onChange={e=>setFp(e.target.value)} style={{background:C.cardAlt,color:C.text,border:"1px solid rgba(255,255,255,0.07)",borderRadius:6,padding:"4px 7px",fontSize:11}}>
                  {["All",...MEMBERS.map(m=>m.name),"Family"].map(x=><option key={x}>{x}</option>)}
                </select></div>
                <span style={{fontSize:10,color:C.muted}}>{filtTx.length} records</span>
              </div>
              <div style={{...CRD,padding:0,overflow:"hidden",overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead><tr style={{background:C.cardAlt}}>{["Mo","Type","Category","Amount","Member","Date","Status","Notes","Actions"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:600,fontSize:9,color:C.muted,borderBottom:"1px solid rgba(255,255,255,0.07)",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                  <tbody>{filtTx.map(t=>{ const d=new Date(t.date+"T00:00:00"); return <tr key={t.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"6px 10px",color:C.muted}}>{MONTHS_SH[d.getMonth()]}</td><td style={{padding:"6px 10px"}}><Pill bg={t.type==="income"?"rgba(30,203,143,0.13)":"rgba(249,115,22,0.13)"} tc={t.type==="income"?C.accent:C.orange} ch={t.type==="income"?"Income":"Expense"}/></td><td style={{padding:"6px 10px",color:C.text}}>{t.category}</td><td style={{padding:"6px 10px",fontWeight:700,color:t.type==="income"?C.accent:C.orange}}>{t.type==="income"?"+":"-"}{fmtAmt(t.amount)}</td><td style={{padding:"6px 10px"}}><span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:7,height:7,borderRadius:50,background:MCLR[t.person]||C.muted,display:"inline-block",flexShrink:0}}/><span style={{color:C.muted}}>{t.person}</span></span></td><td style={{padding:"6px 10px",color:C.muted,whiteSpace:"nowrap"}}>{t.date}</td><td style={{padding:"6px 10px"}}><Pill bg={t.status==="Overdue"?"rgba(239,68,68,0.13)":t.status==="Pending"?"rgba(245,158,11,0.13)":"rgba(30,203,143,0.13)"} tc={t.status==="Overdue"?C.red:t.status==="Pending"?C.yellow:C.accent} ch={t.status||"Paid"}/></td><td style={{padding:"6px 10px",color:C.muted,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.notes}</td><td style={{padding:"6px 10px"}}><div style={{display:"flex",gap:4}}><button onClick={()=>{setEtxForm({...t,amount:String(t.amount)});setTxEd(t.id);}} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.07)",color:C.muted,borderRadius:4,padding:"2px 6px",fontSize:9,cursor:"pointer"}}>✏️</button><button onClick={()=>delTx(t.id)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:11}}>✕</button></div></td></tr>; })}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* INCOME */}
          {page==="income"&&(<div><Banner/><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:11}}>{ibc.length>0?ibc.map(d=><div key={d.label} style={CRD}><p style={SL}>{d.label}</p><p style={SV(C.accent,16)}>{fmtAmt(d.v)}</p></div>):<div style={CRD}><p style={{color:C.muted,margin:0,fontSize:11}}>No income for {MONTHS_SH[vm]}</p></div>}</div><div style={CRD}>{mtx.filter(t=>t.type==="income").sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=><div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:30,height:30,borderRadius:7,background:"rgba(30,203,143,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:C.accent,fontSize:12}}>↑</div><div><p style={{margin:0,fontSize:11,fontWeight:700,color:C.text}}>{t.category}</p><p style={{margin:0,fontSize:9,color:C.muted}}>{t.notes} · {t.person} · {t.date}</p></div></div><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:13,fontWeight:800,color:C.accent}}>+{fmtAmt(t.amount)}</span><button onClick={()=>{setEtxForm({...t,amount:String(t.amount)});setTxEd(t.id);}} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.07)",color:C.muted,borderRadius:4,padding:"2px 6px",fontSize:9,cursor:"pointer"}}>✏️</button></div></div>)}</div></div>)}

          {/* EXPENSES */}
          {page==="expenses"&&(<div><Banner/><div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10,marginBottom:10}}><div style={CRD}><p style={SL}>Breakdown</p><div style={{display:"flex",alignItems:"center",gap:12,marginTop:6}}><Donut sl={ebc} size={115}/><div style={{flex:1}}>{ebc.map(d=><div key={d.label} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0"}}><span style={{display:"flex",alignItems:"center",gap:4,color:C.muted}}><span style={{width:5,height:5,borderRadius:50,background:d.c,display:"inline-block"}}/>{d.label}</span><span style={{color:C.text,fontWeight:600}}>{fmtAmt(d.v)}</span></div>)}</div></div></div><div style={CRD}><p style={SL}>Total</p><p style={SV(C.orange,24)}>{fmtAmt(TEXP)}</p><p style={{fontSize:10,color:C.muted,margin:"3px 0 10px"}}>{mtx.filter(t=>t.type==="expense").length} transactions</p>{ebc.slice(0,5).map(d=><div key={d.label} style={{marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}><span style={{color:C.muted}}>{d.label}</span><span style={{color:C.text}}>{fmtPct(TEXP>0?(d.v/TEXP)*100:0)}</span></div><PB pct={TEXP>0?(d.v/TEXP)*100:0} color={d.c}/></div>)}</div></div><div style={CRD}>{mtx.filter(t=>t.type==="expense").sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=><div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:30,height:30,borderRadius:7,background:"rgba(249,115,22,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:C.orange,fontSize:12}}>↓</div><div><p style={{margin:0,fontSize:11,fontWeight:700,color:C.text}}>{t.category} — {t.notes}</p><p style={{margin:0,fontSize:9,color:C.muted}}>{t.person} · {t.date}</p></div></div><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:12,fontWeight:700,color:C.orange}}>-{fmtAmt(t.amount)}</span><button onClick={()=>{setEtxForm({...t,amount:String(t.amount)});setTxEd(t.id);}} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.07)",color:C.muted,borderRadius:4,padding:"2px 6px",fontSize:9,cursor:"pointer"}}>✏️</button></div></div>)}</div></div>)}

          {/* FAMILY MEMBERS */}
          {page==="family"&&(
            <div>
              <Banner/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:11}}>
                {mstats.map(m=>{ const net=m.inc-m.exp; return(
                  <div key={m.name} style={CRD}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                      <div style={{width:42,height:42,borderRadius:50,background:`linear-gradient(135deg,${m.color},${m.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:16}}>{m.name[0]}</div>
                      <div><p style={{margin:0,fontWeight:800,fontSize:13,color:C.text}}>{m.name}</p><p style={{margin:0,fontSize:9,color:C.muted}}>{m.role}</p></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:9}}>{[{l:"Income",v:m.inc,c:C.accent},{l:"Expenses",v:m.exp,c:C.orange}].map(x=><div key={x.l} style={{background:C.cardAlt,borderRadius:7,padding:"6px 8px"}}><p style={{...SL,marginBottom:2}}>{x.l}</p><p style={{margin:0,fontSize:12,fontWeight:700,color:x.c}}>{fmtAmt(x.v)}</p></div>)}</div>
                    <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:7}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:C.muted}}>Net</span><span style={{fontWeight:800,color:net>=0?C.accent:C.red}}>{fmtAmt(net)}</span></div><PB pct={TINC>0?(m.inc/TINC)*100:0} color={C.purple}/><p style={{margin:"2px 0 0",fontSize:9,color:C.muted}}>{fmtPct(TINC>0?(m.inc/TINC)*100:0)} of household income</p></div>
                  </div>
                ); })}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {page==="reports"&&(<div><div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10,marginBottom:10}}><div style={CRD}><div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><p style={{...SL,margin:0}}>Income vs Expenses</p><div style={{display:"flex",gap:9}}>{[{l:"Income",c:C.accent},{l:"Expenses",c:C.orange}].map(x=><span key={x.l} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,color:C.muted}}><span style={{width:7,height:7,borderRadius:2,background:x.c,display:"inline-block"}}/>{x.l}</span>)}</div></div><MBar data={bars} h={140}/></div><div style={CRD}><p style={SL}>Monthly Breakdown</p>{bars.map(b=><div key={b.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{fontSize:10,color:b.active?C.text:C.muted,fontWeight:b.active?700:400}}>{b.label} {vy}</span><div style={{display:"flex",gap:10}}><span style={{fontSize:10,fontWeight:600,color:C.accent}}>{fmtAmt(b.inc)}</span><span style={{fontSize:10,color:C.orange}}>{fmtAmt(b.exp)}</span></div></div>)}</div></div><div style={CRD}><p style={{...SL,marginBottom:8}}>Categories — {MONTHS[vm]}</p><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:C.cardAlt}}>{["Category","Spent","Budget","Remaining","Status"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"left",fontWeight:600,fontSize:9,color:C.muted,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>{h}</th>)}</tr></thead><tbody>{Object.entries(bud).map(([cat,budget])=>{ const spent=emap[cat]||0,rem=budget-spent,over=rem<0; return <tr key={cat} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"6px 10px",color:C.text}}>{cat}</td><td style={{padding:"6px 10px",color:C.orange,fontWeight:700}}>{fmtAmt(spent)}</td><td style={{padding:"6px 10px",color:C.muted}}>{fmtAmt(budget)}</td><td style={{padding:"6px 10px",color:over?C.red:C.accent,fontWeight:700}}>{fmtAmt(Math.abs(rem))}{over?" over":""}</td><td style={{padding:"6px 10px"}}><Pill bg={over?"rgba(239,68,68,0.13)":spent/budget>0.75?"rgba(245,158,11,0.13)":"rgba(30,203,143,0.13)"} tc={over?C.red:spent/budget>0.75?C.yellow:C.accent} ch={over?"Over budget":spent/budget>0.75?"Close":"On track"}/></td></tr>; })}</tbody></table></div></div>)}

          {/* BUDGETS */}
          {page==="budgets"&&(<div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:11}}><div style={CRD}><p style={{...SL,marginBottom:11}}>Monthly Budget ($)</p>{Object.entries(bud).map(([cat,budget])=>{ const spent=emap[cat]||0,pct=(spent/Math.max(budget,1))*100; return <div key={cat} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:C.text}}>{cat}</span><span style={{color:C.muted}}>{fmtAmt(spent)} / {fmtAmt(budget)}</span></div><PB pct={pct}/><div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginTop:2}}><span style={{color:C.muted}}>{fmtPct(pct)}</span><span style={{color:C.muted}}>{fmtAmt(budget-spent)} left</span></div></div>; })}</div><div style={CRD}><p style={{...SL,marginBottom:11}}>Goals {vy}</p>{goals.map(g=>{ const pct=Math.min(100,(g.current/Math.max(g.target,1))*100); return <div key={g.id} style={{marginBottom:11,paddingBottom:9,borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3,alignItems:"center"}}><p style={{margin:0,fontSize:11,fontWeight:700,color:C.text}}>{g.icon} {g.name}</p><Pill bg="rgba(59,130,246,0.13)" tc={C.blue} ch={fmtPct(pct)}/></div><PB pct={pct} color={C.blue}/><div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginTop:2}}><span style={{color:C.muted}}>{fmtAmt(g.current)}</span><span style={{color:C.muted}}>by {fmtD(g.deadline)}</span></div></div>; })}</div></div>)}

          {/* AI ADVISOR */}
          {page==="advisor"&&(
            <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 155px)"}}>
              <div style={{...CRD,marginBottom:8,padding:"0.7rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div><p style={{margin:"0 0 2px",fontSize:12,fontWeight:700,color:C.text}}>✦ Elite AI Financial Strategist</p><p style={{margin:0,fontSize:9,color:C.muted}}>Buffett · Naval · Kiyosaki · Dalio · Munger · Morgan Housel · Taleb</p></div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:9,color:webSrch?C.accent:C.muted}}>🌐 Web</span>
                    <div onClick={()=>setWebSrch(w=>!w)} style={{width:36,height:18,borderRadius:99,background:webSrch?"rgba(30,203,143,0.3)":"rgba(255,255,255,0.1)",cursor:"pointer",display:"flex",alignItems:"center",padding:"2px",transition:"all 0.2s"}}><div style={{width:14,height:14,borderRadius:50,background:webSrch?C.accent:C.muted,transform:webSrch?"translateX(18px)":"translateX(0)",transition:"transform 0.2s"}}/></div>
                    <span style={{fontSize:9,color:webSrch?C.accent:C.muted}}>{webSrch?"On":"Off"}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {["How to save faster?","Where is overspending?","Best investments now?","Buffett strategy for us","Build passive income","Protect against inflation","Debt payoff strategy","How to grow wealth?"].map(q=><button key={q} onClick={()=>setCin(q)} style={{fontSize:9,padding:"4px 9px",borderRadius:16,border:`1px solid ${C.accent}`,background:"rgba(30,203,143,0.07)",color:C.accent,cursor:"pointer",whiteSpace:"nowrap"}}>{q}</button>)}
                </div>
              </div>
              <div style={{...CRD,flex:1,display:"flex",flexDirection:"column",overflow:"hidden",padding:0}}>
                <div style={{flex:1,overflowY:"auto",padding:"1rem"}}>
                  {chat.map((m,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:12,flexDirection:m.r==="user"?"row-reverse":"row"}}>
                      <div style={{width:30,height:30,borderRadius:50,background:m.r==="user"?`linear-gradient(135deg,${MCLR[activeUser]||C.orange},${MCLR[activeUser]||C.red})`:"linear-gradient(135deg,#1ecb8f,#0ea572)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:800,flexShrink:0}}>{m.r==="user"?activeUser[0]:"✦"}</div>
                      <div style={{maxWidth:"82%",padding:"9px 13px",borderRadius:m.r==="user"?"12px 3px 12px 12px":"3px 12px 12px 12px",background:m.r==="user"?`linear-gradient(135deg,${MCLR[activeUser]||C.orange},${MCLR[activeUser]||C.red})`:C.cardAlt,color:m.r==="user"?"#fff":C.text,fontSize:12,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.t}</div>
                    </div>
                  ))}
                  {cld&&<div style={{display:"flex",gap:8,marginBottom:12}}><div style={{width:30,height:30,borderRadius:50,background:"linear-gradient(135deg,#1ecb8f,#0ea572)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:800}}>✦</div><div style={{padding:"9px 13px",borderRadius:"3px 12px 12px 12px",background:C.cardAlt,color:C.muted,fontSize:12}}>{webSrch?"🌐 Searching the web...":"Analyzing..."}</div></div>}
                  <div ref={cRef}/>
                </div>
                <div style={{padding:"0.8rem",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:8,alignItems:"flex-end"}}>
                  <textarea value={cin} onChange={e=>setCin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),sendChat())} placeholder="Ask a strategic financial question... (Enter to send)" rows={2} style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.07)",background:C.cardAlt,color:C.text,fontSize:12,resize:"none",fontFamily:"inherit"}}/>
                  <button onClick={sendChat} disabled={cld} style={{background:"linear-gradient(135deg,#1ecb8f,#0ea572)",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:cld?"not-allowed":"pointer",opacity:cld?0.6:1,flexShrink:0}}>Send</button>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {page==="settings"&&(
            <div>
              <div style={{...CRD,marginBottom:11}}>
                <p style={{...SL,marginBottom:10}}>👥 Household Members</p>
                <p style={{fontSize:11,color:C.muted,marginBottom:12}}>All members can add, edit and delete transactions. Switch profiles from the left sidebar.</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:9}}>
                  {MEMBERS.map(m=>(
                    <div key={m.name} style={{background:C.cardAlt,borderRadius:10,padding:"0.75rem",border:`1px solid ${activeUser===m.name?m.color:"rgba(255,255,255,0.07)"}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                        <div style={{width:32,height:32,borderRadius:50,background:`linear-gradient(135deg,${m.color},${m.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13}}>{m.name[0]}</div>
                        <div><p style={{margin:0,fontSize:12,fontWeight:700,color:C.text}}>{m.name}</p><p style={{margin:0,fontSize:9,color:C.muted}}>{m.role}</p></div>
                      </div>
                      <button onClick={()=>setActiveUser(m.name)} style={{width:"100%",padding:"5px",borderRadius:6,border:`1px solid ${activeUser===m.name?m.color:C.accent}`,background:activeUser===m.name?`${m.color}22`:"rgba(30,203,143,0.07)",color:activeUser===m.name?m.color:C.accent,fontSize:9,fontWeight:700,cursor:"pointer"}}>{activeUser===m.name?"✓ Active":"Switch to"}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{...CRD,marginBottom:11}}>
                <p style={{...SL,marginBottom:10}}>Monthly Budgets ($)</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {Object.entries(bud).map(([cat,val])=>(
                    <div key={cat} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,color:C.text,minWidth:100}}>{cat}</span>
                      <input type="number" value={val} onChange={e=>setBud(b=>({...b,[cat]:Number(e.target.value)}))} style={{width:100,padding:"5px 8px",borderRadius:7,border:"1px solid rgba(255,255,255,0.07)",background:C.cardAlt,color:C.text,fontSize:12}}/>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{...CRD,marginBottom:11}}>
                <p style={{...SL,marginBottom:5}}>Household Name</p>
                <p style={{fontSize:11,color:C.muted,marginBottom:8}}>Currently: <b style={{color:C.text}}>{setup.groupName}</b></p>
              </div>
              {/* Session Management */}
              <div style={{...CRD,marginBottom:11,border:"1px solid rgba(249,115,22,0.15)"}}>
                <p style={{...SL,marginBottom:10}}>🔐 Session & Access</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {/* Sign Out */}
                  <div style={{background:C.cardAlt,borderRadius:10,padding:"0.75rem"}}>
                    <p style={{margin:"0 0 3px",fontSize:12,fontWeight:700,color:C.text}}>Sign Out</p>
                    <p style={{margin:"0 0 8px",fontSize:10,color:C.muted}}>Locks the app with PIN. Your data stays saved. Another person can then log in with their own PIN on this device.</p>
                    <button onClick={onSignOut} style={{padding:"7px 16px",borderRadius:7,border:`1px solid ${C.orange}`,background:"rgba(249,115,22,0.07)",color:C.orange,cursor:"pointer",fontSize:11,fontWeight:700}}>🔒 Sign Out (Lock App)</button>
                  </div>
                  {/* Switch Household */}
                  <div style={{background:C.cardAlt,borderRadius:10,padding:"0.75rem"}}>
                    <p style={{margin:"0 0 3px",fontSize:12,fontWeight:700,color:C.text}}>Switch Household</p>
                    <p style={{margin:"0 0 8px",fontSize:10,color:C.muted}}>Logs out and clears this household's data so a completely different family can set up their own account on this device.</p>
                    <button onClick={()=>{ if(window.confirm("This will delete all data for '"+setup.groupName+"' on this device and start fresh. Are you sure?")){ onReset(); }}} style={{padding:"7px 16px",borderRadius:7,border:`1px solid rgba(139,92,246,0.5)`,background:"rgba(139,92,246,0.07)",color:C.purple,cursor:"pointer",fontSize:11,fontWeight:700}}>👥 Switch to Different Household</button>
                  </div>
                  {/* Delete everything */}
                  <div style={{background:C.cardAlt,borderRadius:10,padding:"0.75rem"}}>
                    <p style={{margin:"0 0 3px",fontSize:12,fontWeight:700,color:C.text}}>Reset Everything</p>
                    <p style={{margin:"0 0 8px",fontSize:10,color:C.muted}}>Permanently deletes all transactions, goals, settings and members. Cannot be undone.</p>
                    <button onClick={()=>{ if(window.confirm("⚠️ DELETE EVERYTHING for '"+setup.groupName+"'? This cannot be undone.")){ onReset(); }}} style={{padding:"7px 16px",borderRadius:7,border:`1px solid ${C.red}`,background:"rgba(239,68,68,0.07)",color:C.red,cursor:"pointer",fontSize:11,fontWeight:700}}>🗑️ Delete All Data</button>
                  </div>
                </div>
              </div>

              <div style={CRD}>
                <p style={{...SL,marginBottom:10}}>Data & Export</p>
                <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                  <button onClick={()=>{ const csv=["Date,Type,Category,Amount,Member,Notes,Status",...tx.map(t=>`${t.date},${t.type},${t.category},${t.amount.toFixed(2)},${t.person},"${t.notes||""}",${t.status}`)].join("\n"); const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="FamilyFinance.csv";a.click(); }} style={{padding:"7px 16px",borderRadius:7,border:`1px solid ${C.accent}`,background:"rgba(30,203,143,0.07)",color:C.accent,cursor:"pointer",fontSize:11,fontWeight:700}}>📥 Export CSV</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile&&<div style={{position:"fixed",bottom:0,left:0,right:0,background:C.sidebar,borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",justifyContent:"space-around",padding:"6px 0 8px",zIndex:30}}>
        {[{k:"dashboard",l:"Home",i:"◻"},{k:"transactions",l:"Transactions",i:"↕"},{k:"goals",l:"Goals",i:"🎯"},{k:"advisor",l:"AI",i:"✦"},{k:"settings",l:"Settings",i:"⚙"}].map(n=><div key={n.k} onClick={()=>{setPage(n.k);setShowSidebar(false);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",padding:"2px 8px",borderRadius:8,background:page===n.k?"rgba(30,203,143,0.1)":"transparent"}}><span style={{fontSize:16,color:page===n.k?C.accent:C.muted}}>{n.i}</span><span style={{fontSize:9,color:page===n.k?C.accent:C.muted,fontWeight:page===n.k?700:400}}>{n.l}</span></div>)}
      </div>}

      {/* MODALS */}
      {sAdd&&<Modal title={`+ Transaction · ${MONTHS_SH[vm]} ${vy}`} onClose={()=>setSAdd(false)} onSave={addTx} saveLabel="Add"><TxForm data={ntx} onChange={setNtx} members={MEMBERS}/></Modal>}
      {txEd&&<Modal title="✏️ Edit Transaction" onClose={()=>setTxEd(null)} onSave={saveEditTx}><TxForm data={etxForm} onChange={setEtxForm} members={MEMBERS}/></Modal>}
      {(gAdd||gEd)&&(
        <Modal title={gEd?"Edit Goal":"New Goal"} onClose={()=>{setGAdd(false);setGEd(null);setGf(eG);}} onSave={saveGoal}>
          <div style={{marginBottom:9}}><label style={{fontSize:9,color:"#7b87a8",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>Icon</label><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{G_ICONS.map(icon=><button key={icon} onClick={()=>setGf(g=>({...g,icon}))} style={{width:31,height:31,borderRadius:7,border:`1px solid ${gf.icon===icon?C.accent:"rgba(255,255,255,0.07)"}`,background:gf.icon===icon?"rgba(30,203,143,0.11)":"#172035",fontSize:15,cursor:"pointer"}}>{icon}</button>)}</div></div>
          <FRow label="Goal Name"><FInp value={gf.name} onChange={v=>setGf(g=>({...g,name:v}))}/></FRow>
          <FRow label="Target Amount ($)"><FInp value={gf.target} onChange={v=>setGf(g=>({...g,target:v}))} type="number"/></FRow>
          <FRow label="Already Saved ($)"><FInp value={gf.current} onChange={v=>setGf(g=>({...g,current:v}))} type="number"/></FRow>
          <FRow label="Deadline"><FInp value={gf.deadline} onChange={v=>setGf(g=>({...g,deadline:v}))} type="date"/></FRow>
          <FRow label="Note"><FInp value={gf.note||""} onChange={v=>setGf(g=>({...g,note:v}))} placeholder="Optional details..."/></FRow>
          <FRow label="Category"><FSel value={gf.cat} onChange={v=>setGf(g=>({...g,cat:v}))} opts={["Travel","Car","Education","Investment","Real Estate","Home","Health","Savings","Other"].map(o=>({v:o,l:o}))}/></FRow>
        </Modal>
      )}
      {scEd&&(
        <Modal title="Edit Scheduled Payment" onClose={()=>setScEd(null)} onSave={saveSched}>
          <FRow label="Name"><FInp value={sf.name||""} onChange={v=>setSf2(s=>({...s,name:v}))}/></FRow>
          <FRow label="Amount ($)"><FInp value={sf.amount||""} onChange={v=>setSf2(s=>({...s,amount:v}))} type="number"/></FRow>
          <FRow label="Day of Month (1–31)"><FInp value={sf.dom||""} onChange={v=>setSf2(s=>({...s,dom:v}))} type="number"/></FRow>
        </Modal>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────
export default function App(){
  const [setup,   setSetup]   = useState(()=>ld("sf_pub_setup", null));
  const [unlocked,setUnlocked]= useState(()=>{ try{ return localStorage.getItem("sf_pub_pin_ok")==="1"; }catch{ return false; } });

  const handleSignOut = () => {
    try { localStorage.removeItem("sf_pub_pin_ok"); } catch {}
    setUnlocked(false);
  };

  const handleReset = () => {
    try {
      ["sf_pub2_tx","sf_pub2_bud","sf_pub2_goals","sf_pub2_sched","sf_pub_setup","sf_pub_pin_ok"]
        .forEach(k=>localStorage.removeItem(k));
    } catch {}
    setSetup(null);
    setUnlocked(false);
  };

  if(!setup) return <OnboardingFlow onComplete={s=>{ setSetup(s); setUnlocked(true); }}/>;
  if(!unlocked) return <PinLock correctPin={setup.pin} onUnlock={()=>setUnlocked(true)}/>;
  return <AppInner setup={setup} onSignOut={handleSignOut} onReset={handleReset}/>;
}
