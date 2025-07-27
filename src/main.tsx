import { createRoot } from 'react-dom/client'
import './Styling/index.css'
import App from './Pages/App.tsx'
import { WagmiProvider } from 'wagmi'
import { config } from '../config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider } from "connectkit";

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <ConnectKitProvider>
        <App />
      </ConnectKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
)
