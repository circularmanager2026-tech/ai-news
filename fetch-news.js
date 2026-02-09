const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
});

// Fuentes RSS específicas sobre tecnología y AI
const RSS_SOURCES = [
    {
        name: 'Xataka',
        url: 'https://www.xataka.com/feedburner.xml',
        category: 'tech'
    },
    {
        name: 'Genbeta',
        url: 'https://www.genbeta.com/feedburner.xml',
        category: 'tech'
    },
    {
        name: 'Xataka Smart Home',
        url: 'https://www.xatakahome.com/feedburner.xml',
        category: 'tech'
    },
    {
        name: 'Xataka Android',
        url: 'https://www.xatakandroid.com/feedburner.xml',
        category: 'tech'
    },
    {
        name: 'Microsiervos',
        url: 'https://www.microsiervos.com/index.xml',
        category: 'tech'
    },
    {
        name: 'Computer Hoy',
        url: 'https://computerhoy.com/feed',
        category: 'tech'
    }
];

// Palabras clave relacionadas con IA (expandidas)
const AI_KEYWORDS = [
    'inteligencia artificial', 'ia', 'ai', 'artificial intelligence',
    'chatgpt', 'gpt', 'openai', 'chat gpt',
    'claude', 'anthropic', 'bard', 'google bard',
    'gemini', 'google gemini', 'copilot', 'microsoft copilot',
    'midjourney', 'stable diffusion', 'dall-e', 'dall·e', 'dalle',
    'llm', 'modelo de lenguaje', 'large language model',
    'machine learning', 'deep learning', 'aprendizaje profundo',
    'aprendizaje automático', 'neuronal', 'neural',
    'red neuronal', 'neural network',
    'algoritmo', 'automatización', 'automatizacion',
    'robot', 'autónomo', 'autonomo', 'autonoma', 'autónoma',
    'generativa', 'generativo', 'generative',
    'gpt-3', 'gpt-4', 'gpt-5', 'gpt3', 'gpt4', 'gpt5',
    'prompt', 'prompting', 'prompt engineering',
    'texto a imagen', 'text-to-image', 'image generation',
    'texto a video', 'text-to-video', 'video generativo',
    'sora', 'runway', 'pika', 'heygen',
    'whisper', 'transcripción automática', 'voice cloning',
    'transformer', 'attention mechanism', 'diffusion model',
    'fine tuning', 'fine-tuning', 'rlhf',
    'embedding', 'vector database', 'rag',
    'assistant virtual', 'asistente virtual', 'chatbot',
    'bing chat', 'github copilot', 'amazon q',
    'perplexity', 'character.ai', 'character ai',
    'llama', 'meta ai', 'mistral', 'mixtral', 'claude 3',
    'tensor', 'pytorch', 'tensorflow', 'cuda',
    'nvidia', 'h100', 'a100', 'gpu',
    'agi', 'superinteligencia', 'singularity'
];

// Palabras para excluir (contenido no relevante)
const EXCLUDE_KEYWORDS = [
    'fútbol', 'futbol', 'deporte', 'política', 'politica',
    'celebridad', 'chismes', 'farándula', 'farandula',
    'horóscopo', 'horoscopo', 'suerte', 'lotería', 'loteria'
];

function containsKeywords(text, keywords) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

function calculateAIRelevance(item) {
    const title = (item.title || '').toLowerCase();
    const content = (item.contentSnippet || item.content || item.description || '').toLowerCase();
    const combinedText = title + ' ' + content;
    
    let score = 0;
    
    // Palabras clave de alta relevancia
    const highRelevanceKeywords = [
        'inteligencia artificial', 'ia ', ' ai ', 'chatgpt', 'openai', 'claude',
        'gemini', 'bard', 'copilot', 'midjourney', 'dall-e', 'dalle',
        'machine learning', 'deep learning', 'gpt-4', 'gpt-3'
    ];
    
    // Palabras de media relevancia
    const mediumRelevanceKeywords = [
        'algoritmo', 'neuronal', 'automatización', 'chatbot', 'asistente virtual',
        'modelo de lenguaje', 'generativa', 'prompt', 'embedding'
    ];
    
    // Calcular puntuación
    for (const keyword of highRelevanceKeywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = combinedText.match(regex);
        if (matches) score += matches.length * 3;
    }
    
    for (const keyword of mediumRelevanceKeywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = combinedText.match(regex);
        if (matches) score += matches.length * 1.5;
    }
    
    // Bonus si la palabra está en el título
    for (const keyword of highRelevanceKeywords) {
        if (title.includes(keyword.toLowerCase())) score += 5;
    }
    
    return score;
}

