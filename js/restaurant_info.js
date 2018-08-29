let restaurant;
var map;
let restaurantId;

DBHelper.initServiceWorker();

document.addEventListener('DOMContentLoaded', (event) => {
  fetchRestaurantFromURL((error, restaurant) => {
    fillBreadcrumb();

    document.querySelector("#add-review-button").addEventListener("click", e => {
      console.log(restaurantId);
      const date = new Date().getTime();

      const reviewAuthor = document.querySelector("#review-author")
      const reviewRating = document.querySelector("#review-rating")
      const reviewComments = document.querySelector("#review-text")
      const review = {
        comments: reviewComments.value,
        name: reviewAuthor.value,
        rating: parseInt(reviewRating.value, 10),
        restaurant_id: parseInt(restaurantId, 10),
      }

      APIHelper.addReview(restaurantId, review).then(review => {
        if (swreg) {
          swreg.sync.register("review").then(() => {
            console.log('syncReviews registred');
          });
        }
      });
      
      const ul = document.getElementById('reviews-list');

      ul.appendChild(createReviewHTML(review));
      reviewAuthor.value = "";
      reviewRating.value = 1;
      reviewComments.value = "";
    });
  });
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      // fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
async function fetchRestaurantFromURL(callback) {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  restaurantId = getParameterByName('id');
  if (!restaurantId) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    try {
      self.restaurant = await APIHelper.fetchRestaurantById(restaurantId);
      if (!self.restaurant) {
        return;
      }
    } catch (error) {
      console.error(error);
    }

    fillRestaurantHTML();
    callback(null, self.restaurant)
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant = self.restaurant) {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.querySelector('img').className = 'restaurant-img'
  image.querySelector('source').srcset = `/img/${restaurant.id}.webp`;
  image.querySelector('img').src = `/img/${restaurant.id}.png`;
  image.alt = `Picture of the restaurant ${restaurant.name}`;
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHTML(operatingHours = self.restaurant.operating_hours) {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = self.restaurant.reviews) {
  const container = document.getElementById('reviews-container');
  // const title = document.createElement('h2');
  // title.innerHTML = 'Reviews';
  // container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) {
  const date = new Date(review.updatedAt);

  const template = `
  <li>
    <p class="review-name">${review.name}</p>
     <p class="review-date">${date.toDateString()}</p>
    <p class="review-rating"><span>RATING: ${review.rating}</span></p>
    <p class="review-comments">${review.comments}</p>
  </li>
  `;
  const range = document.createRange();
  const fragment = range.createContextualFragment(template);

  return fragment;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb(restaurant = self.restaurant) {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url) {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
