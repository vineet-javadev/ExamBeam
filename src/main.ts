import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { provideMarkdown , MARKED_OPTIONS} from 'ngx-markdown';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCamera, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

import hljs from 'highlight.js/lib/common';

// Register icons globally
library.add(faCamera, faMicrophone, faMicrophoneSlash);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideMarkdown(),  // 👈 This registers MarkdownService and dependencies
    {
      provide: MARKED_OPTIONS,
      useValue:{
        gfm:true,
        breaks:false,
        pedantic: false,
        smartLists:true,
        smartypants:false
      }
    }
  ]
})
  .catch((err) => console.error(err));
