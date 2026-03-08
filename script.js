// ==================== DADOS INICIAIS ====================
const pizzas = [
    { id: 1, nome: 'Margherita', descricao: 'Molho de tomate, mussarela de búfala, manjericão', preco: 49.90, categoria: 'tradicionais' },
    { id: 2, nome: 'Pepperoni', descricao: 'Molho de tomate, mussarela, pepperoni, orégano', preco: 54.90, categoria: 'tradicionais' },
    { id: 3, nome: 'Calabresa', descricao: 'Molho de tomate, mussarela, calabresa, cebola', preco: 52.90, categoria: 'tradicionais' },
    { id: 4, nome: 'Portuguesa', descricao: 'Molho, mussarela, presunto, ovos, cebola, azeitonas', preco: 56.90, categoria: 'tradicionais' },
    { id: 5, nome: 'Quatro Queijos', descricao: 'Mussarela, parmesão, gorgonzola, catupiry', preco: 62.90, categoria: 'especiais' },
    { id: 6, nome: 'Frango Catupiry', descricao: 'Molho, mussarela, frango desfiado, catupiry, milho', preco: 59.90, categoria: 'especiais' },
    { id: 7, nome: 'Bacon', descricao: 'Molho, mussarela, bacon crocante, cheddar, cebola', preco: 64.90, categoria: 'especiais' },
    { id: 8, nome: 'Vegetariana', descricao: 'Molho, mussarela, abobrinha, berinjela, tomate seco, rúcula', preco: 58.90, categoria: 'especiais' },
    { id: 9, nome: 'Chocolate com Morango', descricao: 'Chocolate ao leite, morangos frescos, leite condensado', preco: 69.90, categoria: 'doces' },
    { id: 10, nome: 'Banana Caramelizada', descricao: 'Banana, canela, doce de leite, castanhas', preco: 67.90, categoria: 'doces' },
    { id: 11, nome: 'Romeu e Julieta', descricao: 'Mussarela de búfala, goiabada, queijo minas', preco: 64.90, categoria: 'doces' },
    { id: 12, nome: 'Prestígio', descricao: 'Chocolate ao leite, coco fresco, leite condensado', preco: 71.90, categoria: 'doces' }
];

// ==================== ESTADO GLOBAL ====================
let avaliacoes = JSON.parse(localStorage.getItem('avaliacoes')) || [];
let opinioes = JSON.parse(localStorage.getItem('opinioes')) || [];
let votosEnquete = JSON.parse(localStorage.getItem('votosEnquete')) || [0, 0, 0, 0];
let pizzaSelecionada = 1;
let notaSelecionada = 0;

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    renderizarCardapio();
    renderizarSelectPizzas();
    renderizarAvaliacoes();
    renderizarRanking();
    renderizarEnquete();
    renderizarOpinioes();
    renderizarSugestoes();
    atualizarMediaGeral();
    configurarEventos();
});

