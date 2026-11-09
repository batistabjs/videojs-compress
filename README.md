# Videojs Compressor

Script nodejs para compactação de vídeo.

## Como executar o projeto

### Pré-requisitos

- Nodejs 23
- Biblioteca ffmpeg

### Comandos

```bash
node videojs-compress.js <video_mp4_no_mesmo_diretorio> [--mute] [--aspect-ratio 43]
```

- `--mute`: remove o áudio do vídeo.
- `--aspect-ratio <valor>`: corta o vídeo (sem distorcer) para o aspect-ratio informado.
  Aceita `4:3`, `16:9` ou dígitos concatenados: `43` → 4:3, `169` → 16:9, `916` → 9:16.

---

## Compressão de imagens

```bash
node imagejs-compress.js <imagem> [--quality 1-100] [--format jpeg|png|webp|avif] [--width <px>] [--height <px>] [--output <caminho>]
```

- `--quality <1-100>`: qualidade da compressão (padrão: 80).
- `--format <jpeg|png|webp|avif>`: converte para o formato indicado (padrão: mantém o original).
- `--width <px>` / `--height <px>`: redimensiona preservando o aspect-ratio.
- `--output <caminho>`: caminho do arquivo de saída (padrão: `<nome>-compress.<ext>`).
