<script lang="ts">
import VoucherService from '~~/services/VoucherService';

export default {
  data() {
    return {
      voucher: {
        name: '',
        code: '',
        voucherType: '',
        expiryDate: null,
        expiryDays: null,
        amount: null
      },
      voucherTypes: [
        { label: 'Fixed', value: 'fixed' },
        { label: 'Relative', value: 'relative' }
      ],
      loading: false,
      voucherService: null
    };
  },
  created() {
    this.voucherService = new VoucherService();
  },
  methods: {
    formatExpiryType() {
      if (this.voucher.voucherType === 'fixed' && this.voucher.expiryDate) {
        const date = new Date(this.voucher.expiryDate);
        const formattedDate = date.toISOString().split('T')[0];
        return `fixed ${formattedDate}`;
      } else if (this.voucher.voucherType === 'relative' && this.voucher.expiryDays) {
        return `relative ${this.voucher.expiryDays}d`;
      }
      return '';
    },
    onVoucherTypeChange() {
      this.voucher.expiryDate = null;
      this.voucher.expiryDays = null;
    },

    async saveVoucher() {
      try {
        this.loading = true;

        if (!this.voucher.name || !this.voucher.voucherType || !this.voucher.amount) {
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Please fill in all required fields',
            life: 3000
          });
          return;
        }

        if (this.voucher.voucherType === 'fixed' && !this.voucher.expiryDate) {
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Please select expiry date for fixed voucher',
            life: 3000
          });
          return;
        }

        if (this.voucher.voucherType === 'relative' && !this.voucher.expiryDays) {
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Please enter expiry days for relative voucher',
            life: 3000
          });
          return;
        }

        const voucherData = {
          name: this.voucher.name,
          code: this.voucher.code || null,
          expiry_type: this.formatExpiryType(),
          amount: this.voucher.amount
        };

        const response = await this.voucherService.addVoucher(voucherData);

        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Voucher created successfully',
          life: 3000
        });

        this.$router.push('/voucher');
      } catch (error) {
        console.error('Error creating voucher:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create voucher. Please try again.',
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },

    cancelCreate() {
      this.$router.push('/voucher');
    }
  }
};
</script>

<template>
  <div class="grid">
    <Toast />
    <div class="col-12">
      <div class="card">
        <h5>Create New Voucher</h5>

        <form @submit.prevent="saveVoucher">
          <div class="grid">
            <!-- Voucher Name -->
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="name" class="font-semibold">Voucher Name <span style="color:red">*</span></label>
                <div class="p-inputgroup">
                  <span class="p-inputgroup-addon">
                    <i class="pi pi-tag" />
                  </span>
                  <InputText
                    id="name"
                    v-model="voucher.name"
                    placeholder="Enter voucher name"
                    class="w-full"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Voucher Code (Optional) -->
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="code" class="font-semibold">Voucher Code <span class="text-gray-500">(Optional)</span></label>
                <div class="p-inputgroup">
                  <span class="p-inputgroup-addon">
                    <i class="pi pi-qrcode" />
                  </span>
                  <InputText
                    id="code"
                    v-model="voucher.code"
                    placeholder="Enter voucher code"
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Voucher Type -->
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="voucherType" class="font-semibold">Voucher Type <span style="color:red">*</span></label>
                <div class="p-inputgroup">
                  <span class="p-inputgroup-addon">
                    <i class="pi pi-file" />
                  </span>
                  <Dropdown
                    id="voucherType"
                    v-model="voucher.voucherType"
                    :options="voucherTypes"
                    option-label="label"
                    option-value="value"
                    placeholder="Select voucher type"
                    class="w-full"
                    required
                    @change="onVoucherTypeChange"
                  />
                </div>
              </div>
            </div>

            <!-- Amount -->
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="amount" class="font-semibold">Amount <span style="color:red">*</span></label>
                <div class="p-inputgroup">
                  <span class="p-inputgroup-addon">
                    <i class="pi pi-calculator" />
                  </span>
                  <InputNumber
                    id="amount"
                    v-model="voucher.amount"
                    placeholder="Enter amount"
                    class="w-full"
                    :min="0"
                    :fraction-digits="2"
                    prefix="₦ "
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Expiry Date (for Fixed type) -->
            <div v-if="voucher.voucherType === 'fixed'" class="col-12 md:col-6">
              <div class="field">
                <label for="expiryDate" class="font-semibold">Expiry Date <span style="color:red">*</span></label>
                <div class="p-inputgroup">
                  <span class="p-inputgroup-addon">
                    <i class="pi pi-calendar" />
                  </span>
                  <Calendar
                    id="expiryDate"
                    v-model="voucher.expiryDate"
                    placeholder="Select expiry date"
                    class="w-full"
                    date-format="dd/mm/yy"
                    :min-date="new Date()"
                    show-icon
                    :required="voucher.voucherType === 'fixed'"
                  />
                </div>
              </div>
            </div>

            <!-- Expiry Days (for Relative type) -->
            <div v-if="voucher.voucherType === 'relative'" class="col-12 md:col-6">
              <div class="field">
                <label for="expiryDays" class="font-semibold">Expiry Days <span style="color:red">*</span></label>
                <div class="p-inputgroup">
                  <span class="p-inputgroup-addon">
                    <i class="pi pi-calendar" />
                  </span>
                  <InputText
                    id="expiryDays"
                    v-model="voucher.expiryDays"
                    placeholder="Enter number of days"
                    class="w-full"
                    :min="1"
                    :max="365"
                    suffix=" days"
                    :required="voucher.voucherType === 'relative'"
                  />
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="col-12">
              <div class="flex gap-2 justify-content-end mt-4">
                <Button
                  label="Cancel"
                  icon="pi pi-times"
                  class="p-button-outlined"
                  @click="cancelCreate"
                  type="button"
                />
                <Button
                  label="Save Voucher"
                  icon="pi pi-check"
                  class="p-button"
                  type="submit"
                  :loading="loading"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
}

.text-gray-500 {
  color: #6b7280;
}
</style>
