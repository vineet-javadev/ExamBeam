import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
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

  // response: any = null;
  // Testing data
  response = {
    question: '### Define Newton\'s First Law\n- Also known as the Law of Inertia...',
    options: ['A', 'B', 'C', 'D'], // for MCQ
    answer: 'A',
  };
  // Testing end

  title = 'ExamBeam';
  topicInput: string = '';
  sidebarVisible: boolean = true;
  started = false;
  examMode: string = 'mcq';
  recentTopics: string[] = ['Binary Trees', 'OOP Principles', 'Spring Boot Auth'];

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  startNow() {
    const stored = localStorage.getItem('recentTopics');
    this.recentTopics = stored ? JSON.parse(stored) : [];
    this.started = true;
  }

  submitMode() {
    if (this.examMode) {
      alert(`Mode selected: ${this.examMode}`);
      // Optionally update recent topics:
      this.recentTopics.unshift(`Mode: ${this.examMode}`);
    } else {
      alert('Please select a mode');
    }
  }


  submitTopic() {
    const topic = this.topicInput.trim();
    if (topic) {
      this.recentTopics.unshift(topic);
      this.recentTopics = [...new Set(this.recentTopics)].slice(0, 10); // keep unique & limit to 10
      this.topicInput = '';
      localStorage.setItem('recentTopics', JSON.stringify(this.recentTopics));
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
    const store = localStorage.getItem('recentTopics');
    if (store != null) {
      this.recentTopics = JSON.parse(store);
      this.started = true;
    }
  }

}
