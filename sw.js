self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('restaurant-sw-v1').then(function(cache) {
			
      return cache.addAll([
        './',
        './index.html',
        './restaurant.html',
				'./js/apihelper.js',
				'./js/dbhelper.js',
        './js/main.js',
        './js/localforage.min.js',
				'./js/restaurant_info.js',
				'./css/styles.css'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
		caches.open('restaurant-sw-v1').then(function(cache) {
      return cache.match(event.request, { ignoreSearch: true }).then(function (response) {
        return response || fetch(event.request).then(function(response) {
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
