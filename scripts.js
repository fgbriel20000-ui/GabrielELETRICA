/* =============================================
   SCRIPTS.JS - GS ELETRO
   Código Completo | Versão Profissional
   Mais de 900 linhas | Padrão Oficial do Projeto
   ============================================= */

'use strict';

/* ========== OBJETO DE CONFIGURAÇÕES GLOBAIS ========== */
const CONFIG_GS = {
    projetoNome: 'GS Eletro',
    versao: '2.0.0',
    dataAtualizacao: '09/07/2026',
    alturaCabecalhoFixo: 80,
    velocidadeRolagemSuave: 800,
    tempoAnimacaoEntrada: 600,
    atinjjkjjjjjvarModoDebug: false,
    mensagens: {
        envioSucesso: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        calculoSucesso: 'Cálculo realizado com sucesso!',
        preenchaCampos: 'Por favor, preencha todos os campos corretamente.',
        valorInvalido: 'Valor inválido! Verifique os dados informados.',
        operacaoConcluida: 'Operação concluída com êxito!',
        erroProcessamento: 'Ocorreu um erro durante o processamento. Tente novamente mais tarde.',
        confirmacaoAcao: 'Tem certeza que deseja realizar esta ação?',
        dadosSalvos: 'Dados salvos com sucesso no armazenamento local!'
    }
};

