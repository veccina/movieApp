const apiKey = '0e58c4e8b924899bfafc82f0818efb0e';
const baseUrl = 'https://api.themoviedb.org/3';
const imageUrl = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('movie-list')) {
        fetchMovies();
        setupLoadMore();
    }

    if (document.getElementById('favorites-list')) {
        displayFavorites();
    }
});

function fetchMovies() {
    fetch(`${baseUrl}/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`)
        .then(response => response.json())
        .then(data => {
            displayMovies(data.results);
            setupCarousel(data.results);
        })
        .catch(error => console.error('Fetching error:', error));
}


function displayMovies(movies) {
    const movieListDiv = document.getElementById('movie-list');
    movies.forEach(movie => {
        const movieCardHTML = `
            <div class="col-sm-6 col-md-4 col-lg-3 mb-4" data-aos="fade-up" onclick="navigateToProduct(${movie.id})">
                <div class="card h-100">
                    <img src="${imageUrl}${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <p class="card-text">${movie.overview.substring(0, 100)}...</p>
                        <button onclick="toggleFavorite(event, ${movie.id}, '${movie.title}', '${movie.poster_path}')" class="btn btn-danger">
                            ${isFavorited(movie.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        movieListDiv.innerHTML += movieCardHTML;
    });
}

function setupLoadMore() {
    const loadMoreBtn = document.getElementById('load-more');
    loadMoreBtn.style.display = 'block'; 
    let currentPage = 1;
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        fetch(`${baseUrl}/movie/top_rated?api_key=${apiKey}&language=en-US&page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                displayMovies(data.results);
                if (data.results.length === 0) loadMoreBtn.disabled = true;
            })
            .catch(error => console.error('Loading more movies error:', error));
    });
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoritesDiv = document.getElementById('favorites-list');
    favoritesDiv.innerHTML = ''; 
    favorites.forEach((movie) => {
        const favoriteHTML = `
            <div class="col-md-3 mb-4" data-aos="fade-up" onclick="navigateToProduct(${movie.id})">
                <div class="card h-100">
                    <img src="${imageUrl}${movie.poster}" class="card-img-top" alt="${movie.title}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <button onclick="toggleFavorite(event, '${movie.id}', '${movie.title}', '${movie.poster}')" class="btn btn-danger">
                            Favorilerden Çıkar
                        </button>
                    </div>
                </div>
            </div>
        `;
        favoritesDiv.innerHTML += favoriteHTML;
    });
}

function removeFromFavorites(event, movieId) {
    event.stopPropagation();
    event.preventDefault();
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(fav => fav.id === movieId.toString());
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    } else {
        console.error('Favorite not found');
    }
}

function isFavorited(movieId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.some(fav => fav.id === movieId);
}


