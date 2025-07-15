<script lang="ts">
import VoucherService from '~~/services/VoucherService';

export default {
  data() {
    return {
      isEditing: false,
      loading: false,
      voucher: null,
      originalVoucher: null,
      voucherData: {
        name: '',
        code: '',
        type: '',
        expiryDate: '',
        amount: '',
        usedCount: 0
      },
      voucherTypes: [
        { label: 'Relative', value: 'relative' },
        { label: 'Fixed', value: 'fixed' }
      ],
      confirmationVisible: false,
      confirmationAction: null,
      confirmationMessage: '',
      validationErrors: {}
    };
  },
  voucherService: null,
  computed: {
    isValidForm() {
      return (
        this.voucherData.name.trim() !== '' &&
        this.voucherData.type !== '' &&
        this.voucherData.expiryDate !== '' &&
        this.voucherData.amount !== ''
      );
    },
    hasChanges() {
      if (!this.originalVoucher) return false;
      return (
        this.voucherData.name !== this.originalVoucher.name ||
        this.voucherData.code !== this.originalVoucher.code ||
        this.voucherData.type !== this.originalVoucher.type ||
        this.voucherData.expiryDate !== this.originalVoucher.expiryDate ||
        this.voucherData.amount !== this.originalVoucher.amount
      );
    },
    formattedExpiryDate() {
      if (!this.voucherData.expiryDate) return '';
      return new Date(this.voucherData.expiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatExpiryType() {
      return `${this.voucherData.type} ${this.voucherData.expiryDate}`;
    },
    voucherTypeLabel() {
      const type = this.voucherTypes.find(t => t.value === this.voucherData.type);
      return type ? type.label : this.voucherData.type;
    }
  },
  watch: {
    'voucherData.type': function (this: any, newType: string, oldType: string) {
      if (this.isEditing && oldType && newType !== oldType) {
        this.voucherData.expiryDate = '';
        if (this.validationErrors && Object.prototype.hasOwnProperty.call(this.validationErrors, 'expiryDate')) {
          this.validationErrors.expiryDate = '';
        }
      }
    }
  },
  mounted() {
    this.loadVoucherData();
  },
  created() {
    this.voucherService = new VoucherService();
  },
  methods: {
    async loadVoucherData() {
      this.loading = true;

      try {
        const voucherId = this.$route.params.id;

        if (!voucherId) {
          throw new Error('Voucher ID not found in route parameters');
        }

        const apiResponse = await this.voucherService.getVoucherById(voucherId);

        const response = apiResponse.data;

        if (!response) {
          throw new Error('No voucher data found');
        }

        let voucherType = 'fixed';
        let expiryDate = '';

        if (response.expiry_type && typeof response.expiry_type === 'string') {
          const parts = response.expiry_type.split(' ');
          if (parts.length >= 2) {
            voucherType = parts[0];
            expiryDate = parts[1];

            if (voucherType === 'relative' && expiryDate.endsWith('d')) {
              expiryDate = expiryDate.slice(0, -1);
            }
          }
        }
        const voucherData = {
          id: response.id,
          name: response.name,
          code: response.code,
          type: voucherType,
          expiryDate: expiryDate,
          amount: response.amount.toString(),
          usedCount: response._count?.UserVoucher || 0
        };

        this.voucher = voucherData;
        this.voucherData = { ...voucherData };
        this.originalVoucher = { ...voucherData };
      } catch (error) {
        console.error('Failed to load voucher:', error);

        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to load voucher data: ${error.message}`,
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    },

    toggleEditMode() {
      if (this.isEditing) {
        if (this.hasChanges) {
          this.showConfirmation('cancel', 'Are you sure you want to cancel editing? All unsaved changes will be lost.');
          return;
        }
        this.cancelEdit();
      } else {
        this.isEditing = true;
      }
    },

    cancelEdit() {
      this.voucherData = { ...this.originalVoucher };
      this.isEditing = false;
      this.validationErrors = {};
    },

    validateForm() {
      const errors = {};

      if (!this.voucherData.name.trim()) {
        errors.name = 'Voucher name is required';
      }

      if (!this.voucherData.type) {
        errors.type = 'Voucher type is required';
      }

      if (!this.voucherData.expiryDate) {
        errors.expiryDate = 'Expiry date is required';
      } else if (this.voucherData.type === 'fixed' && new Date(this.voucherData.expiryDate) <= new Date()) {
        errors.expiryDate = 'Expiry date must be in the future';
      } else if (this.voucherData.type === 'relative' && (isNaN(this.voucherData.expiryDate) || parseInt(this.voucherData.expiryDate) <= 0)) {
        errors.expiryDate = 'Expiry days must be a positive number';
      }

      if (!this.voucherData.amount) {
        errors.amount = 'Amount is required';
      } else if (isNaN(this.voucherData.amount) || parseFloat(this.voucherData.amount) <= 0) {
        errors.amount = 'Amount must be a valid positive number';
      }

      this.validationErrors = errors;
      return Object.keys(errors).length === 0;
    },

    formatExpiryTypeForAPI() {
      const { type, expiryDate } = this.voucherData;

      if (type === 'relative') {
        return `${type} ${expiryDate}d`;
      } else if (type === 'fixed') {
        let dateStr = expiryDate;
        if (expiryDate instanceof Date) {
          dateStr = expiryDate.toISOString().split('T')[0];
        }
        return `${type} ${dateStr}`;
      }

      return '';
    },

    saveVoucher() {
      if (!this.validateForm()) {
        this.$toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please fix the errors in the form',
          life: 3000
        });
        return;
      }

      this.showConfirmation('save', 'Are you sure you want to save these changes?');
    },

    async performSave() {
      try {
        this.loading = true;

        const updateData = {
          name: this.voucherData.name,
          code: this.voucherData.code,
          amount: parseFloat(this.voucherData.amount),
          expiry_type: this.formatExpiryTypeForAPI()
        };

        const response = await this.voucherService.updateVoucher(this.voucher.id, updateData);

        this.voucher = { ...this.voucherData };
        this.originalVoucher = { ...this.voucherData };
        this.isEditing = false;
        this.validationErrors = {};

        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Voucher updated successfully',
          life: 3000
        });
      } catch (error) {
        console.error('Error updating voucher:', error);

        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to update voucher: ${error.message}`,
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    },

    deleteVoucher() {
      this.showConfirmation('delete', 'Are you sure you want to delete this voucher? This action cannot be undone.');
    },

    async performDelete() {
      try {
        this.loading = true;
        await this.voucherService.deleteVoucher(this.voucher.id);

        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Voucher deleted successfully',
          life: 3000
        });

        this.goBack();
      } catch (error) {
        console.error('Error deleting voucher:', error);

        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete voucher. Please try again.',
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    },

    showConfirmation(action, message) {
      this.confirmationAction = action;
      this.confirmationMessage = message;
      this.confirmationVisible = true;
    },

    confirmAction() {
      switch (this.confirmationAction) {
        case 'save':
          this.performSave();
          break;
        case 'delete':
          this.performDelete();
          break;
        case 'cancel':
          this.cancelEdit();
          break;
      }
      this.confirmationVisible = false;
      this.confirmationAction = null;
      this.confirmationMessage = '';
    },

    cancelConfirmation() {
      this.confirmationVisible = false;
      this.confirmationAction = null;
      this.confirmationMessage = '';
    },

    goBack() {
      this.$router.go(-1);
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(amount);
    }
  }
};
</script>

<template>
  <div class="grid">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div>
        <i class="pi pi-spin pi-spinner" />
      </div>
    </div>

    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex justify-content-between align-items-center mb-4">
          <div class="flex align-items-center gap-3">
            <h5 class="m-0">{{ isEditing ? 'Edit Voucher' : 'Voucher Details' }}</h5>
          </div>
          <div class="flex gap-2">
            <Button
              icon="pi pi-arrow-left"
              label="Back to Voucher List"
              class="p-button-outlined"
              @click="goBack"
            />
            <Button
              v-if="!isEditing"
              icon="pi pi-pencil"
              label="Edit"
              class="p-button-warning"
              @click="toggleEditMode"
            />
            <Button
              v-if="isEditing"
              icon="pi pi-times"
              label="Cancel"
              class="p-button-outlined"
              @click="toggleEditMode"
            />
            <Button
              v-if="isEditing"
              icon="pi pi-check"
              label="Save Changes"
              class="p-button-success"
              :disabled="!hasChanges || !isValidForm"
              @click="saveVoucher"
            />
            <Button
              v-if="!isEditing"
              icon="pi pi-trash"
              label="Delete"
              class="p-button-danger"
              @click="deleteVoucher"
            />
          </div>
        </div>

        <!-- Voucher Information -->
        <div class="grid">
          <!-- Left Column -->
          <div class="col-12 lg:col-8">
            <div class="card">
              <h6 class="text-primary mb-4">
                <i class="pi pi-info-circle mr-2" />
                Voucher Information
              </h6>

              <div class="grid">
                <!-- Voucher Name -->
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold" :class="{ 'required': isEditing }">
                      Voucher Name
                    </label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-tag" />
                      </span>
                      <InputText
                        v-if="isEditing"
                        v-model="voucherData.name"
                        placeholder="Enter voucher name"
                      />
                      <InputText
                        v-else
                        :value="voucherData.name"
                        readonly
                      />
                    </div>
                    <small v-if="validationErrors.name" class="p-error">
                      {{ validationErrors.name }}
                    </small>
                  </div>
                </div>

                <!-- Voucher Code -->
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">
                      Voucher Code
                    </label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-qrcode" />
                      </span>
                      <InputText
                        v-if="isEditing"
                        v-model="voucherData.code"
                        placeholder="Enter voucher code"
                      />
                      <InputText
                        v-else
                        :value="voucherData.code"
                        readonly
                        style="text-transform: uppercase; font-family: monospace; font-weight: bold;"
                      />
                    </div>
                    <small v-if="validationErrors.code" class="p-error">
                      {{ validationErrors.code }}
                    </small>
                  </div>
                </div>

                <!-- Voucher Type -->
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold" :class="{ 'required': isEditing }">
                      Voucher Type
                    </label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-file" />
                      </span>
                      <Dropdown
                        v-if="isEditing"
                        v-model="voucherData.type"
                        :options="voucherTypes"
                        option-label="label"
                        option-value="value"
                        placeholder="Select voucher type"
                      />
                      <InputText
                        v-else
                        :value="voucherTypeLabel"
                        readonly
                      />
                    </div>
                    <small v-if="validationErrors.type" class="p-error">
                      {{ validationErrors.type }}
                    </small>
                  </div>
                </div>

                <!-- Amount -->
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold" :class="{ 'required': isEditing }">
                      Amount
                      <small class="text-muted">
                        (₦)
                      </small>
                    </label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-calculator" />
                      </span>
                      <InputNumber
                        v-if="isEditing"
                        v-model="voucherData.amount"
                        placeholder="Enter amount"
                        :min="0"
                      />
                      <InputText
                        v-else
                        :value="'₦ ' + voucherData.amount"
                        readonly
                      />
                    </div>
                    <small v-if="validationErrors.amount" class="p-error">
                      {{ validationErrors.amount }}
                    </small>
                  </div>
                </div>

                <!-- Expiry Date -->
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold" :class="{ 'required': isEditing }">
                      Expiry Date
                      <span v-if="voucherData.type === 'relative'" class="text-muted">
                        (days)
                      </span>
                    </label>
                    <div v-if="voucherData.type === 'fixed'" class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-calendar" />
                      </span>
                      <Calendar
                        v-if="isEditing"
                        v-model="voucherData.expiryDate"
                        placeholder="Select expiry date"
                        :min-date="new Date()"
                        date-format="yy-mm-dd"
                      />
                      <InputText
                        v-else
                        :value="formattedExpiryDate"
                        readonly
                      />
                    </div>
                    <div v-if="voucherData.type === 'relative'" class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-calendar" />
                      </span>
                      <InputNumber
                        v-if="isEditing"
                        v-model="voucherData.expiryDate"
                        placeholder="Enter Expiry Days"
                        :min="1"
                      />
                      <InputText
                        v-else
                        :value="voucherData.expiryDate + ' days'"
                        readonly
                      />
                    </div>
                    <small v-if="validationErrors.expiryDate" class="p-error">
                      {{ validationErrors.expiryDate }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Summary -->
          <div class="col-12 lg:col-4">
            <div class="card">
              <h6 class="text-primary mb-4">
                <i class="pi pi-chart-line mr-2" />
                Voucher Summary
              </h6>

              <div class="voucher-summary">
                <div class="summary-item">
                  <div class="summary-label">Code</div>
                  <div class="summary-value code-display">
                    {{ voucherData.code }}
                  </div>
                </div>

                <div class="summary-item">
                  <div class="summary-label">Type</div>
                  <div class="summary-value">
                    <i class="pi pi-file mr-2 " />
                    {{ voucherTypeLabel }}
                  </div>
                </div>

                <div class="summary-item">
                  <div class="summary-label">Value</div>
                  <div class="summary-value value-display">
                    {{ formatCurrency(voucherData.amount) }}
                  </div>
                </div>

                <div class="summary-item">
                  <div class="summary-label">Expires</div>
                  <div class="summary-value">
                    <span v-if="voucherData.type === 'fixed'">
                      {{ formattedExpiryDate }}
                    </span>
                    <span v-else-if="voucherData.type === 'relative'">
                      {{ voucherData.expiryDate }} days
                    </span>
                  </div>
                </div>

                <div class="summary-item">
                  <div class="summary-label">Used Count</div>
                  <div class="summary-value">
                    {{ voucherData.usedCount }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <Dialog
      v-model:visible="confirmationVisible"
      :modal="true"
      :draggable="false"
      header="Confirmation"
      :style="{ width: '25rem' }"
    >
      <div class="flex align-items-center">
        <i
          :class="[
            confirmationAction === 'save' ? 'pi pi-check-circle text-green-600' : confirmationAction === 'delete' ? 'pi pi-exclamation-triangle text-red-600' : 'pi pi-question-circle text-orange-600'
          ]"
          class="mr-3"
          style="font-size: 2rem;"
        />
        <span>{{ confirmationMessage }}</span>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelConfirmation"
        />
        <Button
          :label="confirmationAction === 'save' ? 'Save' : confirmationAction === 'delete' ? 'Delete' : 'Confirm'"
          :icon="confirmationAction === 'save' ? 'pi pi-check' : confirmationAction === 'delete' ? 'pi pi-trash' : 'pi pi-check'"
          :class="confirmationAction === 'save' ? 'p-button-success' : confirmationAction === 'delete' ? 'p-button-danger' : 'p-button-warning'"
          @click="confirmAction"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped lang="scss">
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 600;
}

.required::after {
  content: ' *';
  color: #e24c4c;
}

.card {
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.text-primary {
  color: var(--primary-color) !important;
}

.text-red-600 {
  color: #dc2626 !important;
}

.text-green-600 {
  color: #16a34a !important;
}

.text-muted {
  color: #6c757d;
  font-size: 0.875rem;
}

.p-inputgroup .p-inputgroup-addon {
  background: var(--surface-100);
  color: var(--text-color-secondary);
  border-color: var(--surface-300);
}

.p-button-success {
  background: var(--green-500);
  border-color: var(--green-500);
}

.p-button-warning {
  background: var(--orange-500);
  border-color: var(--orange-500);
}

.p-button-danger {
  background: #d32f2f;
  border-color: #c62828;
}

h5, h6 {
  margin: 0;
  font-weight: 600;
}

h5 {
  font-size: 1.25rem;
}

h6 {
  font-size: 1.125rem;
}

// Voucher Summary Styles
.voucher-summary {
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--surface-200);

    &:last-child {
      border-bottom: none;
    }
  }

  .summary-label {
    font-weight: 600;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
  }

  .summary-value {
    font-weight: 500;
    color: var(--text-color);
    text-align: right;

    &.code-display {
      font-family: monospace;
      font-weight: bold;
      background: var(--surface-100);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    &.value-display {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--primary-color);
    }
  }
}

// Form Validation Styles
.p-invalid {
  border-color: #e24c4c !important;
}

.p-error {
  color: #e24c4c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

// Badge Styles
.p-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

// Responsive Design
@media (max-width: 768px) {
  .flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;

    .flex.gap-2 {
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}
</style>
