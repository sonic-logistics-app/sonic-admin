const config = useRuntimeConfig();
const apiUrl = config.public.BACKEND_URL;

export default class OrderService {
  getAllOrders() {
    return fetch(`${apiUrl}/admin/order`)
      .then(res => res.json())
      .then((d) => {
        return d.data;
      });
  }

  getOrderDetails(orderId: number) {
    return fetch(`${apiUrl}/admin/order/${orderId}`)
      .then(res => res.json())
      .then((d) => {
        return d.data;
      });
  }
}
