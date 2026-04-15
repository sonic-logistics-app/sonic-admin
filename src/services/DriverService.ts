const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost/api/admin';

export default class DriverService {
  getAllDrivers() {
    return fetch(`${apiUrl}/driver`)
      .then(res => res.json())
      .then((d) => {
        console.log(d.drivers);
        return d.drivers;
      });
  }

  getDriverById(id: string) {
    return fetch(`${apiUrl}/driver/${id}`, {
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

  verifyDriver(driverId: number, verificationData: any) {
    const requestBody = {
      driver_id: parseInt(String(driverId)),
      ...verificationData
    };

    return fetch(`${apiUrl}/driver/verify`, {
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

  rejectDriver(driverId: number, rejectionData: any) {
    const requestBody = {
      driver_id: parseInt(String(driverId)),
      ...rejectionData
    };

    return fetch(`${apiUrl}/driver/reject`, {
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

  deleteDriver(driverId: number) {
    const requestBody = {
      driver_id: parseInt(String(driverId))
    };

    return fetch(`${apiUrl}/driver`, {
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
