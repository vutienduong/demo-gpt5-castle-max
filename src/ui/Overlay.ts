export class UIOverlay {
  private root: HTMLElement;
  private scoreEl: HTMLDivElement;
  private hintEl: HTMLDivElement;
  private dialogueEl: HTMLDivElement;
  private dialogueBodyEl: HTMLDivElement;
  private dialogueNameEl: HTMLDivElement;
  private dialogueInput: HTMLInputElement;
  private dialogueSend: HTMLButtonElement;
  private onSend: ((text: string) => void) | null = null;
  private centerToast: HTMLDivElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.scoreEl = document.createElement('div');
    this.scoreEl.className = 'scoreboard';
    this.root.appendChild(this.scoreEl);

    this.hintEl = document.createElement('div');
    this.hintEl.className = 'hint';
    this.root.appendChild(this.hintEl);

    this.dialogueEl = document.createElement('div');
    this.dialogueEl.className = 'dialogue';
    this.dialogueEl.style.display = 'none';
    this.dialogueEl.innerHTML = `
      <div class="dialogue-header"><div class="dialogue-name"></div></div>
      <div class="dialogue-body"></div>
      <div class="dialogue-input">
        <input type="text" placeholder="Say something..." />
        <button>Send</button>
      </div>
    `;
    this.root.appendChild(this.dialogueEl);
    this.dialogueNameEl = this.dialogueEl.querySelector('.dialogue-name') as HTMLDivElement;
    this.dialogueBodyEl = this.dialogueEl.querySelector('.dialogue-body') as HTMLDivElement;
    this.dialogueInput = this.dialogueEl.querySelector('input') as HTMLInputElement;
    this.dialogueSend = this.dialogueEl.querySelector('button') as HTMLButtonElement;
    this.dialogueSend.addEventListener('click', () => {
      const text = this.dialogueInput.value.trim();
      if (!text) return;
      this.onSend?.(text);
      this.dialogueInput.value = '';
    });
    this.dialogueInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.dialogueSend.click();
    });

    this.centerToast = document.createElement('div');
    this.centerToast.className = 'center-toast';
    this.root.appendChild(this.centerToast);
  }

  updateScore(score: number) {
    this.scoreEl.textContent = `Score: ${score}`;
  }

  setHint(text: string) {
    this.hintEl.textContent = text;
  }

  openDialogue(name: string, body: string, onSend: (text: string) => void) {
    this.dialogueNameEl.textContent = name;
    this.dialogueBodyEl.textContent = body;
    this.dialogueEl.style.display = 'block';
    this.onSend = onSend;
  }

  updateDialogueBody(text: string) {
    this.dialogueBodyEl.textContent = text;
  }

  closeDialogue() {
    this.dialogueEl.style.display = 'none';
    this.onSend = null;
  }

  showCenterToast(text: string) {
    this.centerToast.textContent = text;
    this.centerToast.classList.add('show');
  }

  hideCenterToast() {
    this.centerToast.classList.remove('show');
  }

  flashToast(text: string) {
    this.showCenterToast(text);
    setTimeout(() => this.hideCenterToast(), 600);
  }
}


