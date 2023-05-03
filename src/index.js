import './css/styles.css';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';
import axios from "axios";

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.load-more');
let page = 1;
let searchQuery = "";
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35952172-cdf0ca74d0005ca382f96ff4a';

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
  gallery.insertAdjacentHTML("beforeend", cards);
  gallerySimpleLightbox.refresh();
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
  const data = await getImageUrls();
  gallery.innerHTML = "";
  if(data.hits.length < 40){
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
  } else {
    renderGallery(data.hits);
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }
  // searchForm.reset();
});

buttonLoadMore.addEventListener('click', async () => {
  const data = await getImageUrls();
  if (!data.totalHits) return;

  const totalPages = Math.ceil(data.totalHits / 40);

  if (page >= totalPages) {
    buttonLoadMore.style.display = "none";
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");

    return;
  }
  else {
    page += 1;
  renderGallery(data.hits);}
});






