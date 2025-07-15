const config = useRuntimeConfig();
const apiUrl = config.public.BACKEND_URL;

export default class VoucherService {
  getAllVouchers() {
    return fetch(`${apiUrl}/admin/voucher`)
      .then(res => res.json())
      .then((d) => {
        return d.vouchers;
      });
  }

  addVoucher(voucher) {
    return fetch(`${apiUrl}/admin/voucher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(voucher)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        throw error;
      });
  }

  getVoucherById(id) {
    return fetch(`${apiUrl}/admin/voucher/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(d => {
        return d;
      })
      .catch(error => {
        console.error('Error fetching voucher:', error);
        throw error;
      });
  }

  updateVoucher(voucherId, voucherData) {
    const requestBody = {
      ...voucherData
    };

    return fetch(`${apiUrl}/admin/voucher/${voucherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Error updating voucher:', error);
        throw error;
      });
  }

  deleteVoucher(voucherId) {
    const requestBody = {
      voucher_id: voucherId
    };

    return fetch(`${apiUrl}/admin/voucher`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Error deleting voucher:', error);
        throw error;
      });
  }
}
