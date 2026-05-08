import React from 'react'
import { C,inp,pill,pillLight,FOIL_SIZES,BALLOON_SIZES,Lbl,Card,CardTitle } from './shared.jsx'

function SummaryBar({data}) {
  return (
    <div style={{background:C.l700,color:'#fff',padding:'8px 16px',display:'flex',gap:16,fontSize:11,flexWrap:'wrap',marginBottom:2}}>
      <span style={{opacity:.6}}>избрано:</span>
      {Object.entries(data).map(([k,v])=>(
        <span key={k}>{k}: <strong>{v}</strong></span>
      ))}
    </div>
  )
}

export default function BPAccents({state, set, calc, summaryData}) {
  const {accents,foilBalloons,colorEntries,numColors} = state
  const {clusters,clustersPerColor,accentCounts} = calc

  const updAccent = (i,p) => set('accents',accents.map((x,j)=>j===i?{...x,...p}:x))
  const updFoil   = (i,p) => set('foilBalloons',foilBalloons.map((x,j)=>j===i?{...x,...p}:x))

  return (
    <div style={{paddingTop:2}}>
      <SummaryBar data={summaryData} />

      {/* LATEX ACCENTS */}
      <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px',marginBottom:2}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#7b5ea7',marginBottom:4}}>🎈 Акцентни балони (латекс)</div>
            <div style={{fontSize:10,color:C.gray}}>добавят се към букетите без да влияят на дължината</div>
          </div>
          <button style={pill(false,'#7b5ea7')} onClick={()=>set('accents',[...accents,{hex:'#e8c0dc',name:'',sizeInch:5,sizeCm:13,customSize:false,perAccent:3,customQty:false,price:0,distribution:'all',customCount:false,customCountVal:1}])}>
            + Добави акцент
          </button>
        </div>
        {accents.length===0 && <div style={{fontSize:11,color:C.gray,padding:'10px',background:C.l50,textAlign:'center'}}>Няма добавени акцентни балони</div>}
        {accents.map((ac,ai)=>{
          const cnt=accentCounts[ai]||{}
          return (
            <div key={ai} style={{display:'grid',gridTemplateColumns:'1fr 1.4fr 1.2fr',gap:2,marginBottom:4}}>
              {/* цвят */}
              <div style={{background:C.l50,padding:'12px',borderLeft:`3px solid ${ac.hex||'#9b7dd4'}`}}>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                  <input type="color" value={ac.hex||'#e8c0dc'} onChange={e=>updAccent(ai,{hex:e.target.value})}
                    style={{width:28,height:28,border:'none',cursor:'pointer',padding:2,flexShrink:0}} />
                  <input style={{...inp,flex:1,background:'#fff',fontSize:12}} placeholder='напр. Бял 5"'
                    value={ac.name} onChange={e=>updAccent(ai,{name:e.target.value})} />
                  <button onClick={()=>set('accents',accents.filter((_,j)=>j!==ai))} style={{background:'none',border:'none',color:'#c0392b',cursor:'pointer',fontSize:16}}>×</button>
                </div>
                <Lbl>Себестойност/бр (€)</Lbl>
                <input style={{...inp,background:'#fff'}} type="number" step="0.001" value={ac.price} onChange={e=>updAccent(ai,{price:+e.target.value})} />
                <div style={{fontSize:9,color:'#c0892b',marginTop:3}}>⚠️ Себестойност, не продажна цена</div>
                {clusters>0 && <div style={{marginTop:8,fontSize:11,color:'#7b5ea7',fontWeight:600}}>{cnt.acClusters} × {ac.perAccent} = {cnt.nr} бр · €{(cnt.cost||0).toFixed(2)}</div>}
              </div>
              {/* размер */}
              <div style={{background:C.l50,padding:'12px'}}>
                <div style={{fontSize:10,fontWeight:600,color:'#7b5ea7',textTransform:'uppercase',marginBottom:8}}>Размер</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
                  {[{inch:4,cm:10},{inch:5,cm:13},{inch:6,cm:15},{inch:18,cm:46},{inch:24,cm:61},{inch:36,cm:91}].map(sz=>(
                    <button key={sz.inch} style={{...pillLight(ac.sizeInch===sz.inch&&!ac.customSize,'#7b5ea7'),padding:'7px 3px',fontSize:10,textAlign:'center'}}
                      onClick={()=>updAccent(ai,{sizeInch:sz.inch,sizeCm:sz.cm,customSize:false})}>
                      {sz.inch}"<br/><span style={{fontSize:9}}>({sz.cm}см)</span>
                    </button>
                  ))}
                  <button style={{...pillLight(ac.customSize,'#7b5ea7'),padding:'7px 3px',fontSize:10}} onClick={()=>updAccent(ai,{customSize:true})}>друго</button>
                </div>
              </div>
              {/* брой + добави към */}
              <div style={{background:C.l50,padding:'12px'}}>
                <div style={{fontSize:10,fontWeight:600,color:'#7b5ea7',textTransform:'uppercase',marginBottom:8}}>В букет</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} style={{...pillLight(ac.perAccent===n&&!ac.customQty,'#7b5ea7'),padding:'7px 10px',fontSize:12,fontWeight:600}}
                      onClick={()=>updAccent(ai,{perAccent:n,customQty:false})}>{n}</button>
                  ))}
                  <button style={{...pillLight(ac.customQty,'#7b5ea7'),padding:'7px 8px',fontSize:11}}
                    onClick={()=>updAccent(ai,{customQty:true})}>+/-</button>
                </div>
                {ac.customQty && (
                  <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:10}}>
                    <button style={{...pillLight(false,'#7b5ea7'),padding:'5px 10px'}} onClick={()=>updAccent(ai,{perAccent:Math.max(1,(ac.perAccent||1)-1)})}>−</button>
                    <input style={{...inp,width:50,textAlign:'center',padding:'5px',background:'#fff'}} type="number" min={1} value={ac.perAccent} onChange={e=>updAccent(ai,{perAccent:+e.target.value})} />
                    <button style={{...pillLight(false,'#7b5ea7'),padding:'5px 10px'}} onClick={()=>updAccent(ai,{perAccent:(ac.perAccent||1)+1})}>+</button>
                  </div>
                )}
                <div style={{fontSize:10,fontWeight:600,color:'#7b5ea7',marginBottom:6}}>Добави към</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  <button style={{...pillLight(ac.distribution==='all'&&!ac.customCount,'#7b5ea7'),fontSize:10,padding:'5px 8px'}}
                    onClick={()=>updAccent(ai,{distribution:'all',customCount:false})}>Всеки ({clusters})</button>
                  {colorEntries.slice(0,numColors).map((ce,ci)=>(
                    <button key={ci} style={{...pillLight(ac.distribution===String(ci)&&!ac.customCount,ce.hex||'#7b5ea7'),fontSize:10,padding:'5px 8px'}}
                      onClick={()=>updAccent(ai,{distribution:String(ci),customCount:false})}>
                      {ce.name||`Цвят ${ci+1}`} ({clustersPerColor[ci]||0})
                    </button>
                  ))}
                  <button style={{...pillLight(ac.customCount,'#7b5ea7'),fontSize:10,padding:'5px 8px'}}
                    onClick={()=>updAccent(ai,{customCount:true})}>Друго #</button>
                </div>
                {ac.customCount && (
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8,background:'#fff',padding:'6px 8px'}}>
                    <button style={{...pillLight(false,'#7b5ea7'),padding:'4px 8px'}} onClick={()=>updAccent(ai,{customCountVal:Math.max(1,(ac.customCountVal||1)-1)})}>−</button>
                    <input style={{...inp,width:50,textAlign:'center',padding:'4px',background:C.l50}} type="number" min={1} max={clusters} value={ac.customCountVal||1} onChange={e=>updAccent(ai,{customCountVal:+e.target.value})} />
                    <button style={{...pillLight(false,'#7b5ea7'),padding:'4px 8px'}} onClick={()=>updAccent(ai,{customCountVal:(ac.customCountVal||1)+1})}>+</button>
                    <span style={{fontSize:10,color:C.gray}}>от {clusters}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* FOIL BALLOONS */}
      <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#c0892b',marginBottom:4}}>✨ Фолио балони</div>
            <div style={{fontSize:10,color:C.gray}}>надуват се внимателно със сламка — добави ги за точна времева оценка</div>
          </div>
          <button style={pill(false,'#c0892b')} onClick={()=>set('foilBalloons',[...foilBalloons,{name:'',inch:18,cm:46,label:'18" стандартен',customSize:false,qty:1,price:0,timeMin:2}])}>
            + Добави фолио
          </button>
        </div>
        {foilBalloons.length===0 && <div style={{fontSize:11,color:C.gray,padding:'10px',background:'#fffbf0',textAlign:'center'}}>Няма добавени фолио балони</div>}
        {foilBalloons.map((fb,fi)=>(
          <div key={fi} style={{display:'grid',gridTemplateColumns:'1fr 1.4fr 1.2fr',gap:2,marginBottom:4}}>
            <div style={{background:'#fffbf0',padding:'12px',borderLeft:'3px solid #c0892b'}}>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                <span style={{fontSize:16}}>✨</span>
                <input style={{...inp,flex:1,background:'#fff',fontSize:12}} placeholder='напр. Златна цифра 1' value={fb.name} onChange={e=>updFoil(fi,{name:e.target.value})} />
                <button onClick={()=>set('foilBalloons',foilBalloons.filter((_,j)=>j!==fi))} style={{background:'none',border:'none',color:'#c0392b',cursor:'pointer',fontSize:16}}>×</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div><Lbl>Количество</Lbl><input style={{...inp,background:'#fff'}} type="number" min={1} value={fb.qty} onChange={e=>updFoil(fi,{qty:+e.target.value})} /></div>
                <div><Lbl>Себестойност/бр (€)</Lbl><input style={{...inp,background:'#fff'}} type="number" step="0.01" value={fb.price} onChange={e=>updFoil(fi,{price:+e.target.value})} /></div>
              </div>
              <div style={{marginTop:8,fontSize:11,color:'#c0892b',fontWeight:600}}>{fb.qty} бр · {(fb.qty*(fb.timeMin||2)).toFixed(0)} мин · €{(fb.qty*(fb.price||0)).toFixed(2)}</div>
            </div>
            <div style={{background:'#fffbf0',padding:'12px'}}>
              <div style={{fontSize:10,fontWeight:600,color:'#c0892b',textTransform:'uppercase',marginBottom:8}}>Размер</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
                {FOIL_SIZES.map((sz,si)=>(
                  <button key={si} style={{...pillLight(fb.inch===sz.inch&&fb.label===sz.label,'#c0892b'),padding:'7px 4px',fontSize:10,textAlign:'center'}}
                    onClick={()=>updFoil(fi,{inch:sz.inch,cm:sz.cm,timeMin:sz.timeMin,label:sz.label,customSize:false})}>
                    {sz.label}<br/><span style={{fontSize:9}}>({sz.cm}см)</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{background:'#fffbf0',padding:'12px'}}>
              <div style={{fontSize:10,fontWeight:600,color:'#c0892b',textTransform:'uppercase',marginBottom:8}}>Надуване (мин/бр)</div>
              <div style={{fontSize:10,color:C.gray,marginBottom:8}}>⚠️ само сламка/уста</div>
              <input style={{...inp,background:'#fff',fontSize:14,fontWeight:600}} type="number" step="0.5" min={0.5} value={fb.timeMin}
                onChange={e=>updFoil(fi,{timeMin:+e.target.value})} />
              <div style={{marginTop:8,fontSize:10,color:'#c0892b'}}>общо: {(fb.qty*(fb.timeMin||2)).toFixed(0)} мин</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
