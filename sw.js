// =========================================
// GS ELETRICA V2K - SERVICE WORKER
// Funcionamento Offline e Cache
// Desenvolvido por Gabriel
// =========================================

const NOME_CACHE = 'gs-eletrica-v2k-cache';
const VERSAO_CACHE = '1.0.0';
const CACHE_ATUAL = `${NOME_CACHE}-${VERSAO_CACHE}`;

// ========== ARQUIVOS PARA SALVAR NO CACHE ==========
const ARQUIVOS_ESSENCIAIS = [
    './',
    './index.html',
    './loading.html',
    './manifest.json',
    './Assets/CSS/estilo.css',
    './Assets/JS/script.js',
    './Assets/IMG/logo.png',
    './Assets/IMG/icone-192.png',
    './Assets/IMG/icone-512.png',
    './paginas/header.html',
    './paginas/sidebar.html',
    './paginas/footer.html',
    './paginas/modal.html'
];

// ========== INSTALAÇÃO ==========
self.addEventListener('install', (evento) => {
    console.log('✅ Instalando Service Worker...');
    evento.waitUntil(
        caches.open(CACHE_ATUAL)
            .then(cache => {
                console.log('📂 Salvando arquivos no cache...');
                return cache.addAll(ARQUIVOS_ESSENCIAIS);
            })
            .then(() => self.skipWaiting())
    );
});

// ========== ATUALIZAÇÃO / LIMPEZA DE CACHE ANTIGO ==========
self.addEventListener('activate', (evento) => {
    console.log('✅ Ativando novo Service Worker...');
    evento.waitUntil(
        caches.keys().then(listaCaches => {
            return Promise.all(
                listaCaches.map(nomeCache => {
                    if (nomeCache !== CACHE_ATUAL) {
                        console.log('🗑️ Removendo cache antigo:', nomeCache);
                        return caches.delete(nomeCache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ========== BUSCAR ARQUIVOS (OFFLINE FIRST) ==========
self.addEventListener('fetch', (evento) => {
    evento.respondWith(
        caches.match(evento.request)
            .then(respostaCache => {
                // Se encontrar no cache, usa ele; senão busca na internet
                return respostaCache || fetch(evento.request)
                    .then(respostaInternet => {
                        return caches.open(CACHE_ATUAL)
                            .then(cache => {
                                cache.put(evento.request, respostaInternet.clone());
                                return respostaInternet;
                            });
                    });
            })
    );
});
