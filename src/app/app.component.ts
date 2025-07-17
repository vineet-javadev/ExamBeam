import { Component, ChangeDetectorRef, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

import { ServicesService } from './services/services.service';

// Import MarkdownModule
import { MarkdownModule } from 'ngx-markdown';
import { SpeechRecognitionService } from './services/speech-recognition.service';

// Imports for icons
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';


export class YourComponent {
  faCamera = faCamera;
  faMicrophone = faMicrophone;

  uploadPhoto() {
    // Open file input / handle image
  }

  startSpeech() {
    // Trigger speech recognition
  }
}



export interface QuestionResponse {
  question: string;
  options: string[] | null;
  answer: string | null;
  code: string | null | undefined;
};

export interface QuestionsAnswerResponse {
  evaluation: string;
  marks: number;
  Answer: string;
};

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, MarkdownModule, FontAwesomeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(10px)' }))
      ])
    ])
  ]
})
export class AppComponent {

  constructor(private readonly cdr: ChangeDetectorRef, private readonly servicesService: ServicesService, private speechService: SpeechRecognitionService, private ngZone: NgZone) { }

  response: QuestionResponse[] = [];
  Feedback: QuestionsAnswerResponse | null = null;

  taglines: string[] = [
    "Stay calm and let your mind learn.",
    "Great things take time – trust the process.",
    "Every question brings you closer to mastery.",
    "Learning is the eye of the mind.",
    "One step at a time – you’re getting there.",
    "Silence. Focus. Achieve.",
    "Even small progress is still progress.",
    "This moment is shaping your success.",
    "Push limits, not buttons.",
    "Knowledge begins with curiosity."
  ];

  // Making things responsive ( for the mobile device )
  window = window;

  title = 'ExamBeam';
  topicInput: string = '';
  hardnessLevel: number = 5; // Default value
  sidebarVisible: boolean = true;
  started = false;
  examMode: string = 'mcq';
  selectedOptions: (string | null)[] = [];
  recentTopics: string[] = [];
  questionsHistory: string[] = [];

  Answer: string = '';
  currentTagline: string = '';
  obtainMarks: number = 0;
  totalMarks: number = 0;
  isLoading: boolean = false;
  showCorrectAnswer: boolean = false;

  // Speech Recognition 
  isListening = false;
  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;

  setRandomTagline() {
    const index = Math.floor(Math.random() * this.taglines.length);
    this.currentTagline = this.taglines[index];
  }

  startSpeech() {
    if (!this.isListening) {
      this.isListening = true;
      this.speechService.start((partialText: string) => {
        // Wrap update inside Angular zone so change detection triggers
        this.ngZone.run(() => {
          this.Answer = partialText;
        });
      });
    } else {
      this.isListening = false;
      this.speechService.stop();
    }
  }

  // @ViewChild('fileInput') fileInput!: ElementRef;

  // uploadPhoto() {
  //   this.fileInput.nativeElement.click();
  // }

  // onFileSelected(event: Event) {
  //   const file = (event.target as HTMLInputElement).files?.[0];
  //   if (file) {
  //     console.log('Selected file:', file);
  //   }
  // }

  //  testing
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedImage: string | null = null;

  triggerImageUpload(): void {
    alert("This feature is not free yet. Please subscribe to the premium plan to use this feature.");
    // this.fileInput.nativeElement.click();
  }

  handleImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedImage = null;
    }
  }

  // end testing


  async submitAnswer(question: string): Promise<void> {
    if (this.Answer) {
      this.setRandomTagline();
      this.isLoading = true;
      this.isListening = false;
      this.speechService.stop();
      try {
        this.Feedback = await this.servicesService.checkAnswer(question, this.Answer, this.examMode, this.hardnessLevel);
      } finally {
        this.isLoading = false;
      }
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  startNow() {
    const stored = localStorage.getItem('recentTopics');
    this.recentTopics = stored ? JSON.parse(stored) : [];
    this.started = true;
  }

  getMoreQuestions() {
    this.topicInput = this.recentTopics[0];
    if (this.hardnessLevel < 10)
      this.hardnessLevel++;
    this.submitTopic();
  }

  changeExamMode() {
    this.response = [];
    this.totalMarks = 0;
    this.obtainMarks = 0;
  }

  newQuestion() {
    this.topicInput = this.recentTopics[0] || '';
    if (this.topicInput) {
      this.Feedback = null; // Reset feedback
      if (this.hardnessLevel < 10)
        this.hardnessLevel++;
      this.submitTopic();
    }
  }

  async addQuestionInHistory(question: string[]) {
    if (question.length > 0) {
      this.questionsHistory.push(...question);
      this.questionsHistory = Array.from(new Set(this.questionsHistory)); // Remove duplicates
    }
  }

  async submitTopic() {
    const topic = this.topicInput.trim();
    if (!topic) return;
    // remove previous response and feedback
    this.response = [];
    this.Feedback = null;

    this.setRandomTagline();
    this.isLoading = true;
    if (window.innerWidth < 768) {
      this.sidebarVisible = false; // Hide sidebar on small screens
    }
    try {
      const question = await this.servicesService.Question(topic, this.examMode, JSON.stringify(this.questionsHistory), this.hardnessLevel);
      if (Array.isArray(question)) {
        question.forEach(q => this.addQuestionInHistory([q.question]));
      }
      this.response = Array.isArray(question) ? question : [question];
      if (this.examMode === 'mcq') {
        this.selectedOptions = Array(this.response.length).fill(null);
        this.totalMarks = this.totalMarks + this.response.length;
      }
      this.recentTopics.unshift(topic);
      this.recentTopics = [...new Set(this.recentTopics)].slice(0, 6);
      this.topicInput = '';
      localStorage.setItem('recentTopics', JSON.stringify(this.recentTopics));
      this.cdr.detectChanges();
    } catch (err) {
      alert("Something went wrong while fetching questions.");
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  clearCache() {
    this.recentTopics = [];
    localStorage.removeItem('recentTopics');
  }

  previousSelected(topic: string) {
    this.topicInput = topic;
  }

  ngOnInit() {
    this.totalMarks = 0;
    this.obtainMarks = 0;
    this.setRandomTagline();
    const store = localStorage.getItem('recentTopics');
    if (store != null) {
      this.recentTopics = JSON.parse(store);
      this.started = true;
    }
    this.selectedOptions = Array(this.response.length).fill(null); // Initialize selected options array
    // Show sidebar by default on large screens, hide on small screens
    this.sidebarVisible = window.innerWidth >= 768;
  }

  onMcqOptionSelect(index: number, option: string) {
    if (this.response[index].answer === option) {
      this.obtainMarks++;
    }
    this.selectedOptions[index] = option;
  }

  allQuestionsAnswered(): boolean {
    // Make sure response exists and has same length as selectedOptions
    return this.response &&
      this.selectedOptions &&
      this.selectedOptions.length === this.response.length &&
      this.selectedOptions.every(option => option !== null && option !== undefined);
  }

}
