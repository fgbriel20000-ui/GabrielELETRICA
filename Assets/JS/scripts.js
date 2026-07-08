// =========================================
// GS ELETRICA V2K - SCRIPT PRINCIPAL
// Desenvolvido por Gabriel
// Coração do Sistema - Integração e Funcionalidades
// =========================================

// ========== CONTROLE DE TEMA ==========
function inicializarTema() {
    const temaSalvo = localStorage.getItem('gs-tema');
    if (temaSalvo === 'escuro') {
        document.body.classList.add('dark-mode');
    }
}

function alternarTema() {
    document.body.classList.toggle('dark-mode');
    const temaAtual = document.body.classList.contains('dark-mode') ? 'escuro' : 'claro';
    localStorage.setItem('gs-tema', temaAtual);
}

// ========== CARREGAMENTO AUTOMÁTICO DE COMPONENTES ==========
async function carregarComponentes() {
    const componentes = [
        { seletor: 'header', caminho: 'paginas/header.html' },
        { seletor: 'aside.sidebar', caminho: 'paginas/sidebar.html' },
        { seletor: 'footer', caminho: 'paginas/footer.html' },
        { seletor: '#modal-container', caminho: 'paginas/modal.html' }
    ];

    for (const comp of componentes) {
        const elemento = document.querySelector(comp.seletor);
        if (elemento) {
            try {
                const resposta = await fetch(comp.caminho);
                if (resposta.ok) {
                    elemento.innerHTML = await resposta.text();
                    // Re-vincula eventos após carregar componente
                    vincularEventosComponentes();
                }
            } catch (erro) {
                console.log(`ℹ️ Componente não carregado: ${comp.caminho}`, erro);
            }
        }
    }
}

// ========== EVENTOS DOS COMPONENTES ==========
function vincularEventosComponentes() {
    // Botão de tema
    document.querySelector('.btn-theme')?.addEventListener('click', alternarTema);
    
    // Botão do menu mobile
    document.getElementById('btn-menu-lateral')?.addEventListener('click', alternarSidebar);
}

// ========== CONTROLE DO MENU LATERAL ==========
function alternarSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('visivel');
}

// Fecha menu ao clicar fora em telas menores
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const btnMenu = document.getElementById('btn-menu-lateral');
    
    if (window.innerWidth <= 768 && sidebar?.classList.contains('visivel')) {
        if (!sidebar.contains(e.target) && !btnMenu?.contains(e.target)) {
            sidebar.classList.remove('visivel');
        }
    }
});

// ========== REGISTRO DO SERVICE WORKER / PWA ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registro => console.log('✅ Service Worker registrado com sucesso:', registro.scope))
            .catch(erro => console.log('❌ Erro ao registrar Service Worker:', erro));
    });
}

// ========== INICIALIZAÇÃO GERAL DO SISTEMA ==========
document.addEventListener('DOMContentLoaded', async () => {
    inicializarTema();
    await carregarComponentes();
    console.log('✅ Sistema GS Elétrica V2K inicializado com sucesso!');
});