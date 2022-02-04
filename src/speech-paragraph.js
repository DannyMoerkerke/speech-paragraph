const mixin = superClass => class extends superClass {

  static get observedAttributes() {
    return ['lang', 'voice', 'rate'];
  }

  constructor() {
    super();

    this.minRate = 0.5;
    this.maxRate = 1.5;
    this._lang = this.getAttribute('lang') || 'en-US';
    this.voices = this.getVoicesForLanguage();
    this._rate = this.getAttribute('rate') || 1;

    const shadowRoot = this.attachShadow({mode: 'open'});

    shadowRoot.innerHTML = `
            <style>
              :host {
                --button-size: 12px;
                --button-color: #000000;
                --text-highlight-color: #ffff00;
                position: relative;
                display: block;
                width: max-content;
                padding-top: calc(var(--button-size) * 2) !important;
              }

              .play-button,
              .pause-button {
                display: flex;
                position: absolute;
                top: 3px;
                right: 3px;
                z-index: 9999;
                width: calc(var(--button-size) * 2);
                height: calc(var(--button-size) * 2);
                border: none;
                cursor: pointer;
                background-color: transparent;
                align-items: center;
                justify-content: center;
              }

              .pause-button {
                display: none;
              }

              :host([speaking]) .play-button {
                display: none;
              }

              :host([speaking]) .pause-button {
                display: block;
              }

              .play-button-icon,
              .pause-button-icon {
                display: block;
                width: var(--button-size);
                height: var(--button-size);
              }

              .play-button-icon {
                background-color: var(--button-color);
                clip-path: polygon(0% 0%,0% 100%,100% 50%);
              }

              .pause-button-icon {
                border-left: calc(var(--button-size) * .4) solid var(--button-color);
                border-right: calc(var(--button-size) * .4) solid var(--button-color);
                background-color: transparent;
                box-sizing: border-box;
              }

              ::slotted(.highlight) {
                background-color: var(--text-highlight-color);
              }

              ::slotted() {
                user-select: text;
              }

              #container {
                outline: none;
              }

              :host([hasselection]) {
                position: static;
              }
            </style>

            <div id="container" tabindex="0">
              <slot></slot>
              <button type="button" class="play-button">
                <span class="play-button-icon"></span>
              </button>

              <button type="button" class="pause-button">
                <span class="pause-button-icon"></span>
              </button>
            </div>
            `;
  }

  connectedCallback() {
    this.synth = speechSynthesis;
    this.host = this.shadowRoot.getRootNode().host;
    this.container = this.shadowRoot.querySelector('#container');
    this.playButton = this.shadowRoot.querySelector('.play-button');
    this.pauseButton = this.shadowRoot.querySelector('.pause-button');
    this.textNode = this.shadowRoot.querySelector('slot');

    this.playButton.addEventListener('click', () => this.speak(this.selectedText || this.textContent));
    this.pauseButton.addEventListener('click', () => this.pause());

    this.shadowRoot.addEventListener('mouseup', (e) => {
      if(!e.composedPath().includes(this.playButton) && !e.composedPath().includes(this.pauseButton)) {
        this.highlightText();
        e.stopPropagation();
      }
    });

    document.addEventListener('mouseup', (e) => {
      if(!e.composedPath().includes(this.playButton) && !e.composedPath().includes(this.pauseButton)) {
        this.removeHighlights();
        this.hasselection = false;
        this.synth.cancel();
      }
    });

    speechSynthesis.addEventListener('voiceschanged', () => {
      this.voices = speechSynthesis.getVoices().filter(({lang}) => lang.includes(this._lang));
      this._voice = this.voices.find(({lang}) => lang.includes(this._lang));
    });

    this.container.addEventListener('keydown', (e) => {
      if(e.code === 'Space') {
        this.speak(this.selectedText || this.textContent);
      }
    });

    this.container.addEventListener('mouseover', () => this.container.removeAttribute('tabindex'));
    this.container.addEventListener('mouseout', () => this.container.setAttribute('tabindex', 0));
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    this[attr] = newVal;
  }

  getVoicesForLanguage() {
    return speechSynthesis.getVoices().filter(({lang}) => lang.includes(this._lang));
  }

  get lang() {
    return this._lang;
  }

  set lang(lang) {
    this._lang = lang;
    this.voices = this.getVoicesForLanguage();

    if(!this.voices.find(({name}) => name.toLowerCase() === this._voice.name.toLowerCase())) {
      this._voice = this.voices[0];
    }
  }

  get voice() {
    return this._voice;
  }

  set voice(voiceName) {
    if(this.voices.length) {
      const newVoice = this.voices.find(({name}) => name.toLowerCase() === voiceName.toLowerCase());

      if(newVoice) {
        this._voice = newVoice;
      }
    }
  }

  get rate() {
    return this._rate;
  }

  set rate(rate) {
    const newRate = Math.min(this.maxRate, Math.max(this.minRate, rate));

    if(!isNaN(newRate)) {
      this._rate = newRate;
    }
  }

  highlightText() {
    this.removeHighlights();

    const selection = document.getSelection();

    if(selection.anchorNode && selection.anchorNode.parentElement === this.host) {
      this.selectedText = selection.toString();
      this.hasselection = this.selectedText !== '';

      if(this.selectedText !== '') {
        const range = selection.getRangeAt(0);
        const highlight = document.createElement('span');
        highlight.className = 'highlight';

        range.surroundContents(highlight);
        const {x, y, height} = highlight.getBoundingClientRect();

        this.playButton.style.left = `${x - 5}px`;
        this.playButton.style.top = `${y + height + 5}px`;
        this.pauseButton.style.left = `${x - 5}px`;
        this.pauseButton.style.top = `${y + height + 5}px`;
      }
    }
  }

  removeHighlights() {
    const highlighted = this.textNode.assignedNodes().find((el) => el.matches && el.matches('.highlight'));

    if(highlighted) {
      const highlightedText = highlighted.textContent;

      highlighted.replaceWith(highlightedText);

      this.playButton.style.left = ``;
      this.playButton.style.top = ``;
    }
  }

  set hasselection(hasSelection) {
    hasSelection ? this.setAttribute('hasselection', '') : this.removeAttribute('hasselection');
  }

  get hasselection() {
    return this.hasAttribute('hasselection');
  }

  get speaking() {
    return this.hasAttribute('speaking');
  }

  set speaking(isSpeaking) {
    isSpeaking ? this.setAttribute('speaking', '') : this.removeAttribute('speaking');
  }

  get languages() {
    const separator = this.synth.getVoices()[0].lang.includes('-') ? '-' : '_';
    return [...new Set(this.synth.getVoices().map(({lang}) => lang.split(separator).shift()))].sort();
  }

  speak(text) {
    if(this.synth.paused) {
      this.synth.resume();
      this.speaking = true;
    }
    else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this._voice;
      utterance.lang = this._lang;
      utterance.rate = this._rate;

      this.synth.speak(utterance);
      this.speaking = true;

      const checkSpeakingInterval = setInterval(() => {
        if(!this.synth.speaking) {
          this.speaking = false;
          clearInterval(checkSpeakingInterval);
        }
      }, 250);
    }
  }

  pause() {
    this.synth.pause();
    this.speaking = false;
  }
};


customElements.define('test-p', class TestP extends HTMLParagraphElement {}, {extends: 'p'});
const supportsNativeExtend = document.createElement('p', {is: 'test-p'}).constructor.name === 'TestP';

export const SpeechParagraph = supportsNativeExtend ? mixin(HTMLParagraphElement) : mixin(HTMLElement);

if(supportsNativeExtend) {
  customElements.define('speech-paragraph', SpeechParagraph, {extends: 'p'});
}
else {
  customElements.define('speech-paragraph', SpeechParagraph);
}

