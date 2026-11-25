# Aventura 3D

Jogo de plataforma 3D original para navegador, estruturado com JavaScript em módulos e WebGL nativo. O projeto não precisa baixar bibliotecas para iniciar.

## Executar localmente

Na pasta do projeto, execute:

```sh
python3 -m http.server 5173
```

Depois abra `http://localhost:5173` no navegador. O servidor HTTP é necessário porque o navegador restringe módulos JavaScript carregados diretamente por `file://`.

## Organização

- `src/core/`: ciclo do jogo, renderer WebGL, entrada, recursos, áudio e salvamento.
- `src/player/`: personagem, controles, física e animações.
- `src/camera/`: acompanhamento e enquadramento da câmera.
- `src/world/`: cenas, colisões e fases.
- `src/objects/`: plataformas, inimigos, caixas e itens.
- `src/systems/`: vidas, pontuação e progressão.
- `src/levels/`: definição das fases.
- `src/ui/`: menus, HUD e telas de resultado.
- `src/styles/`: estilos da interface.
- `public/assets/`: recursos originais do jogo.

Os sistemas serão implementados em módulos independentes. A renderização será feita diretamente com WebGL, sem dependências externas; isso reduz a conveniência de uma biblioteca 3D, mas permite desenvolver neste ambiente sem downloads.
