'use strict';

 class Datastore {

     constructor() {
        this.dbPromise = idb.open('restaurant-db', 1, upgradeDb => {
                upgradeDb.createObjectStore('restaurants', {
                    keyPath: 'id'
                });
            });
     }

    async getStore() {
        const db = await this.dbPromise;
        return db.transaction('restaurants', 'readwrite').objectStore('restaurants');
    }

    async getAllRestaurants() {
        const store = await this.getStore();
        return store.getAll();
    }

    async addRestaurant(restaurant) {
      const store = await this.getStore();
      return store.put(restaurant);
    }

    async getRestaurant(restaurantId) {
      const store = await this.getStore();
      return store.get(parseInt(restaurantId, 10));
    }

    async addReview(restaurantId, review) {
      const restaurant = await this.getRestaurant(restaurantId);
      restaurant.reviews.push(review);
      const store = await this.getStore();
      return store.put(restaurant);
  }
}