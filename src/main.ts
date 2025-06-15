import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { provideMarkdown } from 'ngx-markdown';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideMarkdown()  // 👈 This registers MarkdownService and dependencies
  ]
})
  .catch((err) => console.error(err));