/* ========== OBJETO PRINCIPAL DA APLICAÇÃO ========== */
const AppGS = {
    estado: {
        menuAberto: false,
        secaoAtual: 'inicio',
        tamanhoTela: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 992 ? 'tablet' : 'desktop',
        dadosFormularios: {},
        cacheCalculos: []
    },

    inicializar: function() {
        this.log('Inicializando aplicação GS Eletro...');
        this.capturarElementosDOM();
        this.configurarEventosPrincipais();
        this.inicializarModulos();
        this.log('Aplicação inicializada com sucesso!');
    },

    log: function(mensagem, tipo = 'info') {
        if (!CONFIG_GS.ativarModoDebug) return;
        const cores = {
            info: 'color: #FF7A00; font-weight: bold;',
            sucesso: 'color: #22C55E; font-weight: bold;',
            aviso: 'color: #F59E0B; font-weight: bold;',
            erro: 'color: #EF4444; font-weight: bold;'
        };
        console.log(`%c[GS Eletro] ${mensagem}`, cores[tipo] || cores.info);
    },

    capturarElementosDOM: function() {
        this.elementos = {
            header: document.querySelector('header'),
            menuNavegacao: document.querySelector('nav ul'),
            botaoMenuMobile: document.querySelector('.menu-mobile'),
            iconeMenuMobile: document.querySelector('.menu-mobile i'),
            linksNavegacao: document.querySelectorAll('nav a'),
            linksAncora: document.querySelectorAll('a[href^="#"]'),
            todasSecoes: document.querySelectorAll('section[id]'),
            botoes: document.querySelectorAll('.btn-amarelo, .btn-azul, .btn-calcular'),
            formularios: document.querySelectorAll('form'),
            cardsAnimaveis: document.querySelectorAll('.card-servico, .card-calculadora, .card-tabela, .card-gestao, .foto, .card-avaliacao, .card-blog, .item'),
            imagensComEfeito: document.querySelectorAll('.galeria-grid img'),
            titulosSecoes: document.querySelectorAll('.titulo h2'),
            rodape: document.querySelector('footer')
        };
        this.log('Elementos do DOM capturados', 'sucesso');
    },

    configurarEventosPrincipais: function() {
        window.addEventListener('DOMContentLoaded', () => this.inicializar());
        window.addEventListener('load', () => this.aoCarregarPagina());
        window.addEventListener('scroll', () => this.aoRolarPagina());
        window.addEventListener('resize', () => this.aoRedimensionarTela());
        document.addEventListener('click', (e) => this.aoClicarDocumento(e));
        document.addEventListener('keydown', (e) => this.aoPressionarTecla(e));
        this.log('Eventos principais configurados', 'sucesso');
    },

    inicializarModulos: function() {
        MenuMobile.inicializar();
        NavegacaoSuave.inicializar();
        DestaqueSecao.inicializar();
        AnimacoesEntrada.inicializar();
        Formularios.inicializar();
        CalculadorasBase.inicializar();
        EfeitosInteracao.inicializar();
        ArmazenamentoLocal.inicializar();
        this.log('Módulos do sistema inicializados', 'sucesso');
    },

    aoCarregarPagina: function() {
        document.body.classList.add('pagina-carregada');
        AnimacoesEntrada.executarAnimacaoInicial();
        this.verificarParametrosURL();
        this.log('Página totalmente carregada', 'sucesso');
    },

    aoRolarPagina: function() {
        const posicaoRolagem = window.scrollY;
        this.ajustarCabecalho(posicaoRolagem);
        DestaqueSecao.verificarSecaoAtual(posicaoRolagem);
    },

    aoRedimensionarTela: function() {
        const novoTamanho = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 992 ? 'tablet' : 'desktop';
        if (novoTamanho !== this.estado.tamanhoTela) {
            this.estado.tamanhoTela = novoTamanho;
            this.log(`Tamanho de tela alterado para: ${novoTamanho}`);
            MenuMobile.ajustarVisibilidadePorTela();
        }
    },

    aoClicarDocumento: function(evento) {
        MenuMobile.verificarFecharFora(evento);
    },

    aoPressionarTecla: function(evento) {
        if (evento.key === 'Escape' && this.estado.menuAberto) {
            MenuMobile.fechar();
        }
    },

    ajustarCabecalho: function(posicao) {
        if (posicao > 50) {
            this.elementos.header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25)';
            this.elementos.header.style.padding = '0.8rem 5%';
        } else {
            this.elementos.header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
            this.elementos.header.style.padding = '1rem 5%';
        }
    },

    verificarParametrosURL: function() {
        const parametros = new URLSearchParams(window.location.search);
        if (parametros.has('sucesso')) {
            this.mostrarNotificacao(CONFIG_GS.mensagens.operacaoConcluida, 'sucesso');
        }
    },

    mostrarNotificacao: function(mensagem, tipo = 'info', duracao = 4000) {
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao-gs notificacao-${tipo}`;
        notificacao.innerHTML = `
            <div class="icone-notificacao">
                <i class="fa-solid ${tipo === 'sucesso' ? 'fa-circle-check' : tipo === 'erro' ? 'fa-circle-xmark' : tipo === 'aviso' ? 'fa-triangle-exclamation' : 'fa-info-circle'}"></i>
            </div>
            <div class="texto-notificacao">${mensagem}</div>
            <button class="fechar-notificacao"><i class="fa-solid fa-xmark"></i></button>
        `;
        document.body.appendChild(notificacao);
        
        setTimeout(() => notificacao.classList.add('ativa'), 10);
        
        const removerNotificacao = () => {
            notificacao.classList.remove('ativa');
            setTimeout(() => notificacao.remove(), 300);
        };
        
        notificacao.querySelector('.fechar-notificacao').addEventListener('click', removerNotificacao);
        setTimeout(removerNotificacao, duracao);
    }
};

/* =============================================
   MÓDULO: CONTROLE DO MENU MOBILE
   ============================================= */
const MenuMobile = {
    inicializado: false,

    inicializar: function() {
        if (this.inicializado) return;
        this.vincularEventos();
        this.ajustarVisibilidadePorTela();
        this.inicializado = true;
        AppGS.log('Módulo Menu Mobile carregado', 'sucesso');
    },

    vincularEventos: function() {
        if (AppGS.elementos.botaoMenuMobile) {
            AppGS.elementos.botaoMenuMobile.addEventListener('click', () => this.alternar());
        }

        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (AppGS.estado.menuAberto) this.fechar();
            });
        });
    },

    alternar: function() {
        AppGS.estado.menuAberto ? this.fechar() : this.abrir();
    },

    abrir: function() {
        AppGS.estado.menuAberto = true;
        AppGS.elementos.menuNavegacao.classList.add('aberto');
        AppGS.elementos.iconeMenuMobile.classList.remove('fa-bars');
        AppGS.elementos.iconeMenuMobile.classList.add('fa-xmark');
        document.body.style.overflow = 'hidden';
        AppGS.log('Menu aberto');
    },

    fechar: function() {
        AppGS.estado.menuAberto = false;
        AppGS.elementos.menuNavegacao.classList.remove('aberto');
        AppGS.elementos.iconeMenuMobile.classList.remove('fa-xmark');
        AppGS.elementos.iconeMenuMobile.classList.add('fa-bars');
        document.body.style.overflow = '';
        AppGS.log('Menu fechado');
    },

    verificarFecharFora: function(evento) {
        if (!AppGS.estado.menuAberto) return;
        const clicouForaMenu = !AppGS.elementos.menuNavegacao.contains(evento.target);
        const clicouForaBotao = !AppGS.elementos.botaoMenuMobile.contains(evento.target);
        if (clicouForaMenu && clicouForaBotao) this.fechar();
    },

    ajustarVisibilidadePorTela: function() {
        if (AppGS.estado.tamanhoTela !== 'mobile' && AppGS.estado.menuAberto) {
            this.fechar();
        }
    }
};

/* =============================================
   MÓDULO: NAVEGAÇÃO SUAVE E LINKS
   ============================================= */
const NavegacaoSuave = {
    inicializado: false,

    inicializar: function() {
        if (this.inicializado) return;
        this.configurarLinksAncora();
        this.inicializado = true;
        AppGS.log('Módulo Navegação Suave carregado', 'sucesso');
    },

    configurarLinksAncora: function() {
        AppGS.elementos.linksAncora.forEach(link => {
            link.addEventListener('click', (e) => this.aoClicarLink(e, link));
        });
    },

    aoClicarLink: function(evento, link) {
        const alvoId = link.getAttribute('href');
        
        if (!alvoId || alvoId === '#' || !alvoId.startsWith('#')) return;
        
        evento.preventDefault();
        const secaoAlvo = document.querySelector(alvoId);
        
        if (!secaoAlvo) {
            AppGS.log(`Seção não encontrada: ${alvoId}`, 'aviso');
            return;
        }

        this.rolarParaElemento(secaoAlvo);
    },

    rolarParaElemento: function(elemento) {
        const alturaCabecalho = AppGS.elementos.header.offsetHeight || CONFIG_GS.alturaCabecalhoFixo;
        const posicaoFinal = elemento.offsetTop - alturaCabecalho;

        window.scrollTo({
            top: posicaoFinal,
            behavior: 'smooth'
        });

        setTimeout(() => {
            history.pushState(null, null, window.location.pathname + elemento.id);
        }, CONFIG_GS.velocidadeRolagemSuave);
    }
};

/* =============================================
   MÓDULO: DESTAQUE DA SEÇÃO ATUAL NO MENU
   ============================================= */
const DestaqueSecao = {
    inicializado: false,

    inicializar: function() {
        if (this.inicializado) return;
        this.inicializado = true;
        AppGS.log('Módulo Destaque de Seção carregado', 'sucesso');
    },

    verificarSecaoAtual: function(posicaoRolagem) {
        let secaoEncontrada = 'inicio';
        const alturaCabecalho = AppGS.elementos.header.offsetHeight || CONFIG_GS.alturaCabecalhoFixo;
        const offsetAjuste = 150;

        AppGS.elementos.todasSecoes.forEach(secao => {
            const topoSecao = secao.offsetTop - alturaCabecalho - offsetAjuste;
            if (posicaoRolagem >= topoSecao) {
                secaoEncontrada = secao.getAttribute('id');
            }
        });

        if (secaoEncontrada !== AppGS.estado.secaoAtual) {
            AppGS.estado.secaoAtual = secaoEncontrada;
            this.atualizarDestaqueMenu(secaoEncontrada);
        }
    },

    atualizarDestaqueMenu: function(idSecao) {
        AppGS.elementos.linksNavegacao.forEach(link => {
            link.style.color = '';
            link.style.borderBottom = '';
            
            const referencia = link.getAttribute('href');
            if (referencia === `#${idSecao}`) {
                link.style.color = '#FF7A00';
                link.style.borderBottom = '2px solid #FF7A00';
            }
        });
    }
};

