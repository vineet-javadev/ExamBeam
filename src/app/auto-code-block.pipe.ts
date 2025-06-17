import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autoCodeBlock'
})
export class AutoCodeBlockPipe implements PipeTransform {

  transform(text: string): string {
    // Detect code-like content (adjust as needed)
    const isProbablyCode = /public\s+class|System\.out|#include|int\s+\w+\s*=|function\s+\w+/.test(text);

    // If it already contains code block markers, return as is
    if (text.includes('```')) return text;

    if (isProbablyCode) {
      // Separate question and code part
      const parts = text.split(/\n(?=public|#include|function)/);
      const questionPart = parts[0];
      const codePart = parts.slice(1).join('\n');

      return `${questionPart}\n\`\`\`\n${codePart}\n\`\`\``;
    }

    return text;
  }
}
