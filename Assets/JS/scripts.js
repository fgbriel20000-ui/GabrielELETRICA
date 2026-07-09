// Inicializa funções quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    menuAtivo();
    rolagemSuave();
    animarEntrada();
    efeitoBotoes();
});

// 1. Destaca item do menu da página atual
function menuAtivo() {
    const caminho = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === caminho) {
            link.style.color = '#FF7A00';
            link.style.borderBottom = '2px solid #FF7A00';
        }
    });
}

// 2. Rolagem suave para links internos
function rolagemSuave() {
    document.querySelectorAll('a[href^="#"]').forEach(ancora => {
        ancora.addEventListener('click', e => {
            e.preventDefault();
            const alvo = document.querySelector(ancora.getAttribute('href'));
            if (alvo) {
                alvo.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 3. Animação de entrada dos elementos ao rolar
function animarEntrada() {
    const elementos = document.querySelectorAll('.card, h2, .hero');
    
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.style.opacity = '1';
                entrada.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    elementos.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease';
        observador.observe(el);
    });
}

// 4. Efeito de clique nos botões
function efeitoBotoes() {
    document.querySelectorAll('.btn').forEach(botao => {
        botao.addEventListener('mousedown', () => {
            botao.style.transform = 'scale(0.97)';
        });
        botao.addEventListener('mouseup', () => {
            botao.style.transform = 'scale(1)';
        });
        botao.addEventListener('mouseleave', () => {
            botao.style.transform = 'scale(1)';
        });
    });
}
