/**
 * FocusAudioSynth - Motor de Áudio Procedural Multicanal Sem IA com Loops de Áudio Reais
 * Gera lindas paisagens sonoras harmônicas e naturais 100% offline, diretamente no navegador.
 * Usa arquivos reais de áudio local de alta qualidade para chuva e fogueira com fallback procedimental híbrido.
 */
export class FocusAudioSynth {
  // Contexto de Áudio Web (Web Audio API)
  private ctx: AudioContext | null = null;
  
  // Nós de Ganho dos Canais do Mixer
  private masterGain: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private rainGainNode: GainNode | null = null;
  private fireGainNode: GainNode | null = null;

  // Estados de controle de execução
  private isRunning: boolean = false;
  private currentChordIndex: number = 0;
  private chordTimerId: any = null;
  private fireCrackleIntervalId: any = null;

  // Buffers de áudio pré-carregados para reprodução offline instantânea
  private campfireBuffer: AudioBuffer | null = null;
  private rainBuffer: AudioBuffer | null = null;

  // Coleções de fontes ativas do Web Audio para interrupção segura (limpeza de memória)
  private activeRainSources: any[] = [];
  private activeFlameSources: any[] = [];
  
  // Níveis de volume configurados inicialmente (0.0 a 1.0)
  private musicVolume: number = 0.45;
  private rainVolume: number = 0.3;
  private fireVolume: number = 0.15;

  // Presets de acordes harmônicos baseados em acordes de 9ª menor e maior nostálgicos
  private readonly CHORD_PRESETS: Record<string, number[][]> = {
    classic: [
      // Fmaj9: Fá2, Dó3, Lá3, Mi4, Sol4
      [87.31, 130.81, 220.00, 329.63, 392.00],
      // Cmaj9: Dó2, Sol2, Mi3, Si3, Ré4
      [65.41, 98.00, 164.81, 246.94, 293.66],
      // Am9: Lá2, Mi3, Dó4, Sol4, Si4
      [110.00, 164.81, 261.63, 392.00, 493.88],
      // Gmaj9: Sol2, Ré3, Si3, Fá#4, Lá4
      [98.00, 146.83, 246.94, 369.99, 440.00]
    ],
    stellar: [
      // Am9: Lá2, Mi3, Dó4, Sol4, Si4
      [110.00, 164.81, 261.63, 392.00, 493.88],
      // Dm9: Ré2, Lá2, Fá3, Dó4, Mi4
      [73.42, 110.00, 174.61, 261.63, 329.63],
      // G11: Sol2, Ré3, Fá3, Lá3, Dó4
      [98.00, 146.83, 174.61, 220.00, 261.63],
      // Cmaj9: Dó2, Sol2, Mi3, Si3, Ré4
      [65.41, 98.00, 164.81, 246.94, 293.66]
    ],
    autumn: [
      // Emaj9: Mi2, Si2, Sol#3, Ré#4, Fá#4
      [82.41, 123.47, 207.65, 311.13, 369.99],
      // Amaj9: Lá2, Mi3, Dó#4, Sol#4, Si4
      [110.00, 164.81, 277.18, 415.30, 493.88],
      // F#m9: Fá#2, Dó#3, Lá3, Mi4, Sol#4
      [92.50, 138.59, 220.00, 329.63, 415.30],
      // B11: Si2, Fá#3, Lá3, Dó#4, Mi4
      [123.47, 185.00, 220.00, 277.18, 329.63]
    ],
    cosmic: [
      // Bm9: Si2, Fá#3, Ré4, Lá4, Dó#5
      [123.47, 185.00, 293.66, 440.00, 554.37],
      // Gmaj9: Sol2, Ré3, Si3, Fá#4, Lá4
      [98.00, 146.83, 246.94, 369.99, 440.00],
      // Em9: Mi2, Si2, Sol3, Ré4, Fá#4
      [82.41, 123.47, 196.00, 293.66, 369.99],
      // F#7sus: Fá#2, Dó#3, Mi3, Si3, Dó#4
      [92.50, 138.59, 164.81, 246.94, 277.18]
    ]
  };

  private currentPreset: string = 'classic';

  constructor() {
    // Inicialização tardia (lazy init) no momento da reprodução para respeitar políticas dos navegadores
  }