/* =============================================
   MÓDULO: ANIMAÇÕES DE ENTRADA E EFEITOS
   ============================================= */
const AnimacoesEntrada = {
    inicializado: false,
    observador: null,

    inicializar: function() {
        if (this.inicializado) return;
        this.prepararElementos();
        this.criarObservadorInterseccao();
        this.inicializado = true;
        AppGS.log('Módulo Animações carregado', 'sucesso');
    },

    prepararElementos: function() {
        AppGS.elementos.cardsAnimaveis.forEach((elemento, indice) => {
            elemento.style.opacity = '0';
            elemento.style.transform = 'translateY(30px)';
            elemento.style.transition = `all ${CONFIG_GS.tempoAnimacaoEntrada}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${indice * 80}ms`;
        });
    },

    criarObservadorInterseccao: function() {
        this.observador = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    entrada.target.style.opacity = '1';
                    entrada.target.style.transform = 'translateY(0)';
                    this.observador.unobserve(entrada.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -80px 0px'
        });

        AppGS.elementos.cardsAnimaveis.forEach(elemento => {
            this.observador.observe(elemento);
        });
    },

    executarAnimacaoInicial: function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.8s ease';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    }
};

/* =============================================
   MÓDULO: GERENCIAMENTO DE FORMULÁRIOS
   ============================================= */
const Formularios = {
    inicializado: false,

    inicializar: function() {
        if (this.inicializado) return;
        this.configurarTodosFormularios();
        this.inicializado = true;
        AppGS.log('Módulo Formulários carregado', 'sucesso');
    },

    configurarTodosFormularios: function() {
        AppGS.elementos.formularios.forEach(form => {
            form.addEventListener('submit', (e) => this.aoSubmeterFormulario(e, form));
            this.configurarCamposFormulario(form);
        });
    },

    configurarCamposFormulario: function(form) {
        const campos = form.querySelectorAll('input, select, textarea');
        campos.forEach(campo => {
            campo.addEventListener('blur', () => this.validarCampo(campo));
            campo.addEventListener('input', () => {
                if (campo.classList.contains('campo-invalido')) {
                    this.validarCampo(campo);
                }
            });
        });
    },

    validarCampo: function(campo) {
        const valor = campo.value.trim();
        let valido = true;
        let mensagemErro = '';

        if (campo.hasAttribute('required') && valor === '') {
            valido = false;
            mensagemErro = 'Este campo é obrigatório';
        } else if (campo.type === 'email' && valor !== '') {
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(valor)) {
                valido = false;
                mensagemErro = 'Informe um e-mail válido';
            }
        } else if (campo.type === 'tel' && valor !== '') {
            const apenasNumeros = valor.replace(/\D/g, '');
            if (apenasNumeros.length < 10) {
                valido = false;
                mensagemErro = 'Informe um telefone válido com DDD';
            }
        } else if (campo.type === 'number' && valor !== '') {
            const numero = parseFloat(valor);
            if (isNaN(numero) || numero <= 0) {
                valido = false;
                mensagemErro = 'Informe um valor numérico positivo';
            }
        }

        if (!valido) {
            campo.classList.add('campo-invalido');
            campo.classList.remove('campo-valido');
            this.mostrarMensagemErroCampo(campo, mensagemErro);
        } else {
            campo.classList.remove('campo-invalido');
            campo.classList.add('campo-valido');
            this.removerMensagemErroCampo(campo);
        }

        return valido;
    },

    mostrarMensagemErroCampo: function(campo, mensagem) {
        this.removerMensagemErroCampo(campo);
        const elementoErro = document.createElement('span');
        elementoErro.className = 'mensagem-erro-campo';
        elementoErro.textContent = mensagem;
        campo.parentNode.appendChild(elementoErro);
    },

    removerMensagemErroCampo: function(campo) {
        const mensagemExistente = campo.parentNode.querySelector('.mensagem-erro-campo');
        if (mensagemExistente) mensagemExistente.remove();
    },

    aoSubmeterFormulario: function(evento, form) {
        evento.preventDefault();
        let formularioValido = true;
        const campos = form.querySelectorAll('input, select, textarea');

        campos.forEach(campo => {
            if (!this.validarCampo(campo)) formularioValido = false;
        });

        if (!formularioValido) {
            AppGS.mostrarNotificacao(CONFIG_GS.mensagens.preenchaCampos, 'erro');
            return;
        }

        this.processarEnvio(form);
    },

    processarEnvio: function(form) {
        const botaoEnvio = form.querySelector('button[type="submit"]');
        const textoOriginal = botaoEnvio.textContent;
        botaoEnvio.textContent = 'Processando...';
        botaoEnvio.disabled = true;

        const dadosForm = new FormData(form);
        const objetoDados = Object.fromEntries(dadosForm);
        AppGS.estado.dadosFormularios = objetoDados;

        setTimeout(() => {
            AppGS.mostrarNotificacao(CONFIG_GS.mensagens.envioSucesso, 'sucesso');
            form.reset();
            botaoEnvio.textContent = textoOriginal;
            botaoEnvio.disabled = false;
        }, 1800);
    }
};

/* =============================================
   MÓDULO: BASE PARA TODAS AS CALCULADORAS
   ============================================= */
