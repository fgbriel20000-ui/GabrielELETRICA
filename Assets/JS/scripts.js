// =========================================
// GS ELETRICA V2K - SCRIPT PRINCIPAL
// Atualizado: Cores Laranja & Preto
// Desenvolvido por Gabriel
// =========================================

// ========== CONFIGURAÇÕES DE CORES (PADRÃO DO SISTEMA) ==========
const COR_DESTAQUE = '#ff7a00';
const COR_DESTAQUE_ESCURO = '#e65c00';
const COR_FUNDO = '#121212';
const COR_SUCESSO = '#22c55e';
const COR_ALERTA = '#f59e0b';
const COR_PERIGO = '#ef4444';

// ========== CONTROLE DE TEMA ==========
function inicializarTema() {
    const temaSalvo = localStorage.getItem('gs-tema');
    if (temaSalvo === 'claro') {
        document.body.classList.add('modo-claro');
    } else {
        // Mantém padrão escuro (Preto/Laranja)
        document.body.classList.remove('modo-claro');
    }
}

function alternarTema() {
    document.body.classList.toggle('modo-claro');
    const temaAtual = document.body.classList.contains('modo-claro') ? 'claro' : 'escuro';
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
                    vincularEventosComponentes();
                }
            } catch (erro) {
                console.log(`ℹ️ Componente: ${comp.caminho} não carregado`, erro);
            }
        }
    }
}

// ========== VINCULA EVENTOS AOS ELEMENTOS ==========
function vincularEventosComponentes() {
    // Botão de Tema
    document.querySelector('.btn-theme')?.addEventListener('click', alternarTema);
    
    // Botão Menu Mobile
    document.getElementById('btn-menu-lateral')?.addEventListener('click', alternarSidebar);
}

// ========== CONTROLE MENU LATERAL ==========
function alternarSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('visivel');
}

// Fecha menu ao clicar fora (celulares)
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const btnMenu = document.getElementById('btn-menu-lateral');
    
    if (window.innerWidth <= 768 && sidebar?.classList.contains('visivel')) {
        if (!sidebar.contains(e.target) && !btnMenu?.contains(e.target)) {
            sidebar.classList.remove('visivel');
        }
    }
});

// ========== REGISTRO PWA / SERVICE WORKER ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registro => console.log('✅ SW registrado:', registro.scope))
            .catch(erro => console.log('❌ Erro SW:', erro));
    });
}

// ========== INICIALIZAÇÃO GERAL ==========
document.addEventListener('DOMContentLoaded', async () => {
    inicializarTema();
    await carregarComponentes();
    console.log('✅ Sistema GS Elétrica V2K | Cores Laranja & Preto | Inicializado!');
});
