<script lang="ts">
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import DriverService from '~~/services/DriverService';

export default {
  data() {
    return {
      drivers: null,
      filters: null,
      loading: true,
      selectedDriver: null,
      deleteDialogVisible: false,
      driverToDelete: null,
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
  driverService: null,
  created() {
    this.driverService = new DriverService();
    this.initFilters(); // Initialize filters when component is created
  },
  mounted() {
    this.loadDrivers();
  },
  methods: {
    loadDrivers() {
      this.loading = true;
      this.driverService.getAllDrivers().then(data => {
        this.drivers = data.map(driver => ({
          ...driver,
          name: `${driver.first_name} ${driver.last_name}`,
          dateBirth: driver.birth_date || new Date().toISOString().split('T')[0],
          email: driver.email,
          verified: driver.otp_verified,
          status: driver.status?.toLowerCase(),
          picture: driver.picture,
          public_id: driver.public_id,
          verificationProgress: driver.verificationProgress,
          verificationStatus: driver.verificationStatus,
          imageLoaded: !!driver.picture,
          deleting: false
        }));
        this.loading = false;
      }).catch(error => {
        console.error('Failed to load drivers:', error);
        this.loading = false;
      });
    },

    initFilters() {
      this.filters = {
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'email': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        'dateBirth': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        'verified': { value: null, matchMode: FilterMatchMode.EQUALS },
        'status': { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
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

    toggleMenu(event, selectedDriver) {
      this.selectedDriver = selectedDriver;
      this.$refs.menu.toggle(event);
    },

    getInitials(first: string, last: string) {
      return ((first?.charAt(0) || '') + (last?.charAt(0) || '')).toUpperCase();
    },

    confirmDelete(driver: any) {
      this.driverToDelete = driver;
      this.deleteDialogVisible = true;
    },

    onImageError(event: Event, data: any) {
      data.imageLoaded = false;
      event.target.style.display = 'none';
    },

    async deleteDriver() {
      if (!this.driverToDelete) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No driver selected for deletion',
          life: 3000
        });
        return;
      }

      this.driverToDelete.deleting = true;

      try {
        await this.driverService.deleteDriver(this.driverToDelete.id);

        this.drivers = this.drivers.filter(d => d.id !== this.driverToDelete.id);

        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Driver ${this.driverToDelete.name} deleted successfully`,
          life: 3000
        });

        console.log('Driver deleted successfully:', this.driverToDelete.name);
      } catch (error) {
        console.error('Failed to delete driver:', error);

        this.$toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: error.response?.data?.message || error.message || 'Failed to delete driver. Please try again.',
          life: 5000
        });
      } finally {
        this.driverToDelete.deleting = false;
        this.deleteDialogVisible = false;
        this.driverToDelete = null;
      }
    },

    confirmDelete(driver) {
      this.$confirm.require({
        message: `Are you sure you want to delete ${driver.name}?`,
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: async () => {
          this.driverToDelete = driver;
          await this.deleteDriver();
        }
      });
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
    <Toast />
    <div class="col-12">
      <div class="card">
        <h5>Driver Management</h5>
        <DataTable
          v-model:filters="filters"
          :value="drivers"
          :paginator="true"
          class="p-datatable-gridlines"
          :rows="10"
          data-key="id"
          :row-hover="true"
          filter-display="menu"
          :loading="loading"
          responsive-layout="scroll"
          :global-filter-fields="['name', 'email', 'status']"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
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
                  placeholder="Search drivers..."
                  style="width: 100%"
                />
              </span>
            </div>
          </template>

          <template #empty>
            No drivers found.
          </template>

          <!-- <template #loading>
            Loading drivers data. Please wait.
          </template> -->

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
                <div class="avatar-wrapper">
                  <img
                    v-if="data.imageLoaded && data.picture"
                    :src="data.picture"
                    width="32"
                    height="32"
                    style="vertical-align: middle; border-radius: 50%; object-fit: cover;"
                    :alt="data.first_name"
                    @error="onImageError($event, data)"
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

          <Column
            field="dateBirth"
            sortable
            header="Date of Birth"
            style="min-width:12rem"
          >
            <template #body="{ data }">
              {{ formatDate(data.dateBirth) }}
            </template>
          </Column>

          <Column
            header="Email"
            filter-field="email"
            field="email"
            sortable
            style="min-width:12rem"
          >
            <template #body="{ data }">
              {{ data.email }}
            </template>
          </Column>

          <Column
            field="verificationProgress"
            header="Verification Progress"
            data-type="text"
            sortable
            body-class="text-center"
            style="min-width:10rem"
          >
            <template #body="{ data }">
              {{ data.verificationProgress || 'Not Started' }}
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
