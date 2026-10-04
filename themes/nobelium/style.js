/* eslint-disable react/no-unknown-property */
export function Style() {
  return (
    <style jsx global>{`
      .reading-theme {
        --reading-bg: #faf7f1;
        --reading-fg: #302c27;
        --reading-body: #4f4941;
        --reading-muted: #82796b;
        --reading-accent: #a75e4d;
        --reading-panel: #f0ebe2;
        --reading-border: #ded7cb;
        background: var(--reading-bg);
        color: var(--reading-fg);
        font-family:
          'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', STSong, SimSun,
          Georgia, serif;
        font-size: 18px;
        line-height: 1.8;
      }
      .dark .reading-theme {
        --reading-bg: #1a1816;
        --reading-fg: #eee8dd;
        --reading-body: #d3ccbf;
        --reading-muted: #a29a8c;
        --reading-accent: #cc9584;
        --reading-panel: #24211d;
        --reading-border: #39342d;
      }
      body:has(.reading-theme) {
        background: #faf7f1;
      }
      .dark body:has(.reading-theme) {
        background: #1a1816;
      }
      .reading-theme a {
        color: inherit;
      }
      .reading-theme a:hover {
        color: var(--reading-accent);
      }
      .reading-theme a:focus-visible,
      .reading-theme button:focus-visible,
      .reading-theme summary:focus-visible {
        outline: 2px solid var(--reading-accent);
        outline-offset: 5px;
      }
      .reading-header,
      .reading-main,
      .reading-footer {
        width: min(100%, 776px);
        margin: 0 auto;
        padding-left: 28px;
        padding-right: 28px;
      }
      .reading-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 24px;
        padding-top: 32px;
        padding-bottom: 32px;
      }
      .reading-brand {
        font-family:
          'Segoe Print', 'Snell Roundhand', 'STKaiti', KaiTi, cursive;
        font-size: 30px;
        font-style: italic;
        line-height: 1.3;
        text-decoration: none;
        white-space: nowrap;
      }
      .reading-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        font-size: 16px;
      }
      .reading-nav a {
        color: var(--reading-muted);
        text-decoration: none;
        padding-bottom: 3px;
      }
      .reading-nav a[aria-current='page'] {
        color: var(--reading-fg);
        border-bottom: 1px solid var(--reading-accent);
      }
      .reading-main {
        flex: 1;
        padding-top: 12px;
      }
      .reading-archive-group {
        margin: 24px 0 40px;
      }
      .reading-archive-group > h2 {
        font-size: 26px;
        font-weight: 700;
        margin-bottom: 24px;
      }
      .reading-theme .tag-container li {
        background: transparent;
        border: 0;
        color: var(--reading-muted);
      }
      .reading-theme .tag-container a {
        padding: 6px 10px;
        font-size: 15px;
      }
      .reading-theme .tag-container a[aria-current='page'] {
        color: var(--reading-accent);
        text-decoration: underline;
        text-underline-offset: 5px;
      }
      .reading-profile {
        display: flex;
        align-items: flex-start;
        gap: 22px;
        margin: 42px 0 72px;
      }
      .reading-avatar {
        border-radius: 50%;
        width: 64px;
        height: 64px;
        flex-shrink: 0;
      }
      .reading-profile h1 {
        margin: 0;
        font-size: 30px;
        font-weight: 700;
        line-height: 1.4;
      }
      .reading-profile p {
        margin: 6px 0 14px;
        font-size: 16px;
        color: var(--reading-muted);
      }
      .reading-social {
        display: flex;
        gap: 20px;
        color: var(--reading-muted);
      }
      .reading-list-label {
        display: flex;
        justify-content: space-between;
        font-size: 15px;
        color: var(--reading-muted);
        margin-bottom: 28px;
      }
      .reading-post-row {
        display: grid;
        grid-template-columns: 112px minmax(0, 1fr);
        align-items: baseline;
        margin: 0 0 16px;
      }
      .reading-post-row time {
        font-family: ui-monospace, monospace;
        font-size: 13px;
        color: var(--reading-muted);
      }
      .reading-post-row h2 {
        font-size: 19px;
        font-weight: 400;
        line-height: 1.7;
        margin: 0;
        overflow-wrap: anywhere;
      }
      .reading-post-row a {
        text-decoration: none;
      }
      .reading-post-row a:hover {
        text-decoration: underline;
        text-underline-offset: 5px;
      }
      .reading-lock {
        display: inline-block;
        vertical-align: middle;
        font-size: 14px;
        margin-left: 10px;
        color: var(--reading-muted);
      }
      .reading-article-header {
        margin-bottom: 36px;
      }
      .reading-article-header h1 {
        font-size: 36px;
        font-weight: 700;
        line-height: 1.3;
        margin: 0 0 14px;
        overflow-wrap: anywhere;
      }
      .reading-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        color: var(--reading-muted);
        font-size: 15px;
      }
      .reading-cover {
        margin-top: 32px;
        border-radius: 5px;
        overflow: hidden;
      }
      .reading-cover img {
        width: 100%;
        max-height: 480px;
        object-fit: cover;
      }
      .reading-theme .notion {
        color: var(--reading-body);
        background: transparent;
        font-family: inherit;
        font-size: 18px;
        line-height: 1.8;
        --bg-color: var(--reading-bg);
        --fg-color: var(--reading-body);
      }
      .reading-theme .notion-page {
        padding: 0;
        width: 100%;
      }
      .reading-theme .notion-page-content {
        padding: 0;
      }
      .reading-theme .notion-text {
        margin: 12px 0;
        line-height: 1.8;
      }
      .reading-theme .notion-h {
        color: var(--reading-fg);
        font-family: inherit;
        scroll-margin-top: 24px;
      }
      .reading-theme .notion-h1 {
        font-size: 28px;
        margin-top: 42px;
      }
      .reading-theme .notion-h2 {
        font-size: 24px;
        margin-top: 32px;
      }
      .reading-theme .notion-h3 {
        font-size: 21px;
      }
      .reading-theme .notion-link {
        color: var(--reading-accent);
        text-decoration: underline;
        text-underline-offset: 4px;
        border: 0;
      }
      .reading-theme .notion-quote {
        border-color: var(--reading-accent);
        color: var(--reading-muted);
      }
      .reading-theme .notion-code {
        background: var(--reading-panel);
        border: 1px solid var(--reading-border);
        border-radius: 5px;
        font-size: 14px;
      }
      .reading-theme .notion-inline-code {
        color: var(--reading-fg);
        background: var(--reading-panel);
      }
      .reading-theme .notion-hr {
        border-color: var(--reading-border);
      }
      .reading-theme .notion-asset-wrapper img {
        border-radius: 5px;
      }
      .reading-theme input {
        background: var(--reading-panel);
        border-color: var(--reading-border);
        color: var(--reading-fg);
      }
      .reading-footer {
        text-align: center;
        font-size: 13px;
        color: var(--reading-muted);
        line-height: 1.7;
        margin-top: 64px;
        padding-bottom: 28px;
      }
      .reading-footer p {
        margin: 5px 0;
      }
      .reading-footer-dot {
        margin: 0 10px;
      }
      .reading-theme-toggle {
        width: 38px;
        height: 38px;
        margin: 12px auto 0;
        display: block;
        padding: 8px 12px;
      }
      .reading-toc {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 30;
        font-size: 14px;
      }
      .reading-toc summary {
        cursor: pointer;
        list-style: none;
        border: 1px solid var(--reading-border);
        background: var(--reading-panel);
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        color: var(--reading-muted);
      }
      .reading-toc summary::-webkit-details-marker {
        display: none;
      }
      .reading-toc nav {
        position: absolute;
        bottom: 54px;
        right: 0;
        width: 280px;
        max-width: calc(100vw - 40px);
        max-height: 60vh;
        overflow-y: auto;
        padding: 12px;
        background: var(--reading-panel);
        border: 1px solid var(--reading-border);
        border-radius: 8px;
      }
      .reading-toc nav a {
        display: block;
        padding: 5px 8px;
        text-decoration: none;
      }
      .reading-theme .comment {
        margin-top: 56px;
        color: var(--reading-body);
      }
      .reading-theme .notion-comments {
        font-family: inherit;
      }
      .reading-theme .nc-form {
        padding: 22px 20px 18px;
        border-color: var(--reading-border);
        border-radius: 6px;
        background: var(--reading-panel);
      }
      .reading-theme .nc-form-heading,
      .reading-theme .nc-avatar {
        display: none;
      }
      .reading-theme .nc-fields {
        gap: 20px;
      }
      .reading-theme .nc-field {
        display: block;
        color: var(--reading-muted);
        font-size: 14px;
        line-height: 1.5;
      }
      .reading-theme .nc-field input {
        border-color: var(--reading-border);
        border-radius: 0;
        color: var(--reading-fg);
        font: inherit;
        min-height: 34px;
      }
      .reading-theme .nc-field input:focus {
        border-color: var(--reading-accent);
      }
      .reading-theme .nc-field input::placeholder,
      .reading-theme .nc-editor::placeholder {
        color: var(--reading-muted);
        opacity: 0.85;
      }
      .reading-theme .nc-editor,
      .reading-theme .nc-preview {
        min-height: 180px;
        padding: 4px 0;
        color: var(--reading-body);
        font-family: inherit;
        font-size: 15px;
        line-height: 1.8;
        border: 0;
        resize: vertical;
      }
      .reading-theme .nc-editor:focus-visible {
        outline: 1px solid var(--reading-accent);
        outline-offset: 5px;
      }
      .reading-theme .nc-counter {
        color: var(--reading-muted);
        font-family: monospace;
        font-size: 12px;
      }
      .reading-theme .nc-text-button,
      .reading-theme .nc-toolbar {
        color: var(--reading-muted);
        font-family: inherit;
        font-size: 14px;
      }
      .reading-theme .nc-submit {
        background: var(--reading-fg);
        color: var(--reading-bg);
        font-family: inherit;
        font-size: 14px;
        border-radius: 4px;
      }
      .reading-theme .nc-list-heading {
        padding-top: 8px;
        margin-bottom: 10px;
      }
      .reading-theme .nc-list-heading h2 {
        margin: 0;
        color: var(--reading-fg);
        font-size: 20px;
      }
      .reading-theme .nc-list-heading select,
      .reading-theme .nc-meta time {
        color: var(--reading-muted);
        font-family: inherit;
      }
      .reading-theme .nc-list-heading select option {
        background: var(--reading-panel);
        color: var(--reading-fg);
      }
      .reading-theme .nc-item {
        border-color: var(--reading-border);
      }
      .reading-theme .nc-meta {
        gap: 14px;
      }
      .reading-theme .nc-meta span,
      .reading-theme .nc-item p {
        color: var(--reading-body);
      }
      .reading-theme .nc-item p {
        font-size: 16px;
        line-height: 1.8;
      }
      .reading-theme .nc-meta button {
        color: var(--reading-muted);
      }
      .reading-theme .nc-empty {
        color: var(--reading-muted);
      }
      @media (max-width: 600px) {
        .reading-theme .nc-fields {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .reading-theme .nc-form {
          padding: 18px 16px;
        }
        .reading-header,
        .reading-main,
        .reading-footer {
          padding-left: 22px;
          padding-right: 22px;
        }
        .reading-header {
          display: block;
          padding-top: 26px;
          padding-bottom: 26px;
        }
        .reading-brand {
          font-size: 28px;
        }
        .reading-nav {
          gap: 22px;
          margin-top: 20px;
          font-size: 15px;
        }
        .reading-profile {
          margin: 24px 0 50px;
          gap: 18px;
        }
        .reading-profile h1 {
          font-size: 26px;
        }
        .reading-article-header h1 {
          font-size: 29px;
        }
        .reading-post-row {
          grid-template-columns: 1fr;
          gap: 2px;
          margin-bottom: 22px;
        }
        .reading-post-row time {
          font-size: 12px;
        }
        .reading-post-row h2 {
          font-size: 18px;
        }
        .reading-toc {
          bottom: 16px;
          right: 16px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .reading-theme *,
        .reading-theme *::before,
        .reading-theme *::after {
          transition: none !important;
          animation: none !important;
          scroll-behavior: auto !important;
        }
      }
    `}</style>
  )
}
