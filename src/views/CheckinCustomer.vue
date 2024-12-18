<template>
  <div
    v-show="isNumberEnterStep"
    class="flex flex-col items-center justify-center h-screen bg-pink-100 p-4 md:p-8 no-double-tap-zoom"
  >
    <div class="top-0 left-0 m-4 w-full">
      <Button
        class="text-white"
        icon="pi pi-home"
        rounded
        aria-label="Filter"
        variant="outlined"
        @click="backHome"
      />
    </div>
    <header class="text-4xl font-bold text-gray-700 mb-6 text-center">
      <span>NAILS MATE</span>
      <span class="mx-2">|</span>
      <span>LYLY NAILS</span>
    </header>

    <div class="flex flex-col md:flex-row items-center w-full gap-8">
      <!-- Points Badge -->
      <div class="flex justify-center w-6/12">
        <div
          class="bg-gray-800 text-white p-6 md:p-8 rounded-lg flex flex-col items-center shadow-lg transform transition duration-200 hover:-translate-y-1 w-full md:w-2/3 md:h-64"
        >
          <h1 class="font-bold points">{{ points }}</h1>
          <p class="text-lg md:text-xl mt-2 opacity-80">Punkte</p>
          <p class="text-sm md:text-lg mt-1 opacity-80">
            Entsprechen {{ (points / 40).toFixed(2) }}€
          </p>
        </div>
      </div>

      <!-- Number Pad -->
      <div class="flex flex-col items-center w-full md:w-1/2">
        <div class="flex">
          <h2 class="text-5xl font-bold text-gray-800 mb-4">{{ enteredValue }}</h2>
          <div></div>
        </div>
        <div class="grid content-center grid-cols-3 gap-4">
          <Button
            v-for="num in numbers"
            :key="num"
            @click="addToEnteredValue(num)"
            rounded
            raised
            class="custom-button shadow-md border-2 text-3xl font-semibold transition duration-150"
            :style="num === 0 ? 'grid-column: 2 / span 1;' : ''"
          >
            {{ num }}
          </Button>
          <Button
            @click="deleteLast"
            rounded
            raised
            class="custom-icon-button no-border text-4xl transition duration-150"
            style="grid-column: 1 / span 1; grid-row: 4"
          >
            <i class="pi pi-delete-left thin-icon" style="font-size: 4rem; color: black"></i>
          </Button>
          <Button
            @click="nextAction"
            rounded
            raised
            class="custom-icon-button no-border text-4xl transition duration-150"
            style="grid-column: 3 / span 1; grid-row: 4"
          >
            <i class="pi pi-arrow-circle-right thin-icon" style="font-size: 4rem; color: black"></i>
          </Button>
        </div>
      </div>
    </div>
    <!-- Footer with Checkbox -->
    <div class="mt-6 text-sm text-gray-600 text-center max-w-xs">
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          v-model="acceptedTerms"
          class="form-checkbox h-5 w-5 text-pink-500 border-gray-300 rounded transition duration-150 focus:ring-pink-400"
        />
        <span
          >Mit dem Check-in erklären Sie sich mit unserer Datenschutzrichtlinie und den
          Geschäftsbedingungen des Geschäfts einverstanden.</span
        >
      </label>
    </div>
  </div>
  <div v-show="!isNumberEnterStep" class="background-container">
    <CardBox
      bgColor="bg-pink-100"
      class="cursor-pointer md:w-3/5 lg:w-5/12 md:h-h-2/5 lg:h-3/5 shadow-2xl md:mx-auto"
      is-hoverable
    >
      <header
        class="text-2xl font-bold tracking-wider text-gray-900 mb-12 flex justify-center items-center space-x-4"
      >
        <span class="text-xl uppercase tracking-widest">Nails Mate</span>
        <span class="text-xl font-light text-gray-500">|</span>
        <span class="text-xl uppercase tracking-widest">LyLy Nails</span>
      </header>

      <div class="space-y-8 mb-8">
        <FloatLabel variant="in">
          <InputText fluid id="Fon_label" class="font-arial text-sm" v-model="account.fullName" />
          <label for="Fon_label" class="font-arial text-sm">Full Name</label>
        </FloatLabel>
        <FloatLabel variant="in">
          <InputText
            fluid
            borderless
            id="on_label"
            class="font-arial text-sm"
            v-model="account.email"
          />
          <label for="on_label" class="font-arial text-sm">Email</label>
        </FloatLabel>
        <div class="flex flex-row justify-center space-x-4">
          <Button label="Zurück" class="w-32" @click="() => (isNumberEnterStep = true)" />
          <Button label=" Einchecken" @click="checkInAction" class="bg-slate-400 w-32" />
        </div>
      </div>

      <!-- Footer Text -->
      <template #footer>
        <span class="mt-12 text-sm text-gray-500">© 2024 Nails Mate | LyLy Nails</span>
      </template>
    </CardBox>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { Button, FloatLabel, InputText } from 'primevue'
  import CardBox from '@/components/CardBox.vue'
  import { geUserByPhone } from '@/api/userApi'
  import { ErrorCode } from '@/helpers/constants'
  import { useToastMessage } from '@/composables/useToast'
  import Account from '@/types/Account'
  import { createOrder } from '@/api/orderApi'
  import { useMasterDataStore } from '@/stores/masterData'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const { confirmCreateCheckInCustomer, showCommonErrorMessage } = useToastMessage()
  const points = ref(400)
  const enteredValue = ref('')
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
  const acceptedTerms = ref(true)
  const isNumberEnterStep = ref(true)
  const account = ref(new Account({}))
  const isNewAccount = ref(false)
  const masterData = useMasterDataStore()

  const addToEnteredValue = (num) => {
    if (enteredValue.value.length < 15) {
      enteredValue.value += num
    }
  }

  const deleteLast = () => {
    enteredValue.value = enteredValue.value.slice(0, -1)
  }

  const nextAction = async () => {
    if (acceptedTerms.value) {
      await geUserByPhone(enteredValue.value)
        .then((res) => {
          if (res.data) {
            account.value = new Account(res.data)
            isNumberEnterStep.value = false
          }
        })
        .catch((err) => {
          if (err.status === 404 && err.response.data.errorCode == ErrorCode.NotFound) {
            confirmCreateCheckInCustomer(
              () => {
                account.value = new Account({ phone: enteredValue.value })
                isNewAccount.value = true
                isNumberEnterStep.value = false
              },
              () => {}
            )
          } else {
            showCommonErrorMessage('Error', 'Retry again')
          }
        })
    } else {
      showCommonErrorMessage('Error', 'Please accept the terms')
    }
  }

  const backHome = () => {
    router.push('/')
  }

  const checkInAction = async () => {
    var orderData = {}
    if (isNewAccount.value) {
      orderData = {
        isNewAccount: true,
        account: {
          fullName: account.value.fullName,
          email: account.value.email,
          phone: account.value.phone,
          role: 'Guest',
          createdBy: masterData.userInfo.id
        },
        createdBy: masterData.userInfo.id,
        description: ''
      }
    } else {
      orderData = {
        isNewAccount: false,
        ownerId: account.value.id,
        account: {
          fullName: account.value.fullName,
          email: account.value.email,
          phone: account.value.phone,
          role: 'Guest',
          createdBy: masterData.userInfo.id
        },
        createdBy: masterData.userInfo.id,
        description: ''
      }
    }
    await createOrder(orderData)
      .then((response) => {
        router.push({ name: 'CheckinSucess' })
      })
      .catch((error) => {
        showErrorCommonMessage('Error', 'Retry again')
      })
  }
</script>

<style scoped>
  .no-double-tap-zoom {
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-text-size-adjust: none;
  }

  .points {
    font-size: calc(2vw + 2rem);
  }

  .custom-button {
    background-color: transparent !important;
    width: 5rem !important;
    /* 16 * 0.25rem */
    height: 5rem !important;
    /* 16 * 0.25rem */
    color: #102c57 !important;
    border-color: #102c57 !important;
    font-size: 1.5rem !important;
    /* 2 * 0.75rem */
  }

  .custom-icon-button {
    background-color: transparent !important;
    width: 5rem !important;
    /* 16 * 0.25rem */
    height: 5rem !important;
    /* 16 * 0.25rem */
    border-width: 0;
    box-shadow: none;
  }

  .custom-button:active {
    background-color: #ec48ad !important;
    /* pink-400 */
    border-color: #ec48ad !important;
    /* pink-400 */
  }

  .thin-icon {
    font-size: 2rem !important;
    font-weight: 300 !important;
    /* Adjust the weight to make it thinner */
  }

  .background-container {
    width: 100vw;
    height: 100vh;
    background-image: url('@/assets/bgL-lyly-store.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }
</style>