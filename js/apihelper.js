/**
 * Common database helper functions.
 */
class APIHelper {
  static getBaseUrl() {
    return 'http://localhost:1337';
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    const url = `${APIHelper.getBaseUrl()}/restaurants`;

    return fetch(url)
    .then(data => {
      return data.json();
    })
    .catch(error => {
      return APIHelper.getAllRestaurants();
    });
  }

  static async fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    
    let restaurants = await APIHelper.getAllRestaurants();
  
    if (cuisine != 'all') { // filter by cuisine
      restaurants = restaurants.filter(r => r.cuisine_type == cuisine);
    }
    if (neighborhood != 'all') { // filter by neighborhood
      restaurants = restaurants.filter(r => r.neighborhood == neighborhood);
    }
    return restaurants;
  }

  static async fetchRestaurantById(id) {
    try {
      let restaurant = await localforage.getItem(String(id));
      
      if (!restaurant) {
        const restaurantUrl = `${APIHelper.getBaseUrl()}/restaurants/${id}`;
        // const response = await fetch(restaurantUrl);
        // restaurant = await response.json();

        const reviewsUrl = `${APIHelper.getBaseUrl()}/reviews/?restaurant_id=${id}`;

        let data = await Promise.all([fetch(restaurantUrl), fetch(reviewsUrl)]);
        data = await Promise.all([data[0].json(), data[1].json()]);
        restaurant = data[0];
        
        restaurant.reviews = data[1];
      } else {
        if (! restaurant.reviews) {
          const reviewsUrl = `${APIHelper.getBaseUrl()}/reviews/?restaurant_id=${id}`;
          const response = await fetch(reviewsUrl);
          const reviews = await response.json();
          restaurant.reviews = reviews;
        }
      }
      localforage.setItem(String(restaurant.id), restaurant);

      return restaurant;
    } catch (error) {
      console.error(error);
    }
  }

  static async addReview(restaurantId, review) {
    let restaurant = await localforage.getItem(String(restaurantId));
    restaurant.reviews.push(review);
    localforage.setItem(String(restaurantId), restaurant);
  }

  static getFavorite(restaurant) {
    if (typeof restaurant.is_favorite === "string") {
      if (restaurant.is_favorite === "true") return true;
      return false;
    }
    return restaurant.is_favorite;
  }

  static async addFavorite(restaurant) {
    const favorite = APIHelper.getFavorite(restaurant);

    const url = `${APIHelper.getBaseUrl()}/restaurants/${restaurant.id}/?is_favorite=${!favorite}`;
    await fetch(url, {
      method: "PUT"
    });
    restaurant.is_favorite = !favorite;
    localforage.setItem(String(restaurant.id), restaurant);
    return restaurant;
  }

  static async getAllRestaurants() {
    const items = [];
    await localforage.iterate(function(value, key, iterationNumber) {
      items.push(value);
    })
    return items;
  }
}
