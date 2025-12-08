
# 📂 Meu Visualizador Web Local

Este repositório contém a estrutura de arquivos para um visualizador web local simples, projetado para ser executado via **Visual Studio Code** utilizando a extensão **Live Server**.

---

## 🎯 Sobre o Projeto

O objetivo deste projeto é fornecer um ambiente simples para navegar, visualizar e testar arquivos web (HTML, CSS, Imagens, etc.) rapidamente, sem a necessidade de configurar um servidor complexo. Ele transforma sua pasta de projeto em um pequeno servidor local.

## 🛠️ Tecnologias Utilizadas

* **HTML, CSS, JavaScript** (para o conteúdo a ser visualizado)
* **Visual Studio Code (VS Code)**
* **Live Server Extension** (Extensão do VS Code por Ritwick Dey)

---

## 🚀 Como Configurar e Executar

Siga os passos abaixo para colocar o visualizador web em funcionamento no seu ambiente.

### Pré-requisitos

Certifique-se de ter os seguintes itens instalados:

1.  **Visual Studio Code**
2.  Extensão **Live Server** instalada no VS Code.

### Instalação e Execução

1.  **Clone o Repositório** para sua máquina local:
    ```bash
    git clone [INSERIR LINK DO SEU REPOSITÓRIO AQUI]
    cd nome-do-seu-projeto
    ```
2.  **Abra a Pasta no VS Code:**
    ```bash
    code .
    ```
3.  **Inicie o Servidor Local:**
    * No VS Code, abra o arquivo `index.html` (ou qualquer arquivo que deseja visualizar).
    * Clique com o botão direito do mouse no arquivo e selecione **`Open with Live Server`**.
    * Alternativamente, clique no botão **`Go Live`** na barra de status inferior do VS Code.

O seu navegador padrão será aberto automaticamente, exibindo o conteúdo do projeto em `$http://127.0.0.1:5500/` (ou porta similar).

---

## 📁 Estrutura de Pastas

Meu Visualizador Web Local/ ├── index.html # Página inicial ou ponto de partida do visualizador. ├── css/ # Pasta para arquivos CSS (estilos). ├── js/ # Pasta para arquivos JavaScript (interatividade). ├── assets/ # Pasta para imagens e outros recursos estáticos. ├── .gitignore # Arquivos ignorados pelo Git. └── README.md # Este arquivo.

---

## 📝 Licença

Este projeto está licenciado sob a **Licença MIT**.