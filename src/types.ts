/**
 * Definições de Tipo Globais - Focus Room
 * Responsável por unificar as interfaces de objetos e opções do sistema de forma estrita e estática.
 */

// Opções de Tema Visual suportadas pelo sistema
export type ThemeOption = 'light' | 'dark';

// Configuração estrutural para canais ou presets sonoros locais
export interface SoundPreset {
  id: string;               // Identificador exclusivo do preset (ex: 'rain')
  name: string;             // Nome amigável de exibição
  description: string;      // Curta descrição de foco
  type: 'synth-rain' | 'synth-fire' | 'stable-url'; // Categoria da origem do áudio
  url?: string;             // Caminho ou URL persistente no diretório public/ para loops locais
}

// Histórico de sessões de foco iniciadas (para fins de organização interna)
export interface FocusSession {
  id: string;               // Identificador exclusivo da sessão
  durationMinutes: number;  // Tempo decorrido em minutos de foco
  completedAt: string;      // Data/Hora em ISOString da conclusão
}
