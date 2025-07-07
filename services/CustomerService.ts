const BACKEND_URL = process.env.BACKEND_URL;

export default class CustomerService {
  getAllCustomers() {
    return fetch(`${BACKEND_URL}/user`).then(res => res.json()).then(d => d.data);
  }

  getCustomersSmall() {
    return fetch('/data/customers-small.json').then(res => res.json()).then(d => d.data);
  }

  getCustomersMedium() {
    return fetch('/data/customers-medium.json').then(res => res.json()).then(d => d.data);
  }

  getCustomersLarge() {
    return fetch('/data/customers-large.json').then(res => res.json()).then(d => d.data);
  }

  getCustomersXLarge() {
    return fetch('/data/customers-xlarge.json').then(res => res.json()).then(d => d.data);
  }

  getCustomers(params) {
    const queryParams = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    return fetch(`https://www.primefaces.org/data/customers?${queryParams}`).then(res => res.json());
  }
}
