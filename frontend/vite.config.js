import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'auth/login.html'),
        register: resolve(__dirname, 'auth/register.html'),
        userDashboard: resolve(__dirname, 'user/dashboard.html'),
        userMyReports: resolve(__dirname, 'user/my-reports.html'),
        userReportLost: resolve(__dirname, 'user/report-lost.html'),
        userReportFound: resolve(__dirname, 'user/report-found.html'),
        userMatches: resolve(__dirname, 'user/matches.html'),
        userChatbot: resolve(__dirname, 'user/chatbot.html'),
        adminDashboard: resolve(__dirname, 'admin/dashboard.html'),
        adminReports: resolve(__dirname, 'admin/reports.html'),
        adminInventory: resolve(__dirname, 'admin/inventory.html'),
        adminUsers: resolve(__dirname, 'admin/users.html'),
        adminBroadcast: resolve(__dirname, 'admin/broadcast.html'),
        adminInbox: resolve(__dirname, 'admin/inbox.html')
      }
    }
  }
});
