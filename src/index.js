import './css/styles.css';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';
import axios from "axios";

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35952172-cdf0ca74d0005ca382f96ff4a';
const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.load-more');
let page = 1;
let searchQuery = "";
let data = null;

buttonLoadMore.style.display = "none";

const gallerySimpleLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
});

async function getImageUrls() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: page,
      },
    });
    const { data } = response;
    return data;
  } catch (error) {
    console.error(error);
  }
}

function renderGallery(images) {
  const cards = images.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
    <div class="photo-card">
      <a href="${largeImageURL}" class="photo"><img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" height="250"/></a>
      <div class="info">
        <p class="info-item">
          <b>Likes : </b>${likes}
        </p>
        <p class="info-item">
          <b>Views : </b>${views}
        </p>
        <p class="info-item">
          <b>Comments : </b>${comments}
        </p>
        <p class="info-item">
          <b>Downloads : </b>${downloads}
        </p>
      </div>
    </div>
  `).join('');
if (page === 1) {
   gallery.innerHTML = cards;
} else {
  gallery.insertAdjacentHTML('beforeend', cards);
}
  buttonLoadMore.style.display = "block";
}

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  searchQuery = e.target.searchQuery.value.trim();
  page = 1;
  buttonLoadMore.style.display = "none";
  if (!searchQuery) {
    return;
  }
  data = await getImageUrls();

  if (data.hits.length === 0) {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
  } else {
    renderGallery(data.hits);
    gallerySimpleLightbox.refresh();
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }
});

buttonLoadMore.addEventListener('click', async () => {
  const maxPages = Math.ceil(data.totalHits / 40);
  if (!data.totalHits) {
    buttonLoadMore.style.display = 'none';
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    return;
  } else {
    page += 1;
    const newData = await getImageUrls();
    renderGallery(newData.hits);
    gallerySimpleLightbox.refresh();
    if (page >= maxPages) {
      buttonLoadMore.style.display = "none";
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  }
});


