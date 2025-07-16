<script lang="ts">
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import OrderService from '~~/services/OrderService';

export default {
  data() {
    return {
      order: {
        orderInfo: {
          customer_name: 'Andi Pratama',
          driver_name: 'Budi Santoso',
          total_payment: 25000,
          status: 'pending',
          package_category: 'makanan'
        },
        packageInfo: {
          image: 'https://kliklogistics.co.id/wp-content/uploads/2023/04/contoh-penulisan-alamat-paket.jpg',
          deliveryType: 'Same Day',
          pickupLocation: 'Jl. Merdeka No. 10, Jakarta',
          landmark: 'Samping Indomaret',
          senderName: 'Andi Pratama',
          senderPhone: '08123456789',
          size: 'Medium',
          description: 'Makanan ringan, cepat sampai',
          applyInsurance: true
        }
      },
      filters1: null,
      filters2: {},
      loading1: true,
      loading2: true,
      idFrozen: false,
      products: null,
      expandedRows: [],
      statuses: [
        'unqualified', 'qualified', 'new', 'negotiation', 'renewal', 'proposal'
      ],
      representatives: [
        { name: 'Amy Elsner', image: 'amyelsner.png' },
        { name: 'Anna Fali', image: 'annafali.png' },
        { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
        { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
        { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
        { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
        { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
        { name: 'Onyama Limba', image: 'onyamalimba.png' },
        { name: 'Stephen Shaw', image: 'stephenshaw.png' },
        { name: 'XuXue Feng', image: 'xuxuefeng.png' }
      ]
    };
  },
  orderService: null,
  created() {
    this.orderService = new OrderService();
  },
  mounted() {
    this.loadOrderDetail();
  },
  methods: {
    loadOrderDetail() {
      this.loading = true;
      this.orderService.getOrderDetails(312).then(data => {
        console.log(data);
        // this.drivers = data.map(driver => ({
        //   ...driver,
        //   name: `${driver.first_name} ${driver.last_name}`,
        //   dateBirth: driver.birth_date || new Date().toISOString().split('T')[0],
        //   email: driver.email,
        //   verified: driver.otp_verified,
        //   status: driver.status?.toLowerCase(),
        //   picture: driver.picture,
        //   public_id: driver.public_id,
        //   verificationProgress: driver.verificationProgress,
        //   verificationStatus: driver.verificationStatus,
        //   imageLoaded: !!driver.picture,
        //   deleting: false
        // }));
        this.loading = false;
      }).catch(error => {
        console.error('Failed to load drivers:', error);
        this.loading = false;
      });
    },
    formatCurrency(value: number) {
      const price = value.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }).split('');
      price.splice(1, 0, ' ');
      return price.join('');
    },
    formatDate(value: Date) {
      return value.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    getSeverity(status: string) {
      switch (status) {
        case 'pending': return 'warning';
        case 'confirmed': return 'info';
        case 'in transit': return 'primary';
        case 'delivered': return 'success';
        case 'cancelled': return 'danger';
        default: return null;
      }
    },
    getIcon(status: string) {
      switch (status) {
        case 'pending': return 'pi pi-exclamation-triangle';
        case 'confirmed': return 'pi pi-info-circle';
        case 'in transit': return 'pi pi-spinner';
        case 'delivered': return 'pi pi-check';
        case 'cancelled': return 'pi pi-times';
        default: return 'pi pi-info-circle';
      }
    }
  }
};
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-3">
          <h4>Details</h4>
        </div>
        <div class="card mb-4">
          <div class="card-header">
            <h6 class="text-primary mb-3">
              <i class="pi pi-truck mr-2" />
              Order Detail
            </h6>
          </div>
          <div class="border-2 surface-border p-4 border-round">
            <section class="mb-5">
              <div class="grid">
                <div class="col-12 md:col-6 mb-2">
                  <p class="text-sm text-500 mb-1">
                    Customer Name
                  </p>
                  <p class="font-medium">
                    {{ order.orderInfo.customer_name }}
                  </p>
                </div>
                <div class="col-12 md:col-6 mb-2">
                  <p class="text-sm text-500 mb-1">
                    Customer Phone
                  </p>
                  <p class="font-medium">
                    {{ order.packageInfo.senderPhone }}
                  </p>
                </div>
                <div class="col-12 md:col-6 mb-2">
                  <p class="text-sm text-500 mb-1">
                    Driver Name
                  </p>
                  <p class="font-medium">
                    {{ order.orderInfo.driver_name }}
                  </p>
                </div>
                <div class="col-12 md:col-6 mb-2">
                  <p class="text-sm text-500 mb-1">
                    Pickup Location
                  </p>
                  <p class="font-medium">
                    {{ order.packageInfo.pickupLocation }}
                  </p>
                </div>
                <div class="col-12 md:col-6 mb-2">
                  <p class="text-sm text-500 mb-1">
                    Destination
                  </p>
                  <p class="font-medium">
                    {{ order.packageInfo.landmark }}
                  </p>
                </div>
                <div class="col-12 md:col-6 mb-2">
                  <p class="text-sm text-500 mb-1">
                    Total Payment
                  </p>
                  <p class="font-medium text-green-600">
                    {{ formatCurrency(order.orderInfo.total_payment) }}
                  </p>
                </div>
                <div class="col-12 md:col-6 mb-2">
                  <p class="text-sm text-500 mb-1">
                    Status
                  </p>
                  <Tag
                    :value="order.orderInfo.status"
                    :severity="getSeverity(order.orderInfo.status)"
                    :icon="getIcon(order.orderInfo.status)"
                  />
                </div>
                <div class="col-12 md:col-6 mb-2">
                  <p class="text-sm text-500 mb-1">
                    Package Category
                  </p>
                  <p class="font-medium">
                    {{ order.orderInfo.package_category }}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <h6 class="text-primary mb-3">
              <i class="pi pi-box mr-2" />
              Package Detail
            </h6>
          </div>
          <div class="border-2 surface-border p-4 border-round">
            <section>
              <div class="grid">
                <!-- Gambar kiri -->
                <div class="col-12 md:col-4 flex justify-content-start">
                  <img
                    :src="order.packageInfo.image"
                    alt="Package"
                    class="w-full md:w-10 border-round shadow-2 cursor-pointer"
                    @click="showImage = true"
                  >
                </div>

                <!-- Detail kanan -->
                <div class="col-12 md:col-8 grid">
                  <div class="col-12 md:col-6 mb-2">
                    <p class="text-sm text-500 mb-1">
                      Delivery Type
                    </p>
                    <p class="font-medium">
                      {{ order.packageInfo.deliveryType }}
                    </p>
                  </div>
                  <div class="col-12 md:col-6 mb-2">
                    <p class="text-sm text-500 mb-1">
                      Sender Name
                    </p>
                    <p class="font-medium">
                      {{ order.packageInfo.senderName }}
                    </p>
                  </div>
                  <div class="col-12 md:col-6 mb-2">
                    <p class="text-sm text-500 mb-1">
                      Package Size
                    </p>
                    <p class="font-medium">
                      {{ order.packageInfo.size }}
                    </p>
                  </div>
                  <div class="col-12 mb-2">
                    <p class="text-sm text-500 mb-1">
                      Description
                    </p>
                    <p class="font-medium">
                      {{ order.packageInfo.description }}
                    </p>
                  </div>
                  <div class="col-12 mb-2">
                    <p class="text-sm text-500 mb-1">
                      Apply Insurance
                    </p>
                    <Tag
                      :value="order.packageInfo.applyInsurance ? 'Yes' : 'No'"
                      :severity="order.packageInfo.applyInsurance ? 'success' : 'danger'"
                      :icon="order.packageInfo.applyInsurance ? 'pi pi-check' : 'pi pi-times'"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Modal Gambar -->
        <Dialog v-model:visible="showImage" modal header="Package Image" :style="{ width: '50vw' }">
          <img :src="order.packageInfo.image" alt="Package" class="w-full border-round">
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-qualified {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-unqualified {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-negotiation {
    background: #feedaf;
    color: #8a5340;
  }

  &.status-new {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-renewal {
    background: #eccfff;
    color: #694382;
  }

  &.status-proposal {
    background: #ffd8b2;
    color: #805b36;
  }
}

.product-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-instock {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-outofstock {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-lowstock {
    background: #feedaf;
    color: #8a5340;
  }
}

.order-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.order-delivered {
    background: #c8e6c9;
    color: #256029;
  }

  &.order-cancelled {
    background: #ffcdd2;
    color: #c63737;
  }

  &.order-pending {
    background: #feedaf;
    color: #8a5340;
  }

  &.order-returned {
    background: #eccfff;
    color: #694382;
  }
}
</style>
