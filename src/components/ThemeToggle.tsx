import { Sun, Moon } from 'lucide-react';
import { ThemeOption } from '../types';

/**
 * Propriedades do componente de alternador de tema
 */
interface ThemeToggleProps {
  theme: ThemeOption;       // Indica qual tema está atualmente ativo ('light' ou 'dark')
  onToggle: () => void;     // Callback chamado para disparar a troca de tema no componente pai
}

/**
 * Componente ThemeToggle
 * Um botão interativo com animações suaves de rotação sob hover para trocar o tema visual do Focus Room.
 */
export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle"
      onClick={onToggle}
      className="p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all duration-300 active:scale-95 cursor-pointer focus:outline-hidden"
      aria-label="Alternar Tema Visual"
      title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {/* Exibe o ícone de Lua se estiver no Light, sugerindo clicar para ativar Modo Escuro, e vice-versa */}
      {theme === 'light' ? (
        <Moon className="w-5 h-5 transition-transform duration-500 ease-out hover:-rotate-12" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-500 ease-out hover:rotate-45" />
      )}
    </button>
  );
}
