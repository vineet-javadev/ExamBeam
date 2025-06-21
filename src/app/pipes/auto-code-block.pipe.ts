import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autoCodeBlock'
})
export class AutoCodeBlockPipe implements PipeTransform {

  transform(text: string): string {
    if (!text) return '';

    // First, unescape \n and escaped quotes (from JSON)
    const cleanText = text
      .replace(/\\n/g, '\n')       // Convert escaped newlines
      .replace(/\\"/g, '"')        // Convert escaped quotes
      .replace(/\\\\/g, '\\');     // Convert double backslashes

    // Basic check for code patterns
    const isProbablyCode = /public\s+class|System\.out|#include|int\s+\w+\s*=|function\s+\w+/.test(cleanText);

    // Avoid double wrapping
    if (cleanText.includes('```')) return cleanText;

    // If it's probably code, wrap it
    if (isProbablyCode) {
      return `\`\`\`java\n${cleanText}\n\`\`\``;
    }

    // Otherwise return clean string
    return cleanText;
  }
}
