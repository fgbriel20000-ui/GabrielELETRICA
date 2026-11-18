/* =========================================================
   GS ELÉTRICA — CARREGADOR DE COMPONENTES
   Injeta header, sidebar e footer via fetch() nas páginas
   ========================================================= */

/* =========================================================
   GS ELÉTRICA — SENHA DE ACESSO (tela de bloqueio)
   Protege o app contra quem pegar o seu celular.
   ========================================================= */
(function () {
    const CH_HASH = 'gs-senha-hash';
    const CH_SAL = 'gs-senha-sal';
    const CH_SESSAO = 'gs-desbloqueado';

    if (!window.crypto || !window.crypto.subtle) return; // sem suporte (precisa de https)

    function paraHex(buffer) {
        return Array.from(new Uint8Array(buffer)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    async function calcularHash(senha, sal) {
        const dados = new TextEncoder().encode(sal + ':' + senha);
        return paraHex(await crypto.subtle.digest('SHA-256', dados));
    }

    window.gsSenha = {
        existe: function () { return !!localStorage.getItem(CH_HASH); },
        definir: async function (senha) {
            const sal = paraHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
            localStorage.setItem(CH_SAL, sal);
            localStorage.setItem(CH_HASH, await calcularHash(senha, sal));
            sessionStorage.setItem(CH_SESSAO, '1');
        },
        remover: function () {
            localStorage.removeItem(CH_HASH);
            localStorage.removeItem(CH_SAL);
        }
    };

    function mostrarBloqueio() {
        const tela = document.createElement('div');
        tela.id = 'gs-bloqueio';
        tela.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#0B1F3A;color:#fff;display:flex;align-items:center;justify-content:center;padding:1.5rem;font-family:Inter,system-ui,sans-serif;';
        tela.innerHTML =
            '<div style="width:100%;max-width:340px;text-align:center;">' +
            '<div style="font-size:2.5rem;">🔒</div>' +
            '<h1 style="font-size:1.4rem;margin:0.5rem 0 0.25rem;">GS Elétrica</h1>' +
            '<p style="opacity:0.8;margin-bottom:1rem;">Digite sua senha para entrar</p>' +
            '<input id="gs-bloqueio-senha" type="password" autocomplete="current-password" style="width:100%;box-sizing:border-box;padding:0.85rem;border-radius:10px;border:none;font-size:1rem;text-align:center;margin-bottom:0.75rem;">' +
            '<button id="gs-bloqueio-entrar" type="button" style="width:100%;padding:0.85rem;border-radius:10px;border:none;background:#FFC21A;color:#101828;font-weight:700;font-size:1rem;cursor:pointer;">Entrar</button>' +
            '<p id="gs-bloqueio-erro" style="color:#ff8a8a;min-height:1.4rem;margin-top:0.75rem;"></p>' +
            '<button id="gs-bloqueio-esqueci" type="button" style="background:none;border:none;color:#fff;opacity:0.7;text-decoration:underline;cursor:pointer;">Esqueci a senha</button>' +
            '</div>';
        document.body.appendChild(tela);
        document.body.style.overflow = 'hidden';

        const campo = document.getElementById('gs-bloqueio-senha');
        const erro = document.getElementById('gs-bloqueio-erro');
        let tentativas = 0;
        let bloqueadoAte = 0;

        async function tentar() {
            const agora = Date.now();
            if (agora < bloqueadoAte) {
                erro.textContent = 'Aguarde ' + Math.ceil((bloqueadoAte - agora) / 1000) + 's para tentar de novo.';
                return;
            }
            const hash = await calcularHash(campo.value, localStorage.getItem(CH_SAL) || '');
            if (hash === localStorage.getItem(CH_HASH)) {
                sessionStorage.setItem(CH_SESSAO, '1');
                tela.remove();
                document.body.style.overflow = '';
                return;
            }
            campo.value = '';
            tentativas++;
            if (tentativas >= 5) {
                tentativas = 0;
                bloqueadoAte = Date.now() + 30000;
                erro.textContent = 'Muitas tentativas. Aguarde 30 segundos.';
            } else {
                erro.textContent = 'Senha incorreta.';
            }
        }

        document.getElementById('gs-bloqueio-entrar').addEventListener('click', tentar);
        campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') tentar(); });

        document.getElementById('gs-bloqueio-esqueci').addEventListener('click', function () {
            const ok = confirm('Sem a senha, o único jeito de entrar é APAGAR todos os dados deste aparelho (orçamentos, clientes, agenda, assinatura). Só faça isso se você tem um backup. Apagar tudo?');
            if (!ok) return;
            Object.keys(localStorage).filter(function (k) { return k.indexOf('gs-') === 0; })
                .forEach(function (k) { localStorage.removeItem(k); });
            sessionStorage.clear();
            window.location.reload();
        });

        campo.focus();
    }

    if (window.gsSenha.existe() && sessionStorage.getItem(CH_SESSAO) !== '1') {
        if (document.body) mostrarBloqueio();
        else document.addEventListener('DOMContentLoaded', mostrarBloqueio);
    }
})();

async function carregarComponente(caminho, idDestino) {
    const destino = document.getElementById(idDestino);
    if (!destino) return;

    try {
        const resposta = await fetch(caminho);
        if (!resposta.ok) throw new Error(`Falha ao carregar ${caminho}`);
        destino.innerHTML = await resposta.text();
        executarScripts(destino);
    } catch (erro) {
        console.error('[GS Elétrica] Erro ao carregar componente:', erro);
        destino.innerHTML = '<p style="padding:1rem;color:#E23D3D;">Não foi possível carregar este componente.</p>';
    }
}

// Scripts inseridos via innerHTML NÃO são executados pelo navegador —
// isso é um comportamento padrão (e uma pegadinha bem comum) do JavaScript.
// Esta função recria cada <script> encontrado dentro do componente recém-carregado
// para que o código lá dentro (menu, tema, links, modal etc.) realmente rode.
function executarScripts(container) {
    container.querySelectorAll('script').forEach((scriptAntigo) => {
        const scriptNovo = document.createElement('script');
        Array.from(scriptAntigo.attributes).forEach((attr) => {
            scriptNovo.setAttribute(attr.name, attr.value);
        });
        scriptNovo.textContent = scriptAntigo.textContent;
        scriptAntigo.replaceWith(scriptNovo);
    });
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
