import { useState, useEffect } from 'react';

/**
 * Componente Clock
 * Exibe as horas em formato digital HH:MM com ampla escala visual responsiva.
 * Projetado para ser legível de longe, sem poluição de segundos ou animações piscantes.
 */
export default function Clock() {
  // Estado local para armazenar e renderizar as horas formatadas
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    // Função interna para capturar as horas do sistema local do usuário
    const updateTime = () => {
      const now = new Date();
      
      // Formata horas e minutos garantindo dois dígitos (ex: 09:05)
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      // Atualiza o estado da UI de forma reativa
      setTime(`${hours}:${minutes}`);
    };

    // Executa imediatamente para evitar o "atraso de renderização" de 1 segundo
    updateTime();

    // Inicializa o temporizador atualizando a cada 1 segundo (1000ms)
    const interval = setInterval(updateTime, 1000);

    // Limpeza de listener: limpa o intervalo ao desmontar o componente para evitar vazamento de memória (Memory Leak)
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      id="focus-clock" 
      className="text-[12vw] sm:text-[100px] md:text-[120px] font-extralight tracking-tighter tabular-nums select-none transition-all duration-300 pointer-events-none"
    >
      {/* Exibe o placeholder de carregamento caso o estado inicial ainda não tenha sido definido */}
      {time || '--:--'}
    </div>
  );
}
