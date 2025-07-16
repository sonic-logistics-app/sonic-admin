<script lang="ts">
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import OrderService from '~~/services/OrderService';

export default {
  data() {
    return {
      orders: [],
      statusOptions: [
        { name: 'pending' },
        { name: 'confirmed' },
        { name: 'in transit' },
        { name: 'delivered' },
        { name: 'cancelled' }
      ],
      selectAllStatus: false,
      checked: false,
      filters1: {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        customer_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        driver_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        address_destination: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        status: { value: null, matchMode: FilterMatchMode.IN }
      },
      filters2: {},
      loading1: true,
      loading2: true,
      loading: false,
      expandedRows: []
    };
  },
  orderService: null,
  created() {
    this.orderService = new OrderService();
  },
  mounted() {
    this.loadOrders();
    // this.loading1 = false;
    // this.loading2 = false;
  },
  methods: {
    loadOrders() {
      this.loading1 = true;
      this.orderService.getAllOrders().then((data) => {
        this.orders = data.map(order => ({
          id: order.id,
          customer: order.user,
          driver: order.driver,
          address_destination: order.receiver_address?.dropoff_address ?? '-',
          total_payment: order.price_fees,
          status: order.order_status.toLowerCase(),
          package_category: order.package?.delivery_type ?? 'unknown',
          imageLoadedCustomer: !!order.user.picture,
          imageLoadedDriver: !!order.driver?.picture
        }));
        this.loading1 = false;
      }).catch((error) => {
        console.error('Failed to load drivers:', error);
        this.loading1 = false;
      });
    },
    clearFilter1() {
      this.filters1 = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        user_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        driver_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        address_destination: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        status: { value: null, matchMode: FilterMatchMode.IN }
      };
    },
    formatCurrency(value: number) {
      if (typeof value !== 'number') {
        return;
      }
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
    },
    goToOrderDetail(event) {
      const id = event.data.id;
      this.$router.push(`/order/${id}`);
    },
    getInitials(first: string, last: string) {
      return ((first?.charAt(0) || '') + (last?.charAt(0) || '')).toUpperCase();
    },
    onImageErrorCustomer(event: Event, data: any) {
      data.imageLoadedCustomer = false;
      event.target.style.display = 'none';
    },
    onImageErrorDriver(event: Event, data: any) {
      data.imageLoadedDriver = false;
      event.target.style.display = 'none';
    },
    handleStatusFilterChange(filterModel, filterCallback) {
      filterCallback();
    }

  }
};
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Order</h5>
        <DataTable
          v-model:filters="filters1"
          :value="orders"
          :paginator="orders.length > 10"
          class="p-datatable-gridlines"
          :rows="10"
          data-key="id"
          :row-hover="true"
          filter-display="menu"
          :loading="loading1"
          :filters="filters1"
          responsive-layout="scroll"
          :global-filter-fields="[
            'status',
            'user_name',
            'driver_name',
            'address_destination'
          ]"
          @row-click="goToOrderDetail"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
              <Button
                type="button"
                icon="pi pi-filter-slash"
                label="Clear"
                class="p-button-outlined mb-2"
                @click="clearFilter1()"
              />
              <span class="p-input-icon-left mb-2">
                <i class="pi pi-search" />
                <InputText
                  v-model="filters1.global.value"
                  placeholder="Keyword Search"
                  style="width: 100%"
                />
              </span>
            </div>
          </template>
          <template #empty>
            No Order found.
          </template>
          <!-- <template #loading>
            Loading customers data. Please wait.
          </template> -->
          <Column
            field="customer_name"
            header="Customer"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              <div style="display: flex; align-items: center;">
                <div class="avatar-wrapper">
                  <img
                    v-if="data.imageLoadedCustomer && data.customer.picture"
                    :src="data.customer.picture"
                    width="32"
                    height="32"
                    style="vertical-align: middle; border-radius: 50%; object-fit: cover;"
                    :alt="data.customer.first_name"
                    @error="onImageErrorCustomer($event, data)"
                  >
                  <span
                    v-if="!data.imageLoadedCustomer || !data.customer.picture"
                    class="fallback-avatar"
                  >
                    {{ getInitials(data.customer.first_name, data.customer.last_name) }}
                  </span>
                </div>
                <span style="margin-left: .5em; vertical-align: middle" class="image-text">
                  {{ [data?.customer?.first_name, data?.customer?.last_name].filter(Boolean).join(' ') }}
                </span>
              </div>
            </template>
          </Column>

          <Column
            field="driver_name"
            header="Driver"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              <div style="display: flex; align-items: center;">
                <div v-if="data.driver" class="avatar-wrapper">
                  <img
                    v-if="data.imageLoadedDriver && data.driver.picture"
                    :src="data.driver.picture"
                    width="32"
                    height="32"
                    style="vertical-align: middle; border-radius: 50%; object-fit: cover;"
                    :alt="data.driver?.first_name"
                    @error="onImageErrorDriver($event, data)"
                  >
                  <span
                    v-if="!data.imageLoadedDriver || !data.driver.picture"
                    class="fallback-avatar"
                  >
                    {{ getInitials(data.driver.first_name, data.driver.last_name) }}
                  </span>
                </div>
                <span style="margin-left: .5em; vertical-align: middle" class="image-text">
                  {{ [data?.driver?.first_name, data?.driver?.last_name].filter(Boolean).join(' ') }}
                </span>
              </div>
            </template>
          </Column>

          <Column
            field="address_destination"
            header="Address Destination"
            filter-field="date"
            data-type="date"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              {{ data.address_destination }}
            </template>
          </Column>
          <Column
            header="Total Payment"
            filter-field="total_payment"
            data-type="numeric"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              {{ formatCurrency(data.total_payment) }}
            </template>
          </Column>

          <Column
            field="status" header="Status" filter-field="status"
            :show-filter-match-modes="false"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="getSeverity(data.status)"
                :icon="getIcon(data.status)"
                class="mr-2"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                v-model="filterModel.value"
                option-label="name"
                option-value="name"
                :options="statusOptions"
                placeholder="Any"
                style="min-width: 14rem"
                :max-selected-labels="1"
                :show-toggle-all="false"
                @change="() => handleStatusFilterChange(filterModel, filterCallback)"
              >
                <!-- Opsi -->
                <template #option="{ option }">
                  <div class="flex items-center gap-2">
                    <Tag
                      :value="option.name"
                      :severity="getSeverity(option.name)"
                      :icon="getIcon(option.name)"
                      class="mr-2"
                    />
                  </div>
                </template>
              </MultiSelect>
            </template>
          </Column>

          <Column
            field="package_category"
            header="Package Category"
            :show-filter-match-modes="false"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              <span class="text-sm capitalize">
                {{ data.package_category }}
              </span>
            </template>
          </Column>
        </DataTable>
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

.avatar-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fallback-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ccc;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
