const fs = require("fs");
const path = require("path");
function removeComments(code) {
  let result = "";
  let i = 0;
  while (i < code.length) {
    if (code[i] === "/" && code[i + 1] === "/") {
      while (i < code.length && code[i] !== "\n") {
        i++;
      }
      continue;
    }
    if (code[i] === "/" && code[i + 1] === "*") {
      i += 2;
      while (i < code.length - 1 && !(code[i] === "*" && code[i + 1] === "/")) {
        i++;
      }
      i += 2;
      continue;
    }
    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const quote = code[i];
      result += code[i++];
      while (i < code.length) {
        if (code[i] === "\\") {
          result += code[i++];
          if (i < code.length) result += code[i++];
        } else if (code[i] === quote) {
          result += code[i++];
          break;
        } else {
          result += code[i++];
        }
      }
      continue;
    }
    result += code[i++];
  }
  return result
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
}
function processFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const cleaned = removeComments(code);
  fs.writeFileSync(filePath, cleaned);
  console.log(`Processed: ${filePath}`);
}
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (
        file !== "node_modules" &&
        file !== ".git" &&
        file !== "dist" &&
        file !== "build"
      ) {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
      callback(filePath);
    }
  });
}
const rootDir = process.cwd();
console.log("Removing comments from all JS files...");
walkDir(rootDir, processFile);
console.log("Done!");
