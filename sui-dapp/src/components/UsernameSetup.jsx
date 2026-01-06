import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { isUsernameTaken } from '@/lib/userProfile'
import {
  registerUsername,
  isUsernameAvailableOnChain,
} from '@/lib/suiTransactions'
import { CONTRACTS } from '@/config/contracts'

const UsernameSetup = ({ address, onComplete, onCancel }) => {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTaken, setIsTaken] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const client = useSuiClient()

  const checkUsername = async value => {
    if (value.length < 3) {
      setIsTaken(false)
      return
    }

    setIsChecking(true)

    // Check localStorage first
    const localTaken = isUsernameTaken(value)

    // Check on-chain if contracts deployed
    let onChainTaken = false
    if (CONTRACTS.PACKAGE_ID !== 'TO_BE_DEPLOYED') {
      try {
        const available = await isUsernameAvailableOnChain(client, value)
        onChainTaken = !available
      } catch (error) {
        console.error('On-chain check failed:', error)
      }
    }

    setIsTaken(localTaken || onChainTaken)
    setIsChecking(false)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters!')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, _ and -')
      return
    }

    if (isTaken) {
      toast.error('Username is already taken!')
      return
    }

    setIsSubmitting(true)

    try {
      if (CONTRACTS.PACKAGE_ID === 'TO_BE_DEPLOYED') {
        // Mock mode: Save to localStorage only
        const userData = {
          username,
          address,
          createdAt: new Date().toISOString(),
          authMethod: 'wallet',
        }

        localStorage.setItem(`user_${address}`, JSON.stringify(userData))
        toast.success(`Welcome, ${username}!`)
        onComplete(userData)
      } else {
        // On-chain mode with Enoki sponsorship
        toast.info('🚀 Creating your profile...', {
          description: 'Transaction is being sponsored by Enoki',
        })

        const result = await registerUsername(signAndExecute, username)

        const userData = {
          username,
          address,
          createdAt: new Date().toISOString(),
          txDigest: result.digest,
          authMethod: 'wallet',
        }

        // Also save locally for quick access
        localStorage.setItem(`user_${address}`, JSON.stringify(userData))

        toast.success(`Welcome, ${username}! ✨`, {
          description: `Profile NFT minted on Sui blockchain`,
        })

        onComplete(userData)
      }
    } catch (error) {
      console.error('Username registration error:', error)

      // Parse error message
      const errorMsg = error.message || error.toString()

      // Check for specific errors
      if (errorMsg.includes('MoveAbort') && errorMsg.includes('1')) {
        toast.error('Username already taken!', {
          description:
            'This username is registered on-chain. Please try another.',
          duration: 5000,
        })
      } else if (
        errorMsg.includes('gas') ||
        errorMsg.includes('insufficient')
      ) {
        toast.error('Need testnet SUI to register', {
          description: 'Click the faucet button below to get free testnet SUI',
          duration: 8000,
          action: {
            label: 'Open Faucet',
            onClick: () =>
              window.open(
                `https://faucet.sui.io/?address=${address}`,
                '_blank'
              ),
          },
        })
      } else if (errorMsg.includes('User rejected')) {
        toast.info('Transaction cancelled', {
          description: 'You cancelled the transaction',
        })
      } else {
        toast.error('Registration failed', {
          description: errorMsg.slice(0, 100) || 'Please try again',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold font-sans">
                {t('components.usernameSetup.welcome')}
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                {t('components.usernameSetup.chooseUsername')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-mono">
                  {t('components.usernameSetup.username')}
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder={t(
                      'components.usernameSetup.usernamePlaceholder'
                    )}
                    value={username}
                    onChange={e => {
                      const value = e.target.value.toLowerCase()
                      setUsername(value)
                      checkUsername(value)
                    }}
                    disabled={isSubmitting}
                    className="pr-10 font-mono"
                    autoFocus
                  />
                  {username.length >= 3 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isChecking ? (
                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                      ) : isTaken ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {t('components.usernameSetup.usernameRules')}
                </p>
                {isTaken && (
                  <p className="text-xs text-red-500 font-mono">
                    {t('components.usernameSetup.usernameTaken')}
                  </p>
                )}
              </div>

              <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                <div className="flex items-start gap-2 text-xs text-muted-foreground font-mono">
                  <div className="mt-0.5">💡</div>
                  <div>
                    <p className="font-semibold mb-1">
                      {t('components.usernameSetup.sponsoredByEnoki')}
                    </p>
                    <p>{t('components.usernameSetup.sponsoredDesc')}</p>
                    {CONTRACTS.PACKAGE_ID !== 'TO_BE_DEPLOYED' && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-xs text-blue-400 hover:text-blue-300"
                        onClick={() =>
                          window.open(
                            `https://faucet.sui.io/?address=${address}`,
                            '_blank'
                          )
                        }
                      >
                        {t('components.usernameSetup.getTestnet')}{' '}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || username.length < 3 || isTaken}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('components.usernameSetup.registering')}
                    </>
                  ) : (
                    t('components.usernameSetup.registerUsername')
                  )}
                </Button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-xs text-muted-foreground font-mono">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UsernameSetup
