// Ajusta fator de potência
function ajustarFP(tipo) {
    const sel = document.getElementById(tipo + '_fp_tipo');
    const manual = document.getElementById(tipo + '_fp_manual');
    manual.disabled = sel.value !== 'manual';
}

// Cálculo Corrente
function calcCorrente() {
    const P = Number(document.getElementById('corr_pot').value);
    const V = Number(document.getElementById('corr_tensao').value);
    const selFP = document.getElementById('corr_fp_tipo').value;
    let fp = selFP === 'manual' ? Number(document.getElementById('corr_fp_manual').value) : Number(selFP);
    
    if (!P || !V || !fp) {
        alert('Preencha todos os campos!');
        return;
    }
    const I = P / (V * fp);
    document.getElementById('res_corr').classList.remove('hidden');
    document.getElementById('res_corr').innerHTML = `Corrente: ${I.toFixed(2)} A`;
}

// Cálculo Potência
function calcPotencia() {
    const V = Number(document.getElementById('pot_tensao').value);
    const I = Number(document.getElementById('pot_corr').value);
    const fp = Number(document.getElementById('pot_fp').value);
    
    if (!V || !I || !fp) {
        alert('Preencha todos os campos!');
        return;
    }
    const P = V * I * fp;
    document.getElementById('res_pot').classList.remove('hidden');
    document.getElementById('res_pot').innerHTML = `Potência Ativa: ${P.toFixed(2)} W`;
}

// Cálculo Queda de Tensão
function calcQueda() {
    const V = Number(document.getElementById('q_tensao').value);
    const I = Number(document.getElementById('q_corr').value);
    const L = Number(document.getElementById('q_comp').value);
    const S = Number(document.getElementById('q_sec').value);
    const rho = 0.0172; // Resistividade cobre
    
    if (!V || !I || !L || !S) {
        alert('Preencha todos os campos!');
        return;
    }
    const quedaV = (2 * rho * L * I) / S;
    const quedaP = (quedaV / V) * 100;
    document.getElementById('res_q').classList.remove('hidden');
    document.getElementById('res_q').innerHTML = 
        `Queda: ${quedaV.toFixed(2)} V (${quedaP.toFixed(2)}%)<br>Limite recomendado: até 5%`;
}

// Cálculo Bitola do Cabo
function calcBitola() {
    const I = Number(document.getElementById('b_corr').value);
    const L = Number(document.getElementById('b_comp').value);
    const V = Number(document.getElementById('b_tensao').value);
    const metodo = document.getElementById('b_tipo').value;
    const rho = 0.0172;
    const quedaMax = V * 0.05; // 5% de queda máxima
    
    if (!I || !L || !V) {
        alert('Preencha todos os campos!');
        return;
    }
    const sQueda = (2 * rho * L * I) / quedaMax;
    const tabela = [
        {s:1.5, i:15.5}, {s:2.5, i:21}, {s:4, i:28},
        {s:6, i:36}, {s:10, i:50}, {s:16, i:68}
    ];
    let sMin = tabela.find(x => x.i >= I)?.s || 16;
    sMin = Math.max(sMin, Math.ceil(sQueda * 10)/10);
    
    document.getElementById('res_b').classList.remove('hidden');
    document.getElementById('res_b').innerHTML = 
        `Seção mínima: ${sMin.toFixed(1)} mm²<br>Método: ${metodo}`;
}