const CalculadorasBase = {
    inicializado: false,

    inicializar: function() {
        if (this.inicializado) return;
        this.inicializado = true;
        AppGS.log('Módulo Base Calculadoras carregado', 'sucesso');
    },

    validarEntradasCalculo: function(campos) {
        for (let i = 0; i < campos.length; i++) {
            const valor = parseFloat(campos[i].value);
            if (isNaN(valor) || valor <= 0) {
                AppGS.mostrarNotificacao(CONFIG_GS.mensagens.valorInvalido, 'erro');
                campos[i].focus();
                return false;
            }
        }
        return true;
    },

    formatarValorNumerico: function(valor, casasDecimais = 2) {
        return Number(valor.toFixed(casasDecimais)).toLocaleString('pt-BR', {
            minimumFractionDigits: casasDecimais,
            maximumFractionDigits: casasDecimais
        });
    },

    salvarUltimoCalculo: function(tipo, parametros, resultados) {
        const registro = {
            data: new Date().toLocaleString('pt-BR'),
            tipoCalculo: tipo,
            parametros: parametros,
            resultados: resultados
        };
        AppGS.estado.cacheCalculos.push(registro);
        if (AppGS.estado.cacheCalculos.length > 15) {
            AppGS.estado.cacheCalculos.shift();
        }
        ArmazenamentoLocal.salvarDados('historicoCalculos', AppGS.estado.cacheCalculos);
    }
};

/* =============================================
   MÓDULO: EFEITOS DE INTERAÇÃO E USABILIDADE
   ============================================= */
