// const cacheName = 'offlinedemo-v1';

// this.addEventListener('install', function(event) {
// 	event.waitUntil(
// 		caches.open('simple-sw-v1').then(function(cache) {
// 			// The cache will fail if any of these resources can't be saved.
// 			return cache.addAll([
// 				// Path is relative to the origin, not the app directory.
// 				'./',
//         './index.html',
//         './js/init_sw.js',
//         './restaurant.html',
// 				'./js/dbhelper.js',
//         './js/main.js',
// 				'./js/restaurant_info.js',
//         './data/restaurants.json',
//         './offline.html',
//         './css/styles.css',
// 			])
// 			.then(function() {
// 				console.log('Success! App is available offline!');
// 			})
// 		})
// 	);
// });

function getAllImages() {
	const images = [];
	for (let i = 1; i < 11; i++) {
		images.push(`./img/${i}.jpg`);
	}
	return images;
}

self.addEventListener('install', function(event) {
  // We pass a promise to event.waitUntil to signal how 
  // long install takes, and if it failed
  event.waitUntil(
    // We open a cache…
    caches.open('restaurant-sw-v1').then(function(cache) {
			// And add resources to it
			
      return cache.addAll([
        './',
        './index.html',
        './restaurant.html',
				'./js/dbhelper.js',
        './js/main.js',
				'./js/restaurant_info.js',
        './data/restaurants.json',
        './offline.html',
				'./css/styles.css'
      ].concat(getAllImages()));
    })
  );
});

// self.addEventListener('activate', event => {
//   event.waitUntil(
//     caches.keys().then(keyList => {
//       return Promise.all(keyList.map(key => {
//         if (key !== 'restaurant-sw-v1') {
//           console.log('Removing old cache', key);
//           return caches.delete(key);
//         }
//       }));
//     })
//   );
// });

// self.addEventListener('fetch', function(event) {
// 	event.respondWith(
// 	    caches.match(event.request)
//     	.then(function(response) {
// 			return response || fetch(event.request);
// 		})
// 		.catch(function() {
// 			return caches.match('/offline.html');
// 		})
//   	);
// });


self.addEventListener('fetch', function(event) {
  // Calling event.respondWith means we're in charge
  // of providing the response. We pass in a promise
  // that resolves with a response object
  event.respondWith(
    // First we look for something in the caches that
		// matches the request
		caches.open('restaurant-sw-v1').then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
					let res = response.clone();
					if (event.request.url.indexOf('maps') < 0) {
						cache.put(event.request, res);
					}
          return response;
        });
      });
		})
		
    // caches.match(event.request).then(function(response) {
    //   // If we get something, we return it, otherwise
    //   // it's null, and we'll pass the request to
    //   // fetch, which will use the network.
		// 	// return response || fetch(event.request);
		// 	return response || fetch(event.request).then(function(response) {
		// 		caches.open('restaurant-sw-v1').then(function(cache) {
		// 			debugger;
		// 			let res = response.clone();
		// 			if (event.request.url.indexOf('maps') < 0) {
		// 				cache.put(event.request, res);
		// 			}
		// 			return response;
		// 		});
		// 	});
    // })
  );
});