function toggleFavorite(event, movieId, title, poster) {
    event.stopPropagation();
    event.preventDefault();

    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(fav => fav.id === movieId.toString());

    if (index === -1) {
        favorites.push({ id: movieId.toString(), title, poster });
        alert('Film favorilere eklendi.');
    } else {
        favorites.splice(index, 1);
        alert('Film favorilerden çıkarıldı.');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    if (event.target) {
        event.target.innerText = index === -1 ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
    }

    if (document.getElementById('favorites-list')) {
        displayFavorites();
    }
}


function isFavorited(movieId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.some(fav => fav.id === movieId);
}

function updateFavoriteIcon(movieId) {
    document.querySelectorAll(`.favorite-btn[data-movie-id="${movieId}"]`).forEach(button => {
        const heartIcon = button.querySelector('i');
        if (heartIcon) {
            if (isFavorited(movieId)) {
                heartIcon.classList.remove('bi-heart');
                heartIcon.classList.add('bi-heart-fill');
            } else {
                heartIcon.classList.remove('bi-heart-fill');
                heartIcon.classList.add('bi-heart');
            }
        }
    });
}


function setupCarousel(movies) {
    const carouselInner = document.getElementById('carouselItems');
    if (carouselInner) {
        carouselInner.innerHTML = "";
        movies.slice(0, 5).forEach((movie, index) => {
            const carouselItemHTML = `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${imageUrl}${movie.poster_path}" class="d-block w-100" alt="${movie.title}">
                    <div class="carousel-caption d-none d-md-block">
                        <h5>${movie.title}</h5>
                        <p>${movie.overview.substring(0, 100)}...</p>
                    </div>
                </div>
            `;
            carouselInner.innerHTML += carouselItemHTML;
        });
    }
}
function navigateToProduct(movieId) {
    window.location.href = `product.html?movieId=${movieId}`;
}


function fetchMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');
    fetch(`${baseUrl}/movie/${movieId}?api_key=${apiKey}&append_to_response=videos`)
        .then(response => response.json())
        .then(movie => {
            if (movie.videos && movie.videos.results.length > 0) {
                const trailers = movie.videos.results.filter(video => video.type === "Trailer");
                if (trailers.length > 0) {
                    movie.trailerId = trailers[0].key; 
                    displayMovieDetails(movie);
                } else {
                    console.error('No trailer available');
                    displayMovieDetailsWithoutTrailer(movie);
                }
            } else {
                console.error('No videos available');
                displayMovieDetailsWithoutTrailer(movie);
            }
        })
        .catch(error => console.error('Error fetching movie details:', error));
}


function displayMovieDetails(movie) {
    const detailsDiv = document.getElementById('movie-details');
    const movieDetailsHTML = `
        <div class="card mb-3" data-aos="fade-up">
            <div class="row no-gutters">
                <div class="col-md-4">
                    <img src="${imageUrl}${movie.poster_path}" class="card-img" alt="${movie.title}">
                    <button onclick="toggleFavorite(event, ${movie.id}, '${movie.title}', '${movie.poster_path}')" class="btn btn-danger mt-4 custom-margin-left">
                            ${isFavorited(movie.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                        </button>
                    </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <p class="card-text">${movie.overview}</p>
                        <p class="card-text"><small class="text-muted">Rating: ${movie.vote_average}</small></p>
                        <div class="embed-responsive embed-responsive-16by9">
                            <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${movie.trailerId}" allowfullscreen></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    detailsDiv.innerHTML = movieDetailsHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    fetchMovieDetails();
});


function setupCarousel(movies) {
    const carouselInner = document.getElementById('carouselItems');
    if (carouselInner) {
        carouselInner.innerHTML = ""; 
        movies.slice(0, 5).forEach((movie, index) => {
            const carouselItemHTML = `
                <div class="carousel-item ${index === 0 ? 'active' : ''}" onclick="navigateToProduct(${movie.id})">
                    <img src="${imageUrl}${movie.poster_path}" class="d-block w-100" alt="${movie.title}">
                    <div class="carousel-caption d-none d-md-block">
                        <h5>${movie.title}</h5>
                        <p>${movie.overview.substring(0, 100)}...</p>
                    </div>
                </div>
            `;
            carouselInner.innerHTML += carouselItemHTML;
        });
    }
}
$(document).ready(function(){
    $('.carousel').carousel({
        interval: 5000, 
        transition: 600 
    });
});

function displayMovieDetailsWithoutTrailer(movie) {
    const detailsDiv = document.getElementById('movie-details');
    const movieDetailsHTML = `
        <div class="card mb-3" data-aos="fade-up">
            <div class="row no-gutters">
                <div class="col-md-4">
                    <img src="${imageUrl}${movie.poster_path}" class="card-img" alt="${movie.title}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <p class="card-text">${movie.overview}</p>
                        <p class="card-text"><small class="text-muted">Rating: ${movie.vote_average}</small></p>
                        <p>No trailer available for this movie.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    detailsDiv.innerHTML = movieDetailsHTML;
}

$('.nav-link').on('click', function() {
    $(this).addClass('glow-effect');
    setTimeout(() => $(this).removeClass('glow-effect'), 500);
});