// ==================== CONFIGURAÇÕES GERAIS ====================
function configurarEventos() {
    // Menu mobile
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('active');
    });

    // Links do menu
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('nav-menu').classList.remove('active');
        });
    });

    // Filtros do cardápio
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderizarCardapio(btn.dataset.filtro);
        });
    });

    // Sistema de estrelas para avaliação
    document.querySelectorAll('#estrelas-input i').forEach(estrela => {
        estrela.addEventListener('mouseover', () => {
            const valor = parseInt(estrela.dataset.valor);
            destacarEstrelas('estrelas-input', valor);
        });

        estrela.addEventListener('mouseout', () => {
            destacarEstrelas('estrelas-input', notaSelecionada);
        });

        estrela.addEventListener('click', () => {
            notaSelecionada = parseInt(estrela.dataset.valor);
            destacarEstrelas('estrelas-input', notaSelecionada);
        });
    });

    // Estrelas para atendimento
    document.querySelectorAll('#estrelas-atendimento i').forEach(estrela => {
        estrela.addEventListener('click', () => {
            const valor = parseInt(estrela.dataset.valor);
            destacarEstrelas('estrelas-atendimento', valor);
        });
    });

    // Estrelas para qualidade
    document.querySelectorAll('#estrelas-qualidade i').forEach(estrela => {
        estrela.addEventListener('click', () => {
            const valor = parseInt(estrela.dataset.valor);
            destacarEstrelas('estrelas-qualidade', valor);
        });
    });

    // Botão de avaliar
    document.getElementById('btn-avaliar').addEventListener('click', () => {
        adicionarAvaliacao();
    });

    // Enquete
    document.querySelectorAll('.opcao').forEach(opcao => {
        opcao.addEventListener('click', () => {
            votar(opcao.dataset.opcao);
        });
    });

    // Formulário de opinião
    document.getElementById('form-opiniao').addEventListener('submit', (e) => {
        e.preventDefault();
        adicionarOpiniao();
    });

    // Sugestões
    document.querySelectorAll('.sugestao-card').forEach(sugestao => {
        sugestao.addEventListener('click', () => {
            votarSugestao(sugestao.dataset.sugestao);
        });
    });

    // Select de pizzas
    document.getElementById('pizza-select').addEventListener('change', (e) => {
        pizzaSelecionada = parseInt(e.target.value);
    });
}

function destacarEstrelas(containerId, valor) {
    const estrelas = document.querySelectorAll(`#${containerId} i`);
    estrelas.forEach((estrela, index) => {
        if (index < valor) {
            estrela.className = 'fas fa-star';
        } else {
            estrela.className = 'far fa-star';
        }
    });
}

// ==================== CARDÁPIO ====================
function renderizarCardapio(filtro = 'todos') {
    const grid = document.getElementById('cardapio-grid');
    const pizzasFiltradas = filtro === 'todos' 
        ? pizzas 
        : pizzas.filter(p => p.categoria === filtro);

    grid.innerHTML = pizzasFiltradas.map(pizza => {
        const avaliacoesPizza = avaliacoes.filter(a => a.pizzaId === pizza.id);
        const media = calcularMedia(avaliacoesPizza);
        
        return `
            <div class="pizza-card">
                <i class="fas fa-pizza-slice pizza-icon"></i>
                <h3>${pizza.nome}</h3>
                <span class="categoria">${pizza.categoria}</span>
                <p class="descricao">${pizza.descricao}</p>
                <span class="preco">R$ ${pizza.preco.toFixed(2)}</span>
                <div class="media">
                    ${gerarEstrelas(media)}
                    <span class="avaliacoes-count">(${avaliacoesPizza.length})</span>
                </div>
                <button class="btn-avaliar-pizza" onclick="document.getElementById('avaliacoes').scrollIntoView({behavior: 'smooth'}); document.getElementById('pizza-select').value = ${pizza.id}; pizzaSelecionada = ${pizza.id}">
                    Avaliar
                </button>
            </div>
        `;
    }).join('');
}

function renderizarSelectPizzas() {
    const select = document.getElementById('pizza-select');
    select.innerHTML = pizzas.map(pizza => 
        `<option value="${pizza.id}">${pizza.nome}</option>`
    ).join('');
}

// ==================== AVALIAÇÕES ====================
function adicionarAvaliacao() {
    if (notaSelecionada === 0) {
        mostrarNotificacao('Selecione uma nota!');
        return;
    }

    const comentario = document.getElementById('comentario').value;
    const recomenda = document.getElementById('recomendar').checked;
    const comeriaNovamente = document.getElementById('comeria-novamente').checked;

    const avaliacao = {
        id: Date.now(),
        pizzaId: pizzaSelecionada,
        pizzaNome: pizzas.find(p => p.id === pizzaSelecionada).nome,
        nota: notaSelecionada,
        comentario: comentario,
        recomenda: recomenda,
        comeriaNovamente: comeriaNovamente,
        data: new Date().toLocaleString()
    };

    avaliacoes.unshift(avaliacao);
    localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));

    // Limpar formulário
    notaSelecionada = 0;
    destacarEstrelas('estrelas-input', 0);
    document.getElementById('comentario').value = '';
    document.getElementById('recomendar').checked = false;
    document.getElementById('comeria-novamente').checked = false;

    renderizarAvaliacoes();
    renderizarCardapio();
    renderizarRanking();
    atualizarMediaGeral();
    mostrarNotificacao('Avaliação enviada com sucesso!');
}