const EfeitosInteracao = {
    inicializado: false,

    inicializar: function() {
        if (this.inicializado) return;
        this.efeitoBotoes();
        this.efeitoImagensGaleria();
        this.rolagemTopoPagina();
        this.inicializado = true;
        AppGS.log('Módulo Efeitos de Interação carregado', 'sucesso');
    },

    efeitoBotoes: function() {
        AppGS.elementos.botoes.forEach(botao => {
            botao.addEventListener('mousedown', function() {
                this.style.transform = 'scale(0.97)';
            });
            botao.addEventListener('mouseup', function() {
                this.style.transform = '';
            });
            botao.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    },

    efeitoImagensGaleria: function() {
        AppGS.elementos.imagensComEfeito.forEach(imagem => {
            imagem.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.08)';
                this.style.transition = 'transform 0.4s ease';
            });
            imagem.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    },

    rolagemTopoPagina: function() {
        const botaoTopo = document.createElement('button');
        botaoTopo.id = 'botao-voltar-topo';
        botaoTopo.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        botaoTopo.title = 'Voltar ao topo da página';
        botaoTopo.style.cssText = `
            position: fixed; bottom: 25px; right: 25px; width: 50px; height: 50px;
            background-color: #FF7A00; color: #111; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.3rem; font-weight: bold; cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 122, 0, 0.4);
            z-index: 998; opacity: 0; visibility: hidden;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(botaoTopo);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                botaoTopo.style.opacity = '1';
                botaoTopo.style.visibility = 'visible';
            } else {
                botaoTopo.style.opacity = '0';
                botaoTopo.style.visibility = 'hidden';
            }
        });

        botaoTopo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        botaoTopo.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#E66C00';
            this.style.transform = 'translateY(-3px)';
        });

        botaoTopo.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#FF7A00';
            this.style.transform = '';
        });
    }
};

/* =============================================
   MÓDULO: ARMAZENAMENTO LOCAL DO NAVEGADOR
   ============================================= */
const ArmazenamentoLocal = {
    inicializado: false,
    suportado: false,

    inicializar: function() {
        if (this.inicializado) return;
        this.verificarSuporte();
        this.carregarDadosSalvos();
        this.inicializado = true;
        AppGS.log('Módulo Armazenamento Local carregado', 'sucesso');
    },

    verificarSuporte: function() {
        try {
            const teste = '__gs_eletro_teste__';
            localStorage.setItem(teste, teste);
            localStorage.removeItem(teste);
            this.suportado = true;
        } catch (erro) {
            this.suportado = false;
            AppGS.log('Armazenamento local não suportado pelo navegador', 'aviso');
        }
    },

    salvarDados: function(chave, valor) {
        if (!this.suportado) return false;
        try {
            const dadosParaSalvar = JSON.stringify(valor);
            localStorage.setItem(`gs_eletro_${chave}`, dadosParaSalvar);
            return true;
        } catch (erro) {
            AppGS.log(`Erro ao salvar dados: ${erro}`, 'erro');
            return false;
        }
    },

    carregarDados: function(chave) {
        if (!this.suportado) return null;
        try {
            const dadosCarregados = localStorage.getItem(`gs_eletro_${chave}`);
            return dadosCarregados ? JSON.parse(dadosCarregados) : null;
        } catch (erro) {
            AppGS.log(`Erro ao carregar dados: ${erro}`, 'erro');
            return null;
        }
    },

    removerDados: function(chave) {
        if (!this.suportado) return false;
        localStorage.removeItem(`gs_eletro_${chave}`);
        return true;
    },

    carregarDadosSalvos: function() {
        const historico = this.carregarDados('historicoCalculos');
        if (historico) AppGS.estado.cacheCalculos = historico;
    }
};

/* =============================================
   FUNÇÕES COMPLEMENTARES E UTILITÁRIAS GERAIS
   ============================================= */
function formatarDataBrasil(data = new Date()) {
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function formatarHoraBrasil(data = new Date()) {
    return data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function gerarIdentificadorUnico() {
    const data = Date.now().toString(36);
    const aleatorio = Math.random().toString(36).substring(2, 10);
    return `${data}_${aleatorio}`.toUpperCase();
}

function converterParaMoedaBrasileira(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '' || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    if (digito2 !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj === '' || cnpj.length !== 14) return false;
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho += 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
}

function mascararTelefone(campo) {
    let valor = campo.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    
    if (valor.length > 6) {
        valor = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7)}`;
    } else if (valor.length > 2) {
        valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
    } else if (valor.length > 0) {
        valor = `(${valor}`;
    }
    
    campo.value = valor;
}

function mascararCPF(campo) {
    let valor = campo.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    
    if (valor.length > 9) {
        valor = `${valor.substring(0, 3)}.${valor.substring(3, 6)}.${valor.substring(6, 9)}-${valor.substring(9)}`;
    } else if (valor.length > 6) {
        valor = `${valor.substring(0, 3)}.${valor.substring(3, 6)}.${valor.substring(6)}`;
    } else if (valor.length > 3) {
        valor = `${valor.substring(0, 3)}.${valor.substring(3)}`;
    }
    
    campo.value = valor;
}

function confirmarAcao(mensagem) {
    return new Promise((resolver) => {
        const confirmacao = window.confirm(mensagem || CONFIG_GS.mensagens.confirmacaoAcao);
        resolver(confirmacao);
    });
}

/* =============================================
   INICIALIZAÇÃO GLOBAL E FIM DO ARQUIVO
   ============================================= */
console.log(`%c=============================================
   ${CONFIG_GS.projetoNome} | Versão ${CONFIG_GS.versao}
   Atualizado em: ${CONFIG_GS.dataAtualizacao}
=============================================`, 'color: #FF7A00; font-size: 14px; font-weight: bold;');

if (typeof AppGS !== 'undefined' && AppGS.inicializar) {
    AppGS.inicializar();
}

/* =============================================
   MÓDULO: BARRA DE PROGRESSO DA PÁGINA
============================================= */

const BarraProgresso = {

    barra: null,

    inicializar() {

        this.criar();

        window.addEventListener("scroll", () => this.atualizar());

        AppGS.log("Barra de progresso carregada","sucesso");

    },

    criar() {

        this.barra = document.createElement("div");

        this.barra.id = "gs-barra-progresso";

        this.barra.style.cssText = `
            position:fixed;
            top:0;
            left:0;
            width:0%;
            height:4px;
            background:linear-gradient(90deg,#FFD400,#FF7A00,#0066CC);
            z-index:999999;
            transition:width .15s linear;
        `;

        document.body.appendChild(this.barra);

    },

    atualizar(){

        const topo = window.scrollY;

        const altura =
        document.documentElement.scrollHeight -
        window.innerHeight;

        const porcentagem =

        (topo/altura)*100;

        this.barra.style.width = porcentagem+"%";

    }

};

/* =============================================
   MÓDULO BOTÃO WHATSAPP
============================================= */

const WhatsAppFlutuante={

    numero:"5584996130508",

    mensagem:"Olá! Gostaria de solicitar um orçamento.",

    botao:null,

    inicializar(){

        this.criar();

        AppGS.log("WhatsApp carregado","sucesso");

    },

    criar(){

        this.botao=document.createElement("a");

        this.botao.href=
        `https://wa.me/${this.numero}?text=${encodeURIComponent(this.mensagem)}`;

        this.botao.target="_blank";

        this.botao.id="gs-whatsapp";

        this.botao.innerHTML=
        `<i class="fa-brands fa-whatsapp"></i>`;

        this.botao.style.cssText=`

            position:fixed;

            bottom:90px;

            right:25px;

            width:62px;

            height:62px;

            border-radius:50%;

            background:#25D366;

            color:#fff;

            display:flex;

            justify-content:center;

            align-items:center;

            font-size:34px;

            box-shadow:0 8px 25px rgba(0,0,0,.30);

            z-index:999;

            transition:.35s;

            text-decoration:none;

        `;

        document.body.appendChild(this.botao);

        this.botao.addEventListener("mouseenter",()=>{

            this.botao.style.transform="scale(1.1)";

        });

        this.botao.addEventListener("mouseleave",()=>{

            this.botao.style.transform="scale(1)";

        });

    }

};

/* =============================================
      CONTADORES ANIMADOS
============================================= */

const ContadoresGS={

    inicializar(){

        const numeros=document.querySelectorAll("[data-contador]");

        if(!numeros.length)return;

        const observador=new IntersectionObserver((entradas)=>{

            entradas.forEach((entrada)=>{

                if(!entrada.isIntersecting)return;

                this.animar(entrada.target);

                observador.unobserve(entrada.target);

            });

        });

        numeros.forEach(n=>observador.observe(n));

    },

    animar(elemento){

        const final=parseInt(elemento.dataset.contador);

        let atual=0;

        const velocidade=Math.max(10,Math.floor(final/100));

        const intervalo=setInterval(()=>{

            atual+=velocidade;

            if(atual>=final){

                atual=final;

                clearInterval(intervalo);

            }

            elemento.textContent=atual;

        },20);

    }

};

/* =============================================
    INICIALIZA NOVOS MÓDULOS
============================================= */

window.addEventListener("load",()=>{

    BarraProgresso.inicializar();

    WhatsAppFlutuante.inicializar();

    ContadoresGS.inicializar();

});

/* =============================================
   MÓDULO: LOADER DA PÁGINA
============================================= */

const LoaderGS = {

    tela: null,

    inicializar() {

        this.criar();

        window.addEventListener("load", () => {

            setTimeout(() => {

                this.tela.style.opacity = "0";

                setTimeout(() => {

                    this.tela.remove();

                },500);

            },600);

        });

    },

    criar() {

        this.tela = document.createElement("div");

        this.tela.id = "gs-loader";

        this.tela.innerHTML = `

        <div class="gs-loader-centro">

            <div class="gs-loader-logo">

                <i class="fa-solid fa-bolt"></i>

            </div>

            <h2>GS Eletro</h2>

            <span>Carregando...</span>

        </div>

        `;

        this.tela.style.cssText = `

        position:fixed;

        inset:0;

        background:#111;

        display:flex;

        justify-content:center;

        align-items:center;

        z-index:9999999;

        transition:.5s;

        `;

        document.body.appendChild(this.tela);

    }

};

/* =============================================
      REVEAL AVANÇADO
============================================= */

const RevealGS = {

    iniciar() {

        const elementos = document.querySelectorAll(

        ".card-servico,.card-calculadora,.card-tabela,.card-blog,.card-avaliacao,.item,.foto"

        );

        const observador = new IntersectionObserver((itens)=>{

            itens.forEach(item=>{

                if(item.isIntersecting){

                    item.target.style.opacity="1";

                    item.target.style.transform="translateY(0)";

                }

            });

        },{

            threshold:.15

        });

        elementos.forEach(el=>{

            el.style.opacity="0";

            el.style.transform="translateY(40px)";

            el.style.transition=".8s";

            observador.observe(el);

        });

    }

};

/* =============================================
      LAZY LOAD DAS IMAGENS
============================================= */

const LazyImagesGS={

    iniciar(){

        const imagens=document.querySelectorAll("img[data-src]");

        if(!imagens.length)return;

        const observador=new IntersectionObserver((entradas)=>{

            entradas.forEach((entrada)=>{

                if(!entrada.isIntersecting)return;

                entrada.target.src=entrada.target.dataset.src;

                entrada.target.removeAttribute("data-src");

                observador.unobserve(entrada.target);

            });

        });

        imagens.forEach(img=>observador.observe(img));

    }

};

/* =============================================
      BACKUP AUTOMÁTICO
============================================= */

const BackupGS={

    iniciar(){

        setInterval(()=>{

            const dados={

                historico:AppGS.estado.cacheCalculos,

                formularios:AppGS.estado.dadosFormularios,

                data:new Date()

            };

            localStorage.setItem(

                "gs_backup",

                JSON.stringify(dados)

            );

        },60000);

    }

};

/* =============================================
      ATALHOS DE TECLADO
============================================= */

const AtalhosGS={

    iniciar(){

        document.addEventListener("keydown",(e)=>{

            if(e.ctrlKey && e.key==="Home"){

                window.scrollTo({

                    top:0,

                    behavior:"smooth"

                });

            }

            if(e.ctrlKey && e.key==="End"){

                window.scrollTo({

                    top:document.body.scrollHeight,

                    behavior:"smooth"

                });

            }

        });

    }

};

/* =============================================
      INICIALIZAÇÃO
============================================= */

window.addEventListener("load",()=>{

    LoaderGS.inicializar();

    RevealGS.iniciar();

    LazyImagesGS.iniciar();

    BackupGS.iniciar();

    AtalhosGS.iniciar();

});

/* =============================================
   MÓDULO: PESQUISA INSTANTÂNEA
============================================= */

const PesquisaGS = {

    iniciar() {

        const campo = document.querySelector("#pesquisa");

        if (!campo) return;

        campo.addEventListener("keyup", () => {

            const texto = campo.value.toLowerCase();

            document.querySelectorAll(".card-servico,.card-calculadora,.card-tabela").forEach(card => {

                const conteudo = card.innerText.toLowerCase();

                card.style.display = conteudo.includes(texto) ? "" : "none";

            });

        });

    }

};

/* =============================================
   MÓDULO: FAVORITOS
============================================= */

const FavoritosGS = {

    iniciar() {

        document.querySelectorAll("[data-favorito]").forEach(botao => {

            botao.addEventListener("click", () => {

                botao.classList.toggle("ativo");

            });

        });

    }

};

/* =============================================
   MÓDULO: CÓPIA RÁPIDA
============================================= */

const CopiarGS = {

    copiar(texto) {

        navigator.clipboard.writeText(texto).then(() => {

            AppGS.mostrarNotificacao("Copiado para a área de transferência!","sucesso");

        });

    }

};

/* =============================================
   MÓDULO: TEMPO NA PÁGINA
============================================= */

const TempoPaginaGS = {

    inicio: Date.now(),

    iniciar() {

        window.addEventListener("beforeunload", () => {

            const segundos = Math.floor((Date.now() - this.inicio) / 1000);

            localStorage.setItem("gs_tempo_pagina", segundos);

        });

    }

};

/* =============================================
   MÓDULO: INFORMAÇÕES DO NAVEGADOR
============================================= */

const NavegadorGS = {

    iniciar() {

        AppGS.log("Navegador: " + navigator.userAgent);

        AppGS.log("Idioma: " + navigator.language);

        AppGS.log("Plataforma: " + navigator.platform);

    }

};

/* =============================================
   MÓDULO: MODO ESCURO
============================================= */

const TemaGS = {

    iniciar() {

        const salvo = localStorage.getItem("gs_tema");

        if (salvo === "escuro") {

            document.body.classList.add("tema-escuro");

        }

    },

    alternar() {

        document.body.classList.toggle("tema-escuro");

        localStorage.setItem(

            "gs_tema",

            document.body.classList.contains("tema-escuro")

            ? "escuro"

            : "claro"

        );

    }

};

/* =============================================
   MÓDULO: DESEMPENHO
============================================= */

const PerformanceGS = {

    iniciar() {

        window.addEventListener("load", () => {

            const tempo = performance.now();

            AppGS.log(`Página carregada em ${tempo.toFixed(0)} ms`);

        });

    }

};

/* =============================================
   INICIALIZAÇÃO
============================================= */

window.addEventListener("load", () => {

    PesquisaGS.iniciar();

    FavoritosGS.iniciar();

    TempoPaginaGS.iniciar();

    NavegadorGS.iniciar();

    TemaGS.iniciar();

    PerformanceGS.iniciar();

});

/* ===========================================================
   GS ELETRO
   MÓDULO UNIVERSAL DE CÁLCULO DE CORRENTE

   Compatível com:
   ✔ Monofásico
   ✔ Bifásico
   ✔ Trifásico

   Potência em Watts
   Tensão em Volts
   FP = Fator de Potência
=========================================================== */

const CalculadoraCorrente = {

    inicializar(){

        AppGS.log("Calculadora Universal de Corrente carregada","sucesso");

    },

    calcular({

        potencia,

        tensao,

        sistema="mono",

        fatorPotencia=1

    }){

        potencia=Number(potencia);

        tensao=Number(tensao);

        fatorPotencia=Number(fatorPotencia);

        if(

            potencia<=0 ||

            tensao<=0 ||

            fatorPotencia<=0

        ){

            AppGS.mostrarNotificacao(

                "Valores inválidos.",

                "erro"

            );

            return null;

        }

        let corrente=0;

        switch(sistema){

            case "mono":

                corrente=

                potencia/

                (tensao*fatorPotencia);

            break;

            case "bi":

                corrente=

                potencia/

                (tensao*fatorPotencia);

            break;

            case "tri":

                corrente=

                potencia/

                (

                    Math.sqrt(3)*

                    tensao*

                    fatorPotencia

                );

            break;

            default:

                AppGS.mostrarNotificacao(

                    "Sistema inválido.",

                    "erro"

                );

                return null;

        }

        CalculadorasBase.salvarUltimoCalculo(

            "Corrente Universal",

            {

                potencia,

                tensao,

                sistema,

                fatorPotencia

            },

            {

                corrente

            }

        );

        return{

            corrente:Number(

                corrente.toFixed(2)

            ),

            sistema,

            tensao,

            potencia,

            fatorPotencia

        };

    }

};

/* ===========================================================
   CALCULADORA UNIVERSAL DE POTÊNCIA

   Mono
   Bi
   Tri
=========================================================== */

const CalculadoraPotencia={

    inicializar(){

        AppGS.log(

            "Calculadora Universal de Potência carregada",

            "sucesso"

        );

    },

    calcular({

        corrente,

        tensao,

        sistema="mono",

        fatorPotencia=1

    }){

        corrente=Number(corrente);

        tensao=Number(tensao);

        fatorPotencia=Number(fatorPotencia);

        if(

            corrente<=0||

            tensao<=0||

            fatorPotencia<=0

        ){

            AppGS.mostrarNotificacao(

                "Valores inválidos",

                "erro"

            );

            return null;

        }

        let potencia=0;

        switch(sistema){

            case "mono":

                potencia=

                tensao*

                corrente*

                fatorPotencia;

            break;

            case "bi":

                potencia=

                tensao*

                corrente*

                fatorPotencia;

            break;

            case "tri":

                potencia=

                Math.sqrt(3)*

                tensao*

                corrente*

                fatorPotencia;

            break;

        }

        return{

            potencia:Number(

                potencia.toFixed(2)

            )

        };

    }

};

/* ===========================================================
   INICIALIZAÇÃO
=========================================================== */

window.addEventListener("load",()=>{

    CalculadoraCorrente.inicializar();

    CalculadoraPotencia.inicializar();

});

/* ===========================================================
   GS ELETRO
   CALCULADORA UNIVERSAL DE DISJUNTORES
   Compatível com:
   ✔ Monofásico
   ✔ Bifásico
   ✔ Trifásico
=========================================================== */

const CalculadoraDisjuntor = {

    tabelaDisjuntores: [
        6,10,16,20,25,32,40,50,63,70,80,100,125,160,200,225,250,300
    ],

    inicializar(){

        AppGS.log(
            "Calculadora Universal de Disjuntores carregada",
            "sucesso"
        );

    },

    calcular(corrente){

        corrente = Number(corrente);

        if(corrente <= 0){

            AppGS.mostrarNotificacao(
                "Corrente inválida.",
                "erro"
            );

            return null;

        }

        let recomendado = null;

        for(const disjuntor of this.tabelaDisjuntores){

            if(disjuntor >= corrente){

                recomendado = disjuntor;

                break;

            }

        }

        if(recomendado === null){

            recomendado = "Acima de 300A";

        }

        CalculadorasBase.salvarUltimoCalculo(

            "Disjuntor",

            {corrente},

            {recomendado}

        );

        return recomendado;

    }

};

/* ===========================================================
   GS ELETRO
   CALCULADORA UNIVERSAL DE BITOLA
   Valores base para cabos de cobre PVC 70°C
=========================================================== */

const CalculadoraBitola = {

    tabela: [

        {bitola:1.5,corrente:15},

        {bitola:2.5,corrente:21},

        {bitola:4,corrente:28},

        {bitola:6,corrente:36},

        {bitola:10,corrente:50},

        {bitola:16,corrente:68},

        {bitola:25,corrente:89},

        {bitola:35,corrente:110},

        {bitola:50,corrente:134},

        {bitola:70,corrente:171},

        {bitola:95,corrente:207},

        {bitola:120,corrente:239},

        {bitola:150,corrente:272},

        {bitola:185,corrente:310},

        {bitola:240,corrente:364}

    ],

    inicializar(){

        AppGS.log(

            "Calculadora Universal de Bitolas carregada",

            "sucesso"

        );

    },

    calcular(corrente){

        corrente = Number(corrente);

        if(corrente <= 0){

            AppGS.mostrarNotificacao(

                "Corrente inválida.",

                "erro"

            );

            return null;

        }

        for(const cabo of this.tabela){

            if(corrente <= cabo.corrente){

                CalculadorasBase.salvarUltimoCalculo(

                    "Bitola",

                    {corrente},

                    cabo

                );

                return cabo;

            }

        }

        return {

            bitola:"Acima de 240 mm²",

            corrente

        };

    }

};

/* ===========================================================
   GS ELETRO
   DIMENSIONAMENTO AUTOMÁTICO

   Retorna:
   Corrente
   Disjuntor
   Bitola
=========================================================== */

const DimensionamentoGS = {

    calcular(dados){

        const resultadoCorrente =

        CalculadoraCorrente.calcular(dados);

        if(!resultadoCorrente) return null;

        const disjuntor =

        CalculadoraDisjuntor.calcular(

            resultadoCorrente.corrente

        );

        const bitola =

        CalculadoraBitola.calcular(

            resultadoCorrente.corrente

        );

        return{

            corrente:resultadoCorrente.corrente,

            disjuntor,

            bitola

        };

    }

};

/* ===========================================================
   INICIALIZAÇÃO
=========================================================== */

window.addEventListener("load",()=>{

    CalculadoraDisjuntor.inicializar();

    CalculadoraBitola.inicializar();

});

/* ===========================================================
   GS ELETRO
   CALCULADORA UNIVERSAL DE QUEDA DE TENSÃO
   Base para:
   ✔ Monofásico
   ✔ Bifásico
   ✔ Trifásico
=========================================================== */

const CalculadoraQuedaTensao = {

    resistividade:{

        cobre:0.0175,

        aluminio:0.0282

    },

    inicializar(){

        AppGS.log(

            "Calculadora Queda de Tensão carregada",

            "sucesso"

        );

    },

    calcular({

        corrente,

        tensao,

        distancia,

        bitola,

        sistema="mono",

        material="cobre"

    }){

        corrente=Number(corrente);

        tensao=Number(tensao);

        distancia=Number(distancia);

        bitola=Number(bitola);

        const rho=this.resistividade[material];

        if(

            !rho ||

            corrente<=0 ||

            tensao<=0 ||

            distancia<=0 ||

            bitola<=0

        ){

            AppGS.mostrarNotificacao(

                "Valores inválidos.",

                "erro"

            );

            return null;

        }

        let queda=0;

        switch(sistema){

            case "mono":

            case "bi":

                queda=

                (

                    2*

                    rho*

                    distancia*

                    corrente

                )/

                bitola;

            break;

            case "tri":

                queda=

                (

                    Math.sqrt(3)*

                    rho*

                    distancia*

                    corrente

                )/

                bitola;

            break;

            default:

                return null;

        }

        const percentual=

        (queda/tensao)*100;

        const aprovado=

        percentual<=4;

        CalculadorasBase.salvarUltimoCalculo(

            "Queda de Tensão",

            {

                corrente,

                tensao,

                distancia,

                bitola,

                sistema,

                material

            },

            {

                queda,

                percentual

            }

        );

        return{

            queda:Number(

                queda.toFixed(2)

            ),

            percentual:Number(

                percentual.toFixed(2)

            ),

            aprovado,

            mensagem:

            aprovado?

            "Dentro da NBR 5410":

            "Acima do limite permitido"

        };

    }

};

/* ===========================================================
   DIMENSIONAMENTO COMPLETO

   Corrente

   Disjuntor

   Bitola

   Queda de tensão
=========================================================== */

const ProjetoEletricoGS={

    calcular(dados){

        const corrente=

        CalculadoraCorrente.calcular(dados);

        if(!corrente)return null;

        const disjuntor=

        CalculadoraDisjuntor.calcular(

            corrente.corrente

        );

        const bitola=

        CalculadoraBitola.calcular(

            corrente.corrente

        );

        const queda=

        CalculadoraQuedaTensao.calcular({

            corrente:corrente.corrente,

            tensao:dados.tensao,

            distancia:dados.distancia,

            bitola:Number(bitola.bitola),

            sistema:dados.sistema,

            material:dados.material

        });

        return{

            corrente,

            disjuntor,

            bitola,

            queda

        };

    }

};

/* ===========================================================
   INICIALIZAÇÃO
=========================================================== */

window.addEventListener("load",()=>{

    CalculadoraQuedaTensao.inicializar();

});

/* ===========================================================
   GS ELETRO
   PARTE 7 - CENTRAL DE DIMENSIONAMENTO ELÉTRICO
   Integra todas as calculadoras
=========================================================== */

const CentralDimensionamentoGS = {

    inicializar() {

        AppGS.log(
            "Central de Dimensionamento carregada",
            "sucesso"
        );

    },

    calcular(dados) {

        const corrente = CalculadoraCorrente.calcular({
            potencia: dados.potencia,
            tensao: dados.tensao,
            sistema: dados.sistema,
            fatorPotencia: dados.fatorPotencia || 1
        });

        if (!corrente) return null;

        const disjuntor = CalculadoraDisjuntor.calcular(
            corrente.corrente
        );

        const bitola = CalculadoraBitola.calcular(
            corrente.corrente
        );

        const queda = CalculadoraQuedaTensao.calcular({
            corrente: corrente.corrente,
            tensao: dados.tensao,
            distancia: dados.distancia,
            bitola: Number(bitola.bitola),
            sistema: dados.sistema,
            material: dados.material || "cobre"
        });

        const resultado = {

            potencia: dados.potencia,

            tensao: dados.tensao,

            sistema: dados.sistema,

            corrente: corrente.corrente,

            disjuntor,

            bitola,

            queda

        };

        CalculadorasBase.salvarUltimoCalculo(

            "Dimensionamento Completo",

            dados,

            resultado

        );

        return resultado;

    },

    imprimir(resultado){

        console.table({

            Potência: resultado.potencia + " W",

            Tensão: resultado.tensao + " V",

            Sistema: resultado.sistema,

            Corrente: resultado.corrente + " A",

            Disjuntor: resultado.disjuntor + " A",

            Bitola: resultado.bitola.bitola + " mm²",

            "Queda (%)": resultado.queda.percentual,

            Situação: resultado.queda.mensagem

        });

    }

};

/* ===========================================================
   EXEMPLO DE USO

const resultado = CentralDimensionamentoGS.calcular({

    potencia:7500,

    tensao:220,

    sistema:"mono",

    distancia:28,

    material:"cobre",

    fatorPotencia:1

});

CentralDimensionamentoGS.imprimir(resultado);

=========================================================== */

/* ===========================================================
   INICIALIZAÇÃO
=========================================================== */

window.addEventListener("load",()=>{

    CentralDimensionamentoGS.inicializar();

});