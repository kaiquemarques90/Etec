'use strict'

function mostrarMaravilha(none) {
    let caixa = document.getElementById('caixa-de-detalhes');

    if (none === 'Cristo Redentor') {
        caixa.innerHTML = `
        <h2 class="titulo-detalhes">Cristo Redentor</h2>
        <div class="conteudo-alinhado">
            <p class="detalhes">O Cristo Redentor é uma estátua de Jesus Cristo localizada no topo do Morro do Corcovado, no Rio de Janeiro, Brasil. Com 30 metros de altura e braços estendidos, a estátua é um símbolo icônico da cidade e do país. Inaugurada em 1931, o Cristo Redentor é uma das sete maravilhas do mundo moderno e atrai milhões de visitantes todos os anos, oferecendo vistas panorâmicas deslumbrantes da cidade e da Baía de Guanabara.</p>
            <img class="imagens" src="https://agendadopoder.com.br/wp-content/uploads/2025/02/cristoranking.jpg" alt="Cristo Redentor">
        </div>
        <footer id="rodape">
        <p>Desenvolvido por: <strong>Kaique Marques</strong></p>
        </footer>
        `;
    }
    else if (none === 'Taj Mahal') {
        caixa.innerHTML = `
        <h2 class="titulo-detalhes">Taj Mahal</h2>
        <div class="conteudo-alinhado">
            <p class="detalhes">O Taj Mahal é um mausoléu localizado em Agra, Índia. Construído pelo imperador mogol Shah Jahan em memória de sua esposa Mumtaz Mahal, o Taj Mahal é reconhecido como um dos monumentos mais belos do mundo e um símbolo do amor eterno.</p>
            <img class="imagens" src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/9a/30/d6/agra.jpg?w=900&h=500&s=1" alt="Taj Mahal">
        </div>
        <footer id="rodape">
        <p>Desenvolvido por: <strong>Kaique Marques</strong></p>
        </footer>
        `;
    }
    else if (none === 'Chichen Itzá') {
        caixa.innerHTML = `
        <h2 class="titulo-detalhes">Chichen Itzá</h2>
        <div class="conteudo-alinhado">
            <p class="detalhes">Chichen Itzá é um sítio arqueológico maia localizado na península de Yucatán, México. Foi uma das maiores cidades maias e é famosa por suas pirâmides, templos e observatórios. O Templo de Kukulcán, também conhecido como El Castillo, é a estrutura mais icônica do local e é considerado uma das sete maravilhas do mundo moderno.</p>
            <img class="imagens" src="https://www.civitatis.com/f/mexico/cancun/chichen-itza-cenote-sagrado-589x392.jpg" alt="Chichen Itzá">
        </div>
        <footer id="rodape">
        <p>Desenvolvido por: <strong>Kaique Marques</strong></p>
        </footer>
        `;
    }
    else if (none === 'Petra') {
        caixa.innerHTML = `
            <h2 class="titulo-detalhes">Petra</h2>
            <div class="conteudo-alinhado">
                <p class="detalhes">Petra é uma cidade histórica localizada no norte da Jordânia. Construída na rocha, é famosa por suas estruturas arquitetônicas impressionantes e seu valor cultural. A cidade é considerada uma das sete maravilhas do mundo moderno e atrai milhões de visitantes todos os anos.</p>
                <img class="imagens" src="https://static.wixstatic.com/media/fd9286_528f2b6a9ca848d4a43377f38ae3ee9e~mv2.jpg/v1/fill/w_628,h_472,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/fd9286_528f2b6a9ca848d4a43377f38ae3ee9e~mv2.jpg" alt="Petra">
            </div>
            <footer id="rodape">
            <p>Desenvolvido por: <strong>Kaique Marques</strong></p>
            </footer>
            `;
    }
    else if (none === 'Colisseu de Roma') {
        caixa.innerHTML = `
            <h2 class="titulo-detalhes">Colisseu de Roma</h2>
            <div class="conteudo-alinhado">
                <p class="detalhes">O Colisseu de Roma, também conhecido como Anfiteatro Flaviano, é um dos monumentos mais icônicos da Roma Antiga. Construído no século I d.C., o Colisseu era usado para eventos públicos, como lutas de gladiadores e espetáculos. Com capacidade para cerca de 50.000 espectadores, o Colisseu é uma das sete maravilhas do mundo moderno e um símbolo duradouro da engenharia romana.</p>
                <img class="imagens" src="https://dicasdaitalia.com.br/wp-content/uploads/sites/11/2019/12/coliseu-roma.jpg" alt="Colisseu de Roma">
            </div>
            <footer id="rodape">
            <p>Desenvolvido por: <strong>Kaique Marques</strong></p>
            </footer>
            `;
    }
    else if (none === 'Machu Picchu') {
        caixa.innerHTML = `
            <h2 class="titulo-detalhes">Machu Picchu</h2>
            <div class="conteudo-alinhado">
                <p class="detalhes">Machu Picchu é uma antiga cidade inca localizada nas montanhas do Peru. Construída no século XV, Machu Picchu é famosa por sua arquitetura impressionante e sua localização deslumbrante. A cidade é considerada uma das sete maravilhas do mundo moderno e atrai milhões de visitantes todos os anos, oferecendo vistas panorâmicas das montanhas e da floresta ao redor.</p>
                <img class="imagens" src="https://images.trvl-media.com/place/178042/3f325d00-c870-4f18-82af-5d16b77679d8.jpg?impolicy=fcrop&w=450&h=280&q=medium" alt="Machu Picchu">
            </div>
            <footer id="rodape">
            <p>Desenvolvido por: <strong>Kaique Marques</strong></p>
            </footer>
            `;
    }
    else if (none === 'Muralha da China') {
        caixa.innerHTML = `
            <h2 class="titulo-detalhes">Muralha da China</h2>
            <div class="conteudo-alinhado">
                <p class="detalhes">A Muralha da China é uma série de fortificações construídas ao longo de milhares de anos para proteger o território chinês contra invasões. Com mais de 21.000 quilômetros de extensão, a muralha é uma das maiores estruturas já construídas pelo homem e é considerada uma das sete maravilhas do mundo moderno. A Muralha da China é um símbolo duradouro da história e da cultura chinesa, atraindo milhões de visitantes todos os anos.</p>
                <img class="imagens" src="https://s4.static.brasilescola.uol.com.br/be/2025/10/muralha-da-china.jpg" alt="Muralha da China">
            </div>
            <footer id="rodape">
            <p>Desenvolvido por: <strong>Kaique Marques</strong></p>
            </footer>
            `;
    }
}