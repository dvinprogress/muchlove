"use strict";(()=>{function p(o){return`
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
      background: ${o.backgroundColor};
      border-radius: ${o.borderRadius};
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
      background: ${o.primaryColor};
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
      border: 2px solid ${o.primaryColor};
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .ml-nav-button:hover:not(:disabled) {
      background: ${o.primaryColor};
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
      fill: ${o.primaryColor};
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
      background: ${o.primaryColor};
    }

    .ml-footer {
      text-align: center;
      margin-top: 16px;
      font-size: 12px;
      color: #999;
    }

    .ml-footer a {
      color: ${o.primaryColor};
      text-decoration: none;
    }

    .ml-footer a:hover {
      text-decoration: underline;
    }

    .ml-hidden {
      display: none;
    }
  `}function h(o){if(!o)return"0:00";let t=Math.floor(o/60),i=Math.floor(o%60);return`${t}:${i.toString().padStart(2,"0")}`}function v(o,t){return o.length<=t?o:o.slice(0,t)+"..."}function m(o){let{testimonials:t,theme:i}=o;if(t.length===0)return`
      <div class="ml-widget">
        <div class="ml-card">
          <p style="text-align: center; color: #999;">No testimonials yet</p>
        </div>
      </div>
    `;let a=t.map(e=>{let r=i.showNames?`
          <div class="ml-header">
            <div class="ml-name">${e.firstName}</div>
            ${e.companyName?`<div class="ml-company">${e.companyName}</div>`:""}
          </div>
        `:"",l=i.showTranscription&&e.transcription?`<div class="ml-transcription">${v(e.transcription,150)}</div>`:"";return`
        <div class="ml-card" data-testimonial-id="${e.id}">
          <div class="ml-video-container">
            <video
              class="ml-video"
              src="${e.videoUrl}"
              preload="metadata"
              playsinline
            ></video>
            <button class="ml-play-button" aria-label="Play video">
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <div class="ml-duration">${h(e.durationSeconds)}</div>
          </div>
          <div class="ml-content">
            ${r}
            ${l}
          </div>
        </div>
      `}).join(""),n=t.map((e,r)=>`<button class="ml-dot ${r===0?"active":""}" data-index="${r}" aria-label="Go to slide ${r+1}"></button>`).join(""),s=i.poweredByVisible?`
      <div class="ml-footer">
        Powered by <a href="https://muchlove.app" target="_blank" rel="noopener">MuchLove</a>
      </div>
    `:"";return`
    <div class="ml-widget">
      <div class="ml-carousel">
        <div class="ml-carousel-track">
          ${a}
        </div>
      </div>
      <div class="ml-navigation">
        <button class="ml-nav-button ml-prev" aria-label="Previous" disabled>
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <div class="ml-dots">
          ${n}
        </div>
        <button class="ml-nav-button ml-next" aria-label="Next">
          <svg viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
      ${s}
    </div>
  `}var d=class{constructor(t){this.container=null;this.shadowRoot=null;this.currentSlide=0;this.totalSlides=0;this.isPlaying=!1;this.config=t}async init(){if(this.container=document.getElementById("muchlove-widget"),!this.container){console.error("MuchLove Widget: Container #muchlove-widget not found");return}this.shadowRoot=this.container.attachShadow({mode:"open"});try{let t=await this.fetchWidgetData();this.render(t),this.attachEventListeners()}catch(t){console.error("MuchLove Widget: Failed to load",t),this.renderError()}}async fetchWidgetData(){let t=`${this.config.apiUrl}/api/widget/testimonials?key=${encodeURIComponent(this.config.apiKey)}`,i=await fetch(t,{method:"GET",headers:{"Content-Type":"application/json"}});if(!i.ok)throw new Error(`Failed to fetch widget data: ${i.status}`);return i.json()}render(t){if(!this.shadowRoot)return;this.totalSlides=t.testimonials.length;let i={...t.theme,showNames:t.theme.showNames,showTranscription:t.theme.showTranscription,poweredByVisible:t.theme.poweredByVisible},a=p(i),n=document.createElement("style");n.textContent=a,this.shadowRoot.appendChild(n);let s=m(t),e=document.createElement("div");e.innerHTML=s,this.shadowRoot.appendChild(e)}renderError(){if(!this.shadowRoot)return;let t=`
      <div style="padding: 20px; text-align: center; color: #999;">
        <p>Unable to load testimonials</p>
      </div>
    `;this.shadowRoot.innerHTML=t}attachEventListeners(){if(!this.shadowRoot)return;this.shadowRoot.querySelectorAll(".ml-play-button").forEach(e=>{e.addEventListener("click",r=>{r.preventDefault();let c=r.target.closest(".ml-card")?.querySelector("video");c&&this.playVideo(c,e)})});let i=this.shadowRoot.querySelector(".ml-prev"),a=this.shadowRoot.querySelector(".ml-next");i?.addEventListener("click",()=>this.goToPrevSlide()),a?.addEventListener("click",()=>this.goToNextSlide()),this.shadowRoot.querySelectorAll(".ml-dot").forEach(e=>{e.addEventListener("click",r=>{let l=parseInt(r.target.dataset.index||"0",10);this.goToSlide(l)})}),this.shadowRoot.querySelectorAll("video").forEach(e=>{e.addEventListener("ended",()=>{let l=e.closest(".ml-card")?.querySelector(".ml-play-button");l&&(l.style.display="flex"),this.isPlaying=!1})})}playVideo(t,i){this.isPlaying||(i.style.display="none",t.play().catch(a=>{console.error("MuchLove Widget: Failed to play video",a),i.style.display="flex"}),this.isPlaying=!0)}goToSlide(t){if(t<0||t>=this.totalSlides)return;this.currentSlide=t;let i=this.shadowRoot?.querySelector(".ml-carousel-track");i&&(i.style.transform=`translateX(-${t*100}%)`),this.shadowRoot?.querySelectorAll(".ml-dot")?.forEach((e,r)=>{r===t?e.classList.add("active"):e.classList.remove("active")});let n=this.shadowRoot?.querySelector(".ml-prev"),s=this.shadowRoot?.querySelector(".ml-next");n&&(n.disabled=t===0),s&&(s.disabled=t===this.totalSlides-1)}goToPrevSlide(){this.goToSlide(this.currentSlide-1)}goToNextSlide(){this.goToSlide(this.currentSlide+1)}};function u(){let o=document.getElementById("muchlove-widget");if(!o)return;let t=o.dataset.apiKey;if(!t){console.error("MuchLove Widget: data-api-key attribute is required");return}let i=o.dataset.apiUrl||"https://muchlove.app";new d({apiKey:t,apiUrl:i}).init()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",u):u();})();
