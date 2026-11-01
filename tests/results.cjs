const assert=require('node:assert/strict'),Quiz=require('../src/quiz.js');
const exact='тебе могут дать шуршащий пакетик, но тебе на него откровенно пох*й. разве может быть что-то интереснее бесконечного скроллинга ленты тик тока?';
assert.equal(Quiz.questions[3].options[12],'ничего');assert.equal(Quiz.questions[5].options[1],'я хз');
const names=new Set();let normis=0;
for(let n=1;n<=Quiz.total;n++){const a=Quiz.fromId(n),r=Quiz.result(a),isNormis=a[3]===12||a[5]===1;assert.equal(Quiz.name(a),r.name);assert.equal(Quiz.description(a),r.description);assert.deepEqual(r,Quiz.result([...a]));assert.equal(r.name==='Нормисный мурлык',isNormis,'Special rule must be exact and have absolute priority');if(isNormis){assert.equal(r.description,exact);normis++}else{assert(r.name.length>3&&r.description.length>70);assert(!r.name.includes('undefined'));assert(!r.description.includes('undefined'))}names.add(r.name)}
assert.equal(normis,33264);assert.equal(names.size,25);assert.equal(Quiz.name([0,0,0,12,0,0]),'Нормисный мурлык');assert.equal(Quiz.name([3,3,6,13,10,1]),'Нормисный мурлык');assert.throws(()=>Quiz.result([]));
console.log(`PASS: ${Quiz.total} deterministic results, ${names.size} reachable archetypes, exact Normis rule and description for all ${normis} matching paths.`);
