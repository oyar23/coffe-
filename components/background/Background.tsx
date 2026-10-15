import type {Background as BackgroundConfig} from '@/lib/data/settings';
export type BackgroundProps={background:BackgroundConfig};
export default function Background({background}:BackgroundProps){
 // TODO F3: video, lottie y component (registry).
 return <div aria-hidden="true" style={{position:'fixed',inset:0,zIndex:-1,pointerEvents:'none'}}>{background.type==='image'&&<div style={{position:'absolute',inset:0,backgroundImage:`url(${JSON.stringify(background.src)})`,backgroundSize:'cover',backgroundPosition:'center'}}/>}<div style={{position:'absolute',inset:0,backgroundColor:'#000',opacity:background.overlay}}/></div>;
}