  /**
   * Inicializa de forma segura o ambiente Web Audio API
   */
  private init() {
    if (this.ctx) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Configuração do ganho mestre da aplicação
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Canais individuais interligados ao canal de saída mestre
    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    this.musicGainNode.connect(this.masterGain);

    this.rainGainNode = this.ctx.createGain();
    this.rainGainNode.gain.setValueAtTime(this.rainVolume, this.ctx.currentTime);
    this.rainGainNode.connect(this.masterGain);

    this.fireGainNode = this.ctx.createGain();
    this.fireGainNode.gain.setValueAtTime(this.fireVolume, this.ctx.currentTime);
    this.fireGainNode.connect(this.masterGain);
  }

  /**
   * Getter seguro para determinar o estado de reprodução ativo
   */
  public isPlaying(): boolean {
    return this.isRunning;
  }

  /**
   * Configura o tema musical do gerador analógico estático
   */
  public setMusicStyle(styleId: string) {
    if (this.CHORD_PRESETS[styleId]) {
      this.currentPreset = styleId;
    }
  }

  /**
   * Ativa a reprodução dos canais sonoros e inicializa o laço do mixer
   */
  public start(musicVol: number, rainVol: number, fireVol: number) {
    this.musicVolume = musicVol;
    this.rainVolume = rainVol;
    this.fireVolume = fireVol;

    this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    // Garante que o volume master esteja amplificado
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    }

    if (this.isRunning) return;
    this.isRunning = true;

    // Define os volumes de canal conforme repassado no painel
    this.setMusicVolume(musicVol);
    this.setRainVolume(rainVol);
    this.setFireVolume(fireVol);

    // 1. Agenda os acordes flutuantes em segundo plano
    this.startMusicScheduler();

