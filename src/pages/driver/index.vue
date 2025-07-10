<script lang="ts">
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import DriverService from '~~/services/DriverService';
import ProductService from '~~/services/ProductService';
import { useRouter } from '#vue-router';
import CustomerService from '~~/services/CustomerService';

const router = useRouter();

export default {
  data() {
    return {
      customer1: null,
      customer2: null,
      customer3: null,
      drivers: null,
      filters1: null,
      filters2: {},
      loading1: true,
      loading2: true,
      idFrozen: false,
      products: null,
      expandedRows: [],
      selectedDriver: null,
      deleteDialogVisible: false,
      driverToDelete: null,
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
      ],
      overlayMenuItems: [
        {
          label: 'Verify',
          icon: 'pi pi-check',
          command: () => {
            this.verifyDriver(this.selectedDriver);
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
            this.confirmDelete(this.selectedDriver);
          }
        }
      ]
    };
  },
  customerService: null,
  productService: null,
  driverService: null,
  created() {
    this.customerService = new CustomerService();
    this.productService = new ProductService();
    this.driverService = new DriverService();
    this.initFilters1();
  },
  mounted() {
    this.driverService.getAllDrivers().then(data => {
      this.drivers = data.map(driver => ({
        ...driver,
        name: `${driver.first_name} ${driver.last_name}`,
        dateBirth: driver.birth_date || new Date().toISOString().split('T')[0],
        email: driver.email,
        verified: driver.otp_verified,
        status: driver.status.toLowerCase(),
        picture: driver.picture,
        public_id: driver.public_id,
        verificationProgress: driver.verificationProgress,
        verificationStatus: driver.verificationStatus,
        representative: {
          name: `${driver.first_name} ${driver.last_name}`,
          image: driver.picture || 'default.png'
        },
        imageLoaded: !!driver.picture
      }));
    });
    this.productService.getProductsWithOrdersSmall().then(data => this.products = data);
    this.customerService.getCustomersLarge().then((data) => {
      this.customer1 = this.transformDriverData(data);
      this.loading1 = false;
      this.customer1.forEach(customer => customer.date = new Date(customer.date));
    });
    this.customerService.getCustomersLarge().then(data => this.customer2 = data);
    this.customerService.getCustomersMedium().then(data => this.customer3 = data);
    this.loading2 = false;
  },
  methods: {

    transformDriverData(data) {
      return data.map(item => ({
        id: item.id,
        representative: {
          name: item.name || item.representative?.name || 'Unknown',
          image: item.representative?.image || 'default.png'
        },
        dateBirth: item.dateBirth || item.date || new Date().toISOString().split('T')[0],
        email: item.email || `${(item.representative?.name || 'user').toLowerCase().replace(' ', '.')}@example.com`,
        verified: item.verified !== undefined ? item.verified : Math.random() > 0.5,
        ...item
      }));
    },
    initFilters1() {
      this.filters1 = {
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'country.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'representative': { value: null, matchMode: FilterMatchMode.IN },
        'date': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        'balance': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        'status': { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        'activity': { value: null, matchMode: FilterMatchMode.BETWEEN },
        'verified': { value: null, matchMode: FilterMatchMode.EQUALS }
      };
    },
    clearFilter1() {
      this.initFilters1();
    },
    expandAll() {
      this.expandedRows = this.products.filter(p => p.id);
    },
    collapseAll() {
      this.expandedRows = null;
    },
    formatCurrency(value) {
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    },
    formatDate(value) {
      return value.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    toggleMenu(event, selectedDriver) {
      this.selectedDriver = selectedDriver;
      this.$refs.menu.toggle(event);
    },
    getInitials(first, last) {
      return ((first?.charAt(0) || '') + (last?.charAt(0) || '')).toUpperCase();
    },
    confirmDelete(driver) {
      this.driverToDelete = driver;
      this.deleteDialogVisible = true;
    },
    onImageError(event, data) {
      data.imageLoaded = false;
      event.target.style.display = 'none'; // Sembunyikan <img> jika gagal load
    },
    deleteDriver() {
      if (this.driverToDelete) {
        this.driverService.deleteDriver(this.driverToDelete.id)
          .then(response => {
            this.drivers = this.drivers.filter(d => d.id !== this.driverToDelete.id);
            
            this.$toast.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Driver deleted successfully',
              life: 3000
            });
          })
          .catch(error => {
            console.error('Failed to delete driver:', error);
            
            this.$toast.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to delete driver',
              life: 3000
            });
          })
          .finally(() => {
            // Reset state
            this.loading1 = false;
            this.deleteDialogVisible = false;
            this.driverToDelete = null;
          });
      }
    },
    
    cancelDelete() {
      this.deleteDialogVisible = false;
      this.driverToDelete = null;
    },
    calculateCustomerTotal(name) {
      let total = 0;
      if (this.customer3) {
        for (const customer of this.customer3) {
          if (customer.representative.name === name) {
            total++;
          }
        }
      }

      return total;
    },

    verifyDriver(driver) {
      if (driver && driver.id) {
        navigateTo(`/driver/${driver.id}`);
      } else {
        console.error('Driver or driver ID not found');
      }
    }
  }
};
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Driver</h5>
        <DataTable
          v-model:filters="filters1"
          :value="drivers"
          :paginator="true"
          class="p-datatable-gridlines"
          :rows="10"
          data-key="id"
          :row-hover="true"
          filter-display="menu"
          :loading="loading1"
          :filters="filters1"
          responsive-layout="scroll"
          :global-filter-fields="['name', 'country.name', 'representative.name', 'balance', 'status']"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
              <Button
                type="button" icon="pi pi-filter-slash" label="Clear"
                class="p-button-outlined mb-2"
                @click="clearFilter1()"
              />
              <span class="p-input-icon-left mb-2">
                <i class="pi pi-search" />
                <InputText v-model="filters1.global.value" placeholder="Keyword Search" style="width: 100%" />
              </span>
            </div>
          </template>
          <template #empty>
            No customers found.
          </template>
          <!-- <template #loading>
            Loading customers data. Please wait.
          </template> -->
          <Column
            header="Name" filter-field="representative" :show-filter-match-modes="false"
            :filter-menu-style="{ width: '14rem' }"
            style="min-width:14rem"
          >
            <template #body="{ data }">
              <div style="display: flex; align-items: center;">
                <!-- Wrapper untuk avatar -->
                <div class="avatar-wrapper">
                  <img
                    v-if="data.imageLoaded && data.picture"
                    :src="data.picture"
                    width="32"
                    height="32"
                    style="vertical-align: middle; border-radius: 50%; object-fit: cover;"
                    @error="onImageError($event, data)"
                    :alt="data.first_name"
                  >
                  <span
                    v-if="!data.imageLoaded || !data.picture"
                    class="fallback-avatar"
                  >
                    {{ getInitials(data.first_name, data.last_name) }}
                  </span>
                </div>
                <span style="margin-left: .5em; vertical-align: middle" class="image-text">
                  {{ data.name }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="dateBirth" header="Date of Birth" style="min-width:12rem">
            <template #body="{ data }">
              {{ data.dateBirth ? formatDate(new Date(data.dateBirth)) : 'N/A' }}
            </template>
          </Column>
          <Column header="Email" filter-field="email" style="min-width:12rem">
            <template #body="{ data }">
              {{ data.email }}
            </template>
          </Column>
          <!-- <Column
            header="Agent" filter-field="representative" :show-filter-match-modes="false"
            :filter-menu-style="{ width: '14rem' }"
            style="min-width:14rem"
          >
            <template #body="{ data }">
              <img :alt="data.representative.name" :src="`/images/avatar/${data.representative.image}`" width="32" style="vertical-align: middle">
              <span style="margin-left: .5em; vertical-align: middle" class="image-text">{{ data.representative.name }}</span>
            </template>
            <template #filter="{ filterModel }">
              <div class="mb-3 text-bold">
                Agent Picker
              </div>
              <ClientOnly>
                <MultiSelect
                  v-model="filterModel.value" :options="representatives" option-label="name"
                  placeholder="Any"
                  class="p-column-filter"
                >
                  <template #option="slotProps">
                    <div class="p-multiselect-representative-option">
                      <img :alt="slotProps.option.name" :src="`/images/avatar/${slotProps.option.image}`" width="32" style="vertical-align: middle">
                      <span style="margin-left: .5em; vertical-align: middle" class="image-text">{{ slotProps.option.name }}</span>
                    </div>
                  </template>
                </MultiSelect>
              </ClientOnly>
            </template>
          </Column>
          <Column header="Date" filter-field="date" data-type="date" style="min-width:10rem">
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
            <template #filter="{ filterModel }">
              <ClientOnly>
                <Calendar v-model="filterModel.value" date-format="mm/dd/yy" placeholder="mm/dd/yyyy" />
              </ClientOnly>
            </template>
          </Column>
          <Column header="Balance" filter-field="balance" data-type="numeric" style="min-width:10rem">
            <template #body="{ data }">
              {{ formatCurrency(data.balance) }}
            </template>
            <template #filter="{ filterModel }">
              <InputNumber v-model="filterModel.value" mode="currency" currency="USD" locale="en-US" />
            </template>
          </Column>
          <Column field="status" header="Status" :filter-menu-style="{ width: '14rem' }" style="min-width:12rem">
            <template #body="{ data }">
              <span :class="`customer-badge status-${data.status}`">{{ data.status }}</span>
            </template>
            <template #filter="{ filterModel }">
              <ClientOnly>
                <Dropdown
                  v-model="filterModel.value" :options="statuses" placeholder="Any"
                  class="p-column-filter"
                  :show-clear="true"
                >
                  <template #value="slotProps">
                    <span v-if="slotProps.value" :class="`customer-badge status-${slotProps.value}`">{{ slotProps.value }}</span>
                    <span v-else>{{ slotProps.placeholder }}</span>
                  </template>
                  <template #option="slotProps">
                    <span :class="`customer-badge status-${slotProps.option}`">{{ slotProps.option }}</span>
                  </template>
                </Dropdown>
              </ClientOnly>
            </template>
          </Column>
          <Column field="activity" header="Activity" :show-filter-match-modes="false" style="min-width:12rem">
            <template #body="{ data }">
              <ProgressBar :value="data.activity" :show-value="false" style="height:.5rem" />
            </template>
            <template #filter="{ filterModel }">
              <Slider v-model="filterModel.value" range class="m-3" />
              <div class="flex align-items-center justify-content-between px-2">
                <span>{{ filterModel.value ? filterModel.value[0] : 0 }}</span>
                <span>{{ filterModel.value ? filterModel.value[1] : 100 }}</span>
              </div>
            </template>
          </Column> -->
          <Column
            field="verified" header="Verified" data-type="boolean"
            body-class="text-center"
            style="min-width:8rem"
          >
            <template #body="{ data }">
              {{ data.verificationProgress }}
            </template>
          </Column>
          <Column
            body-class="text-center"
          >
            <template #header>
              <span class="text-center w-full">
                Action
              </span>
            </template>
            <template #body="{ data }">
              <Menu ref="menu" :model="overlayMenuItems" :popup="true" class="w-fit px-2" />
              <Button
                icon="pi pi-ellipsis-v"
                class="p-button-rounded p-button-text p-2"
                @click="toggleMenu($event, data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <Dialog
      v-model:visible="deleteDialogVisible"
      :style="{ width: '450px' }"
      header="Confirm Delete"
      :modal="true"
      class="p-fluid"
    >
      <div class="flex align-items-center justify-content-center my-3">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--orange-500)"/>
        <span v-if="driverToDelete">
          Are you sure you want to delete <b>{{ driverToDelete.name }}</b>?
        </span>
      </div>
      
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelDelete"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-danger"
          @click="deleteDriver"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped lang="scss">
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

	.customer-badge {
		border-radius: 2px;
		padding: .25em .5rem;
		text-transform: uppercase;
		font-weight: 700;
		font-size: 12px;
		letter-spacing: .3px;

		&.status-qualified {
			background: #C8E6C9;
			color: #256029;
		}

		&.status-unqualified {
			background: #FFCDD2;
			color: #C63737;
		}

		&.status-negotiation {
			background: #FEEDAF;
			color: #8A5340;
		}

		&.status-new {
			background: #B3E5FC;
			color: #23547B;
		}

		&.status-renewal {
			background: #ECCFFF;
			color: #694382;
		}

		&.status-proposal {
			background: #FFD8B2;
			color: #805B36;
		}
	}

	.product-badge {
		border-radius: 2px;
		padding: .25em .5rem;
		text-transform: uppercase;
		font-weight: 700;
		font-size: 12px;
		letter-spacing: .3px;

		&.status-instock {
			background: #C8E6C9;
			color: #256029;
		}

		&.status-outofstock {
			background: #FFCDD2;
			color: #C63737;
		}

		&.status-lowstock {
			background: #FEEDAF;
			color: #8A5340;
		}
	}

	.order-badge {
		border-radius: 2px;
		padding: .25em .5rem;
		text-transform: uppercase;
		font-weight: 700;
		font-size: 12px;
		letter-spacing: .3px;

		&.order-delivered {
			background: #C8E6C9;
			color: #256029;
		}

		&.order-cancelled {
			background: #FFCDD2;
			color: #C63737;
		}

		&.order-pending {
			background: #FEEDAF;
			color: #8A5340;
		}

		&.order-returned {
			background: #ECCFFF;
			color: #694382;
		}
	}
</style>
