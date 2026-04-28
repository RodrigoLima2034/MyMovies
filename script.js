const searchButton = document.getElementById('search-button');
const movieName = document.getElementById('movie-name');
const movieYear = document.getElementById('movie-year');
const movieListContainer = document.getElementById('movie-list');
const clearButton = document.getElementById('clear-button');
const saveKeyButton = document.getElementById('save-key');
const apiKeyInput = document.getElementById('api-key');

// Spinner
const spinner = document.createElement('div');
spinner.id = 'spinner-loading';
spinner.style.display = 'none';
spinner.style.position = 'fixed';
spinner.style.top = '50%';
spinner.style.left = '50%';
spinner.style.transform = 'translate(-50%, -50%)';
spinner.style.zIndex = '9999';
spinner.innerHTML = '<div style="border: 8px solid #f3f3f3; border-top: 8px solid #3498db; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite;"></div>';
document.body.appendChild(spinner);

const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

let key = ""; // 🔥 agora cada usuário define a própria key

let movieList;

try {
    movieList = JSON.parse(localStorage.getItem("movieList")) || [];
} catch {
    movieList = [];
}

/* 🔑 SALVAR KEY DO USUÁRIO */
saveKeyButton.addEventListener('click', () => {
    if (!apiKeyInput.value.trim()) {
        notie.alert({ type: 'error', text: 'Digite uma API Key!' });
        return;
    }

    key = apiKeyInput.value.trim();
    notie.alert({ type: 'success', text: 'API Key salva!' });
});

