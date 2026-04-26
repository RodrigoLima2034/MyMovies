const searchButton = document.getElementById('search-button');
const movieName = document.getElementById('movie-name');
const movieYear = document.getElementById('movie-year');
const movieListContainer = document.getElementById('movie-list');
const clearButton = document.getElementById('clear-button');

const saveKeyButton = document.getElementById('save-key');
const apiKeyInput = document.getElementById('api-key');

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
        <article id="movie-card-${movieObject.imdbID}">
            <img src="${poster}" alt="${movieObject.Title}">
            <p>${movieObject.Title}</p>
            <button onclick="removeFilmeFromList('${movieObject.imdbID}')">
                REMOVER
            </button>
        </article>
    `);
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
searchButton.addEventListener('click', searchButtonClickHandler);
clearButton.addEventListener('click', clearList);