import { http, createConfig } from 'wagmi'
import { arbitrum } from 'wagmi/chains'
// import { Network, Alchemy } from "alchemy-sdk";

export const config = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http('https://arb-mainnet.g.alchemy.com/v2/eGXWdnta6-Q6uwlBIdQMY'),
    
  },  
})
