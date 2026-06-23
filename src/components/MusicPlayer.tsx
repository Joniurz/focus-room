import { useState, useEffect } from 'react';
import { Play, Pause, Music, CloudRain, Flame } from 'lucide-react';
import { FocusAudioSynth } from '../utils/audioSynth';

/**
 * Inicialização estática de uma única instância do motor de áudio.
 * Isso garante que múltiplos tocadores não iniciem e causem eco ou conflito de canais de áudio.
 */
const synthEngine = new FocusAudioSynth();

/**
 * Componente MusicPlayer
 * Painel de controle do Mixer de canais de áudio offline e reprodução ambiental.
 * Possibilita o ajuste instantâneo individual de volumes para: Música, Chuva Real, Fogueira Real.
 */
export default function MusicPlayer() {
  // Estado que verifica se os efeitos e trilha de áudio estão ativos no momento
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Estados para volumes individuais persistentes de 0.0 a 1.0
  const [musicVol, setMusicVol] = useState<number>(0.35); // Canal de pad/textura harmônica
  const [rainVol, setRainVol] = useState<number>(0.20);  // Canal de áudio local de chuva
  const [fireVol, setFireVol] = useState<number>(0.15);  // Canal de áudio local de fogueira

  // Efeito reativo para sincronizar o volume da música com o sintetizador em execução
  useEffect(() => {
    if (isPlaying) {
      synthEngine.setMusicVolume(musicVol);
    }
  }, [musicVol, isPlaying]);

  // Efeito reativo para sincronizar o volume da chuva com o sintetizador em execução
  useEffect(() => {
    if (isPlaying) {
      synthEngine.setRainVolume(rainVol);
    }
  }, [rainVol, isPlaying]);

  // Efeito reativo para sincronizar o volume do fogo com o sintetizador em execução
  useEffect(() => {
    if (isPlaying) {
      synthEngine.setFireVolume(fireVol);
    }
  }, [fireVol, isPlaying]);

  /**
   * Ativa ou desativa a reprodução do sintetizador ambiental local.
   * Por padrão, os navegadores barram o auto-play de áudio sem interação direta com clique,
   * portanto esse botão de Play atua como a ignição inicial exigida de consentimento seguro.
   */
  const handleTogglePlay = () => {
    if (isPlaying) {
      synthEngine.stop();
      setIsPlaying(false);
    } else {
      // Inicia a geração processual e reprodução dos buffers locais
      synthEngine.start(musicVol, rainVol, fireVol);
      setIsPlaying(true);
    }
  };

  // Coleta de lixo/Cleanup: Interrompe qualquer áudio de osciladores caso o usuário saia/desmonte a aba
  useEffect(() => {
    return () => {
      synthEngine.stop();
    };
  }, []);

  return (
    <div 
      id="clean-music-player" 
      className="w-full flex flex-col items-center gap-7 px-2 max-w-sm mx-auto"
    >
      {/* Botão Principal de Play/Pause com Glow Suave baseada no estado */}
      <div className="flex flex-col items-center gap-2">
        <button
          id="btn-play-pause-minimal"
          onClick={handleTogglePlay}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center cursor-pointer select-none transition-all duration-300 active:scale-95 shadow-xs border
            ${isPlaying 
              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-neutral-100 dark:border-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200' 
              : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-700'
            }
          `}
          title={isPlaying ? 'Pausar Áudio' : 'Iniciar Áudio'}
          aria-label={isPlaying ? 'Pausar Áudio' : 'Iniciar Áudio'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 stroke-[1.5]" />
          ) : (
            <Play className="w-5 h-5 translate-x-0.5 stroke-[1.5]" />
          )}
        </button>
        
        {/* Indicador de Status Escrito */}
        <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase select-none transition-opacity duration-300">
          {isPlaying ? 'Ambiente Ativo' : 'Pronto para Focar'}
        </span>
      </div>

      {/* Painel do Mixer Fino */}
      <div 
        id="sound-mixer-panel"
        className="w-full flex flex-col gap-4.5 p-4 rounded-xl transition-all duration-500"
      >
        {/* Canal 1: Música Minimalista (Pads Progressivos Offline) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 select-none">
            <span className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Música</span>
            </span>
            <span className="text-[10px] font-mono">{Math.round(musicVol * 100)}%</span>
          </div>
          <input
            id="slider-music-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVol}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMusicVol(val);
              // Caso o usuário mova o slider de volume de 0, inicia o player automaticamente
              if (!isPlaying && val > 0) {
                synthEngine.start(val, rainVol, fireVol);
                setIsPlaying(true);
              }
            }}
            className="w-full h-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-neutral-800 dark:accent-neutral-200"
            aria-label="Ajustar Volume da Música"
          />
        </div>

        {/* Canal 2: Chuva Real (Loop local em MP3) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 select-none">
            <span className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Chuva Real</span>
            </span>
            <span className="text-[10px] font-mono">{Math.round(rainVol * 100)}%</span>
          </div>
          <input
            id="slider-rain-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={rainVol}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setRainVol(val);
              if (!isPlaying && val > 0) {
                synthEngine.start(musicVol, val, fireVol);
                setIsPlaying(true);
              }
            }}
            className="w-full h-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-neutral-800 dark:accent-neutral-200"
            aria-label="Ajustar Volume da Chuva"
          />
        </div>

        {/* Canal 3: Fogueira Real (Campfire Loop local) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 select-none">
            <span className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Fogueira Real</span>
            </span>
            <span className="text-[10px] font-mono">{Math.round(fireVol * 100)}%</span>
          </div>
          <input
            id="slider-fire-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={fireVol}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setFireVol(val);
              if (!isPlaying && val > 0) {
                synthEngine.start(musicVol, rainVol, val);
                setIsPlaying(true);
              }
            }}
            className="w-full h-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-neutral-800 dark:accent-neutral-200"
            aria-label="Ajustar Volume da Fogueira"
          />
        </div>
      </div>
    </div>
  );
}
