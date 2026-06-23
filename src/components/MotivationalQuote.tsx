import { useState, useEffect } from 'react';

/**
 * Banco estático de frases meditativas construído localmente na aplicação.
 * Garante que a aplicação funcione offline e permaneça livre de APIs externas ou serviços de IA.
 */
const FOCUS_QUOTES = [
  "A quietude de agora constrói a clareza de amanhã.",
  "Simplifique tudo antes de começar a focar.",
  "Menos barulho exterior, mais espaço para a mente criar.",
  "Atenção plena é a forma mais refinada de sabedoria.",
  "Um passo de cada vez: sem pressa, mas sem interrupção.",
  "A constância sutil é mais poderosa que o esforço extremo.",
  "Onde está sua atenção, aí reside o seu progresso.",
  "Crie silêncio dentro de si para que as ideias possam ecoar.",
  "A disciplina protege a sua energia das distrações mundanas.",
  "Concentre toda a sua mente na tarefa deste exato instante.",
  "Excelente é o foco que simplifica o complexo.",
  "A calmaria no ambiente convida à precisão intelectual."
];

/**
 * Componente MotivationalQuote
 * Apresenta uma frase minimalista de bem-estar e foco mental a cada carregamento de página,
 * sem requisições HTTP adicionais ou processadores de IA externos.
 */
export default function MotivationalQuote() {
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    // Escolhe aleatoriamente uma frase do repositório estático local no momento da montagem (mount)
    const randomIndex = Math.floor(Math.random() * FOCUS_QUOTES.length);
    setQuote(FOCUS_QUOTES[randomIndex]);
  }, []);

  return (
    <div 
      id="focus-motivation" 
      className="max-w-70 sm:max-w-xs mx-auto text-center"
    >
      <p className="text-[11px] sm:text-xs font-light tracking-[0.12em] text-neutral-400/70 dark:text-neutral-500/70 lowercase leading-relaxed transition-all duration-300 select-none">
        “{quote}”
      </p>
    </div>
  );
}
