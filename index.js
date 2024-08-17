import { readdirSync, readFile } from 'node:fs';
import { sep } from 'node:path';

// ['👉', '👈', '👆', '👇', '🤜', '🤛', '👊'];

const rules = {
  '👉': 'increasePointer',
  '👈': 'decreasePointer',
  '👆': 'increaseCell',
  '👇': 'decreaseCell',
  '🤜': 'loopStart',
  '🤛': 'loopEnd',
  '👊': 'print',
};

const compile = (data) => {
  const memory = Array(256).fill(0); // 0 - 255 Bytes "memoria de tamaño 'indefinido' de bytes"
  const loopMap = {}; // Hardest thing overall, but it's soooo helpful for the loops
  const loopStack = [];

  let loopCount = 0;
  let pointer = 0;
  let output = '';

  const commands = Array.from(data);

  // commands.map((c) => {
  //   console.log(rules[c]);
  // });

  for (let i = 0; i < commands.length; i++) {
    if (commands[i] === '🤜') {
      loopStack.push(i);
      loopCount++;
    } else if (commands[i] === '🤛') {
      const start = loopStack.pop(); // Last opened loop on the stack 🤜
      loopMap[start] = i; // This loop who starts at index "start", ends at i
      loopMap[i] = start; // Viceversa when accessing the last closed loop 🤛, to see where it needs to go back to continue looping.
    }
  }

  // [DEBUG] -> Amount of loops
  // console.log(loopCount);

  for (let i = 0; i < commands.length; i++) {
    const command = rules[commands[i]];

    // console.log(command);

    switch (command) {
      case 'increasePointer':
        pointer = (pointer + 1) % memory.length; // I need to ensure the pointer doesn't exceeds the max amount of memory
        break;

      case 'decreasePointer':
        pointer = (pointer - 1 + memory.length) % memory.length; // Decreasing 0 means, -1. Then (-1 + 256 = 255) and 255 MOD 256 = 255
        break;

      case 'increaseCell':
        memory[pointer] = (memory[pointer] + 1) % 256; // Mod for not excedding 255 limit
        break;

      case 'decreaseCell':
        memory[pointer] = (memory[pointer] - 1 + 256) % 256; // Same but lower bound limit, so that if val < 0 goes to 255
        break;

      case 'print':
        // Here no sabía si printear en sí, así que preferí anidarlo al output mejor pa' que salga el string completo
        output += String.fromCharCode(memory[pointer]);
        break;

      case 'loopStart':
        if (memory[pointer] === 0) {
          i = loopMap[i]; // Jump to the matching closing one 🤛
        }
        break;

      case 'loopEnd':
        if (memory[pointer] !== 0) {
          i = loopMap[i]; // Jump back to the matching loop start 🤜
        }
        break;

      default:
        console.log('No valid instruction found');
        break;
    }
  }

  return output;
};

// The compile function just receives a string with the emojis, so it can be used like this:
/*
  const result = compile(
    '👇🤜👇👇👇👇👇👇👇👉👆👈🤛👉👇👊👇🤜👇👉👆👆👆👆👆👈🤛👉👆👆👊👆👆👆👆👆👆👆👊👊👆👆👆👊'
  );
  console.log(result);
*/

// Here I decided to read input data files from the inputFolder
const inputFolder = 'data';

readdirSync(inputFolder, { withFileTypes: true })
  .filter((f) => !f.isDirectory())
  .map((f) => {
    const ext = f.name.slice(f.name.lastIndexOf('.'));

    if (ext === '.data') {
      const path = `${inputFolder}${sep}${f.name}`;
      readFile(path, 'utf-8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log(`[${f.name}] -> ${compile(data).trim()}`); // I'm trimming cuz the input file itself ends with \n because of the instructions it has and I just don't like it, lol
      });
    }
  });
