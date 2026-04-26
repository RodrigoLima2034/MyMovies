const overlay = document.getElementById('modal-overlay');
const background = document.getElementById('modal-background');
const modalContainer = document.getElementById('modal-container');

let currentMovie = {};

function backgroundClickhandler() {
    overlay.classList.remove('open');
}

function addCurrentMovieTolist() {

    if (isMovieAlreadyOnList(currentMovie.imdbID)) {
        notie.alert({ type: 'error', text: "Filme já está na sua lista!" });
        return;
    }

    addToList(currentMovie);
    updateLocalStorage();

    notie.alert({ type: 'success', text: "Filme adicionado!" });
    overlay.classList.remove('open');
}

function isMovieAlreadyOnList(id) {
    return movieList.some(movie => movie.imdbID === id);
}

function createModal(data) {
    currentMovie = data;

    modalContainer.innerHTML = `
        <h2>${data.Title} - ${data.Year}</h2>

        <section id="modal-body">
            <img src="${data.Poster}" alt="Poster do filme">

            <div id="movie-info">
                <p><strong>Sinopse:</strong> ${data.Plot}</p>
                <p><strong>Gênero:</strong> ${data.Genre}</p>
                <p><strong>Atores:</strong> ${data.Actors}</p>
            </div>
        </section>

        <section id="modal-add-list">
            <button onclick="addCurrentMovieTolist()">Adicionar à Lista</button>
        </section>
    `;

    overlay.classList.add('open');
}

window.createModal = createModal;

background.addEventListener('click', backgroundClickhandler);