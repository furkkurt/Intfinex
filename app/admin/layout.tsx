import FirestoreInterceptor from './components/FirestoreInterceptor'
import NetworkDebugger from './components/NetworkDebugger'
import FirestoreMonkeyPatch from './components/FirestoreMonkeyPatch'
import AdminErrorBoundary from './components/AdminErrorBoundary'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div>
      <FirestoreInterceptor />
      <FirestoreMonkeyPatch />
      {process.env.NODE_ENV === 'development' && <NetworkDebugger />}
      <AdminErrorBoundary fallback={
        <div className="p-6 bg-red-50 border border-red-300 rounded-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">
            There was an error in the admin panel. Please try refreshing the page or contact support.
          </p>
          <a href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Go to Admin Home
          </a>
        </div>
      }>
        {children}
      </AdminErrorBoundary>
    </div>
  )
} 