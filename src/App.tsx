import { useState, useEffect } from 'react';
import { ThemeOption } from './types';
import Clock from './components/Clock';
import DateDisplay from './components/DateDisplay';
import MusicPlayer from './components/MusicPlayer';
import ThemeToggle from './components/ThemeToggle';
import MotivationalQuote from './components/MotivationalQuote';

/**
 * Componente Principal (App)
 * Gerencia o estado de tema global (claro/escuro) com persistência local (localStorage)
 * e organiza a distribuição e hierarquia visual de tela única do Focus Room.
 * Focado em minimalismo rigoroso, livre de variações desnecessárias ou integradores de IA.
 */
export default function App() {
  // Carrega o tema salvo no localStorage na montagem ou define 'dark' como padrão (para proteção ocular crepuscular)
  const [theme, setTheme] = useState<ThemeOption>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('focus-room-theme');
      return (saved as ThemeOption) || 'dark';
    }
    return 'dark';
  });

  // Sincroniza o estado reativo do React com a árvore de classes HTML do DOM para aplicar o tema do Tailwind
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    // Preserva a preferência do usuário localmente
    localStorage.setItem('focus-room-theme', theme);
  }, [theme]);

  // Função simples de alternação de tema disparada pelo ThemeToggle
  const handleToggleTheme = () => {
    setTheme((prev: ThemeOption) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-between px-6 py-6 md:px-12 md:py-10 bg-white text-[#4B5563] dark:bg-black dark:text-[#9CA3AF] transition-colors duration-1000 ease-in-out relative overflow-hidden"
    >
      {/* Barra de Cabeçalho: Posiciona o controle do interruptor de tema à direita */}
      <header className="w-full max-w-2xl flex justify-end items-center z-20">
        <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
      </header>

      {/* Bloco Central da Aplicação */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center text-center z-10 py-6 gap-6 animate-fade-in">
        
        {/* Renderizador de Data Localizada de Alto Contraste */}
        <div className="animate-fade-in transition-all duration-500">
          <DateDisplay />
        </div>

        {/* Relógio Responsivo de Medição Abstrata */}
        <Clock />

        {/* Citações Sem Requisição de API ou Conexão com IAs Externas */}
        <div className="animate-fade-in transition-all duration-500 mt-1">
          <MotivationalQuote />
        </div>

        {/* Painel do Mixer de Áudio Sintético e Procedural */}
        <div className="w-full mt-4">
          <MusicPlayer />
        </div>
      </main>

      {/* Rodapé Sutil e Silencioso */}
      <footer className="w-full text-center py-2 z-10">
        <p className="text-[9px] tracking-[0.25em] font-light uppercase opacity-25 select-none md:hover:opacity-40 transition-opacity duration-300">
          foco consciente • ambiente offline
        </p>
      </footer>
    </div>
  );
}
