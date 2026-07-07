# ⚡ GS Elétrica V2K

> Sistema profissional completo para eletricistas, desenvolvido com foco nas normas técnicas brasileiras e gestão prática de serviços.

---

## 📋 Sobre o Projeto
O **GS Elétrica V2K** é uma solução web pensada para auxiliar no dia a dia do profissional de eletricidade, reunindo ferramentas de cálculo, gestão de clientes, orçamentos, recibos e consulta rápida a normas — tudo alinhado à **NBR 5410, NR-10 e demais regulamentações vigentes**.

Desenvolvido por Gabriel, Natal/RN.

---

## ✨ Funcionalidades Principais
- 🧮 **Calculadoras Elétricas**: Cálculo de corrente, seção de cabos, queda de tensão, potência e muito mais
- 📝 **Orçamentos**: Criação, armazenamento e impressão de orçamentos profissionais
- 🧾 **Recibos**: Emissão rápida de recibos com dados da sua empresa e formato pronto para impressão
- 👥 **Gestão de Clientes**: Cadastro, edição e busca de clientes
- 📅 **Agenda**: Organização de serviços e compromissos
- 📚 **Biblioteca Técnica**: Normas, tabelas práticas e orientações de segurança
- ⚙️ **Configurações**: Controle de tema, backup e restauração de dados
- 📱 **PWA**: Funciona offline, pode ser instalado como aplicativo no celular

---

## 📂 Estrutura do Projeto

gs-eletrica-v2k/
├── index.html               # Página inicial
├── loading.html             # Tela de carregamento
├── sw.js                    # Service Worker (funcionamento offline)
├── manifest.json            # Configuração PWA
├── LICENSE                   # Termos de uso
├── README.md                 # Documentação
│
├── paginas/
│   ├── calculadoras.html
│   ├── orcamentos.html
│   ├── recibos.html
│   ├── clientes.html
│   ├── agenda.html
│   ├── biblioteca.html
│   ├── ferramentas.html
│   ├── configuracoes.html
│   ├── navbar.html          # Componente cabeçalho
│   ├── sidebar.html         # Componente menu lateral
│   ├── footer.html          # Componente rodapé
│   └── modal.html           # Componente janelas de diálogo
│
├── dados/
│   ├── aparelhos.json
│   ├── cabos.json
│   ├── clientes.json
│   ├── tabelas.json
│   └── historico.json
│
├── Assets/
│   ├── CSS/estilo.css       # Estilos globais
│   ├── JS/script.js         # Funções gerais
│   └── IMG/                 # Ícones e imagens


---

## 🚀 Como Usar
### Opção 1: Instalação Local
1. Baixe todos os arquivos para uma pasta no seu dispositivo
2. Abra o arquivo `index.html` no navegador
3. Pronto! Todas as funcionalidades estarão disponíveis

### Opção 2: Como Aplicativo (PWA)
1. Abra o sistema no navegador do seu celular
2. Clique em "Adicionar à tela inicial" no menu do navegador
3. O ícone será instalado como um app nativo, com acesso rápido e funcionamento offline

---

## 🛠️ Tecnologias Utilizadas
- HTML5 semântico
- CSS3 responsivo
- JavaScript puro (sem dependências externas)
- Service Worker e Manifest para PWA
- Armazenamento Local (LocalStorage) para dados

---

## 📜 Base Normativa
- ✅ NBR 5410 – Instalações elétricas de baixa tensão
- ✅ NR-10 – Segurança em instalações e serviços com eletricidade
- ✅ NBR 14713 – Condutores de cobre isolados
- ✅ NBR 5419 – Proteção contra descargas atmosféricas

> ⚠️ **Aviso**: O conteúdo técnico serve como apoio profissional. Sempre consulte a versão oficial e atualizada das normas para execução de serviços.

---

## 📄 Licença
Este projeto está sob a licença MIT – veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📬 Contato
Desenvolvido por Gabriel – Natal/RN