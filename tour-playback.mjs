// Playback timing is independent of rendering so pauses preserve the remaining dwell.
export class TourPlayback {
  constructor({count=8,dwell=7000,move,onStep,onPause,onFinish,clock=()=>performance.now(),schedule=(fn,ms)=>setTimeout(fn,ms),unschedule=id=>clearTimeout(id)}){
    Object.assign(this,{count,dwell,move,onStep,onPause,onFinish,clock,schedule,unschedule});
    this.active=false;this.paused=false;this.index=0;this.revision=0;
  }
  cancelPending(){this.revision++;this.unschedule(this.timer);this.timer=null;this.flight?.kill();this.flight=null;}
  start(){this.active=true;this.paused=false;this.go(0);}
  go(index,{manual=false}={}){
    if(!this.active)return;
    this.cancelPending();this.index=Math.max(0,Math.min(this.count-1,index));
    this.phase='moving';this.remaining=this.dwell;const revision=this.revision;
    this.onStep(this.index);
    this.flight=this.move(this.index,()=>{
      if(!this.active||revision!==this.revision)return;
      this.phase='dwelling';if(!this.paused)this.arm();
    });
    if(this.paused&&!manual)this.flight?.pause();
    this.onPause(this.paused);
  }
  arm(){this.started=this.clock();this.timer=this.schedule(()=>{this.timer=null;this.next();},this.remaining);}
  pause(){
    if(!this.active||this.paused)return;
    this.paused=true;this.flight?.pause();
    if(this.timer!=null){this.unschedule(this.timer);this.timer=null;this.remaining=Math.max(0,this.remaining-(this.clock()-this.started));}
    this.onPause(true);
  }
  resume(){
    if(!this.active||!this.paused)return;
    this.paused=false;this.flight?.resume();if(this.phase==='dwelling'&&this.timer==null)this.arm();this.onPause(false);
  }
  toggle(){this.paused?this.resume():this.pause();}
  previous(){this.go(this.index-1,{manual:true});}
  next(){if(!this.active)return;if(this.index===this.count-1){this.stop();this.onFinish();}else this.go(this.index+1,{manual:true});}
  stop(){this.cancelPending();this.active=false;this.paused=false;}
}
