import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

import { ServicesService } from './services.service';

// Import MarkdownModule
import { MarkdownModule } from 'ngx-markdown';

export interface QuestionResponse {
  question: string;
  options: string[] | null;
  answer: string | null;
};

export interface QuestionsAnswerResponse {
  evaluation: string;
  marks: number;
  Answer: string;
};

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, MarkdownModule],
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

  constructor(private readonly cdr: ChangeDetectorRef, private readonly servicesService: ServicesService) { }

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
  sidebarVisible: boolean = true;
  started = false;
  examMode: string = 'mcq';
  selectedOptions: (string | null)[] = [];
  recentTopics: string[] = [];
  questionsHistory: string[] = [];

  shortAnswer: string = '';
  Answer: string = '';
  longAnswer: string = '';
  currentTagline: string = '';
  obtainMarks: number = 0;
  totalMarks: number = 0;
  isLoading: boolean = false;
  showCorrectAnswer: boolean = false;

  setRandomTagline() {
    const index = Math.floor(Math.random() * this.taglines.length);
    this.currentTagline = this.taglines[index];
  }

  async submitAnswer(question: string): Promise<void> {
    if (this.Answer) {
      this.setRandomTagline();
      this.isLoading = true;
      try {
        this.Feedback = await this.servicesService.checkAnswer(question, this.Answer, this.examMode);
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
    this.submitTopic();
  }

  changeExamMode() {
    this.response = [];
  }

  newQuestion() {
    this.topicInput = this.recentTopics[0] || '';
    if (this.topicInput) {
      this.Feedback = null; // Reset feedback
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
    this.setRandomTagline();
    this.isLoading = true;
    try {
      const question = await this.servicesService.Question(topic, this.examMode, JSON.stringify(this.questionsHistory));
      if (Array.isArray(question)) {
        question.forEach(q => this.addQuestionInHistory([q.question]));
      }
      this.response = Array.isArray(question) ? question : [question];
      if (this.examMode === 'mcq') {
        this.selectedOptions = Array(this.response.length).fill(null);
        this.totalMarks = this.response.length;
        this.obtainMarks = 0;
      }
      this.recentTopics.unshift(topic);
      this.recentTopics = [...new Set(this.recentTopics)].slice(0, 10);
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
