<script>
import { useAzureStorageTemporaryUrlByFileName } from '@/composables/AzureStorage'
import { mapGetters, mapState } from 'vuex'
import SBreadcrumb from '@/components/SBreadcrumb'
import SHamburger from '@/components/SHamburger'
import SExceptionLog from '@/components/SExceptionLog'
import SFullScreen from '@/components/SFullScreen'
import SizeSelect from '@/components/SizeSelect'
import LangSelect from '@/components/LangSelect'
import Search from '@/components/HeaderSearch'
import RightPanel from '@/components/RightPanel'
import Settings from '@/layout/components/Settings'
import SNotificationCenter from '@/components/SNotificationCenter'

export default {
  components: {
    SBreadcrumb,
    SHamburger,
    SExceptionLog,
    SFullScreen,
    SizeSelect,
    LangSelect,
    Search,
    RightPanel,
    Settings,
    SNotificationCenter,
  },
  data() {
    return {
      isLoadingSystemDate: false,
      avatarTemporaryUrl: '',
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'device']),
    ...mapState({
      showSettings: state => state.settings.showSettings,
      systemDate: state => state.settings.systemDate,
    }),
    avatarUrl() {
      return this.$store.state.user.user.avatarUrl
    },
  },
  watch: {
    avatarUrl: {
      async handler(value) {
        this.avatarTemporaryUrl = await useAzureStorageTemporaryUrlByFileName(value)
      },
      immediate: true,
    },
  },
  methods: {
    async getSystemDate() {
      this.isLoadingSystemDate = true
      try {
        setTimeout(async (_) => {
          await this.$store.dispatch('settings/getSystemDate')
          this.$message({
            type: 'success',
            message: this.$t('Đã cập nhật ngày hệ thống'),
            showClose: true,
          })
          this.isLoadingSystemDate = false
        }, 400)
      }
      catch (e) {
        this.isLoadingSystemDate = false
        this.$message({
          type: 'error',
          message: this.$t('Lỗi: Không thể cập nhật ngày hệ thống'),
          showClose: true,
        })
      }
    },
    handleClickOutside() {
      this.$store.dispatch('closeSideBar', { withoutAnimation: false })
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      useIDSLogout()
    },
    avatarErrorHandler() {
      return true
    },
  },
}
</script>

<template>
  <div class="navbar">
    <SHamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <SBreadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    <div class="right-menu">
      <div
        class="d-flex align-items-center w-abs-190 system-date pointer"
        :title="$t('Ngày hệ thống')"
        @click="getSystemDate"
      >
        <i v-if="isLoadingSystemDate" class="el-icon-loading mr-2" />
        <div>{{ systemDate | dayOnly }}</div>
        <div class="custom-divider-system-date" />
        <div>{{ systemDate | monthOnly }}</div>
        <div class="custom-divider-system-date" />
        <div class="mr-4">
          {{ systemDate | yearOnly }}
        </div>
      </div>
      <template v-if="device !== 'mobile'" />
      <div class="right-menu-item">
        <el-dropdown class="avatar-container" trigger="click">
          <span class="el-dropdown-link">
            <s-avatar
              :size="24"
              :src="avatarTemporaryUrl"
              @error="avatarErrorHandler"
            >
              <img src="@/assets/default-avatar.svg">
            </s-avatar>
            <template v-if="device !== 'mobile'">
              <span class="ml-2">{{ $store.state.user.name }}</span>
              <i class="el-icon-arrow-down el-icon--right" />
            </template>
          </span>
          <el-dropdown-menu slot="dropdown" class="w-abs-min-160">
            <router-link to="/users/profile">
              <el-dropdown-item>{{ $t('Thông tin tài khoản') }}</el-dropdown-item>
            </router-link>
            <router-link to="/users/change-password">
              <el-dropdown-item>{{ $t('Đổi mật khẩu') }}</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided @click.native="logout">
              <span>{{ $t('Đăng xuất') }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
