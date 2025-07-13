const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function atualizarCheckout() {
  const container = document.getElementById('checkout');
  container.innerHTML = '';

  let total = 0;
  carrinho.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item-carrinho';
    
    const img = document.createElement('img');
    img.src = 'imagens/' + item.imagem;
    img.alt = item.nome;

    const titulo = document.createElement('h3');
    titulo.textContent = item.nome;

    const preco = document.createElement('p');
    preco.textContent = `R$ ${item.preco.toFixed(2)}`;

    div.appendChild(img);
    div.appendChild(titulo);
    div.appendChild(preco);
    container.appendChild(div);

    total += item.preco;
  });

  document.getElementById('total').textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Exemplo: popular carrinho localStorage para teste
function popularCarrinho() {
  const ebooks = [
    { nome: "EUA", imagem: "image/USA-removebg-preview.png" },
    { nome: "Portugal", imagem: "image/POR-removebg-preview.png" },
    { nome: "Espanha", imagem: "image/ESP-removebg-preview.png" },
    { nome: "UK", imagem: "image/UK-removebg-preview.png" },
    { nome: "Canadá", imagem: "image/CAN-removebg-preview.png" },
    { nome: "Japão", imagem: "image/JAP-removebg-preview.png" },
    { nome: "Austrália", imagem: "image/AUS-removebg-preview.png" },
    { nome: "Alemanha", imagem: "image/ALE-removebg-preview.png" }
  ];

  const carrinho = ebooks.map(ebook => ({
    nome: ebook.nome,
    preco: 15.00,
    imagem: ebook.imagem
  }));

  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  location.reload();
}

document.addEventListener('DOMContentLoaded', atualizarCheckout);
