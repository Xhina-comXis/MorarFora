
document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA PARA EXIBIR MENSAGENS (GLOBAL) ---
    // Esta função será usada para mostrar mensagens de sucesso/erro na interface
    // em vez de usar 'alert()'.
    const messageBox = document.getElementById('messageBox'); // Pega o elemento da caixa de mensagem

    function showMessage(message, type = 'success') {
        if (messageBox) {
            messageBox.textContent = message;
            // Define as classes para estilização e visibilidade (show, success/error)
            messageBox.className = `message-box show ${type}`; 
            // Garante que o elemento esteja visível
            messageBox.classList.remove('hidden'); 

            // Oculta a mensagem após 5 segundos
            setTimeout(() => {
                messageBox.classList.remove('show');
                // Opcional: esconde o elemento completamente após a transição para liberar espaço
                setTimeout(() => messageBox.classList.add('hidden'), 300); 
            }, 5000);
        } else {
            // Fallback para 'alert()' se a caixa de mensagem não for encontrada (não deve acontecer se o HTML estiver certo)
            alert(message);
        }
    }


    // --- LÓGICA DE LOGIN E REGISTRO (Para auth.html) ---
    const formTitle = document.getElementById('form-title');
    const usernameField = document.getElementById('regUsername');
    const emailField = document.getElementById('regEmail');
    const passwordField = document.getElementById('regPassword');
    const toggleLink = document.querySelector('.toggle-link');
    const submitButton = document.getElementById('submitButton');
    const authForm = document.getElementById('auth-form');

    let isLogin = true; // Define o estado inicial do formulário como Login

    // Verifica se os elementos do formulário de autenticação existem na página.
    // Isso garante que este bloco de código só tente rodar quando estivermos em 'auth.html'.
    if (formTitle && usernameField && emailField && passwordField && toggleLink && submitButton && authForm) {
        
        // Função para alternar entre as visualizações de Login e Registro do formulário.
        // É exposta globalmente ('window.toggleForm') para ser chamada pelo 'onclick' no HTML.
        window.toggleForm = function() {
            isLogin = !isLogin; // Inverte o estado
            if (isLogin) {
                // Configurações para o modo Login
                usernameField.classList.add('hidden'); // Esconde o campo de nome de usuário
                formTitle.innerText = 'Login';
                submitButton.innerText = 'Entrar';
                toggleLink.innerText = 'Não tem conta? Registre-se';
            } else {
                // Configurações para o modo Registrar
                usernameField.classList.remove('hidden'); // Mostra o campo de nome de usuário
                formTitle.innerText = 'Registrar';
                submitButton.innerText = 'Registrar';
                toggleLink.innerText = 'Já tem conta? Entrar';
            }
            // Oculta qualquer mensagem de feedback existente ao alternar o formulário.
            if (messageBox) {
                messageBox.classList.add('hidden');
                messageBox.classList.remove('show', 'success', 'error');
            }
        };

        // Adiciona um 'event listener' para o envio do formulário de autenticação.
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Previne o comportamento padrão do formulário de recarregar a página.

            const email = emailField.value;
            const password = passwordField.value;
            let url = '';
            let data = {};

            // Determina qual rota do backend usar e quais dados enviar, baseado no estado atual do formulário.
            if (isLogin) {
                url = 'http://localhost:5000/login'; // Rota de login do seu backend
                // Para login, o backend está configurado para procurar por 'username' OU 'email'.
                // Estamos enviando o valor do campo de email como 'username' para simplificar o formulário HTML.
                data = { username: email, password: password }; 
            } else {
                url = 'http://localhost:5000/register'; // Rota de registro do seu backend
                const username = usernameField.value;
                data = { username: username, email: email, password: password };
            }

            try {
                // Envia a requisição POST para o backend usando 'fetch()'.
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Informa que o corpo da requisição é JSON
                    },
                    body: JSON.stringify(data) // Converte o objeto JavaScript 'data' para uma string JSON
                });

                const result = await response.json(); // Analisa a resposta JSON do backend.

                if (response.ok) { // 'response.ok' é true para status HTTP 2xx (sucesso).
                    showMessage('Sucesso: ' + result.message, 'success'); // Exibe mensagem de sucesso.
                    authForm.reset(); // Limpa os campos do formulário.
                    if (!isLogin) { 
                       toggleForm(); // Se o registro foi bem-sucedido, alterna para a tela de login.
                    }
                    // Em um aplicativo real, você faria mais aqui, como guardar um token de sessão
                    // ou redirecionar o usuário para uma área logada.
                } else {
                    // Se o status HTTP não for 2xx (erro), exibe a mensagem de erro do backend.
                    showMessage('Erro: ' + result.message, 'error'); 
                }

            } catch (error) {
                // Captura erros de rede ou outros erros que impedem a comunicação com o backend.
                console.error('Erro ao conectar ao backend:', error);
                showMessage('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 'error'); 
            }
        });
    }


    // --- Lógica do Carrinho Hover (Geral para todas as páginas que têm o botão do carrinho) ---
    const cartButton = document.getElementById('cart-button');
    const cartHover = document.getElementById('cart-hover');
    const hoverList = document.getElementById('hover-list');

    // Apenas tenta configurar a lógica do carrinho hover se os elementos existirem na página.
    // Isso previne erros em páginas onde esses elementos não estão presentes.
    if (cartButton && cartHover && hoverList) { 
        cartButton.addEventListener('mouseenter', () => {
            const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            hoverList.innerHTML = ''; // Limpa a lista antes de preencher
            // Mostra apenas os 3 primeiros itens do carrinho na prévia
            carrinho.slice(0, 3).forEach(item => { 
                const li = document.createElement('li');
                // Adiciona o nome do item e o preço formatado, com fallback se o preço for nulo.
                li.textContent = `${item.nome} - R$ ${item.preco ? item.preco.toFixed(2) : '0.00'}`;
                hoverList.appendChild(li);
            });
            if (carrinho.length === 0) {
                hoverList.innerHTML = '<li>Vazio</li>'; // Mensagem se o carrinho estiver vazio
            }
            cartHover.style.display = 'block'; // Mostra a prévia do carrinho
        });

        cartButton.addEventListener('mouseleave', () => {
            // Pequeno atraso para a prévia não sumir imediatamente quando o mouse sai.
            setTimeout(() => cartHover.style.display = 'none', 300);
        });
    }


    // --- LÓGICA DE ATUALIZAÇÃO DA PÁGINA DO CARRINHO (Para carrinho.html) ---
    const listaCarrinhoElement = document.getElementById('lista-carrinho');
    const totalElement = document.getElementById('total');
    const finalizarCompraButton = document.getElementById('finalizarCompraButton'); 

    // Apenas executa a lógica se os elementos da página de carrinho existirem.
    if (listaCarrinhoElement && totalElement) { 
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        let soma = 0;

        if (carrinho.length === 0) {
            listaCarrinhoElement.innerHTML = '<div class="empty-msg">Seu carrinho está vazio.</div>';
        } else {
            carrinho.forEach(item => {
                const wrapper = document.createElement('div');
                wrapper.className = 'cart-item';
                
                const img = document.createElement('img');
                // Ajusta o caminho da imagem: 'item.imagem' deve ser apenas o nome do arquivo (ex: "USA-removebg-preview.png").
                // O caminho '../image/' sobe da pasta 'js/' (onde está o script) para a raiz do projeto,
                // e então entra na pasta 'image/'.
                img.src = `../image/${item.imagem}`; 
                img.alt = item.nome;

                const details = document.createElement('div');
                details.className = 'cart-item-details';

                const nome = document.createElement('h4');
                nome.textContent = item.nome;

                const preco = document.createElement('p');
                // Formata o preço, com fallback para '0.00' se o preço for nulo ou indefinido.
                const precoFormatado = item.preco ? item.preco.toFixed(2) : '0.00';
                preco.innerHTML = `<del>R$ 30,00</del> <strong>R$${precoFormatado}</strong>`;

                details.appendChild(nome);
                details.appendChild(preco);

                wrapper.appendChild(img);
                wrapper.appendChild(details);

                listaCarrinhoElement.appendChild(wrapper);

                soma += item.preco || 0; // Soma o preço do item, usando 0 se for nulo.
            });

            totalElement.textContent = 'Total: R$ ' + soma.toFixed(2);
        }

        // Adiciona um 'event listener' ao botão "Finalizar Compra".
        if (finalizarCompraButton) {
            finalizarCompraButton.addEventListener('click', () => {
                // Aqui você pode adicionar lógica de integração com um gateway de pagamento ou backend para finalizar o pedido.
                alert('Compra finalizada com sucesso!'); // Por enquanto, usa 'alert()'.
                localStorage.removeItem('carrinho'); // Limpa o carrinho no localStorage.
                window.location.href = 'carrinho.html'; // Redireciona para a página do carrinho (que agora estará vazia).
            });
        }
    }


    // --- FUNÇÃO AUXILIAR PARA POPULAR O CARRINHO PARA TESTE (Opcional) ---
    // Esta função é exposta globalmente para ser chamada diretamente de um botão no HTML (ex: em 'carrinho.html').
    window.popularCarrinho = function() {
        const ebooks = [
            { nome: "EUA", imagem: "USA-removebg-preview.png", preco: 15.00 },
            { nome: "Portugal", imagem: "POR-removebg-preview.png", preco: 15.00 },
            { nome: "Espanha", imagem: "ESP-removebg-preview.png", preco: 15.00 },
            { nome: "UK", imagem: "UK-removebg-preview.png", preco: 15.00 },
            { nome: "Canadá", imagem: "CAN-removebg-preview.png", preco: 15.00 },
            { nome: "Japão", imagem: "JAP-removebg-preview.png", preco: 15.00 },
            { nome: "Austrália", imagem: "AUS-removebg-preview.png", preco: 15.00 },
            { nome: "Alemanha", imagem: "ALE-removebg-preview.png", preco: 15.00 }
        ];

        localStorage.setItem('carrinho', JSON.stringify(ebooks));
        location.reload(); // Recarrega a página para que as mudanças no carrinho sejam visíveis.
    };
});