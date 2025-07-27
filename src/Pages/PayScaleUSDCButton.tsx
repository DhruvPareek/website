import { useAccount, useChainId, useSwitchChain, useWriteContract, useConfig } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseUnits } from 'viem'
import { useState } from 'react'

const ARBITRUM_CHAIN_ID = 42161
type Address = `0x${string}`
const MICROPAY_CONTRACT: Address = '0xA27CBB50Abea821E2845F9ed6cA977a438cD99Bb'
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
    inputs: [{ name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPaidAmount',
    inputs: [{ name: 'payer', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

// Export for use in other components
export { ARBITRUM_CHAIN_ID, MICROPAY_CONTRACT, micropayAbi }

interface PayUSDCButtonProps {
  refetchPaymentStatus?: () => Promise<any>
}

export function PayUSDCButton({ refetchPaymentStatus }: PayUSDCButtonProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const config = useConfig()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
        args: [amount],
        chainId: ARBITRUM_CHAIN_ID,
      })

      setSuccess(true)
      if (refetchPaymentStatus) {
        // Wait a bit for blockchain state to update, then refetch
        setTimeout(async () => {
          console.log('Refetching payment status...')
          await refetchPaymentStatus()
          console.log('Payment status refetched')
        }, 2000) // 2 second delay
      }
    } catch (err) {
      console.error('Payment failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
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
  )
}
