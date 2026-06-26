const str = "'abc'";
const replaced = str.replace(/(?<!N)('(?:[^']|'')*')/g, 'N$1');
console.log("Original:", str);
console.log("Replaced:", replaced);