/* 🔎 SEARCH */
async function searchButtonClickHandler() {
    try {
        spinner.style.display = 'block';
        if (!key) {
            throw new Error("Digite sua API Key primeiro!");
        }
        let url = `https://www.omdbapi.com/?apikey=${key}&t=${movieNameParameterGenerator()}`;
        const year = movieYearParameterGenerator();
        if (year) url += `&y=${year}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || data.Response === "False") {
            throw new Error('Filme não encontrado!');
        }
        createModal(data);
    } catch (error) {
        notie.alert({ type: 'error', text: error.message });
    } finally {
        spinner.style.display = 'none';
    }
}

/* NAME */
function movieNameParameterGenerator() {
    if (movieName.value.trim() === '') {
        throw new Error('Informe o nome do filme');
    }
    return encodeURIComponent(movieName.value.trim());
}

/* YEAR */
function movieYearParameterGenerator() {
    if (movieYear.value.trim() === '') return '';

    if (movieYear.value.length !== 4 || isNaN(movieYear.value)) {
        throw new Error('Ano inválido');
    }

    return movieYear.value;
}

/* ADD */
function addToList(movieObject) {

    const exists = movieList.some(movie => movie.imdbID === movieObject.imdbID);

    if (exists) {
        notie.alert({ type: 'error', text: 'Filme já está na lista!' });
        return;
    }

    movieList.push(movieObject);
    updateUI(movieObject);
    updateLocalStorage();
}

/* UI */
function updateUI(movieObject) {
    const poster = movieObject.Poster !== "N/A"
        ? movieObject.Poster
        : "https://via.placeholder.com/180x250?text=Sem+Imagem";

    movieListContainer.insertAdjacentHTML('beforeend', `
        <article id="movie-card-${movieObject.imdbID}" class="movie-card" style="cursor:pointer;">
            <img src="${poster}" alt="${movieObject.Title}">
            <p>${movieObject.Title}</p>
            <button onclick="removeFilmeFromList('${movieObject.imdbID}')">
                REMOVER
            </button>
        </article>
    `);

    // Adiciona evento de clique para trailer
    const card = document.getElementById(`movie-card-${movieObject.imdbID}`);
    if (card) {
        card.addEventListener('click', function(e) {
            // Evita conflito com botão remover
            if (e.target.tagName === 'BUTTON') return;
            showTrailerModal(movieObject.Title, movieObject.Year);
        });
    }
}

// Função para buscar trailer e exibir modal
async function showTrailerModal(title, year) {
    try {
        const query = encodeURIComponent(`${title} ${year || ''} trailer`);
        const url = `https://www.youtube.com/results?search_query=${query}`;

        // Buscar o primeiro resultado do YouTube usando noembed
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/results?search_query=${query}`);
        let videoId = null;
        if (response.ok) {
            const data = await response.json();
            if (data.url && data.url.includes('youtube.com/watch')) {
                const match = data.url.match(/v=([\w-]+)/);
                if (match) videoId = match[1];
            }
        }

        // Criar o modal
        let trailerModal = document.getElementById('trailer-modal');
        if (!trailerModal) {
            trailerModal = document.createElement('div');
            trailerModal.id = 'trailer-modal';
            trailerModal.style.position = 'fixed';
            trailerModal.style.top = '0';
            trailerModal.style.left = '0';
            trailerModal.style.width = '100vw';
            trailerModal.style.height = '100vh';
            trailerModal.style.background = 'rgba(0,0,0,0.8)';
            trailerModal.style.display = 'flex';
            trailerModal.style.alignItems = 'center';
            trailerModal.style.justifyContent = 'center';
            trailerModal.style.zIndex = '10000';
            trailerModal.innerHTML = `<div id="trailer-content" style="background:#fff; padding:20px; border-radius:10px; max-width:90vw; max-height:80vh; overflow:auto; position:relative;"></div>`;
            document.body.appendChild(trailerModal);
        }

        const content = trailerModal.querySelector('#trailer-content');
        if (videoId) {
            content.innerHTML = `
                <button id="close-trailer-modal" style="position:absolute;top:10px;right:10px;font-size:20px;">&times;</button>
                <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
            `;
        } else {
            content.innerHTML = `
                <button id="close-trailer-modal" style="position:absolute;top:10px;right:10px;font-size:20px;">&times;</button>
                <p style="text-align:center;">Trailer não encontrado. <a href="${url}" target="_blank" style="color:blue;">Buscar no YouTube</a></p>
            `;
        }

        trailerModal.style.display = 'flex';
        document.getElementById('close-trailer-modal').onclick = () => {
            trailerModal.style.display = 'none';
            content.innerHTML = '';
        };

        // Fechar com ESC
        document.onkeydown = function(e) {
            if (e.key === 'Escape') {
                trailerModal.style.display = 'none';
                content.innerHTML = '';
            }
        };
    } catch (err) {
        alert('Não foi possível carregar o trailer.');
    }
}
/* REMOVE */
function removeFilmeFromList(id) {

    notie.confirm({
        text: 'Remover filme?',
        submitText: "Sim",
        cancelText: "Não",
        submitCallback: function () {

            movieList = movieList.filter(movie => movie.imdbID !== id);

            const el = document.getElementById(`movie-card-${id}`);
            if (el) el.remove();

            updateLocalStorage();

            notie.alert({ type: 'success', text: 'Removido!' });
        }
    });
}

/* STORAGE */
function updateLocalStorage() {
    localStorage.setItem('movieList', JSON.stringify(movieList));
}

/* LOAD */
movieList.forEach(updateUI);

/* CLEAR */
function clearList() {

    if (movieList.length === 0) {
        notie.alert({ type: 'warning', text: 'Lista vazia!' });
        return;
    }

    notie.confirm({
        text: 'Limpar lista inteira?',
        submitText: "Sim",
        cancelText: "Não",
        submitCallback: function () {

            movieList = [];
            movieListContainer.innerHTML = '';
            updateLocalStorage();

            notie.alert({ type: 'success', text: 'Lista limpa!' });
        }
    });
}

/* EVENTS */

// Buscar ao pressionar Enter no campo de nome
movieName.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        searchButtonClickHandler();
    }
});

// Foco automático no campo de nome ao carregar
window.addEventListener('DOMContentLoaded', function() {
    movieName.focus();
});

searchButton.addEventListener('click', searchButtonClickHandler);
clearButton.addEventListener('click', clearList);