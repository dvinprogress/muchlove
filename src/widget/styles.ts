export interface WidgetTheme {
  primaryColor: string
  backgroundColor: string
  borderRadius: string
  layout: 'carousel' | 'grid'
  maxItems: number
  showNames: boolean
  showTranscription: boolean
  poweredByVisible: boolean
}

export function generateWidgetStyles(theme: WidgetTheme): string {
  return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .ml-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .ml-carousel {
      position: relative;
      overflow: hidden;
    }

    .ml-carousel-track {
      display: flex;
      transition: transform 0.3s ease;
      gap: 20px;
    }

    .ml-card {
      flex: 0 0 100%;
      background: ${theme.backgroundColor};
      border-radius: ${theme.borderRadius};
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    @media (min-width: 768px) {
      .ml-card {
        flex: 0 0 calc(50% - 10px);
      }
    }

    @media (min-width: 1024px) {
      .ml-card {
        flex: 0 0 calc(33.333% - 14px);
      }
    }

    .ml-video-container {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
    }

    .ml-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ml-play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: ${theme.primaryColor};
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .ml-play-button:hover {
      transform: translate(-50%, -50%) scale(1.1);
    }

    .ml-play-button svg {
      width: 24px;
      height: 24px;
      fill: #fff;
      margin-left: 4px;
    }

    .ml-duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .ml-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ml-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ml-name {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .ml-company {
      font-size: 14px;
      color: #666;
    }

    .ml-transcription {
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ml-navigation {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 20px;
    }

    .ml-nav-button {
      width: 40px;
      height: 40px;
      border: 2px solid ${theme.primaryColor};
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .ml-nav-button:hover:not(:disabled) {
      background: ${theme.primaryColor};
    }

    .ml-nav-button:hover:not(:disabled) svg {
      fill: #fff;
    }

    .ml-nav-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .ml-nav-button svg {
      width: 20px;
      height: 20px;
      fill: ${theme.primaryColor};
      transition: fill 0.2s ease;
    }

    .ml-dots {
      display: flex;
      gap: 8px;
    }

    .ml-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ddd;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .ml-dot.active {
      background: ${theme.primaryColor};
    }

    .ml-footer {
      text-align: center;
      margin-top: 16px;
      font-size: 12px;
      color: #999;
    }

    .ml-footer a {
      color: ${theme.primaryColor};
      text-decoration: none;
    }

    .ml-footer a:hover {
      text-decoration: underline;
    }

    .ml-hidden {
      display: none;
    }
  `
}
