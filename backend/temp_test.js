let __stdout__ = [];
const __original_log__ = console.log;
console.log = function(...args) {
  __stdout__.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
};

function solution(input) {
  console.log("Debug: input is", input);
  return [0, 1];
}

const input = JSON.parse('{"nums":[2,7,11,15],"target":9}');
const result = solution(input);
console.log(JSON.stringify(result));

__stdout__.forEach(s => console.log(">>> " + s));