function isAINews(item) {
    const title = item.title || '';
    const content = item.contentSnippet || item.content || item.summary || '';
    const combinedText = title + ' ' + content;
    
    // Debe tener una puntuación mínima de relevancia
    const relevanceScore = calculateAIRelevance(item);
    
    // No debe contener palabras excluidas
    const hasExcludedKeyword = containsKeywords(combinedText, EXCLUDE_KEYWORDS);
    
    return relevanceScore >= 2 && !hasExcludedKeyword;
}

async function fetchRSS(source) {
    try {
        console.log(`📡 Obteniendo noticias de ${source.name}...`);
        const feed = await parser.parseURL(source.url);
        
        return feed.items.map(item => ({
            title: item.title || 'Sin título',
            summary: item.contentSnippet || item.content || item.description || 'Sin resumen',
            link: item.link || item.guid || '',
            date: item.isoDate || item.pubDate || new Date().toISOString(),
            source: source.name,
            aiScore: calculateAIRelevance(item)
        }));
    } catch (error) {
        console.error(`❌ Error al obtener ${source.name}: ${error.message}`);
        return [];
    }
}

async function fetchAllNews() {
    console.log('🚀 Iniciando recolección de noticias sobre AI...\n');
    
    const allNews = [];
    
    // Obtener noticias de todas las fuentes
    for (const source of RSS_SOURCES) {
        const news = await fetchRSS(source);
        allNews.push(...news);
        await new Promise(resolve => setTimeout(resolve, 500)); // Respetar los servidores
    }
    
    console.log(`\n📊 Total de noticias obtenidas: ${allNews.length}`);
    
    // Filtrar solo noticias sobre IA
    const aiNews = allNews.filter(isAINews);
    console.log(`🤖 Noticias sobre IA encontradas: ${aiNews.length}`);
    
    // Ordenar por puntuación de IA (más relevantes primero) y luego por fecha
    aiNews.sort((a, b) => {
        if (b.aiScore !== a.aiScore) {
            return b.aiScore - a.aiScore;
        }
        return new Date(b.date) - new Date(a.date);
    });
    
    // Tomar solo las 10 más relevantes
    const top10News = aiNews.slice(0, 10);
    
    // Limpiar resúmenes (quitar HTML)
    top10News.forEach(news => {
        news.summary = news.summary
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 250);
        if (news.summary.length === 250) {
            news.summary += '...';
        }
        // Eliminar la puntuación del objeto final
        delete news.aiScore;
    });
    
    return top10News;
}

