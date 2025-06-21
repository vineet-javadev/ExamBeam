import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { provideMarkdown } from 'ngx-markdown';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCamera, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

// Register icons globally
library.add(faCamera, faMicrophone, faMicrophoneSlash);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideMarkdown()  // 👈 This registers MarkdownService and dependencies
  ]
})
  .catch((err) => console.error(err));
