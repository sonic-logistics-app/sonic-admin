<script lang="ts" setup>
import DashboardService from '~~/services/DashboardService';

const dashboardService = new DashboardService();

useHead({
  title: 'Dashboard'
});

interface OrderStatus {
  status: string;
  total: number;
}

interface DashboardStats {
  totalOrder: number;
  totalCustomer: number;
  totalDriver: number;
  ordersByStatus: OrderStatus[];
  orderLastWeek: number;
  orderThisWeek: number;
  orderDifference: number;
  orderGrowthRate: number;
  customerLastWeek: number;
  driverLastWeek: number;
}

const products = ref([]);
const recentOrdersData = ref([]);

const dashboardStatsData = ref<DashboardStats>({
  totalOrder: 0,
  totalCustomer: 0,
  totalDriver: 0,
  ordersByStatus: [],
  orderLastWeek: 0,
  orderThisWeek: 0,
  orderDifference: 0,
  orderGrowthRate: 0,
  customerLastWeek: 0,
  driverLastWeek: 0
});

const loading = ref(false);
const error = ref('');

const items = ref([
  { label: 'Add New', icon: 'pi pi-fw pi-plus' },
  { label: 'Remove', icon: 'pi pi-fw pi-minus' }
]);

const lineData = ref({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Revenue',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      backgroundColor: '#2f4860',
      borderColor: '#2f4860',
      tension: 0.4
    },
    {
      label: 'Sales',
      data: [28, 48, 40, 19, 86, 27, 90],
      fill: false,
      backgroundColor: '#00bb7e',
      borderColor: '#00bb7e',
      tension: 0.4
    }
  ]
});

const statusConfig = {
  PENDING: {
    label: 'Pending',
    icon: 'pi pi-clock',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-500'
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: 'pi pi-check',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    textColor: 'text-green-500'
  },
  IN_TRANSIT: {
    label: 'In Transit',
    icon: 'pi pi-truck',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-500'
  },
  PICKUP: {
    label: 'Ready for Pickup',
    icon: 'pi pi-box',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-500'
  },
  DELIVERED: {
    label: 'Delivered',
    icon: 'pi pi-check',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    textColor: 'text-green-500'
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: 'pi pi-times',
    bgColor: 'bg-cancelled',
    borderColor: 'border-cancelled',
    textColor: 'text-cancelled'
  },
  IN_PAYMENT: {
    label: 'In Payment',
    icon: 'pi pi-credit-card',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-500'
  }
};

function formatCurrency(value: number) {
  if (typeof value !== 'number') {
    return;
  }
  const price = value.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }).split('');
  price.splice(1, 0, ' ');
  return price.join('');
}

function goToOrderDetail(event: any) {
  const id = event.data.id;
  navigateTo(`/order/${id}`);
}

function getSeverity(status: string) {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'CONFIRMED': return 'info';
    case 'IN_TRANSIT': return 'primary';
    case 'DELIVERED': return 'success';
    case 'CANCELLED': return 'danger';
    case 'IN_PAYMENT': return 'info';
    case 'PICKUP': return 'warning';
    default: return null;
  }
}

function getIcon(status: string) {
  switch (status) {
    case 'PENDING': return 'pi pi-exclamation-triangle';
    case 'CONFIRMED': return 'pi pi-info-circle';
    case 'IN_TRANSIT': return 'pi pi-spinner';
    case 'DELIVERED': return 'pi pi-check';
    case 'CANCELLED': return 'pi pi-times';
    case 'IN_PAYMENT': return 'pi pi-credit-card';
    case 'PICKUP': return 'pi pi-box';
    default: return 'pi pi-info-circle';
  }
}

