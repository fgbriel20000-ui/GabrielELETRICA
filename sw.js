// =========================================
// GS ELETRICA V2K - SERVICE WORKER
// Desenvolvido por Gabriel
// Funcionamento Offline e PWA
// =========================================

const NOME_CACHE = 'gs-eletrica-v2k-cache-v1';
const ARQUIVOS_CACHE = [
    '/',
    '/index.html',
    '/Assets/CSS/estilo.css',
    '/Assets/JS/script.js',
    '/Assets/IMG/logo.png',
    '/Assets/IMG/icone-192.png',
    '/Assets/IMG/icone-512.png',
    '/manifest.json',
    '/paginas/calculadoras.html',
    '/paginas/orcamentos.html',
    '/paginas/recibos.html',
    '/paginas/clientes.html',
    '/paginas/agenda.html',
    '/paginas/biblioteca.html',
    '/paginas/ferramentas.html',
    '/paginas/configuracoes.html',
    '/paginas/modal.html',
    '/paginas/sidebar.html',
    '/paginas/footer.html',
    '/dados/aparelhos.json',
    '/dados/cabos.json',
    '/dados/clientes.json'
];

// INSTALAÇÃO: Armazena arquivos no cache
self.addEventListener('install', evento => {
    console.log('[Service Worker] Instalando...');
    evento.waitUntil(
        caches.open(NOME_CACHE)
            .then(cache => {
                console.log('[Service Worker] Arquivos em cache');
                return cache.addAll(ARQUIVOS_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// ATUALIZAÇÃO: Limpa cache antigo se houver nova versão
self.addEventListener('activate', evento => {
    console.log('[Service Worker] Ativando...');
    evento.waitUntil(
        caches.keys().then(listaCaches => {
            return Promise.all(
                listaCaches.filter(nome => nome !== NOME_CACHE)
                    .map(nomeAntigo => caches.delete(nomeAntigo))
            );
        }).then(() => self.clients.claim())
    );
});

// BUSCA: Responde com cache se disponível, senão busca na rede
self.addEventListener('fetch', evento => {
    evento.respondWith(
        caches.match(evento.request)
            .then(respostaCache => {
                // Retorna cache se encontrar, senão busca na rede
                return respostaCache || fetch(evento.request)
                    .then(respostaRede => {
                        // Armazena nova resposta no cache para próximas vezes
                        return caches.open(NOME_CACHE)
                            .then(cache => {
                                cache.put(evento.request, respostaRede.clone());
                                return respostaRede;
                            });
                    });
            })
            .catch(() => {
                // Fallback para página offline se não houver conexão
                if (evento.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});
