
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileHeader from '../components/MobileHeader';
import MobileContainer from '../components/MobileContainer';
import { 
  Settings, 
  CreditCard, 
  Mail, 
  Database, 
  Download, 
  Upload,
  Save,
  RefreshCw,
  AlertTriangle,
  Check,
  Bell,
  Globe,
  Shield
} from 'lucide-react';

interface SystemSettings {
  appName: string;
  appVersion: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUsersPerOrder: number;
  sessionTimeout: number;
}

interface PaymentSettings {
  grabPayEnabled: boolean;
  touchNGoEnabled: boolean;
  bankTransferEnabled: boolean;
  pointsConversionRate: number;
  minimumOrderAmount: number;
  serviceFeePercentage: number;
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  orderConfirmationTemplate: string;
  welcomeEmailTemplate: string;
  resetPasswordTemplate: string;
}

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'app' | 'payment' | 'email' | 'backup'>('app');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    appName: 'EarnEats',
    appVersion: '1.0.0',
    maintenanceMode: false,
    allowRegistration: true,
    maxUsersPerOrder: 5,
    sessionTimeout: 30
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    grabPayEnabled: true,
    touchNGoEnabled: true,
    bankTransferEnabled: true,
    pointsConversionRate: 1.0,
    minimumOrderAmount: 10.0,
    serviceFeePercentage: 2.5
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smsEnabled: false,
    pushNotificationsEnabled: true,
    orderConfirmationTemplate: `Dear {{userName}},

Your order {{orderId}} has been confirmed!

Total: RM {{amount}}
Items: {{items}}

Thank you for choosing EarnEats!`,
    welcomeEmailTemplate: `Welcome to EarnEats, {{userName}}!

We're excited to have you join our community. Start earning points by completing surveys and enjoy delicious food!

Get started: Complete your first survey to earn 50 points!`,
    resetPasswordTemplate: `Hi {{userName}},

You requested a password reset for your EarnEats account.

If you didn't request this, please ignore this email.

Reset your password: {{resetLink}}`
  });

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemSettings,
          payment: paymentSettings,
          notifications: notificationSettings
        })
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    }
  };

  const handleBackupDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/backup-database');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `earneats-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: 'welcome' })
      });
      
      if (response.ok) {
        alert('Test email sent successfully!');
      } else {
        alert('Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Error sending test email');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon, active }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
        active 
          ? 'border-blue-500 text-blue-600 bg-blue-50' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="System Settings" 
          onBack={() => setLocation('/admin/dashboard')}
        />

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="flex overflow-x-auto">
            <TabButton id="app" label="App Config" icon={Settings} active={activeTab === 'app'} />
            <TabButton id="payment" label="Payment" icon={CreditCard} active={activeTab === 'payment'} />
            <TabButton id="email" label="Templates" icon={Mail} active={activeTab === 'email'} />
            <TabButton id="backup" label="Backup" icon={Database} active={activeTab === 'backup'} />
          </div>
        </div>

        <div className="p-4">
          {/* App Configuration Tab */}
          {activeTab === 'app' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">App Name</label>
                    <input
                      type="text"
                      value={systemSettings.appName}
                      onChange={(e) => setSystemSettings({...systemSettings, appName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">App Version</label>
                    <input
                      type="text"
                      value={systemSettings.appVersion}
                      onChange={(e) => setSystemSettings({...systemSettings, appVersion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                      <p className="text-xs text-gray-500">Temporarily disable app access</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({...systemSettings, maintenanceMode: !systemSettings.maintenanceMode})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Allow Registration</span>
                      <p className="text-xs text-gray-500">Enable new user signups</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({...systemSettings, allowRegistration: !systemSettings.allowRegistration})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.allowRegistration ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Configuration Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">GrabPay</span>
                      <p className="text-xs text-gray-500">Enable GrabPay payments</p>
                    </div>
                    <button
                      onClick={() => setPaymentSettings({...paymentSettings, grabPayEnabled: !paymentSettings.grabPayEnabled})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        paymentSettings.grabPayEnabled ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          paymentSettings.grabPayEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Touch 'n Go</span>
                      <p className="text-xs text-gray-500">Enable Touch 'n Go payments</p>
                    </div>
                    <button
                      onClick={() => setPaymentSettings({...paymentSettings, touchNGoEnabled: !paymentSettings.touchNGoEnabled})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        paymentSettings.touchNGoEnabled ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          paymentSettings.touchNGoEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
                      <p className="text-xs text-gray-500">Enable FPX bank transfers</p>
                    </div>
                    <button
                      onClick={() => setPaymentSettings({...paymentSettings, bankTransferEnabled: !paymentSettings.bankTransferEnabled})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        paymentSettings.bankTransferEnabled ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          paymentSettings.bankTransferEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Points to RM Rate</label>
                    <input
                      type="number"
                      step="0.1"
                      value={paymentSettings.pointsConversionRate}
                      onChange={(e) => setPaymentSettings({...paymentSettings, pointsConversionRate: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Amount (RM)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={paymentSettings.minimumOrderAmount}
                      onChange={(e) => setPaymentSettings({...paymentSettings, minimumOrderAmount: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={paymentSettings.serviceFeePercentage}
                      onChange={(e) => setPaymentSettings({...paymentSettings, serviceFeePercentage: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Email & Notification Templates</h3>
                  <button
                    onClick={handleTestEmail}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Test Email'}
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-sm">Email</span>
                      <button
                        onClick={() => setNotificationSettings({...notificationSettings, emailEnabled: !notificationSettings.emailEnabled})}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          notificationSettings.emailEnabled ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            notificationSettings.emailEnabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-gray-500" />
                      <span className="text-sm">Push</span>
                      <button
                        onClick={() => setNotificationSettings({...notificationSettings, pushNotificationsEnabled: !notificationSettings.pushNotificationsEnabled})}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          notificationSettings.pushNotificationsEnabled ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            notificationSettings.pushNotificationsEnabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Email Template</label>
                    <textarea
                      value={notificationSettings.welcomeEmailTemplate}
                      onChange={(e) => setNotificationSettings({...notificationSettings, welcomeEmailTemplate: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Variables: {{userName}}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Confirmation Template</label>
                    <textarea
                      value={notificationSettings.orderConfirmationTemplate}
                      onChange={(e) => setNotificationSettings({...notificationSettings, orderConfirmationTemplate: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Variables: {{userName}}, {{orderId}}, {{amount}}, {{items}}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Reset Template</label>
                    <textarea
                      value={notificationSettings.resetPasswordTemplate}
                      onChange={(e) => setNotificationSettings({...notificationSettings, resetPasswordTemplate: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Variables: {{userName}}, {{resetLink}}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup & Maintenance Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Maintenance</h3>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Database Backup</h4>
                    <p className="text-sm text-gray-600 mb-4">Create a complete backup of all application data</p>
                    <button
                      onClick={handleBackupDatabase}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
                      {loading ? 'Creating Backup...' : 'Download Backup'}
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">System Maintenance</h4>
                    <p className="text-sm text-gray-600 mb-4">Perform system maintenance tasks</p>
                    <div className="space-y-2">
                      <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Clear Cache
                      </button>
                      <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Optimize Database
                      </button>
                      <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Clear Logs
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Database Connection</span>
                        <span className="flex items-center gap-1 text-green-600">
                          <Check size={14} />
                          <span className="text-sm">Healthy</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Storage Usage</span>
                        <span className="text-sm text-gray-900">78% (2.3GB / 3GB)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Memory Usage</span>
                        <span className="text-sm text-gray-900">52% (512MB / 1GB)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 mt-6">
            <button
              onClick={handleSaveSettings}
              disabled={saveStatus === 'saving'}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                saveStatus === 'success' 
                  ? 'bg-green-600 text-white' 
                  : saveStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {saveStatus === 'saving' && <RefreshCw className="animate-spin" size={16} />}
              {saveStatus === 'success' && <Check size={16} />}
              {saveStatus === 'error' && <AlertTriangle size={16} />}
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'success' ? 'Saved!' : 
               saveStatus === 'error' ? 'Error - Try Again' : 
               'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
