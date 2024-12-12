/*
Author: Scriptone
Description: This code is a simple util library for my editors. It provides functions to strip comments and strings from the editor input, remove logging statements, and count empty lines.
created:  2024/12/12
*/

// Configuration for different syntax types and their comment/string delimiters, now we don't have to repeat ourselves for different languages.
const syntaxConfig = {
  lua: {
    singleLineComment: "--",
    multiLineCommentStart: "--[[",
    multiLineCommentEnd: "]]",
    stringDelimiters: ['"', "'", "`"],
  },
  typescript: {
    singleLineComment: "//",
    multiLineCommentStart: "/*",
    multiLineCommentEnd: "*/",
    stringDelimiters: ['"', "'", "`"],
  },
  html: {
    singleLineComment: "",
    multiLineCommentStart: "<!--",
    multiLineCommentEnd: "-->",
    stringDelimiters: ['"', "'"],
  },
  css: {
    singleLineComment: "",
    multiLineCommentStart: "/*",
    multiLineCommentEnd: "*/",
    stringDelimiters: ['"', "'"],
  },
};

// Function to remove comments and strings from the editor input based on syntax configuration
const stripInput = (editor) => {
  const config = syntaxConfig[editor.lang || "lua"];
  const input = editor.input;
  let result = "";
  let inString = false;
  let stringDelimiter = "";
  let inComment = false;
  let inLongComment = false;
  for (let i = 0; i < input.length; i++) {
    const currentChar = input[i];
    const nextChar = input[i + 1];
    // Start of a comment
    if (
      !inString &&
      !inComment &&
      currentChar === config.singleLineComment[0] &&
      nextChar === config.singleLineComment[1]
    ) {
      // Check if it's a multi-line comment
      if (
        config.multiLineCommentStart &&
        input.slice(i, i + config.multiLineCommentStart.length) ===
          config.multiLineCommentStart
      ) {
        inComment = true;
        inLongComment = true;
        i += config.multiLineCommentStart.length - 1; // Skip multi-line comment start
        continue;
      } else {
        // It's a single-line comment
        inComment = true;
        inLongComment = false;
        i += config.singleLineComment.length - 1; // Skip single-line comment start
        continue;
      }
    }
    // Inside a comment
    if (inComment) {
      if (inLongComment) {
        // End of multi-line comment
        if (
          config.multiLineCommentEnd &&
          input.slice(i, i + config.multiLineCommentEnd.length) ===
            config.multiLineCommentEnd
        ) {
          inComment = false;
          inLongComment = false;
          i += config.multiLineCommentEnd.length - 1; // Skip multi-line comment end
        }
      } else {
        // End of single-line comment
        if (currentChar === "\n") {
          inComment = false;
          result += currentChar; // Preserve the newline
        }
      }
      continue; // Skip all characters inside comments
    }
    // Handle entering and exiting strings
    if (!inString) {
      if (config.stringDelimiters.includes(currentChar)) {
        inString = true;
        stringDelimiter = currentChar;
        result += currentChar;
        continue;
      }
    } else {
      if (currentChar === stringDelimiter) {
        inString = false;
      } else if (currentChar === "\\" && nextChar === stringDelimiter) {
        // Handle escaped delimiters
        result += currentChar; // Add the escape character
        i += 1; // Skip the escaped delimiter
      }
      result += currentChar;
      continue;
    }
    // Handle Lua long string literals [[...]]
    if (currentChar === "[" && nextChar === "[") {
      inComment = false; // Ensure we're not inside a comment
      result += currentChar + nextChar;
      i += 1; // Skip the second "[" to avoid it being treated as a new long string
      continue;
    } else if (currentChar === "]" && nextChar === "]") {
      result += currentChar + nextChar;
      i += 1; // Skip the second "]" to avoid it being treated as a new long string
      continue;
    }
    // Add character to result if not in a comment
    result += currentChar;
  }
  // Remove empty lines
  return result
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
};

// Logging functions for different languages
const logFunctions = {
  lua: ["print", "warn", "error"],
  typescript: ["console.log", "console.warn", "console.error"],
};

// Function to get the regex for logging statements in the input
const getLogRegex = (lang = "lua") => {
  const functions = logFunctions[lang];
  if (!functions)
    // Return null if no logging functions are defined for the language
    return;
  return new RegExp(`^.*(${functions.join("|")})\\(.*\\).*\n?`, "gm");
};

// This function removes logging statements from the input based on the language
const stripLoggingStatements = (input, lang = "lua") => {
  const regex = getLogRegex(lang);
  if (!regex)
    // Return input if no logging functions are defined for the language
    return input;
  return input.replace(regex, "");
};

// Here we count the number of empty lines in the input
const countWhitelines = (editor) =>
  editor.input.split("\n").filter((line) => line.trim() === "").length;

// Final export of the functions
export { countWhitelines, stripInput, stripLoggingStatements };
