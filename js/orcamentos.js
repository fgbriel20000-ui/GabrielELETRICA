/* =========================================================
   GS ELÉTRICA — LÓGICA DA PÁGINA DE ORÇAMENTOS
   ========================================================= */

(function () {
    const CHAVE_HISTORICO = 'gs-historico-orcamentos';
    const CHAVE_CONTADOR = 'gs-contador-orcamentos';
    const CHAVE_ASSINATURA = 'gs-assinatura-eletricista';
    const CHAVE_MATERIAIS = 'gs-materiais-salvos';

    const form = document.getElementById('form-orcamento');
    const areaVazia = document.getElementById('of-vazio');
    const areaConteudo = document.getElementById('of-conteudo');
    const acoesPreview = document.getElementById('acoes-preview');

    const canvasAssinatura = document.getElementById('assinatura-canvas');
    const ctxAssinatura = canvasAssinatura.getContext('2d');
    const statusAssinatura = document.getElementById('assinatura-status');
    const imagemPreviewAssinatura = document.getElementById('of-assinatura-imagem');
    const linhaPreviewAssinatura = document.getElementById('of-assinatura-linha');

    let desenhandoAssinatura = false;
    let assinaturaFoiAlterada = false;

    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatarData(data) {
        return data.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function arredondar(valor) {
        return Math.round(valor * 100) / 100;
    }

    function formatarQuantidade(valor) {
        return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    }

    let ultimoOrcamento = null;

    /* ===== Materiais e mão de obra ===== */

    const listaMateriais = document.getElementById('lista-materiais');

    function criarLinhaMaterial() {
        const linha = document.createElement('div');
        linha.className = 'material-linha';
        linha.innerHTML = `
            <div class="campo campo-nome"><label>Material</label><input type="text" class="mat-nome" list="materiais-sugestoes" placeholder="Ex: Cabo 2,5mm (metro)" autocomplete="off"></div>
            <div class="campo"><label>Qtd.</label><input type="number" class="mat-qtd" min="0" step="0.01" value="1"></div>
            <div class="campo"><label>Preço unit. (R$)</label><input type="number" class="mat-preco" min="0" step="0.01"></div>
            <button type="button" class="btn btn-contorno btn-remover" aria-label="Remover material">✕</button>`;
        listaMateriais.appendChild(linha);
    }

    function lerMateriais() {
        const itens = [];
        listaMateriais.querySelectorAll('.material-linha').forEach(function (linha) {
            const nome = linha.querySelector('.mat-nome').value.trim();
            const quantidade = Number(linha.querySelector('.mat-qtd').value || 0);
            const precoUnitario = Number(linha.querySelector('.mat-preco').value || 0);
            if (!nome && !precoUnitario) return;
            itens.push({
                nome: nome || 'Material',
                quantidade: quantidade,
                precoUnitario: precoUnitario,
                subtotal: arredondar(quantidade * precoUnitario)
            });
        });
        return itens;
    }

    function lerMaoDeObra() {
        const dias = Number(document.getElementById('mo-dias').value || 0);
        const valorDiaria = Number(document.getElementById('mo-valor-diaria').value || 0);
        return { dias: dias, valorDiaria: valorDiaria, total: arredondar(dias * valorDiaria) };
    }

    function somaMateriais(itens) {
        return arredondar(itens.reduce(function (soma, item) { return soma + item.subtotal; }, 0));
    }

    function atualizarTotaisDoFormulario() {
        const totalMateriais = somaMateriais(lerMateriais());
        const maoDeObra = lerMaoDeObra();
        document.getElementById('form-total-materiais').textContent = formatarMoeda(totalMateriais);
        document.getElementById('form-total-mao-obra').textContent = formatarMoeda(maoDeObra.total);
        document.getElementById('form-total-geral').textContent = formatarMoeda(arredondar(totalMateriais + maoDeObra.total));
    }

    /* ===== Materiais salvos (catálogo pessoal) ===== */

    function lerCatalogo() {
        try {
            const lista = JSON.parse(localStorage.getItem(CHAVE_MATERIAIS) || '[]');
            return Array.isArray(lista) ? lista : [];
        } catch (erro) {
            return [];
        }
    }

    function atualizarSugestoes() {
        const datalist = document.getElementById('materiais-sugestoes');
        datalist.innerHTML = '';
        lerCatalogo().forEach(function (item) {
            const opcao = document.createElement('option');
            opcao.value = item.nome;
            opcao.label = formatarMoeda(item.preco);
            datalist.appendChild(opcao);
        });
    }

    function salvarNoCatalogo(itens) {
        const catalogo = lerCatalogo();
        itens.forEach(function (item) {
            if (!item.precoUnitario || item.nome === 'Material') return;
            const existente = catalogo.find(function (c) {
                return c.nome.toLowerCase() === item.nome.toLowerCase();
            });
            if (existente) {
                existente.preco = item.precoUnitario;
            } else {
                catalogo.push({ nome: item.nome, preco: item.precoUnitario });
            }
        });
        catalogo.sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });
        try {
            localStorage.setItem(CHAVE_MATERIAIS, JSON.stringify(catalogo.slice(0, 300)));
        } catch (erro) {
            console.error('[GS Elétrica] Não foi possível salvar os materiais:', erro);
        }
        atualizarSugestoes();
    }

    // Ao escolher um material salvo, o preço é preenchido sozinho (se estiver vazio)
    listaMateriais.addEventListener('change', function (evento) {
        if (!evento.target.classList.contains('mat-nome')) return;
        const nome = evento.target.value.trim().toLowerCase();
        const salvo = lerCatalogo().find(function (c) { return c.nome.toLowerCase() === nome; });
        if (!salvo) return;
        const campoPreco = evento.target.closest('.material-linha').querySelector('.mat-preco');
        if (!campoPreco.value) {
            campoPreco.value = salvo.preco;
            atualizarTotaisDoFormulario();
        }
    });

    atualizarSugestoes();

    function reiniciarMateriais() {
        listaMateriais.innerHTML = '';
        criarLinhaMaterial();
    }

    reiniciarMateriais();

    document.getElementById('btn-add-material').addEventListener('click', function () {
        criarLinhaMaterial();
        const campos = listaMateriais.querySelectorAll('.mat-nome');
        campos[campos.length - 1].focus();
    });

    listaMateriais.addEventListener('click', function (evento) {
        const botao = evento.target.closest('.btn-remover');
        if (!botao) return;
        botao.closest('.material-linha').remove();
        if (!listaMateriais.querySelector('.material-linha')) criarLinhaMaterial();
        atualizarTotaisDoFormulario();
    });

    form.addEventListener('input', atualizarTotaisDoFormulario);

    function proximoNumeroDocumento() {
        const agora = new Date();
        const prefixo = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}`;
        let contador = Number(localStorage.getItem(CHAVE_CONTADOR) || '0') + 1;
        localStorage.setItem(CHAVE_CONTADOR, String(contador));
        return `${prefixo}-${contador}`;
    }

    function salvarNoHistorico(registro) {
        const historico = JSON.parse(localStorage.getItem(CHAVE_HISTORICO) || '[]');
        historico.unshift(registro);
        localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
    }

    function listaFormasPagamento() {
        const formas = [];
        if (document.getElementById('pg-dinheiro').checked) formas.push('Dinheiro');
        if (document.getElementById('pg-cartao').checked) formas.push('Cartão de Crédito');
        if (document.getElementById('pg-boleto').checked) formas.push('Boleto');
        if (document.getElementById('pg-pix').checked) formas.push('Pix');
        return formas.join(' / ') || 'A combinar';
    }

    /* ===== Assinatura digital ===== */

    canvasAssinatura.width = canvasAssinatura.clientWidth;
    canvasAssinatura.height = canvasAssinatura.clientHeight;
    ctxAssinatura.lineWidth = 2;
    ctxAssinatura.lineCap = 'round';
    ctxAssinatura.strokeStyle = '#101828';

    function posicaoDoEvento(evento) {
        const retangulo = canvasAssinatura.getBoundingClientRect();
        const origem = evento.touches ? evento.touches[0] : evento;
        return {
            x: origem.clientX - retangulo.left,
            y: origem.clientY - retangulo.top
        };
    }

    function iniciarTraco(evento) {
        evento.preventDefault();
        desenhandoAssinatura = true;
        const pos = posicaoDoEvento(evento);
        ctxAssinatura.beginPath();
        ctxAssinatura.moveTo(pos.x, pos.y);
    }

    function desenharTraco(evento) {
        if (!desenhandoAssinatura) return;
        evento.preventDefault();
        const pos = posicaoDoEvento(evento);
        ctxAssinatura.lineTo(pos.x, pos.y);
        ctxAssinatura.stroke();
        assinaturaFoiAlterada = true;
    }

    function finalizarTraco() {
        if (!desenhandoAssinatura) return;
        desenhandoAssinatura = false;
        if (assinaturaFoiAlterada) {
            localStorage.setItem(CHAVE_ASSINATURA, canvasAssinatura.toDataURL('image/png'));
            atualizarStatusAssinatura();
        }
    }

    canvasAssinatura.addEventListener('mousedown', iniciarTraco);
    canvasAssinatura.addEventListener('mousemove', desenharTraco);
    window.addEventListener('mouseup', finalizarTraco);

    canvasAssinatura.addEventListener('touchstart', iniciarTraco, { passive: false });
    canvasAssinatura.addEventListener('touchmove', desenharTraco, { passive: false });
    canvasAssinatura.addEventListener('touchend', finalizarTraco);

    function atualizarStatusAssinatura() {
        const salva = localStorage.getItem(CHAVE_ASSINATURA);
        if (salva) {
            statusAssinatura.textContent = 'Assinatura salva ✓';
            statusAssinatura.classList.add('salva');
            canvasAssinatura.classList.add('tem-assinatura');
        } else {
            statusAssinatura.textContent = 'Nenhuma assinatura salva';
            statusAssinatura.classList.remove('salva');
            canvasAssinatura.classList.remove('tem-assinatura');
        }
    }

    function carregarAssinaturaSalva() {
        const dados = localStorage.getItem(CHAVE_ASSINATURA);
        atualizarStatusAssinatura();
        if (!dados) return;
        const imagem = new Image();
        imagem.onload = function () {
            ctxAssinatura.drawImage(imagem, 0, 0, canvasAssinatura.width, canvasAssinatura.height);
        };
        imagem.src = dados;
    }

    carregarAssinaturaSalva();

    document.getElementById('btn-limpar-assinatura').addEventListener('click', function () {
        ctxAssinatura.clearRect(0, 0, canvasAssinatura.width, canvasAssinatura.height);
        assinaturaFoiAlterada = false;
        localStorage.removeItem(CHAVE_ASSINATURA);
        atualizarStatusAssinatura();
    });

    // Assinatura pronta: escreve o nome em letra cursiva e salva como se tivesse sido desenhada
    document.getElementById('btn-assinatura-digitada').addEventListener('click', async function () {
        const nome = document.getElementById('assinatura-nome').value.trim();
        if (!nome) {
            alert('Digite seu nome para criar a assinatura.');
            return;
        }

        try { await document.fonts.load("700 48px 'Dancing Script'"); } catch (erro) { /* usa a fonte cursiva padrão */ }

        const largura = canvasAssinatura.width;
        const altura = canvasAssinatura.height;
        ctxAssinatura.clearRect(0, 0, largura, altura);

        let tamanho = Math.round(altura * 0.6);
        ctxAssinatura.font = `700 ${tamanho}px 'Dancing Script', cursive`;
        while (ctxAssinatura.measureText(nome).width > largura * 0.9 && tamanho > 14) {
            tamanho -= 2;
            ctxAssinatura.font = `700 ${tamanho}px 'Dancing Script', cursive`;
        }
        ctxAssinatura.fillStyle = '#101828';
        ctxAssinatura.textAlign = 'center';
        ctxAssinatura.textBaseline = 'middle';
        ctxAssinatura.fillText(nome, largura / 2, altura / 2);

        localStorage.setItem(CHAVE_ASSINATURA, canvasAssinatura.toDataURL('image/png'));
        atualizarStatusAssinatura();
    });

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const materiais = lerMateriais();
        const totalMateriais = somaMateriais(materiais);
        const maoDeObra = lerMaoDeObra();

        if (totalMateriais + maoDeObra.total <= 0) {
            alert('Informe pelo menos um material com preço ou a mão de obra (diárias × valor da diária).');
            return;
        }

        const dados = {
            numero: proximoNumeroDocumento(),
            data: formatarData(new Date()),
            cliente: {
                nome: document.getElementById('cliente-nome').value.trim(),
                telefone: document.getElementById('cliente-telefone').value.trim(),
                cpf: document.getElementById('cliente-cpf').value.trim(),
                endereco: document.getElementById('cliente-endereco').value.trim()
            },
            servico: {
                descricao: document.getElementById('servico-descricao').value.trim(),
                local: document.getElementById('servico-local').value.trim(),
                materiais: materiais,
                totalMateriais: totalMateriais,
                maoDeObra: maoDeObra,
                // "valor" continua sendo o TOTAL do orçamento (a página de Clientes lê este campo)
                valor: arredondar(totalMateriais + maoDeObra.total)
            },
            validadeDias: Number(document.getElementById('validade-dias').value || 7),
            garantiaDias: Number(document.getElementById('garantia-dias').value || 90),
            formasPagamento: listaFormasPagamento(),
            observacoes: document.getElementById('observacoes').value.trim()
        };

        ultimoOrcamento = dados;
        preencherPreview(dados);
        salvarNoHistorico(dados);
        salvarNoCatalogo(materiais);
    });

    function preencherPreview(dados) {
        document.getElementById('of-numero').textContent = `Orçamento Nº ${dados.numero}`;
        document.getElementById('of-data').textContent = dados.data;

        document.getElementById('of-cliente-nome').textContent = dados.cliente.nome;
        document.getElementById('of-cliente-telefone').textContent = dados.cliente.telefone;
        document.getElementById('of-cliente-cpf').textContent = `CPF: ${dados.cliente.cpf}`;
        document.getElementById('of-cliente-endereco').textContent = dados.cliente.endereco;
        document.getElementById('of-servico-local').textContent = `Local do serviço: ${dados.servico.local}`;

        document.getElementById('of-servico-descricao').textContent = dados.servico.descricao;

        const corpoMateriais = document.getElementById('of-materiais-corpo');
        corpoMateriais.innerHTML = '';
        dados.servico.materiais.forEach(function (item) {
            const tr = document.createElement('tr');
            [
                [item.nome, false],
                [formatarQuantidade(item.quantidade), true],
                [formatarMoeda(item.precoUnitario), true],
                [formatarMoeda(item.subtotal), true]
            ].forEach(function (celula) {
                const td = document.createElement('td');
                td.textContent = celula[0];
                if (celula[1]) td.className = 'num';
                tr.appendChild(td);
            });
            corpoMateriais.appendChild(tr);
        });
        document.getElementById('of-total-materiais').textContent = formatarMoeda(dados.servico.totalMateriais);
        document.getElementById('of-bloco-materiais').style.display = dados.servico.materiais.length ? 'block' : 'none';

        const mo = dados.servico.maoDeObra;
        document.getElementById('of-mo-descricao').textContent =
            `${formatarQuantidade(mo.dias)} ${mo.dias === 1 ? 'diária' : 'diárias'} × ${formatarMoeda(mo.valorDiaria)}`;
        document.getElementById('of-mo-valor').textContent = formatarMoeda(mo.total);
        document.getElementById('of-bloco-mao-obra').style.display = mo.total > 0 ? 'block' : 'none';

        document.getElementById('of-total').textContent = formatarMoeda(dados.servico.valor);

        document.getElementById('of-condicoes').textContent =
            `Validade do orçamento: ${dados.validadeDias} dias • Garantia da mão de obra: ${dados.garantiaDias} dias • Formas de pagamento aceitas: ${dados.formasPagamento}`;

        document.getElementById('of-observacoes').textContent = dados.observacoes || 'Nenhuma observação adicional.';

        const assinaturaSalva = localStorage.getItem(CHAVE_ASSINATURA);
        if (assinaturaSalva) {
            imagemPreviewAssinatura.src = assinaturaSalva;
            imagemPreviewAssinatura.style.display = 'block';
            linhaPreviewAssinatura.style.display = 'none';
        } else {
            imagemPreviewAssinatura.style.display = 'none';
            linhaPreviewAssinatura.style.display = 'block';
        }

        areaVazia.style.display = 'none';
        areaConteudo.style.display = 'block';
        acoesPreview.style.display = 'flex';
    }

    document.getElementById('btn-limpar').addEventListener('click', function () {
        form.reset();
        reiniciarMateriais();
        atualizarTotaisDoFormulario();
        ultimoOrcamento = null;
        areaVazia.style.display = 'block';
        areaConteudo.style.display = 'none';
        acoesPreview.style.display = 'none';
    });

    document.getElementById('btn-imprimir').addEventListener('click', function () {
        window.print();
    });

    async function capturarFolhaComoCanvas(folha) {
        // No celular a prévia fica numa coluna estreita (largura da tela do telefone), o que fazia
        // a "foto" sair comprida e fina, tipo cupom fiscal. Pra sempre sair proporcional como no
        // computador, tiramos a foto de uma cópia do orçamento fora da tela, com largura fixa.
        const LARGURA_CAPTURA = 794; // ~ largura de uma folha A4 a 96dpi

        const clone = folha.cloneNode(true);
        clone.style.width = LARGURA_CAPTURA + 'px';
        clone.style.maxWidth = 'none';
        clone.style.boxSizing = 'border-box';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '-99999px';
        wrapper.style.width = LARGURA_CAPTURA + 'px';
        wrapper.style.background = '#ffffff';
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        try {
            // dá um instante pro navegador aplicar o layout na cópia antes de capturar
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

            return await html2canvas(clone, {
                scale: 2,
                backgroundColor: '#ffffff',
                width: LARGURA_CAPTURA,
                windowWidth: LARGURA_CAPTURA
            });
        } finally {
            wrapper.remove();
        }
    }

    async function gerarPdfDoOrcamento() {
        const folha = document.getElementById('folha-orcamento');
        const canvas = await capturarFolhaComoCanvas(folha);
        const imagem = canvas.toDataURL('image/png');

        // A página do PDF é criada do tamanho exato do conteúdo (largura de A4, altura proporcional),
        // assim o orçamento inteiro cabe numa página só, sem cortar nada quando ele é mais alto que uma A4.
        const larguraMm = 210;
        const alturaMm = (canvas.height * larguraMm) / canvas.width;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: [larguraMm, alturaMm] });

        pdf.addImage(imagem, 'PNG', 0, 0, larguraMm, alturaMm);

        const numero = document.getElementById('of-numero').textContent.replace(/\D/g, '-');
        const nomeArquivo = `orcamento-gs-eletrica-${numero || 'documento'}.pdf`;

        return { pdf, nomeArquivo };
    }

    function montarMensagemWhatsapp() {
        const nome = document.getElementById('of-cliente-nome').textContent.trim();
        const numero = document.getElementById('of-numero').textContent.trim();
        const descricao = document.getElementById('of-servico-descricao').textContent.trim();
        const total = document.getElementById('of-total').textContent.trim();
        const condicoes = document.getElementById('of-condicoes').textContent.trim();

        let detalhes = '';
        if (ultimoOrcamento) {
            const serv = ultimoOrcamento.servico;
            if (serv.materiais.length) detalhes += `*Materiais:* ${formatarMoeda(serv.totalMateriais)}\n`;
            if (serv.maoDeObra.total > 0) detalhes += `*Mão de obra:* ${formatarMoeda(serv.maoDeObra.total)}\n`;
        }

        return `Olá${nome ? ' ' + nome : ''}! Segue o orçamento *${numero}* da GS Elétrica.\n\n` +
            `*Serviço:* ${descricao}\n${detalhes}*Total:* ${total}\n${condicoes}\n\n` +
            `Qualquer dúvida, estou à disposição!`;
    }

    function numeroWhatsappDoCliente() {
        const telefone = document.getElementById('of-cliente-telefone').textContent || '';
        const digitos = telefone.replace(/\D/g, '');
        if (!digitos) return '';
        return digitos.length <= 11 ? `55${digitos}` : digitos;
    }

    document.getElementById('btn-baixar-pdf').addEventListener('click', async function () {
        const botao = this;
        const textoOriginal = botao.textContent;
        botao.textContent = 'Gerando PDF...';
        botao.disabled = true;

        try {
            const { pdf, nomeArquivo } = await gerarPdfDoOrcamento();
            pdf.save(nomeArquivo);
        } catch (erro) {
            console.error('[GS Elétrica] Erro ao gerar PDF:', erro);
            alert('Não foi possível gerar o PDF. Tente novamente.');
        } finally {
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }
    });

    document.getElementById('btn-whatsapp').addEventListener('click', async function () {
        const botao = this;
        const textoOriginal = botao.textContent;
        botao.textContent = 'Preparando...';
        botao.disabled = true;

        try {
            const { pdf, nomeArquivo } = await gerarPdfDoOrcamento();
            const mensagem = montarMensagemWhatsapp();
            const blobPdf = pdf.output('blob');
            const arquivo = new File([blobPdf], nomeArquivo, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
                // Celular com suporte a compartilhamento nativo: manda o PDF direto para o WhatsApp escolhido
                await navigator.share({
                    files: [arquivo],
                    title: nomeArquivo,
                    text: mensagem
                });
            } else {
                // Sem suporte a compartilhar arquivo (ex: computador): baixa o PDF e abre o WhatsApp com a mensagem pronta
                pdf.save(nomeArquivo);
                const numeroCliente = numeroWhatsappDoCliente();
                const link = numeroCliente
                    ? `https://wa.me/${numeroCliente}?text=${encodeURIComponent(mensagem)}`
                    : `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
                window.open(link, '_blank');
            }
        } catch (erro) {
            if (erro.name !== 'AbortError') {
                console.error('[GS Elétrica] Erro ao enviar pelo WhatsApp:', erro);
                alert('Não foi possível enviar pelo WhatsApp. Tente novamente.');
            }
        } finally {
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }
    });
})();
