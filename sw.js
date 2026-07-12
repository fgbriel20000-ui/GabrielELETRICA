/* =========================================================
   GS ELÉTRICA — SERVICE WORKER
   Cacheia o "esqueleto" do app para funcionar offline.
   IMPORTANTE: sempre que adicionar/renomear uma página ou
   arquivo, aumente o NOME_CACHE (ex: v2, v3...) para forçar
   a atualização do cache nos aparelhos dos usuários.
   ========================================================= */

const NOME_CACHE = 'gs-eletrica-v4';

const ARQUIVOS_ESSENCIAIS = [
    './index.html',
    './manifest.json',
    './css/estilo.css',
    './js/componentes.js',
    './js/orcamentos.js',
    './js/clientes.js',
    './js/agenda.js',
    './componentes/header.html',
    './componentes/sidebar.html',
    './componentes/footer.html',
    './componentes/modal.html',
    './paginas/orcamentos.html',
    './paginas/clientes.html',
    './paginas/agenda.html',
    './paginas/mais.html',
    './js/mais.js',
    './icones/icone-192.png',
    './icones/icone-512.png'
];

// Instala o service worker e guarda os arquivos essenciais no cache
self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(NOME_CACHE).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
    );
    self.skipWaiting();
});

// Remove caches antigos quando uma nova versão é ativada
self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys().then((chaves) =>
            Promise.all(
                chaves
                    .filter((chave) => chave !== NOME_CACHE)
                    .map((chave) => caches.delete(chave))
            )
        )
    );
    self.clients.claim();
});

// Estratégia: tenta a rede primeiro; se falhar (sem internet), usa o cache
self.addEventListener('fetch', (evento) => {
    // Não intercepta chamadas para outros domínios (ex: fontes do Google, CDN do jsPDF)
    if (!evento.request.url.startsWith(self.location.origin)) return;

    evento.respondWith(
        fetch(evento.request)
            .then((resposta) => {
                const copia = resposta.clone();
                caches.open(NOME_CACHE).then((cache) => cache.put(evento.request, copia));
                return resposta;
            })
            .catch(() => caches.match(evento.request))
    );
});