function renderizarAvaliacoes() {
    const lista = document.getElementById('lista-avaliacoes');
    const ultimas = avaliacoes.slice(0, 5);

    if (ultimas.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: var(--gray);">Nenhuma avaliação ainda</p>';
        return;
    }

    lista.innerHTML = ultimas.map(av => `
        <div class="avaliacao-item">
            <div class="avaliacao-header">
                <span class="avaliacao-pizza">${av.pizzaNome}</span>
                <span class="avaliacao-estrelas">${gerarEstrelas(av.nota)}</span>
            </div>
            ${av.comentario ? `<p class="avaliacao-comentario">"${av.comentario}"</p>` : ''}
            <div class="avaliacao-footer">
                <span><i class="fas fa-check-circle" style="color: ${av.recomenda ? '#27ae60' : '#95a5a6'}"></i> Recomenda</span>
                <span><i class="fas fa-redo-alt" style="color: ${av.comeriaNovamente ? '#27ae60' : '#95a5a6'}"></i> Comeria de novo</span>
                <span>${av.data}</span>
            </div>
        </div>
    `).join('');
}

// ==================== RANKING ====================
function renderizarRanking() {
    const ranking = pizzas.map(pizza => {
        const avaliacoesPizza = avaliacoes.filter(a => a.pizzaId === pizza.id);
        const media = calcularMedia(avaliacoesPizza);
        return {
            nome: pizza.nome,
            media: media,
            total: avaliacoesPizza.length
        };
    }).filter(p => p.total > 0).sort((a, b) => b.media - a.media);

    const container = document.getElementById('ranking-container');

    if (ranking.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray);">Nenhuma pizza avaliada ainda</p>';
        return;
    }

    container.innerHTML = ranking.map((pizza, index) => `
        <div class="ranking-item">
            <span class="ranking-posicao">#${index + 1}</span>
            <span class="ranking-nome">${pizza.nome}</span>
            <span class="ranking-media">
                ${gerarEstrelas(pizza.media)}
                <span>(${pizza.total})</span>
            </span>
        </div>
    `).join('');
}

// ==================== ENQUETE ====================
function renderizarEnquete() {
    const total = votosEnquete.reduce((acc, v) => acc + v, 0);
    document.getElementById('total-votos').textContent = `Total de votos: ${total}`;

    votosEnquete.forEach((votos, index) => {
        document.getElementById(`votos-${index}`).textContent = `${votos} votos`;
    });
}

function votar(opcao) {
    votosEnquete[parseInt(opcao)]++;
    localStorage.setItem('votosEnquete', JSON.stringify(votosEnquete));
    renderizarEnquete();
    mostrarNotificacao('Voto computado com sucesso!');
}

// ==================== OPINIÕES ====================
function adicionarOpiniao() {
    const nome = document.getElementById('nome-opiniao').value;
    const atendimento = getEstrelasValor('estrelas-atendimento');
    const qualidade = getEstrelasValor('estrelas-qualidade');
    const texto = document.getElementById('opiniao-livre').value;

    if (!nome || atendimento === 0 || qualidade === 0) {
        mostrarNotificacao('Preencha todos os campos obrigatórios!');
        return;
    }

    const opiniao = {
        id: Date.now(),
        nome: nome,
        atendimento: atendimento,
        qualidade: qualidade,
        texto: texto,
        data: new Date().toLocaleString()
    };

    opinioes.unshift(opiniao);
    localStorage.setItem('opinioes', JSON.stringify(opinioes));

    document.getElementById('form-opiniao').reset();
    destacarEstrelas('estrelas-atendimento', 0);
    destacarEstrelas('estrelas-qualidade', 0);

    renderizarOpinioes();
    mostrarNotificacao('Opinião enviada com sucesso!');
}

