import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autoCodeBlock'
})
export class AutoCodeBlockPipe implements PipeTransform {
  transform(text: string): string {
    if (!text) return '';

    // Step 1: Unescape characters from JSON strings
    const cleanText = text
      .replace(/\\n/g, '\n')         // Escaped newline to actual newline
      .replace(/\\"/g, '"')          // Escaped quotes to actual quotes
      .replace(/\\\\/g, '\\');       // Double backslashes to single

    // Step 2: Avoid wrapping if already wrapped
    if (cleanText.includes('```')) return cleanText;

    // Step 3: Generic code detection pattern
    const codeIndicators = [
      /#include\s+[<"]\w+/,                // C/C++
      /int\s+\w+\s*=|float\s+\w+\s*=/,     // Java/C/PHP
      /public\s+(class|static)/,          // Java
      /System\.out\.print/,               // Java
      /<\?php/,                           // PHP
      /\$\w+\s*=.*;/,                     // PHP/JS variable assignment
      /function\s+\w+\s*\(/,              // JS/PHP
      /console\.log/,                     // JS
      /echo\s+["']/,                      // PHP
      /def\s+\w+\(/,                      // Python
      /print\(/,                          // Python
    ];

    const isProbablyCode = codeIndicators.some((regex) => regex.test(cleanText));

    // Step 4: Wrap if detected as code
    if (isProbablyCode) {
      return `\`\`\`\n${cleanText.trim()}\n\`\`\``;
    }

    // Step 5: Return plain text if not code
    return cleanText;
  }
}
