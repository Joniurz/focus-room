# Focus Room

Seu espaço minimalista de foco, calmaria e atenção plena. Um ambiente projetado para reduzir a sobrecarga sensorial e induzir estados profundos de concentração através de som ambiente interativo, design limpo e controle de tempo elegante.

> **Nota de Arquitetura**: Este projeto foi construído sob uma filosofia estritamente offline-first. **Não há qualquer integração com inteligência artificial (IA)**, APIs externas de LLMs ou processamento em nuvem. A geração sonora de sintetizadores é feita por processamento de áudio analógico sintético e processual local diretamente no navegador utilizando a **Web Audio API**.

---

## 📸 Funcionalidades Core

1. **Geração Sonora Processual & Mistura de Canais**
   - **Música e Pads Ambientais**: Usa osciladores analógicos virtuais gerados de forma puramente matemática e offline (tons clássicos e sussurrados de 9ª menor/maior).
   - **Chuva Real**: Sistema integrado de áudio com loops locais de som de água de alta fidelidade e fallback de síntese caso haja falha ou limites de rede.
   - **Fogueira Real**: Som de fogo realista com suporte local de crepitações e micro-estalos procedimentais aleatórios.
2. **Relógio de Foco Amplo**
   - Exibição limpa em tipografia display tabular ultra-fina, se adaptando responsivamente em qualquer tela para dar legibilidade à distância.
3. **Frases Inspiradoras Locais**
   - Banco estático selecionado de pensamentos focado em calmaria, constância e sabedoria de atenção plena.
4. **Tema de Crepúsculo (Twilight Eye-Safe)**
   - Tema escuro de alto contraste suave de série para proteger a visão em momentos de estudo noturno. Alternador instantâneo com memória persistente de tema (`localStorage`).

---

## 🛠️Tecnologias Utilizadas

- **React 18** com **Vite** e **TypeScript**
- **Tailwind CSS** para estilização sem estilos embutidos ou arquivos CSS paralelos.
- **Web Audio API** para reprodução e síntese sonora de ruído branco, marrom e síntese de ondas analógicas puras no cliente.
- **Lucide React** para ícones limpos sem SVGs inline poluentes.

---

## 📂 Organização dos Arquivos Comentados

```bash
├── public/                 # Assets estáticos e sons locais offline (campfire.mp3, rain.mp3)
├── scripts/                # Script para download de assets estáticos locais
├── src/
│   ├── components/
│   │   ├── Clock.tsx             # Relógio responsivo de foco consciente
│   │   ├── DateDisplay.tsx       # Mostrador localizado e de baixo custo de CPU
│   │   ├── MotivationalQuote.tsx # Frases estáticas puras sem consumo de API
│   │   ├── ThemeToggle.tsx       # Alternador de tema minimalista
│   │   └── MusicPlayer.tsx       # Painel de controle do Mixer de Áudio
│   ├── utils/
│   │   └── audioSynth.ts         # Motor de processamento Web Audio, Chords Synth & Fallbacks
│   ├── App.tsx             # Componente central da estrutura visual única
│   ├── types.ts            # Declarações globais de interfaces de tipagem
│   └── index.css           # Folha de estilo de importação global do Tailwind CSS e fontes
└── package.json            # Scripts de build, dev e dependências locais
```

---

## 🚀 Como Iniciar

1. Certifique-se de ter o **Node.js** instalado na máquina.
2. No diretório raiz, instale as dependências:
   ```bash
   npm install
   ```
3. Se necessário, execute o script para garantir os sons de download:
   ```bash
   npx tsx scripts/download_assets.ts
   ```
4. Inicie o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```
5. Abra o navegador na porta listada ou utilize o fluxo padrão do aplicativo.
