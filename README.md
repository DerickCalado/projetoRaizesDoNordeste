# Rede "Raízes do Nordeste" — Design System & Protótipo Interativo

Este projeto apresenta a especificação do **Design System (DS)** e um **Protótipo Interativo de Fluxo de Pedidos** para a rede de lanchonetes **"Raízes do Nordeste"**, inspirado no fluxo de convidados (*guest*) de autoatendimento da Pizza Hut (`https://www.pizzahut.com.br/guest`).

A proposta unifica a agilidade e a organização da jornada de compra de uma grande franquia multinacional com as cores calorosas, a gastronomia típica e a identidade cultural do Nordeste brasileiro.

---

## 🎨 Cores e Tokens de Design (Nordeste Warm)

Substituímos o vermelho característico da Pizza Hut por tonalidades ricas que remetem à cultura nordestina:
* **Terracota (`--color-primary` / `#C85A32`):** Representa o solo do sertão, a argila e os tradicionais utensílios de barro.
* **Amarelo Cuscuz (`--color-secondary` / `#F4B942`):** Representa o sol brilhante, o milho e o cuscuz fumegante que é marca registrada.
* **Verde Mandacaru (`--color-success` / `#2E7D32`):** O cacto mandacaru, símbolo de resiliência e frescor regional, usado para feedbacks positivos e sucesso.
* **Creme de Coco (`--color-bg-light` / `#FCFAF6`):** Tom esbranquiçado suave para substituir o branco frio comercial, trazendo sensação de aconchego e hospitalidade.
* **Marrom Café (`--color-text-main` / `#2F2421`):** Tom de café coado forte para textos principais, otimizando o contraste e a legibilidade.

---

## 📦 Estrutura de Arquivos do Projeto

```text
raizes-do-nordeste-ds/
├── index.html       # Simulador interativo e painel de documentação do Design System
├── index.css        # Arquivo central com variáveis CSS (tokens), grid e estilos dos componentes
├── app.js           # Lógica que simula o carrinho, customizações, unidades e checkout desacoplado
├── assets/          # Fotos e imagens dos produtos regionais
│   ├── cuscuz_recheado.png
│   ├── tapioca_rendada.png
│   ├── bolo_macaxeira.png
│   └── suco_caja.png
└── README.md        # Esta documentação detalhada
```

---

## 🛠️ Desafios do Estudo de Caso Resolvidos no Protótipo

O protótipo permite interagir diretamente com as regras descritas no estudo de caso da rede:

### 1. Múltiplos Canais e Jornada Unificada (Seção 2)
A tela inicial simula a escolha entre **Delivery** (com cálculo de frete dinâmico após busca de CEP) e **Retirada (Pick-up)** com a seleção visual de unidades físicas da rede.

### 2. Diferenças de Menu por Unidade (Seção 3)
Nem todas as cozinhas são iguais. Ao mudar de unidade:
* **Recife Centro:** Possui cozinha completa, disponibilizando pratos quentes e sucos (ex: *Bolo de Macaxeira* e *Suco de Cajá*).
* **Caruaru Express:** Unidade de cozinha reduzida, oferecendo apenas itens simplificados (ex: *Cuscuz* e *Tapioca*). O cardápio se adapta automaticamente na tela ao selecionar a loja.

### 3. Programa de Fidelização e Privacidade (LGPD) (Seção 4)
No cabeçalho do site ou no banner do carrinho de compras, há a opção de "Entrar / Cadastrar". O cadastro exige Nome, E-mail, WhatsApp, CPF, Senha e o **consentimento de LGPD** explícito. Ao se cadastrar com o consentimento ativado, o desconto de **15%** de fidelidade é ativado automaticamente no carrinho, e o sistema vincula os dados do usuário ao pedido de forma segura.

### 4. Pagamentos Desacoplados (Seção 5)
O sistema não processa pagamentos internamente. Ao clicar em finalizar pedido, abre-se uma tela do gateway externo simulado. Você pode optar por simular um pagamento via **PIX** ou **Cartão**, escolhendo se deseja aprovar ou recusar a transação. O sistema receberá o retorno assíncrono e atualizará a timeline de status do pedido de acordo.

---

## 🚀 Como Visualizar e Testar o Protótipo

O site está publicado em: https://derickcalado.github.io/projetoRaizesDoNordeste/
