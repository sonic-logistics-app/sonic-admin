const config = useRuntimeConfig();
const apiUrl = config.public.BACKEND_URL;

export default class CustomerService {
  getAllCustomers() {
    return fetch(`${apiUrl}/admin/user`)
      .then(res => res.json())
      .then((d) => {
        console.log(d.users);
        return d.users;
      });
  }

  verifyCustomer(user_id) {
    return fetch(`${apiUrl}/admin/user/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id })
    }).then(res => res.json());
  }

  deleteCustomer(user_id) {
    return fetch(`${apiUrl}/admin/user`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id })
    }).then(res => res.json());
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

  getCustomers(params: { [x: string]: string | number | boolean }) {
    const queryParams = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    return fetch(`https://www.primefaces.org/data/customers?${queryParams}`).then(res => res.json());
  }
}