const loadStats = async () => {
  try {
    loading.value = true;
    error.value = '';

    const stats = await dashboardService.getDashboardStats();

    if (!stats || !stats.order || !stats.order.status) {
      throw new Error('Invalid data structure from API');
    }

    const statusOrder = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'PICKUP', 'DELIVERED', 'CANCELLED', 'IN_PAYMENT'];

    const statusMap = {};
    stats.order.status.forEach(item => {
      statusMap[item.order_status] = item.total;
    });

    const orderedStatusTotals = statusOrder.map(status => ({
      status: status,
      total: statusMap[status] || 0
    }));

    const orderLastWeek = stats.order?.total_last_week || 0;
    const orderThisWeek = stats.order?.total_this_week || 0;
    const orderDifference = orderThisWeek - orderLastWeek;
    const orderGrowthRate = orderLastWeek > 0
      ? (orderDifference / orderLastWeek) * 100
      : (orderThisWeek > 0 ? 100 : 0);

    dashboardStatsData.value = {
      totalOrder: stats.order?.total || 0,
      totalCustomer: stats.user?.total || 0,
      totalDriver: stats.driver?.total || 0,
      ordersByStatus: orderedStatusTotals,
      orderLastWeek,
      orderThisWeek,
      orderDifference,
      orderGrowthRate,
      customerLastWeek: stats.user?.total_this_week || 0,
      driverLastWeek: stats.driver?.total_this_week || 0
    };
  } catch (err) {
    error.value = 'Failed to load dashboard stats';

    dashboardStatsData.value = {
      totalOrder: 0,
      totalCustomer: 0,
      totalDriver: 0,
      ordersByStatus: [],
      orderLastWeek: 0,
      orderThisWeek: 0,
      orderDifference: 0,
      orderGrowthRate: 0
    };
  } finally {
    loading.value = false;
  }
};

const loadRecentOrders = async () => {
  try {
    loading.value = true;
    error.value = '';

    const recentOrders = await dashboardService.getRecentOrders();
    recentOrdersData.value = recentOrders.map(order => ({
      id: order.id,
      order_id: order.order_id,
      status: order.order_status,
      total_payment: order.price_fees,
      package_category: order.package?.delivery_type ?? '-',
      fullname_customer: `${order.user?.first_name ?? ''} ${order.user?.last_name ?? ''}`.trim(),
      fullname_driver: `${order.driver?.first_name ?? ''} ${order.driver?.last_name ?? ''}`.trim(),
    }));
  } catch (err) {
    error.value = 'Failed to load recent orders';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStats();
  loadRecentOrders();
});
</script>

