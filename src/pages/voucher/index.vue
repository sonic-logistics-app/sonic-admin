<script lang="ts">
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import VoucherService from '~~/services/VoucherService';

export default {
  data() {
    return {
      vouchers: [],
      filters: null,
      loading: true,
      selectedVoucher: null,
      deleteDialogVisible: false,
      voucherToDelete: null,
      overlayMenuItems: [
        {
          label: 'View',
          icon: 'pi pi-eye',
          command: () => {
            this.goToEditVoucher(this.selectedVoucher);
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
            this.confirmDelete(this.selectedVoucher);
          }
        }
      ]
    };
  },
  voucherService: null,
  created() {
    this.voucherService = new VoucherService();
    this.initFilters();
  },
  mounted() {
    this.loadVouchers();
  },
  methods: {
    loadVouchers() {
      this.loading = true;
      this.voucherService.getAllVouchers().then(data => {
        this.vouchers = data.map(voucher => ({
          ...voucher,
          amount: voucher.amount || 0,
          code: voucher.code || '',
          voucherType: voucher.expiry_type.split(' ')[0],
          expiryDate: voucher.expiry_type.split(' ')[1],
          name: voucher.name || '',
          used: voucher.used || 0,
          deleting: false
        }));
        this.loading = false;
      }).catch(error => {
        console.error('Failed to load voucher:', error);
        this.loading = false;
      });
    },

    initFilters() {
      this.filters = {
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'voucherType': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'expiryDate': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        'amount': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        'used': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
      };
    },

    clearFilter() {
      this.initFilters();
    },

    formatDate(value) {
      if (!value) return 'N/A';
      return new Date(value).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    toggleMenu(event, selectedVoucher) {
      this.selectedVoucher = selectedVoucher;
      this.$refs.menu.toggle(event);
    },

    confirmDelete(voucher: any) {
      this.voucherToDelete = voucher;
      this.deleteDialogVisible = true;
    },

    async deleteVoucher() {
      console.log('deleting voucher:', this.voucherToDelete);
      if (!this.voucherToDelete) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No voucher selected for deletion',
          life: 3000
        });
        return;
      }

      this.voucherToDelete.deleting = true;

      try {
        await this.voucherService.deleteVoucher(this.voucherToDelete.id);

        this.vouchers = this.vouchers.filter(d => d.id !== this.voucherToDelete.id);

        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Voucher ${this.voucherToDelete.name} deleted successfully`,
          life: 3000
        });

        console.log('voucher deleted successfully:', this.voucherToDelete.name);
      } catch (error) {
        console.error('Failed to delete voucher:', error);

        this.$toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: error.response?.data?.message || error.message || 'Failed to delete voucher. Please try again.',
          life: 5000
        });
      } finally {
        this.voucherToDelete.deleting = false;
        this.deleteDialogVisible = false;
        this.voucherToDelete = null;
      }
    },

    confirmDelete(voucher) {
      console.log('confirmDelete', voucher);
      this.$confirm.require({
        message: `Are you sure you want to delete ${voucher.name}?`,
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: async () => {
          this.voucherToDelete = voucher;
          await this.deleteVoucher();
        }
      });
    },

    goToCreateVoucher() {
      navigateTo('/voucher/create');
    },

    goToEditVoucher(voucher) {
      navigateTo(`/voucher/${voucher.id}`);
    }
  }
};
</script>

<template>
  <div class="grid">
    <Toast />
    <div class="col-12">
      <div class="card">
        <h5>Voucher Management</h5>
        <DataTable
          v-model:filters="filters"
          :value="vouchers"
          :paginator="vouchers.length > 10"
          class="p-datatable-gridlines"
          :rows="10"
          data-key="id"
          :row-hover="true"
          filter-display="menu"
          :loading="loading"
          responsive-layout="scroll"
          :global-filter-fields="['name', 'code', 'voucherType', 'expiryDate', 'amount', 'used']"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
              <Button
                type="button" icon="pi pi-plus" label="Add"
                class="p-button mb-2"
                @click="goToCreateVoucher"
              />
              <div class="flex gap-3">
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear"
                  class="p-button-outlined mb-2"
                  @click="clearFilter()"
                />
                <span class="p-input-icon-left mb-2">
                  <i class="pi pi-search" />
                  <InputText
                    v-model="filters['global'].value"
                    placeholder="Search voucher..."
                    style="width: 100%"
                  />
                </span>
              </div>
            </div>
          </template>

          <template #empty>
            No voucher found.
          </template>

          <Column
            header="Name"
            field="name"
            :show-filter-match-modes="false"
            :filter-menu-style="{ width: '14rem' }"
            sortable
            style="min-width:14rem"
          >
            <template #body="{ data }">
              <div style="display: flex; align-items: center;">
                <span style="margin-left: .5em; vertical-align: middle" class="image-text">
                  {{ data.name }}
                </span>
              </div>
            </template>
          </Column>

          <Column
            field="code"
            sortable
            header="Code"
            style="min-width:12rem"
          >
            <template #body="{ data }">
              {{ data.code || "-" }}
            </template>
          </Column>

          <Column
            field="voucherType"
            sortable
            header="Voucher Type"
            style="min-width:12rem"
          >
            <template #body="{ data }">
              <p class="capitalize">
                {{ data.voucherType }}
              </p>
            </template>
          </Column>

          <Column
            header="Expiry Date"
            filter-field="expiryDate"
            field="expiryDate"
            sortable
            style="min-width:12rem"
          >
            <template #body="{ data }">
              {{ data.expiryDate }}
            </template>
          </Column>

          <Column
            header="Amount"
            filter-field="amount"
            field="amount"
            sortable
            style="min-width:8rem"
          >
            <template #body="{ data }">
              {{ data.amount }}
            </template>
          </Column>

          <Column
            header="Used"
            filter-field="used"
            field="used"
            sortable
            style="min-width:8rem"
          >
            <template #body="{ data }">
              {{ data.used }}
            </template>
          </Column>

          <Column body-class="text-center">
            <template #header>
              <span class="text-center w-full">
                Action
              </span>
            </template>
            <template #body="{ data }">
              <Menu ref="menu" :model="overlayMenuItems" :popup="true" class="w-fit px-2" />
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

    <Dialog
      v-model:visible="deleteDialogVisible"
      :style="{ width: '450px' }"
      header="Confirm Delete"
      :modal="true"
      class="p-fluid"
    >
      <div class="flex align-items-center justify-content-center my-3">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--orange-500)"/>
        <span v-if="voucherToDelete">
          Are you sure you want to delete <b>{{ voucherToDelete.name }}</b>?
        </span>
      </div>

      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-danger"
          @click="deleteVoucher"
        />
      </template>
    </Dialog>
    <ConfirmDialog />
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
</style>
