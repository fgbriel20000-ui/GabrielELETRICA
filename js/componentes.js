/* =========================================================
   GS ELÉTRICA — CARREGADOR DE COMPONENTES
   Injeta header, sidebar e footer via fetch() nas páginas
   ========================================================= */

async function carregarComponente(caminho, idDestino) {
    const destino = document.getElementById(idDestino);
    if (!destino) return;

    try {
        const resposta = await fetch(caminho);
        if (!resposta.ok) throw new Error(`Falha ao carregar ${caminho}`);
        destino.innerHTML = await resposta.text();
    } catch (erro) {
        console.error('[GS Elétrica] Erro ao carregar componente:', erro);
        destino.innerHTML = '<p style="padding:1rem;color:#E23D3D;">Não foi possível carregar este componente.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Cada página define data-base="./" ou "../" no <body> conforme a profundidade
    const base = document.body.dataset.base || './';

    carregarComponente(`${base}componentes/header.html`, 'gs-header');
    carregarComponente(`${base}componentes/sidebar.html`, 'gs-sidebar');
    carregarComponente(`${base}componentes/footer.html`, 'gs-footer');
    carregarComponente(`${base}componentes/modal.html`, 'gs-modal-slot');

    // Restaura tema salvo
    if (localStorage.getItem('gs-tema') === 'escuro') {
        document.body.classList.add('dark-mode');
    }

    // Registra o service worker (funcionamento offline / PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(`${base}sw.js`)
            .catch((erro) => console.error('[GS Elétrica] Falha ao registrar service worker:', erro));
    }
});