    // 2. Aciona o streaming de áudio local
    this.startRainStream();
    this.startFireStream();
  }

  /**
   * Interrompe todos os osciladores e streams de áudio suavemente para evitar estalos (clipping)
   */
  public stop() {
    this.isRunning = false;

    // Remove o agendador de notas musicais
    if (this.chordTimerId) {
      clearInterval(this.chordTimerId);
      this.chordTimerId = null;
    }

    // Desliga gerador de estalos extras da fogueira sintética
    if (this.fireCrackleIntervalId) {
      clearInterval(this.fireCrackleIntervalId);
      this.fireCrackleIntervalId = null;
    }

    // Efeito sutil de fade out no ganho mestre
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
      } catch (err) {
        // Fallback passivo
      }
    }

    // Libera os recursos de áudio após o fade out de 350 milissegundos
    setTimeout(() => {
      // Para as fontes de som de chuva
      this.activeRainSources.forEach(src => {
        try { src.stop(); } catch(e){}
        try { src.disconnect(); } catch(e){}
      });
      this.activeRainSources = [];

      // Para as fontes de som de fogueira
      this.activeFlameSources.forEach(src => {
        try { src.stop(); } catch(e){}
        try { src.disconnect(); } catch(e){}
      });
      this.activeFlameSources = [];
    }, 350);
  }

  /* ==========================================
     MÚSICA - Sintetizador de Ondas Senoidais Analógicas
     ========================================== */

  /**
   * Gerencia a alternância cíclica de acordes a cada 6 segundos
   */
  private startMusicScheduler() {
    this.currentChordIndex = 0;
    this.playChord(this.currentChordIndex);

    this.chordTimerId = setInterval(() => {
      if (!this.isRunning || !this.ctx) return;
      this.currentChordIndex = (this.currentChordIndex + 1) % 4; // Ciclo de 4 acordes por preset
      this.playChord(this.currentChordIndex);
    }, 6000);
  }

  /**
   * Gera e executa o acorde no índice informado aplicando envelope de amplitude ADSR sutil
   */
  private playChord(chordIndex: number) {
    if (!this.ctx || !this.musicGainNode || !this.isRunning) return;

    const chords = this.CHORD_PRESETS[this.currentPreset] || this.CHORD_PRESETS.classic;
    const chord = chords[chordIndex];
    const now = this.ctx.currentTime;
    
    // Curva de envelope suave (Fade-in e Fade-out) para os blocos de sintetizador
    const attack = 1.8;
    const sustain = 3.2; 
    const release = 2.0;
    const totalDuration = attack + sustain + release; 

    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.musicGainNode) return;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const noteGain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Desafinação térmica sutil para imitar osciladores analógicos vintage
      const drift = (Math.random() - 0.5) * 5; 
      osc.detune.setValueAtTime(drift, now);

      // Filtro passa-baixa para remover notas muito agudas e abafar o som
      filter.type = 'lowpass';
      const cutoff = 360 + (idx * 45); 
      filter.frequency.setValueAtTime(cutoff, now);
      filter.Q.setValueAtTime(1.1, now);

      noteGain.gain.setValueAtTime(0, now);
      const baseGain = 0.11 - (idx * 0.014);
      noteGain.gain.linearRampToValueAtTime(Math.max(0.045, baseGain), now + attack);
      noteGain.gain.setValueAtTime(Math.max(0.045, baseGain), now + attack + sustain);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicGainNode);

      osc.start(now);
      osc.stop(now + totalDuration);
    });
  }

  /* ==========================================
     CARREGADOR DE ÁUDIO DE REDE
     ========================================== */

  /**
   * Carrega e decodifica de forma segura o binário de áudio MP3 offline ou online
   */
  private async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    if (!this.ctx) throw new Error('AudioContext não inicializado');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao buscar conteúdo de áudio em ${url}: Status ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return await this.ctx.decodeAudioData(arrayBuffer);
  }

  /* ==========================================
     CHUVA - Fluxo Estático / Fallback Híbrido
     ========================================== */

  /**
   * Inicializa o laço do som da chuva
   */
  private async startRainStream() {
    if (!this.ctx || !this.rainGainNode) return;

    try {
      if (!this.rainBuffer) {
        this.rainBuffer = await this.loadAudioBuffer('/sounds/rain.mp3');
      }

      const source = this.ctx.createBufferSource();
      source.buffer = this.rainBuffer;
      source.loop = true;
      source.connect(this.rainGainNode);
      source.start(0);

      this.activeRainSources.push(source);
      console.log("Fluxo real de chuva iniciado com sucesso.");
    } catch (e) {
      console.warn("Não foi possível carregar o loop original da chuva. Ativando síntese como fallback:", e);
      this.startRainSynthesisFallback();
    }
  }

  /**
   * Emite uma frequência sintetizada artificial que imita de forma idêntica o som de chuva
   */
  private startRainSynthesisFallback() {
    if (!this.ctx || !this.rainGainNode) return;

    try {
      const now = this.ctx.currentTime;
      
      // Canal grave da chuva (Ruído Browniano filtrado)
      const rumbleBuffer = this.createBrownianNoiseBuffer();
      const rumbleSource = this.ctx.createBufferSource();
      rumbleSource.buffer = rumbleBuffer;
      rumbleSource.loop = true;

      const rumbleFilter = this.ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(220, now);

      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(this.rainGainNode);
      rumbleSource.start(now);

      this.activeRainSources.push(rumbleSource);

      // Canal agudo (Gotejamento sintético - Ruído Branco filtrado)
      const rainBuffer = this.createWhiteNoiseBuffer();
      const rainSource = this.ctx.createBufferSource();
      rainSource.buffer = rainBuffer;
      rainSource.loop = true;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.setValueAtTime(800, now);
      rainFilter.Q.setValueAtTime(1.0, now);

      rainSource.connect(rainFilter);
      rainFilter.connect(this.rainGainNode);
      rainSource.start(now);

      this.activeRainSources.push(rainSource);
    } catch (err) {
      console.error("Erro ao inicializar o sintetizador secundário de chuva", err);
    }
  }

  /* ==========================================
     FOGUEIRA - Fluxo Estático / Fallback Híbrido
     ========================================== */

  /**
   * Inicializa o laço do som de crackle de fogueira
   */
  private async startFireStream() {
    if (!this.ctx || !this.fireGainNode) return;

    try {
      if (!this.campfireBuffer) {
        this.campfireBuffer = await this.loadAudioBuffer('/sounds/campfire.mp3');
      }

      const source = this.ctx.createBufferSource();
      source.buffer = this.campfireBuffer;
      source.loop = true;
      source.connect(this.fireGainNode);
      source.start(0);

      this.activeFlameSources.push(source);
      console.log("Fluxo real de fogueira iniciado com sucesso.");
    } catch (e) {
      console.warn("Não foi possível carregar o loop original da fogueira. Ativando síntese como fallback:", e);
      this.startFireSynthesisFallback();
    }
  }

  /**
   * Desenha analiticamente estalos térmicos de queima de madeira
   */
  private startFireSynthesisFallback() {
    if (!this.ctx || !this.fireGainNode) return;

    try {
      const now = this.ctx.currentTime;

      // Chama baixa e quente (Hum de ruído marrom filtrado)
      const humBuffer = this.createBrownianNoiseBuffer();
      const humSource = this.ctx.createBufferSource();
      humSource.buffer = humBuffer;
      humSource.loop = true;

      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(130, now);

      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.35, now);

      humSource.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(this.fireGainNode);

      humSource.start(now);
      this.activeFlameSources.push(humSource);

      // Chiado constante de brasa (Ruído branco filtrado)
      const sizzleBuffer = this.createWhiteNoiseBuffer();
      const sizzleSource = this.ctx.createBufferSource();
      sizzleSource.buffer = sizzleBuffer;
      sizzleSource.loop = true;

      const sizzleFilter = this.ctx.createBiquadFilter();
      sizzleFilter.type = 'bandpass';
      sizzleFilter.frequency.setValueAtTime(3200, now);
      sizzleFilter.Q.setValueAtTime(1.8, now);

      const sizzleGain = this.ctx.createGain();
      sizzleGain.gain.setValueAtTime(0.12, now);

      sizzleSource.connect(sizzleFilter);
      sizzleFilter.connect(sizzleGain);
      sizzleGain.connect(this.fireGainNode);

      sizzleSource.start(now);
      this.activeFlameSources.push(sizzleSource);

      // Temporizador para gerar estalos aleatórios e microestalos esporádicos
      this.fireCrackleIntervalId = setInterval(() => {
        if (!this.isRunning || !this.ctx || this.fireVolume < 0.01) return;

        const currentTime = this.ctx.currentTime;
        const seed = Math.random();

        if (seed < 0.45) {
          const offset = Math.random() * 0.04;
          this.triggerMicroCrackle(currentTime + offset);
        }
        if (seed > 0.45 && seed < 0.51) {
          const offset = Math.random() * 0.05;
          this.triggerCampfireCrackle(currentTime + offset);
        }
      }, 80);

    } catch (e) {
      console.warn("Erro ao instanciar fogueira através de caminhos procedimentais", e);
    }
  }

  /**
   * Cospe cliques curtos agudos
   */
  private triggerMicroCrackle(time: number) {
    if (!this.ctx || !this.fireGainNode || !this.isRunning) return;
    try {
      const length = this.ctx.sampleRate * (0.0015 + Math.random() * 0.0035);
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const decay = 1.0 - (i / data.length);
        data[i] = (Math.random() * 2 - 1) * decay * 0.35;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3800 + Math.random() * 2800, time);

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.08 + Math.random() * 0.18, time);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.fireGainNode);

      source.start(time);
    } catch (e) {}
  }

  /**
   * Cospe estalos pesados de queima com grave
   */
  private triggerCampfireCrackle(time: number) {
    if (!this.ctx || !this.fireGainNode || !this.isRunning) return;
    try {
      const length = this.ctx.sampleRate * (0.010 + Math.random() * 0.018);
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const decay = 1.0 - (i / data.length);
        data[i] = (Math.random() * 2 - 1) * decay * 0.45;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 2000, time);
      filter.Q.setValueAtTime(2.2, time);

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.16 + Math.random() * 0.28, time);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.fireGainNode);

      source.start(time);
    } catch (e) {}
  }

  /* ==========================================
     UTILITÁRIOS MATEMÁTICOS DE RUÍDO ACÚSTICO
     ========================================== */

  /**
   * Preenche um buffer com dados aleatórios de ruído branco de forma sequencial
   */
  private createWhiteNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('Contexto não inicializado');
    const bufferSize = this.ctx.sampleRate * 2.5; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Preenche um buffer aplicando algoritmo matemático incremental de ruído marrom (reduz agudos)
   */
  private createBrownianNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('Contexto não inicializado');
    const bufferSize = this.ctx.sampleRate * 3.0; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.022 * white)) / 1.022;
      lastOut = data[i];
      data[i] *= 3.8; // Amplifica o sinal de atenuação
    }
    return buffer;
  }

  /* ==========================================
     GERENCIADORES DINÂMICOS DE VOLUME
     ========================================== */

  public setMusicVolume(vol: number) {
    this.musicVolume = vol;
    if (this.ctx && this.musicGainNode) {
      try {
        this.musicGainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
      } catch (err) {}
    }
  }

  public setRainVolume(vol: number) {
    this.rainVolume = vol;
    if (this.ctx && this.rainGainNode) {
      try {
        this.rainGainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
      } catch (err) {}
    }
  }

  public setFireVolume(vol: number) {
    this.fireVolume = vol;
    if (this.ctx && this.fireGainNode) {
      try {
        this.fireGainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
      } catch (err) {}
    }
  }
}
