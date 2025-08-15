import { useAccount, useChainId, useSwitchChain, useWriteContract, useConfig, useReadContract } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseUnits } from 'viem'
import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'

const ARBITRUM_CHAIN_ID = 42161
type Address = `0x${string}`
const MICROPAY_CONTRACT: Address = '0xf38B566e8dE174e1500d38083bB07033185EE651'
const USDC_ADDRESS: Address = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

// ERC-20 ABI for allowance and approve
const erc20Abi = [
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

// Micropayment contract ABI
const micropayAbi = [
  {
    type: 'function',
    name: 'pay',
    inputs: [{ name: 'amount', type: 'uint256'}, { name: 'webpageId', type: 'uint256'}, { name: 'webpageOwner', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPaidAmount',
    inputs: [{ name: 'webpageOwner', type: 'address' }, { name: 'webpageId', type: 'uint256'}, { name: 'payer', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

// Export for use in other components
export { ARBITRUM_CHAIN_ID, MICROPAY_CONTRACT, micropayAbi }

// interface PayUSDCButtonProps {
//   refetchPaymentStatus?: () => Promise<any>
// }

export function PayUSDCButton({ children, webpageId, webpageOwner }: { children: React.ReactNode, webpageId: number, webpageOwner: string }) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const config = useConfig()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { data: paidAmount } = useReadContract({
    address: MICROPAY_CONTRACT,
    abi: micropayAbi,
    functionName: 'getPaidAmount',
    args: [webpageOwner, webpageId, address!],
    chainId: ARBITRUM_CHAIN_ID,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  })

  const hasAccess = address && paidAmount && typeof paidAmount === 'bigint' && paidAmount >= 100000n

  const handlePay = async () => {
    if (!address) return
    setSuccess(false)
    if (chainId !== ARBITRUM_CHAIN_ID) {
      await switchChainAsync({ chainId: ARBITRUM_CHAIN_ID })
    }

    const amount = parseUnits('0.10', 6)
    setLoading(true)

    try {
      // Check current allowance via direct readContract action
      const allowance = await readContract(config, {
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, MICROPAY_CONTRACT],
        chainId: ARBITRUM_CHAIN_ID,
      }) as bigint

      // If allowance insufficient, submit approve
      if (allowance < amount) {
        await writeContractAsync({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [MICROPAY_CONTRACT, amount],
          chainId: ARBITRUM_CHAIN_ID,
        })
      }

      // Pay the micropayment contract
      await writeContractAsync({
        address: MICROPAY_CONTRACT,
        abi: micropayAbi,
        functionName: 'pay',
        args: [amount, webpageId, webpageOwner],
        chainId: ARBITRUM_CHAIN_ID,
      })

      setSuccess(true)
    } catch (err) {
      console.error('Payment failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {hasAccess ? children : (
        <>
          <div style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
            <div className="connectkit-button" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p>In order to continue, please pay 10 cents USDC (or more if you want to).</p>
              <ConnectKitButton />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
            <button
              disabled={!isConnected || loading}
              onClick={handlePay}
              className="pay-button"
            >
              {loading ? 'Processing...' : 'Pay 10¢'}
            </button>
            {success && <p>Payment successful!</p>}
          </div>
        </>
      )}
    </>
  )
}
