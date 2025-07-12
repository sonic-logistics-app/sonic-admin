<script lang="ts">
import DriverService from '~~/services/DriverService';

export default {
  data() {
    return {
      activeTab: 'personal',
      driver: null,
      loading: false,
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        status: ''
      },
      vehicleDocuments: {
        vehicleType: '',
        vehiclePhoto: '',
        status: '',

        brandName: '',
        modelName: '',
        modelYear: '',
        vehicleColor: '',
        vehiclePlate: '',

        numberOfSeats: '',
        registrationCertificate: '',

        nin: '',
        nameOnNin: '',
        bvnNumber: ''
      },
      vehicleTypes: [
        { label: 'Car', value: 'car' },
        { label: 'Bike', value: 'bike' },
        { label: 'Public Transport', value: 'public_transport' },
        { label: 'Truck', value: 'truck' }
      ],
      driverDocuments: {
        nationalIdentificationNumber: '',
        bankVerificationNumber: '',
        driverLicense: '',
        status: ''
      },
      idConfirmation: {
        photoWithID: '',
        status: ''
      },
      bankDetails: {
        accountName: '',
        accountNumber: '',
        bank: '',
        accountType: '',
        status: ''
      },
      confirmationVisible: false,
      confirmationAction: null,
      confirmationSection: null,
      confirmationMessage: ''
    };
  },
  computed: {
    verificationProgress() {
      const sections = [
        this.personalInfo,
        this.vehicleDocuments,
        this.driverDocuments,
        this.idConfirmation,
        this.bankDetails,
      ];
      const verifiedCount = sections.filter(
        (section) => section.status === 'verified'
      ).length;
      return Math.round((verifiedCount / sections.length) * 100);
    },
    tabItems() {
      return [
        {
          key: 'personal',
          title: 'Personal Information',
          icon: 'pi pi-user',
          status: this.personalInfo.status
        },
        {
          key: 'vehicle',
          title: 'Vehicle Details',
          icon: 'pi pi-car',
          status: this.vehicleDocuments.status
        },
        {
          key: 'driver',
          title: 'Driver Documents',
          icon: 'pi pi-id-card',
          status: this.driverDocuments.status
        },
        {
          key: 'id',
          title: 'ID Confirmation',
          icon: 'pi pi-bookmark',
          status: this.idConfirmation.status
        },
        {
          key: 'bank',
          title: 'Bank Details',
          icon: 'pi pi-building',
          status: this.bankDetails.status
        },
      ];
    }
  },
  driverService: null,
  created() {
    this.driverService = new DriverService();
  },
  mounted() {
    const driverId = this.$route.params.id;
    if (driverId) {
      if (isNaN(parseInt(driverId))) {
        this.$toast.add({
          severity: 'error',
          summary: 'Invalid Driver ID',
          detail: 'The driver ID must be a valid number.',
          life: 5000
        });
        this.goBack();
        return;
      }

      this.loading = true;

      this.driverService.getDriverById(driverId)
        .then((response) => {
          const driver = response.data || response.driver || response;

          if (!driver) {
            throw new Error('Driver data not found in response');
          }

          this.driver = driver;

          this.personalInfo = {
            firstName: driver.first_name || this.personalInfo.firstName,
            lastName: driver.last_name || this.personalInfo.lastName,
            dateOfBirth: driver.birth_date ? new Date(driver.birth_date).toISOString().split('T')[0] : this.personalInfo.dateOfBirth,
            email: driver.email || this.personalInfo.email,
            status: driver.verificationStatus?.personal_info?.toLowerCase() || 'pending'
          };

          const vehicleData = driver.driver_vehicle && driver.driver_vehicle[0] ? driver.driver_vehicle[0] : {};
          this.vehicleDocuments = {
            ...this.vehicleDocuments,
            vehicleType: vehicleData.vehicle_type?.toLowerCase() || this.vehicleDocuments.vehicleType,
            vehiclePhoto: vehicleData.model_image_url || this.vehicleDocuments.vehiclePhoto,
            brandName: vehicleData.brand_name || this.vehicleDocuments.brandName,
            modelName: vehicleData.model_name || this.vehicleDocuments.modelName,
            modelYear: vehicleData.model_year || this.vehicleDocuments.modelYear,
            vehicleColor: vehicleData.model_color || this.vehicleDocuments.vehicleColor,
            vehiclePlate: vehicleData.model_plate_number || this.vehicleDocuments.vehiclePlate,
            numberOfSeats: vehicleData.model_seat_capacity?.toString() || this.vehicleDocuments.numberOfSeats,
            registrationCertificate: vehicleData.model_certificate_url || this.vehicleDocuments.registrationCertificate,
            nin: vehicleData.national_identification_number || this.vehicleDocuments.nin,
            nameOnNin: vehicleData.nin_name || this.vehicleDocuments.nameOnNin,
            bvnNumber: vehicleData.bvn_number || this.vehicleDocuments.bvnNumber,
            status: driver.verificationStatus?.vehicle?.toLowerCase() || 'pending'
          };

          const documentsData = driver.driver_documents && driver.driver_documents[0] ? driver.driver_documents[0] : {};
          this.driverDocuments = {
            nationalIdentificationNumber: documentsData.national_id_url || this.driverDocuments.nationalIdentificationNumber,
            bankVerificationNumber: documentsData.bank_verification || this.driverDocuments.bankVerificationNumber,
            driverLicense: documentsData.driver_license_url || this.driverDocuments.driverLicense,
            status: driver.verificationStatus?.document?.toLowerCase() || 'pending'
          };

          const idConfirmationData = driver.driver_id_confirmation && driver.driver_id_confirmation[0] ? driver.driver_id_confirmation[0] : {};
          this.idConfirmation = {
            photoWithID: idConfirmationData.image_url || this.idConfirmation.photoWithID,
            status: driver.verificationStatus?.id_confirmation?.toLowerCase() || 'pending'
          };

          const bankData = driver.bank_account && driver.bank_account[0] ? driver.bank_account[0] : {};
          this.bankDetails = {
            accountName: bankData.account_holder_name || this.bankDetails.accountName,
            accountNumber: bankData.account_number || this.bankDetails.accountNumber,
            bank: bankData.bank_name || this.bankDetails.bank,
            accountType: bankData.account_type || this.bankDetails.accountType,
            status: driver.verificationStatus?.bank_account?.toLowerCase() || 'pending'
          };
        })
        .catch((error) => {
          console.error('Error fetching driver details:', error);

          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load driver details. Please try again.',
            life: 5000
          });
        })
        .finally(() => {
          this.loading = false;
        });
    } else {
      console.error('No driver ID found in URL');
      this.$toast.add({
        severity: 'error',
        summary: 'Missing Driver ID',
        detail: 'Driver ID is required to view details.',
        life: 5000
      });
      this.goBack();
    }
  },
  methods: {
    verifySection(sectionType: string, action: string) {
      const sectionMapping = {
        'personal': 'personal_info',
        'vehicle': 'vehicle', 
        'driver': 'document',
        'id': 'id_confirmation',
        'bank': 'bank_account'
      };

      const actionData = {};
      const apiField = sectionMapping[sectionType];

      if (apiField) {
        actionData[apiField] = true;
      }

      const driverId = this.$route.params.id;

      let apiCall;
      if (action === 'verified') {
        apiCall = this.driverService.verifyDriver(driverId, actionData);
      } else if (action === 'rejected') {
        apiCall = this.driverService.rejectDriver(driverId, actionData);
      }

      this.loading = true;

      apiCall
        .then(response => {
          console.log(`${action === 'verified' ? 'Verification' : 'Rejection'} response:`, response);

          let section;
          switch (sectionType) {
            case 'personal':
              section = this.personalInfo;
              break;
            case 'vehicle':
              section = this.vehicleDocuments;
              break;
            case 'driver':
              section = this.driverDocuments;
              break;
            case 'id':
              section = this.idConfirmation;
              break;
            case 'bank':
              section = this.bankDetails;
              break;
          }

          if (section) {
            section.status = action;
          }

          let severity = 'success';
          let summary = '';
          let detail = '';

          if (action === 'verified') {
            severity = 'success';
            summary = 'Section Verified';
            detail = `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} section has been verified successfully`;
          } else if (action === 'rejected') {
            severity = 'warn';
            summary = 'Section Rejected';
            detail = `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} section has been rejected`;
          }

          this.$toast.add({
            severity,
            summary,
            detail,
            life: 3000
          });
        })
        .catch(error => {
          console.error(`Error ${action === 'verified' ? 'verifying' : 'rejecting'} driver section:`, error);

          this.$toast.add({
            severity: 'error',
            summary: `${action === 'verified' ? 'Verification' : 'Rejection'} Failed`,
            detail: `Failed to ${action === 'verified' ? 'verify' : 'reject'} ${sectionType} section. Please try again.`,
            life: 5000
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    goBack() {
      this.$router.go(-1);
    },

    setActiveTab(tabKey: string) {
      this.activeTab = tabKey;
    },

    getStatusClass(status: string) {
      switch (status) {
        case 'verified':
          return 'text-green-600';
        case 'rejected':
          return 'text-red-600';
        case 'pending':
          return 'text-orange-600';
        default:
          return 'text-gray-600';
      }
    },

    getStatusIcon(status: string) {
      switch (status) {
        case 'verified':
          return 'pi pi-check-circle';
        case 'rejected':
          return 'pi pi-times-circle';
        case 'pending':
          return 'pi pi-clock';
        default:
          return 'pi pi-question-circle';
      }
    },

    showConfirmation(sectionType, action) {
      this.confirmationSection = sectionType;
      this.confirmationAction = action;

      const sectionName = sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
      const actionText = action === 'verified' ? 'verify' : 'reject';

      this.confirmationMessage = `Are you sure you want to ${actionText} the ${sectionName} section?`;
      this.confirmationVisible = true;
    },

    confirmAction() {
      if (this.confirmationSection && this.confirmationAction) {
        this.verifySection(this.confirmationSection, this.confirmationAction);
      }
      this.confirmationVisible = false;
      this.confirmationAction = null;
      this.confirmationSection = null;
      this.confirmationMessage = '';
    },

    cancelConfirmation() {
      this.confirmationVisible = false;
      this.confirmationAction = null;
      this.confirmationSection = null;
      this.confirmationMessage = '';
    }
  },
};
</script>

<template>
  <div class="grid">
    <div v-if="loading" class="loading-overlay">
      <div>
        <i class="pi pi-spin pi-spinner" />
      </div>
    </div>
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <h5>Driver Details</h5>
          <Button
            icon="pi pi-arrow-left"
            label="Back to Driver List"
            class="p-button-outlined"
            @click="goBack"
          />
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation mb-4">
          <div class="tab-header">
            <button
              v-for="tab in tabItems"
              :key="tab.key"
              :class="['tab-button', { active: activeTab === tab.key }]"
              @click="setActiveTab(tab.key)"
            >
              <i :class="tab.icon" />
              <span>{{ tab.title }}</span>
              <i
                :class="[getStatusIcon(tab.status), getStatusClass(tab.status)]"
                class="status-icon"
              />
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Personal Information Tab -->
          <div v-if="activeTab === 'personal'" class="tab-pane">
            <div class="card">
              <div class="flex justify-content-between align-items-center mb-3">
                <h6 class="text-primary">Personal Information</h6>
                <div class="flex gap-2">
                  <Button
                    v-if="personalInfo.status !== 'verified' && personalInfo.status !== 'rejected'"
                    icon="pi pi-check"
                    label="Verify"
                    class="p-button-success"
                    :loading="loading"
                    :disabled="loading"
                    @click="showConfirmation('personal', 'verified')"
                  />
                  <Button
                    v-if="personalInfo.status !== 'rejected' && personalInfo.status !== 'verified'"
                    icon="pi pi-times"
                    label="Reject"
                    class="p-button-danger"
                    :loading="loading"
                    :disabled="loading"
                    @click="showConfirmation('personal', 'rejected')"
                  />
                  <div
                    v-if="personalInfo.status === 'verified'"
                    class="flex align-items-center text-green-600"
                  >
                    <i class="pi pi-check-circle mr-2" />
                    <span class="font-semibold">Verified</span>
                  </div>
                  <div
                    v-if="personalInfo.status === 'rejected'"
                    class="flex align-items-center"
                    style="color: red"
                  >
                    <i class="pi pi-times-circle mr-2" />
                    <span class="font-semibold">Rejected</span>
                  </div>
                </div>
              </div>
              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">First Name</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-user" />
                      </span>
                      <InputText v-model="personalInfo.firstName" readonly />
                    </div>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">Last Name</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-user" />
                      </span>
                      <InputText v-model="personalInfo.lastName" readonly />
                    </div>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">Date of Birth</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-calendar" />
                      </span>
                      <InputText v-model="personalInfo.dateOfBirth" readonly />
                    </div>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">Email</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-envelope" />
                      </span>
                      <InputText v-model="personalInfo.email" readonly />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vehicle Documents Tab -->
          <div v-if="activeTab === 'vehicle'" class="tab-pane">
            <div class="flex justify-content-between align-items-center mb-3">
              <h6 class="text-primary">Vehicle Information</h6>
              <div class="flex gap-2">
                <Button
                  v-if="
                    vehicleDocuments.status !== 'verified' && vehicleDocuments.status !== 'rejected'
                  "
                  icon="pi pi-check"
                  label="Verify"
                  class="p-button-success"
                  @click="showConfirmation('vehicle', 'verified')"
                />
                <Button
                  v-if="
                    vehicleDocuments.status !== 'rejected' && vehicleDocuments.status !== 'verified'
                  "
                  icon="pi pi-times"
                  label="Reject"
                  class="p-button-danger"
                  @click="showConfirmation('vehicle', 'rejected')"
                />
                <div
                  v-if="vehicleDocuments.status === 'verified'"
                  class="flex align-items-center text-green-600"
                >
                  <i class="pi pi-check-circle mr-2" />
                  <span class="font-semibold">Verified</span>
                </div>
                <div
                  v-if="vehicleDocuments.status === 'rejected'"
                  class="flex align-items-center text-red-600"
                >
                  <i class="pi pi-times-circle mr-2" />
                  <span class="font-semibold">Rejected</span>
                </div>
              </div>
            </div>

            <!-- Section 1: Vehicle Details -->
            <div class="card mb-4">
              <div class="card-header">
                <h6 class="text-primary mb-3">
                  <i class="pi pi-info-circle mr-2"></i>
                  Vehicle Details
                </h6>
              </div>
              <div class="grid">
                <!-- Vehicle Type -->
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">Vehicle Type</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-car" />
                      </span>
                      <InputText
                        v-model="vehicleDocuments.vehicleType"
                        class="uppercase"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <!-- Brand Name - For Car, Bike, Truck -->
                <div
                  v-if="
                    ['car', 'bike', 'truck'].includes(vehicleDocuments.vehicleType)
                  "
                  class="col-12 md:col-6"
                >
                  <div class="field">
                    <label class="font-semibold">Brand Name</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-bookmark" />
                      </span>
                      <InputText v-model="vehicleDocuments.brandName" readonly />
                    </div>
                  </div>
                </div>

                <!-- Model Name - For Car, Bike, Truck -->
                <div
                  v-if="
                    ['car', 'bike', 'truck'].includes(vehicleDocuments.vehicleType)
                  "
                  class="col-12 md:col-6"
                >
                  <div class="field">
                    <label class="font-semibold">Model Name</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-bookmark-fill" />
                      </span>
                      <InputText v-model="vehicleDocuments.modelName" readonly />
                    </div>
                  </div>
                </div>

                <!-- Model Year - For Car, Bike, Truck -->
                <div
                  v-if="
                    ['car', 'bike', 'truck'].includes(vehicleDocuments.vehicleType)
                  "
                  class="col-12 md:col-6"
                >
                  <div class="field">
                    <label class="font-semibold">Model Year</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-calendar" />
                      </span>
                      <InputText v-model="vehicleDocuments.modelYear" readonly />
                    </div>
                  </div>
                </div>

                <!-- Vehicle Color - For Car, Bike, Truck -->
                <div
                  v-if="
                    ['car', 'bike', 'truck'].includes(vehicleDocuments.vehicleType)
                  "
                  class="col-12 md:col-6"
                >
                  <div class="field">
                    <label class="font-semibold">Vehicle Color</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-palette" />
                      </span>
                      <InputText v-model="vehicleDocuments.vehicleColor" readonly />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Vehicle Number Plate -->
            <div class="card mb-4" v-if="['car', 'bike'].includes(vehicleDocuments.vehicleType)">
              <div class="card-header">
                <h6 class="text-primary mb-3">
                  <i class="pi pi-tag mr-2"></i>
                  Vehicle Number Plate
                </h6>
              </div>
              <div class="grid">
                <!-- Vehicle Type (repeated for context) -->
                <div class="col-12 md:col-4">
                  <div class="field">
                    <label class="font-semibold">Vehicle Type</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-car" />
                      </span>
                      <InputText
                        v-model="vehicleDocuments.vehicleType"
                        class="uppercase"
                        readonly
                      />
                    </div>
                  </div>
                </div>

                <!-- Vehicle Plate -->
                <div class="col-12 md:col-4">
                  <div class="field">
                    <label class="font-semibold">Vehicle Plate No</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-tag" />
                      </span>
                      <InputText v-model="vehicleDocuments.vehiclePlate" readonly />
                    </div>
                  </div>
                </div>

                <!-- Number of Seats - For Car only -->
                <div
                  v-if="vehicleDocuments.vehicleType === 'car'"
                  class="col-12 md:col-4"
                >
                  <div class="field">
                    <label class="font-semibold">Number of Seats</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-users" />
                      </span>
                      <InputText v-model="vehicleDocuments.numberOfSeats" readonly />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Vehicle Photo -->
            <div class="card mb-4" v-if="vehicleDocuments.vehiclePhoto">
              <div class="card-header">
                <h6 class="text-primary mb-3">
                  <i class="pi pi-camera mr-2"></i>
                  Vehicle Photo
                </h6>
              </div>
              <div class="border-2 border-dashed surface-border p-4 text-center border-round">
                <img
                  :src="vehicleDocuments.vehiclePhoto"
                  alt="Vehicle Photo"
                  class="max-w-full max-h-16rem mx-auto border-round shadow-2"
                />
              </div>
            </div>

            <!-- Section 4: Vehicle Registration Certificate -->
            <div class="card mb-4" v-if="['car', 'bike'].includes(vehicleDocuments.vehicleType)">
              <div class="card-header">
                <h6 class="text-primary mb-3">
                  <i class="pi pi-file-text mr-2"></i>
                  Vehicle Registration Certificate
                </h6>
              </div>
              <div class="border-2 border-dashed surface-border p-4 text-center border-round">
                <img 
                  :src="vehicleDocuments.registrationCertificate" 
                  alt="Vehicle Registration Certificate"
                  class="max-w-full max-h-16rem mx-auto border-round shadow-2"
                />
              </div>
            </div>

            <!-- Section for Public Transport (NIN, Name, BVN) -->
            <div class="card mb-4" v-if="vehicleDocuments.vehicleType === 'public_transport'">
              <div class="card-header">
                <h6 class="text-primary mb-3">
                  <i class="pi pi-id-card mr-2"></i>
                  Public Transport Information
                </h6>
              </div>
              <div class="grid">
                <!-- National Identity Number -->
                <div class="col-12 md:col-4">
                  <div class="field">
                    <label class="font-semibold">National Identity Number (NIN)</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-id-card" />
                      </span>
                      <InputText v-model="vehicleDocuments.nin" readonly />
                    </div>
                  </div>
                </div>

                <!-- Name on NIN -->
                <div class="col-12 md:col-4">
                  <div class="field">
                    <label class="font-semibold">Name on NIN</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-user" />
                      </span>
                      <InputText v-model="vehicleDocuments.nameOnNin" readonly />
                    </div>
                  </div>
                </div>

                <!-- BVN Number -->
                <div class="col-12 md:col-4">
                  <div class="field">
                    <label class="font-semibold">BVN Number</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-credit-card" />
                      </span>
                      <InputText v-model="vehicleDocuments.bvnNumber" readonly />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Driver Documents Tab -->
          <div v-if="activeTab === 'driver'" class="tab-pane">
            <div class="card">
              <div class="flex justify-content-between align-items-center mb-3">
                <h6 class="text-primary">Driver Documents</h6>
                <div class="flex gap-2">
                  <Button
                    v-if="driverDocuments.status !== 'verified' && driverDocuments.status !== 'rejected'"
                    icon="pi pi-check"
                    label="Verify"
                    class="p-button-success"
                    @click="showConfirmation('driver', 'verified')"
                  />
                  <Button
                    v-if="driverDocuments.status !== 'rejected' && driverDocuments.status !== 'verified'"
                    icon="pi pi-times"
                    label="Reject"
                    class="p-button-danger"
                    @click="showConfirmation('driver', 'rejected')"
                  />
                  <div
                    v-if="driverDocuments.status === 'verified'"
                    class="flex align-items-center text-green-600"
                  >
                    <i class="pi pi-check-circle mr-2" />
                    <span class="font-semibold">Verified</span>
                  </div>
                  <div
                    v-if="driverDocuments.status === 'rejected'"
                    class="flex align-items-center text-red-600"
                  >
                    <i class="pi pi-times-circle mr-2" />
                    <span class="font-semibold">Rejected</span>
                  </div>
                </div>
              </div>
              <div class="grid">
                <div v-if="driverDocuments.driverLicense" class="col-12 md:col-6 mb-4">
                  <label class="font-semibold block mb-2">Driver License </label>
                  <div class="border-2 border-dashed surface-border p-4 text-center border-round">
                    <img 
                      :src="driverDocuments.driverLicense" 
                      alt="Driver License "
                      class="max-w-full max-h-16rem mx-auto border-round shadow-2"
                    />
                  </div>
                </div>

                <!-- National ID  Preview -->
                <div v-if="driverDocuments.nationalIdentificationNumber" class="col-12 md:col-6 mb-4">
                  <label class="font-semibold block mb-2">National Identification Number (NIN)</label>
                  <div class="border-2 border-dashed surface-border p-4 text-center border-round">
                    <img 
                      :src="driverDocuments.nationalIdentificationNumber"
                      alt="National Identification Number"
                      class="max-w-full max-h-16rem mx-auto border-round shadow-2"
                    />
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">Bank Verification Number</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-star" />
                      </span>
                      <InputText
                        v-model="driverDocuments.bankVerificationNumber"
                        readonly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ID Confirmation Tab -->
          <div v-if="activeTab === 'id'" class="tab-pane">
            <div class="card">
              <div class="flex justify-content-between align-items-center mb-3">
                <h6 class="text-primary">ID Confirmation</h6>
                <div class="flex gap-2">
                  <Button
                    v-if="idConfirmation.status !== 'verified' && idConfirmation.status !== 'rejected'"
                    icon="pi pi-check"
                    label="Verify"
                    class="p-button-success"
                    @click="showConfirmation('id', 'verified')"
                  />
                  <Button
                    v-if="idConfirmation.status !== 'rejected' && idConfirmation.status !== 'verified'"
                    icon="pi pi-times"
                    label="Reject"
                    class="p-button-danger"
                    @click="showConfirmation('id', 'rejected')"
                  />
                  <div
                    v-if="idConfirmation.status === 'verified'"
                    class="flex align-items-center text-green-600"
                  >
                    <i class="pi pi-check-circle mr-2" />
                    <span class="font-semibold">Verified</span>
                  </div>
                  <div
                    v-if="idConfirmation.status === 'rejected'"
                    class="flex align-items-center text-red-600"
                  >
                    <i class="pi pi-times-circle mr-2" />
                    <span class="font-semibold">Rejected</span>
                  </div>
                </div>
              </div>
              <div class="grid">
                <div v-if="idConfirmation.photoWithID" class="col-12 md:col-6 mb-4">
                  <label class="font-semibold block mb-2">National Identification Number (NIN)</label>
                  <div class="border-2 border-dashed surface-border p-4 text-center border-round">
                    <img 
                      :src="idConfirmation.photoWithID"
                      alt="National Identification Number"
                      class="max-w-full max-h-16rem mx-auto border-round shadow-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bank Details Tab -->
          <div v-if="activeTab === 'bank'" class="tab-pane">
            <div class="card">
              <div class="flex justify-content-between align-items-center mb-3">
                <h6 class="text-primary">Bank Details</h6>
                <div class="flex gap-2">
                  <Button
                    v-if="bankDetails.status !== 'verified' && bankDetails.status !== 'rejected'"
                    icon="pi pi-check"
                    label="Verify"
                    class="p-button-success"
                    @click="showConfirmation('bank', 'verified')"
                  />
                  <Button
                    v-if="bankDetails.status !== 'rejected' && bankDetails.status !== 'verified'"
                    icon="pi pi-times"
                    label="Reject"
                    class="p-button-danger"
                    @click="showConfirmation('bank', 'rejected')"
                  />
                  <div
                    v-if="bankDetails.status === 'verified'"
                    class="flex align-items-center text-green-600"
                  >
                    <i class="pi pi-check-circle mr-2" />
                    <span class="font-semibold">Verified</span>
                  </div>
                  <div
                    v-if="bankDetails.status === 'rejected'"
                    class="flex align-items-center text-red-600"
                  >
                    <i class="pi pi-times-circle mr-2" />
                    <span class="font-semibold">Rejected</span>
                  </div>
                </div>
              </div>
              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">Account Name</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-building" />
                      </span>
                      <InputText v-model="bankDetails.accountName" readonly />
                    </div>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">Account Number</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-hashtag" />
                      </span>
                      <InputText v-model="bankDetails.accountNumber" readonly />
                    </div>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">Bank Name</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-user" />
                      </span>
                      <InputText
                        v-model="bankDetails.bank"
                        readonly
                      />
                    </div>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field">
                    <label class="font-semibold">Account Type</label>
                    <div class="p-inputgroup">
                      <span class="p-inputgroup-addon">
                        <i class="pi pi-credit-card" />
                      </span>
                      <InputText v-model="bankDetails.accountType" readonly />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Status -->
        <div class="card mt-4">
          <div class="flex justify-content-between align-items-center">
            <h6 class="text-primary">Overall Verification Status</h6>
            <div class="flex align-items-center">
              <span class="mr-2">{{ verificationProgress }}% Complete</span>
              <ProgressBar :value="verificationProgress" style="width: 200px" />
            </div>
          </div>
        </div>
      </div>
    </div>
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
            confirmationAction === 'verified' ? 'pi pi-check-circle' : 'pi pi-times-circle',
            confirmationAction === 'verified' ? 'text-green-600' : 'text-red-600'
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
          :label="confirmationAction === 'verified' ? 'Verify' : 'Reject'"
          :icon="confirmationAction === 'verified' ? 'pi pi-check' : 'pi pi-times'"
          :class="confirmationAction === 'verified' ? 'p-button-success' : 'p-button-danger'"
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

.opacity-50 {
  opacity: 0.5;
  pointer-events: none;
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

.p-progressbar {
  height: 1rem;
  background: var(--surface-300);
  border-radius: 6px;
  overflow: hidden;
}

.p-progressbar .p-progressbar-value {
  background: var(--primary-color);
  transition: width 0.3s ease;
}

h6 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

// Tab Navigation Styles
.tab-navigation {
  .tab-header {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    border-bottom: 2px solid var(--surface-200);
    padding-bottom: 0.5rem;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-color);
    font-weight: 500;
    position: relative;

    &:hover {
      background: var(--surface-100);
      border-color: var(--primary-color);
    }

    &.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      opacity: 0.90;
    }

    .status-icon {
      font-size: 0.875rem;
      margin-left: 0.25rem;
    }

    span {
      font-size: 0.875rem;
    }

    i:first-child {
      font-size: 1rem;
    }
  }
}

// Tab Content Styles
.tab-content {
  .tab-pane {
    animation: fadeIn 0.3s ease-in-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .tab-navigation {
    .tab-header {
      flex-direction: column;
      gap: 0.25rem;
    }

    .tab-button {
      width: 100%;
      justify-content: flex-start;
      border-radius: 6px;
      margin-bottom: 0.25rem;
    }
  }
}

// Status Colors
.text-green-600 {
  color: #16a34a !important;
}

.text-red-600 {
  color: #dc2626 !important;
}

.text-orange-600 {
  color: #ea580c !important;
}

.text-gray-600 {
  color: #6b7280 !important;
}
</style>
