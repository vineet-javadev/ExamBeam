import { Injectable } from '@angular/core';

// Add minimal SpeechRecognition type declaration
type SpeechRecognition = any;
type SpeechRecognitionEvent = any;

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private finalTranscript: string = '';

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.continuous = true;
  }

  start(callback: (text: string) => void): void {
    if (!this.recognition) {
      console.error('SpeechRecognition is not available.');
      return;
    }

    this.finalTranscript = '';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          this.finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      callback(this.finalTranscript + interimTranscript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended.');
    };

    this.recognition.start();
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
