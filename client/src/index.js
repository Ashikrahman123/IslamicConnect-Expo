// No need to import React and ReactDOM as they are available globally
// Import local modules
const { QueryClient, QueryClientProvider } = ReactQuery;
const App = require('./App').default;
// Import styles - this will be handled by Babel
// import './styles/globals.css';
const { AuthProvider } = require('./hooks/use-auth');

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// For React 18+
if (ReactDOM.createRoot) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  // Fallback for older versions
  ReactDOM.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

// Initialize Feather icons after render
if (typeof feather !== 'undefined') {
  feather.replace();
}
