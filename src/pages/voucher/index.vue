<script lang="ts">
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import CustomerService from '~~/services/CustomerService';
import ProductService from '~~/services/ProductService';

export default {
  data() {
    return {
      displayConfirmation: true,
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
      ],
      contextActionItems: [] as { label: string, icon: string, command: () => void }[]
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
    this.customerService.getAllCustomers().then((data) => {
      console.log(data);
      this.customers = data.map((customer) => ({
        ...customer,
        imageLoaded: true,
        verifying: false,
        deleting: false
      }));
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
    // toggleMenu(event) {
    //   this.$refs.menu.toggle(event);
    // },
    onContextRightClick(event) {
      this.$refs.contextMenu.show(event);
    },
    getInitials(first, last) {
      return ((first?.charAt(0) || '') + (last?.charAt(0) || '')).toUpperCase();
    },
    onImageError(event, data) {
      data.imageLoaded = false;
      event.target.style.display = 'none'; // Sembunyikan <img> jika gagal load
    },
    toggleMenu(event, data) {
      this.contextActionItems = [];

      if (!data.is_verified) {
        this.contextActionItems.push({
          label: 'Verify',
          icon: 'pi pi-check',
          command: () => {
            this.$confirm.require({
              message: `Are you sure you want to verify ${data.first_name} ${data.last_name}?`,
              header: 'Confirm Verification',
              icon: 'pi pi-check-circle',
              acceptLabel: 'Yes',
              rejectLabel: 'Cancel',
              accept: () => {
                this.verifyCustomer(data);
              }
            });
          }
        });
      }

      this.contextActionItems.push({
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteCustomer(data)
      });

      this.$refs.menu.toggle(event);
    },
    async verifyCustomer(customer) {
      if (!customer) {
        return;
      }

      customer.verifying = true;
      try {
        await this.customerService.verifyCustomer(customer.id);

        customer.is_verified = true;
          this.$toast.add({
          severity: 'success',
          summary: 'Customer Verified',
          detail: `${customer.first_name} ${customer.last_name || ''} has been successfully verified.`,
          life: 3000
        });
      } catch (error) {
        console.error('Verifikasi gagal:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Verification Failed',
          detail: `Failed to verify ${customer.first_name} ${customer.last_name || ''}. Please try again.`,
          life: 3000
        });
      } finally {
        customer.verifying = false;
      }
    },
    async deleteCustomer(customer) {
      if (!customer) {
        return;
      }

      this.$confirm.require({
        message: `Are you sure you want to delete ${customer.first_name} ${customer.last_name || ''}?`,
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: async () => {
          customer.deleting = true;
          try {
            await this.customerService.deleteCustomer(customer.id);

            // Remove from local list
            this.customers = this.customers.filter(c => c.id !== customer.id);

            this.$toast.add({
              severity: 'success',
              summary: 'Customer Deleted',
              detail: `${customer.first_name} ${customer.last_name || ''} has been successfully deleted.`,
              life: 3000
            });
          } catch (error) {
            console.error('Deletion failed:', error);
            this.$toast.add({
              severity: 'error',
              summary: 'Deletion Failed',
              detail: `Failed to delete ${customer.first_name} ${customer.last_name || ''}. Please try again.`,
              life: 3000
            });
          } finally {
            customer.deleting = false;
          }
        }
      });
    }
  }
};
</script>

<template>
  <div class="grid">
    <Toast />
    <div class="col-12">
      <div class="card">
        <h5>Voucher</h5>
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
                type="button" icon="pi pi-plus" label="Add"
                class="p-button mb-2"
                @click="clearFilter1()"
              />
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
                <img
                  :src="`${data.picture}`"
                  width="32"
                  height="32"
                  style="vertical-align: middle; border-radius: 50%; object-fit: cover;"
                  @error="onImageError($event, data)"
                  :alt="data.first_name"
                >
                <span
                  v-if="!data.imageLoaded"
                  class="fallback-avatar"
                >
                  {{ getInitials(data.first_name, data.last_name) }}
                </span>
                <span style="margin-left: .5em; vertical-align: middle" class="image-text">
                  {{ data.first_name }} {{ data.last_name }}
                </span>
              </div>
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
            <template #body="{ data }">
              <span style="margin-left: .5em; vertical-align: middle" class="image-text">{{ data.email }}</span>
            </template>
          </Column>
          <Column header="Phone number" filter-field="balance" data-type="numeric" style="min-width:10rem">
            <template #body="{ data }">
              <span style="margin-left: .5em; vertical-align: middle" class="image-text">{{ data.phone ? `+${data.phone}` : '' }}</span>
            </template>
          </Column>
          <Column field="status" header="Type" :filter-menu-style="{ width: '14rem' }" style="min-width:12rem">
            <template #body="{ data }">
              <span :class="`customer-badge status-${data.provider}`">{{ data.provider }}</span>
            </template>
            <!-- <template #filter="{ filterModel }">
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
            </template> -->
          </Column>
          <Column
            field="verified" header="Verified" data-type="boolean"
            body-class="text-center"
            style="min-width:8rem"
          >
            <template #body="{ data }">
              <i
                v-if="data.verifying"
                class="pi pi-spin pi-spinner text-gray-500"
              />
              <i
                v-else
                class="pi"
                :class="{
                  'text-green-500 pi-check-circle': data.is_verified,
                  'text-pink-500 pi-times-circle': !data.is_verified
                }"
              />
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
              <Menu
                ref="menu"
                :model="contextActionItems"
                :popup="true"
                class="w-fit px-2"
              />
              <Button
                :icon="data.deleting ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-v'"
                class="p-button-rounded p-button-text p-2"
                @click="toggleMenu($event, data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <ConfirmDialog />
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

		&.status-CREDENTIALS {
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

		&.status-GOOGLE {
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
