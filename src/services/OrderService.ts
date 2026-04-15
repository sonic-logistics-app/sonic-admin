const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost/api/admin';

export default class OrderService {
  getAllOrders() {
    return fetch(`${apiUrl}/order`)
      .then(res => res.json())
      .then((d) => {
        return d.data;
      });
  }

  getOrderDetails(orderId: number) {
    return fetch(`${apiUrl}/order/${orderId}`)
      .then(res => res.json())
      .then((d) => {
        return d.data;
      });
  }
}
