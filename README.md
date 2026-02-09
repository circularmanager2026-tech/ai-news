# 🤖 AI News Fetcher

Obtiene y muestra noticias sobre Inteligencia Artificial de fuentes RSS en español.

## 📋 Descripción

Este proyecto es un agregador de noticias de IA que:
- Obtiene noticias de múltiples fuentes RSS (Xataka, Genbeta, Computer Hoy, etc.)
- Filtra automáticamente noticias relacionadas con Inteligencia Artificial
- Presenta las noticias en una interfaz web moderna y responsive
- Se actualiza periódicamente mediante un script Node.js

## 🏗️ Estructura del Proyecto

```
ai-news/
├── docker-compose.yml    # Configuración Docker con nginx + traefik
├── nginx.conf            # Configuración nginx
├── fetch-news.js         # Script Node.js para obtener noticias RSS
├── package.json          # Dependencias del proyecto
├── .gitignore           # Archivos ignorados por git
└── html/
    ├── index.html       # Interfaz web
    └── news.json        # Datos de noticias (generado)
```

## 🚀 Instalación y Uso

### Requisitos
- Node.js (v14+)
- Docker y Docker Compose (opcional, para despliegue)

### Instalación local
```bash
# Instalar dependencias
npm install

# Obtener noticias
npm run fetch

# O
node fetch-news.js
```

### Despliegue con Docker
```bash
docker-compose up -d
```

El sitio estará disponible en `https://ai.dev.interwwweb.com`

## 📰 Fuentes de Noticias

- Xataka
- Genbeta
- Xataka Smart Home
- Xataka Android
- Microsiervos
- Computer Hoy

## 🔍 Palabras Clave Filtradas

El script filtra noticias relacionadas con:
- Inteligencia Artificial / AI / IA
- ChatGPT, GPT, OpenAI
- Claude, Anthropic
- Bard, Google Gemini
- Microsoft Copilot
- DALL-E, Midjourney, Stable Diffusion
- LLM, Modelos de Lenguaje
- Y más...

## 🛠️ Tecnologías

- **Node.js** - Backend y procesamiento de RSS
- **RSS Parser** - Parseo de feeds RSS
- **Nginx** - Servidor web
- **Traefik** - Reverse proxy y SSL
- **Docker** - Contenerización

## 📝 Licencia

MIT

## 👤 Autor

Creado para proyectos de Interwwweb.
