// Gabriel Eletro - Script Unificado e Atualizado

// Aba de navegação interna
function mostrarAba(nome) {
    document.querySelectorAll('.conteudo-aba').forEach(aba => aba.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('aba_' + nome).classList.remove('hidden');
    event.target.classList.add('active');
}

// Cálculo Corrente
function calcularCorrente() {
    const P = Number(document.getElementById('corr_pot').value);
    const V = Number(document.getElementById('corr_tensao').value);
    const fp = Number(document.getElementById('corr_fp').value) || 1;
    if (!P || !V) return alert('Preencha Potência e Tensão!');
    const I = (P / (V * fp)).toFixed(2);
    document.getElementById('res_corrente').classList.remove('hidden');
    document.getElementById('res_corrente').innerHTML = `Corrente: ${I} A`;
}

// Cálculo Potência
function calcularPotencia() {
    const V = Number(document.getElementById('pot_tensao').value);
    const I = Number(document.getElementById('pot_corr').value);
    const fp = Number(document.getElementById('pot_fp').value) || 1;
    if (!V || !I) return alert('Preencha Tensão e Corrente!');
    const P = (V * I * fp).toFixed(0);
    document.getElementById('res_potencia').classList.remove('hidden');
    document.getElementById('res_potencia').innerHTML = `Potência: ${P} W`;
}

// Cálculo Disjuntor
function calcularDisjuntor() {
    const I = Number(document.getElementById('disj_corr').value);
    const fator = Number(document.getElementById('disj_tipo').value);
    if (!I) return alert('Preencha a corrente calculada!');
    const correnteAjustada = I * fator;
    const disjuntores = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100];
    const escolhido = disjuntores.find(d => d >= correnteAjustada) || 'Acima de 100A';
    document.getElementById('res_disjuntor').classList.remove('hidden');
    document.getElementById('res_disjuntor').innerHTML = 
        `Corrente ajustada: ${correnteAjustada.toFixed(2)} A<br>Disjuntor recomendado: ${escolhido} A`;
}

// Cálculo Bitola Cabo
function calcularBitola() {
    const I = Number(document.getElementById('bit_corr').value);
    const L = Number(document.getElementById('bit_comp').value);
    const V = Number(document.getElementById('bit_tensao').value);
    if (!I || !L || !V) return alert('Preencha todos os campos!');
    const rho = 0.0172;
    const quedaMax = V * 0.05;
    const sQueda = (2 * rho * L * I) / quedaMax;
    const tabela = [
        {s:1.5, i:15.5}, {s:2.5, i:21}, {s:4, i:28},
        {s:6, i:36}, {s:10, i:50}, {s:16, i:68}
    ];
    const sMinCorr = tabela.find(x => x.i >= I)?.s || 16;
    const sFinal = Math.max(sMinCorr, Math.ceil(sQueda * 10)/10);
    document.getElementById('res_bitola').classList.remove('hidden');
    document.getElementById('res_bitola').innerHTML = 
        `Seção mínima: ${sFinal.toFixed(1)} mm²<br>Conforme NBR 5410`;
}

// Metragem Cabos
function calcularMetragem() {
    const pontos = Number(document.getElementById('qtd_pontos').value);
    const media = Number(document.getElementById('media_percurso').value);
    const folga = Number(document.getElementById('folga').value) / 100 || 0;
    if (!pontos || !media) return alert('Preencha quantidade e média!');
    const total = (pontos * media * (1 + folga)).toFixed(1);
    document.getElementById('res_metragem').classList.remove('hidden');
    document.getElementById('res_metragem').innerHTML = `Total estimado: ${total} metros`;
}

// Recibo
function gerarRecibo() {
    const nomeCliente = document.getElementById('cliente').value;
    const endereco = document.getElementById('endereco').value;
    const servico = document.getElementById('servico').value;
    const valor = Number(document.getElementById('valor').value).toFixed(2);
    const data = new Date().toLocaleDateString('pt-BR');

    document.getElementById('recibo_area').innerHTML = `
    <div class="recibo-unico">
        <h2 style="text-align:center; color:#facc15; margin-bottom:20px;">RECIBO DE SERVIÇO</h2>
        <p><strong>Prestador:</strong> Gabriel Eletro</p>
        <p><strong>Cliente:</strong> ${nomeCliente}</p>
        <p><strong>Endereço:</strong> ${endereco}</p>
        <p style="margin-top:15px;"><strong>Serviço executado:</strong><br>${servico}</p>
        <p style="margin-top:15px; font-size:18px;"><strong>Valor Total:</strong> R$ ${valor}</p>
        <p style="margin-top:10px;"><strong>Data:</strong> ${data}</p>
        <p style="margin-top:40px; text-align:center;">____________________________________<br>Assinatura</p>
    </div>`;
}
