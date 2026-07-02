/* ==========================================================
   GABRIEL ELETRO V2K
   Desenvolvido por Gabriel
========================================================== */

/* ==========================
   UTILIDADES
========================== */

const $ = (id) => document.getElementById(id);

function mostrar(id) {
    const elemento = $(id);
    if (elemento) {
        elemento.classList.remove("hidden");
    }
}

function ocultar(id) {
    const elemento = $(id);
    if (elemento) {
        elemento.classList.add("hidden");
    }
}

function resultado(id, texto) {
    const elemento = $(id);

    if (!elemento) return;

    elemento.innerHTML = texto;
    elemento.classList.remove("hidden");
}

function numero(id) {
    return Number($(id)?.value || 0);
}

function texto(id) {
    return $(id)?.value.trim() || "";
}

/* ==========================
   MENU
========================== */

function ativarMenu(botao) {

    document
        .querySelectorAll(".nav-btn")
        .forEach(item => item.classList.remove("active"));

    botao.classList.add("active");

}

/* ==========================
   PESQUISA
========================== */

document.addEventListener("DOMContentLoaded", () => {

    const pesquisa = $("pesquisaFerramenta");

    if (!pesquisa) return;

    pesquisa.addEventListener("keyup", () => {

        const textoPesquisa = pesquisa.value.toLowerCase();

        document.querySelectorAll(".nav-btn").forEach(item => {

            const nome = item.textContent.toLowerCase();

            item.style.display = nome.includes(textoPesquisa)
                ? "flex"
                : "none";

        });

    });

});

/* ==========================
   CALCULADORA DE CORRENTE
========================== */

function calcularCorrente() {

    const potencia = numero("corr_pot");
    const tensao = numero("corr_tensao");
    const fp = numero("corr_fp") || 1;

    if (!potencia || !tensao) {

        alert("Preencha Potência e Tensão.");

        return;

    }

    const corrente = potencia / (tensao * fp);

    resultado(

        "res_corrente",

        `<strong>Corrente:</strong> ${corrente.toFixed(2)} A`

    );

}

/* ==========================
   CALCULADORA DE POTÊNCIA
========================== */

function calcularPotencia() {

    const tensao = numero("pot_tensao");
    const corrente = numero("pot_corr");
    const fp = numero("pot_fp") || 1;

    if (!tensao || !corrente) {

        alert("Preencha todos os campos.");

        return;

    }

    const potencia = tensao * corrente * fp;

    resultado(

        "res_potencia",

        `<strong>Potência:</strong> ${potencia.toFixed(0)} W`

    );

}
/* ==========================
   CALCULADORA DE DISJUNTOR
========================== */

function calcularDisjuntor() {

    const corrente = numero("disj_corr");
    const fator = numero("disj_tipo") || 1;

    if (!corrente) {
        alert("Informe a corrente.");
        return;
    }

    const correnteAjustada = corrente * fator;

    const disjuntores = [
        6,10,16,20,25,32,40,50,63,80,100,125,150,175,200
    ];

    const escolhido =
        disjuntores.find(item => item >= correnteAjustada)
        || "Acima de 200 A";

    resultado(

        "res_disjuntor",

        `
        <strong>Corrente Ajustada:</strong>
        ${correnteAjustada.toFixed(2)} A
        <br><br>

        <strong>Disjuntor Recomendado:</strong>
        ${escolhido}
        `

    );

}

/* ==========================
   BITOLA
========================== */

function calcularBitola(){

    const corrente = numero("bit_corr");
    const comprimento = numero("bit_comp");
    const tensao = numero("bit_tensao");

    if(!corrente || !comprimento || !tensao){

        alert("Preencha todos os campos.");

        return;

    }

    const rho = 0.0172;

    const queda = tensao * 0.05;

    const secaoCalculada =
        (2 * rho * comprimento * corrente) / queda;

    const tabela = [

        {secao:1.5,corrente:15.5},

        {secao:2.5,corrente:21},

        {secao:4,corrente:28},

        {secao:6,corrente:36},

        {secao:10,corrente:50},

        {secao:16,corrente:68},

        {secao:25,corrente:89},

        {secao:35,corrente:110},

        {secao:50,corrente:140}

    ];

    let bitola = 50;

    for(const cabo of tabela){

        if(cabo.corrente >= corrente){

            bitola = cabo.secao;

            break;

        }

    }

    if(secaoCalculada > bitola){

        bitola = Math.ceil(secaoCalculada);

    }

    resultado(

        "res_bitola",

        `
        <strong>Bitola Recomendada:</strong>

        ${bitola} mm²

        <br><br>

        <small>

        Considerando queda de tensão de 5%.

        </small>
        `

    );

}

/* ==========================
   METRAGEM
========================== */

function calcularMetragem(){

    const pontos = numero("qtd_pontos");

    const media = numero("media_percurso");

    const folga = numero("folga") || 0;

    if(!pontos || !media){

        alert("Informe todos os dados.");

        return;

    }

    const total =
        pontos * media * (1 + (folga/100));

    resultado(

        "res_metragem",

        `
        <strong>Total Estimado:</strong>

        ${total.toFixed(1)} metros

        `

    );

}

/* ==========================
   RECIBO
========================== */

function gerarRecibo(){

    const cliente = texto("cliente");

    const endereco = texto("endereco");

    const servico = texto("servico");

    const valor = numero("valor").toFixed(2);

    const data =
    new Date().toLocaleDateString("pt-BR");

    resultado(

        "recibo_area",

        `

<div class="recibo-unico">

<h2 style="text-align:center;color:#facc15;">

RECIBO DE SERVIÇO

</h2>

<p>

<strong>Prestador:</strong>

Gabriel Eletro

</p>

<p>

<strong>Cliente:</strong>

${cliente}

</p>

<p>

<strong>Endereço:</strong>

${endereco}

</p>

<p>

<strong>Serviço:</strong>

${servico}

</p>

<p>

<strong>Valor:</strong>

R$ ${valor}

</p>

<p>

<strong>Data:</strong>

${data}

</p>

<br>

<p style="text-align:center;">

_________________________________

<br>

Assinatura

</p>

</div>

`

    );

}

/* ==========================
   FIM
========================== */

console.log(

"⚡ Gabriel Eletro V2K carregado com sucesso."

);