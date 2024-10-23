class Mtg {
    constructor(baseUrl = "https://api.magicthegathering.io/v1/") {
      this.baseUrl = baseUrl;
    }
  
    async loadCards(name = '') {
      const url = this.buildUrl('cards', { name });
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        return json.cards || [];  // Загружаем карты или возвращаем пустой массив
      } catch (error) {
        console.error('Error fetching cards:', error);
        throw error;  // Пробрасываем ошибку дальше
      }
    }
  
    buildUrl(endpoint, params) {
      const url = new URL(endpoint, this.baseUrl);
      url.search = new URLSearchParams(params).toString();
      return url.toString();
    }
  }
  
  export { Mtg };