// Cálculo Disjuntor
function calcDisjuntor() {
    const I = Number(document.getElementById('d_corr').value);
    const S = Number(document.getElementById('d_sec').value);
    const tipo = document.getElementById('d_tipo').value;
    
    if (!I || !S) {
        alert('Preencha todos os campos!');
        return;
    }
    let fator = tipo === 'resistiva' ? 1.25 : tipo === 'indutiva' ? 1.5 : 1.3;
    const In = Math.ceil(I * fator / 5) * 5;
    const tabelaCabo = {1.5:16, 2.5:25, 4:32, 6:40, 10:50, 16:63};
    const maxCabo = tabelaCabo[S] || 100;
    const indicado = Math.min(In, maxCabo);
    
    document.getElementById('res_d').classList.remove('hidden');
    document.getElementById('res_d').innerHTML = 
        `Disjuntor indicado: ${indicado} A<br>Tipo: ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
}

// Cálculo Consumo
function calcConsumo() {
    const P = Number(document.getElementById('c_pot').value);
    const h = Number(document.getElementById('c_hora').value);
    const d = Number(document.getElementById('c_dia').value);
    const preco = Number(document.getElementById('c_preco').value);
    
    if (!P || !h || !d || !preco) {
        alert('Preencha todos os campos!');
        return;
    }
    const consumo = (P * h * d) / 1000;
    const valor = consumo * preco;
    document.getElementById('res_c').classList.remove('hidden');
    document.getElementById('res_c').innerHTML = 
        `Consumo mensal: ${consumo.toFixed(2)} kWh<br>Valor estimado: R$ ${valor.toFixed(2)}`;
}

// Cálculo Demanda
function calcDemanda() {
    const Ptotal = Number(document.getElementById('fd_total').value);
    const n = Number(document.getElementById('fd_circ').value);
    
    if (!Ptotal || !n) {
        alert('Preencha todos os campos!');
        return;
    }
    const fd = n <= 2 ? 0.8 : n <= 4 ? 0.7 : 0.6;
    const demanda = Ptotal * fd;
    document.getElementById('res_fd').classList.remove('hidden');
    document.getElementById('res_fd').innerHTML = 
        `Fator de Demanda: ${fd.toFixed(2)}<br>Demanda calculada: ${demanda.toFixed(0)} W`;
}

// Conversor AWG → mm²
function convAWG() {
    const awg = Number(document.getElementById('conv_awg').value);
    const tabela = {10:5.26, 12:3.31, 14:2.08, 16:1.31, 18:0.823};
    const res = tabela[awg] || 'Valor não encontrado';
    document.getElementById('res_awg').classList.remove('hidden');
    document.getElementById('res_awg').innerHTML = 
        `${awg} AWG = ${typeof res === 'number' ? res.toFixed(2) + ' mm²' : res}`;
}

// Conversor W → kW
function convW() {
    const w = Number(document.getElementById('conv_w').value);
    document.getElementById('res_w').classList.remove('hidden');
    document.getElementById('res_w').innerHTML = `${w} W = ${(w/1000).toFixed(3)} kW`;
}

// Cálculo Cargas Específicas
function calcCarga() {
    const tipo = document.getElementById('carga_tipo').value;
    const valor = Number(document.getElementById('carga_valor').value);
    const V = Number(document.getElementById('carga_tensao').value);
    const fp = Number(document.getElementById('carga_fp').value);
    
    if (!valor || !V || !fp) {
        alert('Preencha todos os campos!');
        return;
    }
    let P = tipo === 'motor' ? valor * 735.5 : valor; // CV → W
    const I = P / (V * fp);
    document.getElementById('res_carga').classList.remove('hidden');
    document.getElementById('res_carga').innerHTML = 
        `Potência: ${P.toFixed(0)} W<br>Corrente estimada: ${I.toFixed(2)} A`;
}

// Orçamento
function gerarOrcamento() {
    const tom = Number(document.getElementById('qtd_tomada').value) * Number(document.getElementById('preco_tomada').value);
    const int = Number(document.getElementById('qtd_interruptor').value) * Number(document.getElementById('preco_interruptor').value);
    const c15 = Number(document.getElementById('m15').value) * Number(document.getElementById('preco_m15').value);
    const c25 = Number(document.getElementById('m25').value) * Number(document.getElementById('preco_m25').value);
    const c4 = Number(document.getElementById('m4').value) * Number(document.getElementById('preco_m4').value);
    const disj = Number(document.getElementById('qtd_disj').value) * Number(document.getElementById('preco_disj').value);
    const cond = Number(document.getElementById('qtd_conduite').value) * Number(document.getElementById('preco_conduite').value);
    const mao = Number(document.getElementById('mao').value);
    const lucro = 1 + Number(document.getElementById('lucro').value)/100;

    const total = (tom + int + c15 + c25 + c4 + disj + cond + mao) * lucro;
    document.getElementById('res_orc').classList.remove('hidden');
    document.getElementById('res_orc').innerHTML = `Total Estimado: R$ ${total.toFixed(2)}`;
}

// Recibo
function gerarRecibo() {
    const prestador = document.getElementById('prestador_nome').value;
    const docPrestador = document.getElementById('prestador_doc').value;
    const endPrestador = document.getElementById('prestador_end').value;
    const cliente = document.getElementById('cliente_nome').value;
    const docCliente = document.getElementById('cliente_doc').value;
    const endCliente = document.getElementById('cliente_end').value;
    const desc = document.getElementById('descricao').value;
    const valor = Number(document.getElementById('valor_total').value).toFixed(2);
    const data = document.getElementById('data_recibo').value;

    document.getElementById('recibo_area').innerHTML = `
        <div style="background:white; color:#000; padding:25px; border-radius:10px;">
            <h3 style="text-align:center; margin-bottom:20px;">RECIBO DE SERVIÇO</h3>
            <p><strong>Prestador:</strong> ${prestador}<br>${docPrestador}<br>${endPrestador}</p>
            <p><strong>Cliente:</strong> ${cliente}<br>${docCliente}<br>${endCliente}</p>
            <p><strong>Serviço:</strong> ${desc}</p>
            <p style="margin-top:15px;"><strong>Valor Total:</strong> R$ ${valor}</p>
            <p style="margin-top:15px;"><strong>Data:</strong> ${data}</p>
            <p style="margin-top:40px; text-align:center;">____________________________________<br>Assinatura</p>
        </div>
    `;
}