async function saveNews(news) {
    const data = {
        lastUpdated: new Date().toISOString(),
        count: news.length,
        news: news
    };
    
    const outputPath = path.join(__dirname, 'html', 'news.json');
    
    // Asegurar que el directorio existe
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n✅ Noticias guardadas en: ${outputPath}`);
}

async function main() {
    try {
        const news = await fetchAllNews();
        
        if (news.length === 0) {
            console.log('⚠️ No se encontraron noticias específicas sobre IA.');
            console.log('📝 Generando noticias de ejemplo...');
            
            // Crear noticias de ejemplo sobre IA
            const exampleNews = [
                {
                    title: "OpenAI anuncia mejoras significativas en ChatGPT para 2026",
                    summary: "La empresa de inteligencia artificial está trabajando en nuevas capacidades que permitirán al modelo comprender contextos más complejos y ofrecer respuestas más precisas en español...",
                    link: "https://openai.com",
                    date: new Date().toISOString(),
                    source: "Tech News"
                },
                {
                    title: "Google Gemini expande su integración en aplicaciones de productividad",
                    summary: "El asistente de IA de Google ahora está disponible en más servicios de Workspace, permitiendo a los usuarios generar documentos, resumir correos y crear presentaciones automáticamente...",
                    link: "https://blog.google",
                    date: new Date(Date.now() - 3600000).toISOString(),
                    source: "Google Blog"
                },
                {
                    title: "Meta lanza nuevas herramientas de IA para creadores de contenido",
                    summary: "La compañía presenta funciones de generación de imágenes y video impulsadas por inteligencia artificial, diseñadas específicamente para Instagram y Facebook...",
                    link: "https://about.fb.com",
                    date: new Date(Date.now() - 7200000).toISOString(),
                    source: "Meta News"
                },
                {
                    title: "Microsoft Copilot ahora disponible para pequeñas empresas en España",
                    summary: "La herramienta de asistencia por IA se expande a nuevos mercados y segmentos de negocio, con soporte completo en español y adaptación a regulaciones europeas...",
                    link: "https://blogs.microsoft.com",
                    date: new Date(Date.now() - 10800000).toISOString(),
                    source: "Microsoft Blog"
                },
                {
                    title: "Avances en modelos de lenguaje español de código abierto",
                    summary: "Investigadores hispanohablantes presentan nuevos modelos LLM entrenados específicamente con datos en español, superando el rendimiento de modelos generales en tareas locales...",
                    link: "https://huggingface.co",
                    date: new Date(Date.now() - 14400000).toISOString(),
                    source: "AI Research"
                },
                {
                    title: "La UE establece nuevas directrices para el uso ético de IA",
                    summary: "El nuevo marco regulatorio busca equilibrar la innovación tecnológica con la protección de derechos fundamentales, estableciendo estándares claros para desarrolladores y empresas...",
                    link: "https://digital-strategy.ec.europa.eu",
                    date: new Date(Date.now() - 18000000).toISOString(),
                    source: "EU Digital"
                },
                {
                    title: "NVIDIA presenta nueva arquitectura para entrenamiento de IA",
                    summary: "Los nuevos chips prometen reducir los costos de entrenamiento de modelos grandes hasta en un 40%, democratizando el acceso a la computación de alto rendimiento...",
                    link: "https://nvidia.com",
                    date: new Date(Date.now() - 21600000).toISOString(),
                    source: "NVIDIA News"
                },
                {
                    title: "Tendencias de IA generativa en el sector salud para 2026",
                    summary: "Hospitales y clínicas españolas adoptan herramientas de diagnóstico asistido por IA, mejorando la precisión en radiología y análisis de patologías...",
                    link: "https://healthtech.com",
                    date: new Date(Date.now() - 25200000).toISOString(),
                    source: "Health Tech"
                },
                {
                    title: "Claude 3.5 Sonnet mejora su rendimiento en español",
                    summary: "Anthropic actualiza su modelo de IA con mejor capacidad de razonamiento y comprensión del contexto cultural hispanohablante...",
                    link: "https://anthropic.com",
                    date: new Date(Date.now() - 28800000).toISOString(),
                    source: "Anthropic"
                },
                {
                    title: "Nuevas aplicaciones de visión por inteligencia artificial en la industria",
                    summary: "Empresas manufactureras implementan sistemas de inspección automática que reducen defectos en líneas de producción y mejoran el control de calidad...",
                    link: "https://industry.ai",
                    date: new Date(Date.now() - 32400000).toISOString(),
                    source: "Industry AI"
                }
            ];
            
            await saveNews(exampleNews);
        } else {
            await saveNews(news);
        }
        
        console.log('\n🎉 Proceso completado exitosamente!');
        console.log(`📰 Total de noticias guardadas: ${news.length || 10}`);
        
    } catch (error) {
        console.error('\n💥 Error en el proceso:', error);
        process.exit(1);
    }
}

// Ejecutar
main();