let ds = new Datastore();

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
      let restaurant = await ds.getRestaurant(id);
      
      if (!restaurant) {
        const restaurantUrl = `${APIHelper.getBaseUrl()}/restaurants/${id}`;

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
      ds.addRestaurant(restaurant);

      return restaurant;
    } catch (error) {
      console.error(error);
    }
  }

  static async add(restaurant) {
    return ds.addRestaurant(restaurant);
  }

  static async addReview(restaurantId, review) {
    return ds.addReview(restaurantId, review);
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

    ds.addRestaurant(restaurant);
    return restaurant;
  }

  static async getRestaurant(restaurantId) {
    const items = await ds.getRestaurant(restaurantId);
    return items;
  }

  static async getAllRestaurants() {
    const items = await ds.getAllRestaurants();
    return items;
  }
}
