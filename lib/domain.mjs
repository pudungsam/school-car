export const vehicles = [{id:'van',image:'/vehicles/staria.png',name:'스타리아(5524)',type:'승합차 · 5524',capacity:11,icon:'VAN'},{id:'car',image:'/vehicles/mighty25.png',name:'25인승 버스',type:'25인승 · 중형',capacity:25,icon:'BUS'},{id:'bus',image:'/vehicles/grand45.png',name:'45인승 버스',type:'45인승 · 대형',capacity:45,icon:'BUS'},{id:'bonnival',image:'/vehicles/carnival.png',name:'본니발(11인승)',type:'11인승 · 승합',capacity:11,icon:'VAN'}];
export function validate(input) {
 const v=vehicles.find(v=>v.id===input.vehicleId);
 if(!v) throw new Error('차량을 선택해 주세요.');
 for(const key of ['applicant','purpose','destination']) if(typeof input[key]!=='string'||!input[key].trim()||input[key].length>300) throw new Error('필수 항목을 올바르게 입력해 주세요.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||Number.isNaN(Date.parse(input.date))||new Date(input.date).toISOString().slice(0,10)!==input.date) throw new Error('이용 날짜를 확인해 주세요.');
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.end)||input.start>=input.end||input.start<'07:00'||input.end>'22:00') throw new Error('이용 시간은 07:00~22:00이며 종료 시간은 시작 시간 이후여야 합니다.');
 if(Number(input.start.slice(3))%5!==0) throw new Error('시작시간은 5분 단위로 선택해 주세요.');
 if(Number(input.end.slice(3))%5!==0) throw new Error('반납시간은 5분 단위로 선택해 주세요.');
 if(!Number.isInteger(Number(input.passengers))||Number(input.passengers)<1||Number(input.passengers)>v.capacity) throw new Error(`탑승 인원은 1~${v.capacity}명이어야 합니다.`);
 const extra={hiPass:null,hiPassAmount:null,distanceKm:null};
 if(input.vehicleId==='bonnival'){
 extra.hiPass=input.hiPass||'unconfirmed';if(!['unconfirmed','unused','used'].includes(extra.hiPass))throw new Error('하이패스 사용 여부를 확인해 주세요.');
 for(const key of ['hiPassAmount','distanceKm'])if(input[key]!==''&&input[key]!=null){const raw=String(input[key]);if(!/^\d+(\.\d+)?$/.test(raw)||!Number.isFinite(Number(raw)))throw new Error('금액과 이용거리는 0 이상의 숫자만 입력해 주세요.');extra[key]=Number(raw);}
 if(extra.hiPass==='used'&&(extra.hiPassAmount===null||!Number.isInteger(extra.hiPassAmount)))throw new Error('하이패스 사용 금액을 원 단위 숫자로 입력해 주세요.');
 if(extra.hiPass!=='used')extra.hiPassAmount=null;
 }
 return {...extra,...Object.fromEntries(['vehicleId','date','start','end','applicant','department','phone','purpose','destination'].map(k=>[k,typeof input[k]==='string'?input[k].trim().slice(0,300):''])),passengers:Number(input.passengers),notes:typeof input.notes==='string'?input.notes.slice(0,1000):''};
}
export function overlaps(a,b){return a.vehicleId===b.vehicleId&&a.date===b.date&&a.start<b.end&&b.start<a.end&&!['rejected','cancelled'].includes(b.status);}

