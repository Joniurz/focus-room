import { useState, useEffect } from 'react';

/**
 * Componente DateDisplay
 * Formata e renderiza a data corrente no idioma local (pt-BR) com estilo elegante de espaçamento largo.
 */
export default function DateDisplay() {
  // Estado local para armazenar o texto formatado da data
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    // Função interna para obter e formatar as datas de forma localizada
    const updateDate = () => {
      const today = new Date();
      
      // Opções completas de internacionalização (ex: Segunda-feira, 22 de junho)
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      };
      
      // Obtém string em português do Brasil sem necessidade de bibliotecas pesadas como moment ou date-fns
      let localized = today.toLocaleDateString('pt-BR', options);
      
      // Capitaliza a primeira letra do dia para maior consistência estética e editorial
      if (localized) {
        localized = localized.charAt(0).toUpperCase() + localized.slice(1);
      }
      
      setDateStr(localized);
    };

    // Executa a formatação inicial imediatamente no carregamento do componente
    updateDate();
    
    // Configura o verificador de mudança de dia a cada minuto (60000ms), baixo consumo de CPU
    const interval = setInterval(updateDate, 60000);

    // Limpeza ao desmontar o componente para restaurar memória do browser
    return () => clearInterval(interval);
  }, []);

  return (
    <p 
      id="focus-date" 
      className="text-sm md:text-base font-light tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase select-none mb-4 transition-all duration-300"
    >
      {/* Fallback silencioso enquanto os dados são localizados */}
      {dateStr || '...'}
    </p>
  );
}
