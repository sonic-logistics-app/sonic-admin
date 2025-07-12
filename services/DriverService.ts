const config = useRuntimeConfig();
const apiUrl = config.public.BACKEND_URL;

export default class DriverService {
  getAllDrivers() {
    return fetch(`${apiUrl}/admin/driver`)
      .then(res => res.json())
      .then((d) => {
        console.log(d.drivers);
        return d.drivers;
      });
  }

  getDriverById(id: string) {
    return fetch(`${apiUrl}/admin/driver/${id}`, {
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
        console.log('API Response:', d);
        return d;
      })
      .catch(error => {
        console.error('Error fetching driver:', error);
        throw error;
      });
  }

  verifyDriver(driverId, verificationData) {
    const requestBody = {
      driver_id: parseInt(driverId),
      ...verificationData
    };

    return fetch(`${apiUrl}/admin/driver/verify`, {
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
        console.log('Driver verification response:', data);
        return data;
      })
      .catch(error => {
        console.error('Error verifying driver:', error);
        throw error;
      });
  }

  rejectDriver(driverId, rejectionData) {
    const requestBody = {
      driver_id: parseInt(driverId),
      ...rejectionData
    };

    return fetch(`${apiUrl}/admin/driver/reject`, {
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
        console.log('Driver rejection response:', data);
        return data;
      })
      .catch(error => {
        console.error('Error rejecting driver:', error);
        throw error;
      });
  }

  deleteDriver(driverId) {
    const requestBody = {
      driver_id: parseInt(driverId)
    };

    return fetch(`${apiUrl}/admin/driver`, {
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
        console.log('Driver deletion response:', data);
        return data;
      })
      .catch(error => {
        console.error('Error deleting driver:', error);
        throw error;
      });
  }
}
