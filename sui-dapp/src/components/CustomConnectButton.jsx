import { useDisconnectWallet } from '@mysten/dapp-kit'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wallet, LogOut, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { ConnectButton } from '@mysten/dapp-kit'

const CustomConnectButton = ({ className = '' }) => {
  const { mutate: disconnect } = useDisconnectWallet()
  const { address, userProfile } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLogout = () => {
    disconnect()
  }

  // If not connected, show connect button
  if (!address) {
    return <ConnectButton className={className} />
  }

  // Connected - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Wallet className="h-4 w-4 mr-2" />
          {userProfile?.username ||
            `${address.slice(0, 6)}...${address.slice(-4)}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {userProfile?.username || 'Account'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Connection Type */}
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          🔐 Wallet Connected
        </div>

        {/* Address */}
        <DropdownMenuItem onClick={copyAddress} className="font-mono text-xs">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              {address.slice(0, 8)}...{address.slice(-8)}
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CustomConnectButton
