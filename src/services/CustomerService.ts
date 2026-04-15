const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost/api/admin';

export default class CustomerService {
  getAllCustomers() {
    return fetch(`${apiUrl}/user`)
      .then(res => res.json())
      .then((d) => {
        console.log(d.users);
        return d.users;
      });
  }

  verifyCustomer(user_id: number) {
    return fetch(`${apiUrl}/user/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id })
    }).then(res => res.json());
  }

  deleteCustomer(user_id: number) {
    return fetch(`${apiUrl}/user`, {
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
    const queryParams = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`).join('&');
    return fetch(`https://www.primefaces.org/data/customers?${queryParams}`).then(res => res.json());
  }
}