<template>
  <div class="grid">
    <div class="col-12 lg:col-6 xl:col-4">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Total Orders All Time</span>
            <div class="text-900 font-medium text-xl">
              <span v-if="loading">Loading...</span>
              <span v-else-if="error" class="text-red-500">Error</span>
              <span v-else>{{ dashboardStatsData.totalOrder }}</span>
            </div>
          </div>
          <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-truck text-blue-500 text-xl" />
          </div>
        </div>
        <span
          :class="{
            'text-green-500': dashboardStatsData.orderDifference > 0,
            'text-cancelled': dashboardStatsData.orderDifference < 0,
            'text-gray-500': dashboardStatsData.orderDifference === 0
          }"
          class="font-medium"
        >
          <span v-if="dashboardStatsData.orderDifference > 0">+{{ dashboardStatsData.orderGrowthRate.toFixed(1) }}%</span>
          <span v-else-if="dashboardStatsData.orderDifference < 0">{{ dashboardStatsData.orderGrowthRate.toFixed(1) }}%</span>
          <span v-else>0%</span>
        </span>
        <span class="text-500"> since last week</span>
      </div>
    </div>

    <div class="col-12 lg:col-6 xl:col-4">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Customers</span>
            <div class="text-900 font-medium text-xl">
              <span v-if="loading">Loading...</span>
              <span v-else-if="error" class="text-red-500">Error</span>
              <span v-else>{{ dashboardStatsData.totalCustomer }}</span>
            </div>
          </div>
          <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-user text-orange-500 text-xl" />
          </div>
        </div>
        <span class="text-green-500 font-medium">{{ dashboardStatsData.customerLastWeek }}</span>
        <span class="text-500"> newly registered in the last week</span>
      </div>
    </div>

    <div class="col-12 lg:col-6 xl:col-4">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Drivers</span>
            <div class="text-900 font-medium text-xl">
              <span v-if="loading">Loading...</span>
              <span v-else-if="error" class="text-red-500">Error</span>
              <span v-else>{{ dashboardStatsData.totalDriver }}</span>
            </div>
          </div>
          <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
            <i class="pi pi-users text-cyan-500 text-xl" />
          </div>
        </div>
        <span class="text-green-500 font-medium">{{ dashboardStatsData.driverLastWeek }} </span>
        <span class="text-500"> newly registered in the last week</span>
      </div>
    </div>

    <div class="col-12 xl:col-8">
      <div class="card">
        <h5>Recent Orders</h5>
        <DataTable
          :value="recentOrdersData"
          :rows="5" :paginator="true"
          responsive-layout="scroll"
          :loading="loading"
          :row-hover="true"
          data-key="id"
          @row-click="goToOrderDetail"
        >
          <Column field="fullname_customer" header="Customer" style="width: 35%" />
          <Column field="fullname_driver" header="Driver" style="width: 35%" />
          <Column field="total_payment" header="Total Payment" style="width: 25%">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.total_payment) }}
            </template>
          </Column>
          <Column
            field="status" header="Status" filter-field="status"
            :show-filter-match-modes="false"
          >
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="getSeverity(data.status)"
                :icon="getIcon(data.status)"
                class="mr-2"
              />
            </template>
          </Column>
          <Column field="package_category" header="Package Category" style="width:35%" />
        </DataTable>
      </div>

      <div class="card">
        <div class="flex justify-content-between align-items-center mb-5">
          <h5>Best Selling Products</h5>
          <div>
            <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu2.toggle($event)" />
            <ClientOnly>
              <Menu ref="menu2" :popup="true" :model="items" />
            </ClientOnly>
          </div>
        </div>
        <ul class="list-none p-0 m-0">
          <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
            <div>
              <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Space T-Shirt</span>
              <div class="mt-1 text-600">Clothing</div>
            </div>
            <div class="mt-2 md:mt-0 flex align-items-center">
              <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height:8px">
                <div class="bg-orange-500 h-full" style="width:50%" />
              </div>
              <span class="text-orange-500 ml-3 font-medium">%50</span>
            </div>
          </li>
          <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
            <div>
              <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Portal Sticker</span>
              <div class="mt-1 text-600">Accessories</div>
            </div>
            <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
              <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height:8px">
                <div class="bg-cyan-500 h-full" style="width:16%" />
              </div>
              <span class="text-cyan-500 ml-3 font-medium">%16</span>
            </div>
          </li>
          <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
            <div>
              <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Supernova Sticker</span>
              <div class="mt-1 text-600">Accessories</div>
            </div>
            <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
              <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height:8px">
                <div class="bg-pink-500 h-full" style="width:67%" />
              </div>
              <span class="text-pink-500 ml-3 font-medium">%67</span>
            </div>
          </li>
          <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
            <div>
              <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Wonders Notebook</span>
              <div class="mt-1 text-600">Office</div>
            </div>
            <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
              <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height:8px">
                <div class="bg-green-500 h-full" style="width:35%" />
              </div>
              <span class="text-green-500 ml-3 font-medium">%35</span>
            </div>
          </li>
          <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
            <div>
              <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Mat Black Case</span>
              <div class="mt-1 text-600">Accessories</div>
            </div>
            <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
              <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height:8px">
                <div class="bg-purple-500 h-full" style="width:75%" />
              </div>
              <span class="text-purple-500 ml-3 font-medium">%75</span>
            </div>
          </li>
          <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
            <div>
              <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Robots T-Shirt</span>
              <div class="mt-1 text-600">Clothing</div>
            </div>
            <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
              <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height:8px">
                <div class="bg-teal-500 h-full" style="width:40%" />
              </div>
              <span class="text-teal-500 ml-3 font-medium">%40</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="col-12 xl:col-4">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-2">
          <h5>Order Status</h5>
        </div>

        <div v-if="loading" class="text-center py-4">
          <i class="pi pi-spinner pi-spin text-2xl" />
          <p class="mt-2">Loading order status...</p>
        </div>

        <div v-else-if="error" class="text-center py-4">
          <i class="pi pi-exclamation-triangle text-red-500 text-2xl" />
          <p class="mt-2 text-red-500">{{ error }}</p>
        </div>

        <ul v-else class="list-none p-0 m-0">
          <li
            v-for="statusItem in dashboardStatsData.ordersByStatus"
            :key="statusItem.status"
            class="flex flex-column py-3 px-4 border-left-3 border-round-lg md:flex-row md:align-items-center md:justify-content-between mb-3"
            :class="[
              statusConfig[statusItem.status]?.bgColor || 'bg-gray-100',
              statusConfig[statusItem.status]?.borderColor || 'border-gray-500'
            ]"
          >
            <div>
              <span class="text-700 font-regular mr-2 mb-1 md:mb-0">
                {{ statusConfig[statusItem.status]?.label || statusItem.status }}
              </span>
              <div class="mt-1 text-2xl font-semibold">
                {{ statusItem.total }}
              </div>
            </div>
            <div class="mt-2 md:mt-0 flex align-items-center">
              <span
                class="ml-3 font-medium"
                :class="statusConfig[statusItem.status]?.textColor || 'text-gray-500'"
              >
                <i
                  :class="statusConfig[statusItem.status]?.icon || 'pi pi-info-circle'"
                  style="font-size:1.5rem"
                />
              </span>
            </div>
          </li>
        </ul>
      </div>

      <div class="card">
        <h5>Sales Overview</h5>
        <Chart type="line" :data="lineData" />
      </div>

      <div class="card">
        <div class="flex align-items-center justify-content-between mb-4">
          <h5>Notifications</h5>
          <div>
            <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu1.toggle($event)" />
            <ClientOnly>
              <Menu ref="menu1" :popup="true" :model="items" />
            </ClientOnly>
          </div>
        </div>

        <span class="block text-600 font-medium mb-3">TODAY</span>
        <ul class="p-0 mx-0 mt-0 mb-4 list-none">
          <li class="flex align-items-center py-2 border-bottom-1 surface-border">
            <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
              <i class="pi pi-dollar text-xl text-blue-500" />
            </div>
            <span class="text-900 line-height-3">Richard Jones
              <span class="text-700">has purchased a blue t-shirt for <span class="text-blue-500">79$</span></span>
            </span>
          </li>
          <li class="flex align-items-center py-2">
            <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0">
              <i class="pi pi-download text-xl text-orange-500" />
            </div>
            <span class="text-700 line-height-3">Your request for withdrawal of <span class="text-blue-500 font-medium">2500$</span> has been initiated.</span>
          </li>
        </ul>

        <span class="block text-600 font-medium mb-3">YESTERDAY</span>
        <ul class="p-0 m-0 list-none">
          <li class="flex align-items-center py-2 border-bottom-1 surface-border">
            <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
              <i class="pi pi-dollar text-xl text-blue-500" />
            </div>
            <span class="text-900 line-height-3">Keyser Wick
              <span class="text-700">has purchased a black jacket for <span class="text-blue-500">59$</span></span>
            </span>
          </li>
          <li class="flex align-items-center py-2 border-bottom-1 surface-border">
            <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-pink-100 border-circle mr-3 flex-shrink-0">
              <i class="pi pi-question text-xl text-pink-500" />
            </div>
            <span class="text-900 line-height-3">Jane Davis
              <span class="text-700">has posted a new questions about your product.</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bg-cancelled {
  background-color:#fee2e2;
}

.border-cancelled {
  border-color: #ef4444;
}

.text-cancelled {
  color: #ef4444;
}
</style>
