self.importScripts('./js/idb.js');
self.importScripts('./js/datastore.js');

var ds = new Datastore();

const cacheName = 'restaurant-sw-v2.1';

function getAllImages() {
  const images = [];
  for (let i = 1; i < 11; i++) {
    images.push(`./img/${i}.webp`);
  }
  return images;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {

      return cache.addAll([
        './',
        './index.html',
        './restaurant.html',
        './js/idb.js',
        './js/datastore.js',
        './js/apihelper.js',
        './js/dbhelper.js',
        './js/main.js',
        './js/restaurant_info.js',
        './css/styles.css'
      ].concat(getAllImages()));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});


self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open(cacheName).then(function (cache) {
      return cache.match(event.request, { ignoreSearch: true }).then(function (response) {
        return response || fetch(event.request).then(function (response) {
          let res = response.clone();
          if (event.request.url.indexOf('img/') > 0) {
            cache.put(event.request, res);
          }
          return response;
        });
      });
    })
  );
});

async function syncReview(review) {
  const response = await fetch(`http://localhost:1337/reviews/`, {
    method: 'POST',
    body: JSON.stringify(review)
  });
  review = await response.json();

  return review;
}

async function syncReviews() {

  const restaurants = await ds.getAllRestaurants();
	for (let restaurant of restaurants) {
    const newReviews = [];
    for (let review of restaurant.reviews) {
      if (!review.id) {
        const r = await syncReview(review);
        newReviews.push(r);
      }
    }
    restaurant.reviews = restaurant.reviews.filter(review => review.id);
    restaurant.reviews = restaurant.reviews.concat(newReviews);
    ds.addRestaurant(restaurant);
  }
}

self.addEventListener('sync', event => {
  event.waitUntil(syncReviews());
});