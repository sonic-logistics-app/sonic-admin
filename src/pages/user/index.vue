<script lang="ts">
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import CustomerService from '~~/services/CustomerService';
import ProductService from '~~/services/ProductService';

export default {
  data() {
    return {
      customers: null,
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
      ],
      overlayMenuItems: [
        {
          label: 'Verify',
          icon: 'pi pi-check'
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash'
        }
      ]
    };
  },
  customerService: null,
  productService: null,
  created() {
    this.customerService = new CustomerService();
    this.productService = new ProductService();
    this.initFilters1();
  },
  mounted() {
    this.productService.getProductsWithOrdersSmall().then(data => this.products = data);
    this.customerService.getCustomersLarge().then((data) => {
      this.customers = data;
      this.loading1 = false;
      this.customers.forEach(customer => customer.date = new Date(customer.date));
    });
  },
  methods: {
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
    formatDate(value) {
      return value.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    toggleMenu(event) {
      this.$refs.menu.toggle(event);
    },
    onContextRightClick(event) {
      this.$refs.contextMenu.show(event);
    }
  }
};
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Customer</h5>
        <DataTable
          v-model:filters="filters1"
          :value="customers"
          :paginator="true"
          class="p-datatable-gridlines"
          :rows="10"
          data-key="id"
          :row-hover="true"
          filter-display="menu"
          :loading="loading1"
          :filters="filters1"
          responsive-layout="scroll"
          :global-filter-fields="['name', 'representative.name', 'balance', 'status']"
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
              <img :alt="data.representative.name" :src="`/images/avatar/${data.representative.image}`" width="32" style="vertical-align: middle">
              <span style="margin-left: .5em; vertical-align: middle" class="image-text">{{ data.representative.name }}</span>
            </template>
          </Column>
          <!-- <Column field="name" header="Name" style="min-width:12rem">
            <template #body="{ data }">
              {{ data.name }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by name" />
            </template>
          </Column> -->
          <Column header="Email" filter-field="country.name" style="min-width:12rem">
            <!-- <template #body="{ data }">
              <img src="~/assets/demo/flags/flag_placeholder.png" :alt="data.country.name" :class="`flag flag-${data.country.code}`" width="30">
              <span style="margin-left: .5em; vertical-align: middle" class="image-text">{{ data.country.name }}</span>
            </template> -->
          </Column>
          <Column header="Phone number" filter-field="balance" data-type="numeric" style="min-width:10rem">
            <!-- <template #body="{ data }">
              {{ formatCurrency(data.balance) }}
            </template> -->
          </Column>
          <Column field="status" header="Login with" :filter-menu-style="{ width: '14rem' }" style="min-width:12rem">
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
          <Column
            field="verified" header="Verified" data-type="boolean"
            body-class="text-center"
            style="min-width:8rem"
          >
            <template #body="{ data }">
              <i class="pi" :class="{ 'text-green-500 pi-check-circle': data.verified, 'text-pink-500 pi-times-circle': !data.verified }" />
            </template>
            <template #filter="{ filterModel }">
              <TriStateCheckbox v-model="filterModel.value" />
            </template>
          </Column>

          <Column
            filter-field="balance"
            data-type="numeric"
            style="min-width:1rem; text-align: center;"
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
                @click="toggleMenu"
              />
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