function renderizarOpinioes() {
    const lista = document.getElementById('lista-opinioes');
    const ultimas = opinioes.slice(0, 5);

    if (ultimas.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: var(--gray);">Nenhuma opinião ainda</p>';
        return;
    }

    lista.innerHTML = ultimas.map(op => `
        <div class="opiniao-item">
            <div class="opiniao-header">
                <span>${op.nome}</span>
                <span class="opiniao-estrelas">
                    Atend: ${op.atendimento}★ | Qual: ${op.qualidade}★
                </span>
            </div>
            ${op.texto ? `<p class="opiniao-texto">"${op.texto}"</p>` : ''}
            <small>${op.data}</small>
        </div>
    `).join('');
}

function getEstrelasValor(containerId) {
    const estrelas = document.querySelectorAll(`#${containerId} i`);
    let valor = 0;
    estrelas.forEach((estrela, index) => {
        if (estrela.className === 'fas fa-star') {
            valor = index + 1;
        }
    });
    return valor;
}

// ==================== SUGESTÕES ====================
let sugestoes = JSON.parse(localStorage.getItem('sugestoes')) || [
    { texto: 'Pizza de Camarão', votos: 0 },
    { texto: 'Massas sem glúten', votos: 0 },
    { texto: 'Opções veganas', votos: 0 },
    { texto: 'Pizzas integrais', votos: 0 },
    { texto: 'Novos sabores doces', votos: 0 },
    { texto: 'Bordas recheadas', votos: 0 }
];

function renderizarSugestoes() {
    const container = document.getElementById('sugestoes-container');
    const ordenadas = [...sugestoes].sort((a, b) => b.votos - a.votos).slice(0, 6);

    container.innerHTML = ordenadas.map((s, index) => `
        <div class="sugestao-card" data-sugestao="${index}">
            <i class="fas fa-lightbulb"></i>
            <h4>${s.texto}</h4>
            <span class="sugestao-votos">${s.votos} votos</span>
        </div>
    `).join('');

    // Reaplicar eventos
    document.querySelectorAll('.sugestao-card').forEach(card => {
        card.addEventListener('click', () => {
            votarSugestao(card.dataset.sugestao);
        });
    });
}

function votarSugestao(index) {
    sugestoes[parseInt(index)].votos++;
    localStorage.setItem('sugestoes', JSON.stringify(sugestoes));
    renderizarSugestoes();
    mostrarNotificacao('Sugestão votada! Obrigado pela participação.');
}

// ==================== MÉDIA GERAL ====================
function atualizarMediaGeral() {
    if (avaliacoes.length === 0) return;

    const media = avaliacoes.reduce((acc, av) => acc + av.nota, 0) / avaliacoes.length;
    document.getElementById('media-geral').textContent = media.toFixed(1);
    document.getElementById('media-estrelas').innerHTML = gerarEstrelas(media);
}

// ==================== UTILITÁRIOS ====================
function calcularMedia(avaliacoes) {
    if (avaliacoes.length === 0) return 0;
    return avaliacoes.reduce((acc, av) => acc + av.nota, 0) / avaliacoes.length;
}

function gerarEstrelas(nota) {
    const estrelasCheias = Math.floor(nota);
    const temMeia = nota % 1 >= 0.5;
    let estrelas = '';

    for (let i = 0; i < 5; i++) {
        if (i < estrelasCheias) {
            estrelas += '<i class="fas fa-star"></i>';
        } else if (i === estrelasCheias && temMeia) {
            estrelas += '<i class="fas fa-star-half-alt"></i>';
        } else {
            estrelas += '<i class="far fa-star"></i>';
        }
    }

    return estrelas;
}

function mostrarNotificacao(msg) {
    const notif = document.createElement('div');
    notif.className = 'notificacao';
    notif.textContent = msg;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
