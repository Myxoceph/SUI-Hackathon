import { createContext, useContext, useState, useEffect } from 'react'
import {
  useCurrentAccount,
  useSuiClient,
  useDisconnectWallet,
} from '@mysten/dapp-kit'
import { getUserProfile } from '@/lib/userProfile'
import { getUserProjects } from '@/lib/suiTransactions'
import { CONTRACTS } from '@/config/contracts'
import { TIME, STORAGE_KEYS } from '@/config/constants'
import { logError } from '@/lib/errors'

const WalletContext = createContext(null)

export const WalletProvider = ({ children }) => {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const { mutate: disconnect } = useDisconnectWallet()
  const [balance, setBalance] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [showUsernameSetup, setShowUsernameSetup] = useState(false)

  const activeAddress = account?.address

  useEffect(() => {
    if (activeAddress) {
      checkUserProfile()
      fetchWalletData()
    } else {
      setBalance(null)
      setProjects([])
      setUserProfile(null)
      setShowUsernameSetup(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress])

  const checkUserProfile = () => {
    if (!activeAddress) return

    const profile = getUserProfile(activeAddress)

    if (!profile) {
      // New user - show username setup
      setShowUsernameSetup(true)
      setUserProfile(null)
    } else {
      // Existing user - load profile
      setUserProfile(profile)
      setShowUsernameSetup(false)
    }
  }

  const handleUsernameSetup = userData => {
    setUserProfile(userData)
    setShowUsernameSetup(false)
  }

  const handleCancelSetup = () => {
    // Disconnect when username setup is cancelled
    disconnect()
    setShowUsernameSetup(false)
    setUserProfile(null)
  }

  const fetchWalletData = async () => {
    if (!activeAddress) return

    setLoading(true)
    try {
      // Fetch balance with timeout
      const balanceData = await Promise.race([
        client.getBalance({ owner: activeAddress }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Balance fetch timeout')),
            TIME.FETCH_TIMEOUT
          )
        ),
      ])
      setBalance(balanceData.totalBalance)

      if (CONTRACTS.PACKAGE_ID === 'TO_BE_DEPLOYED') {
        // Mock mode: load from localStorage
        const stored = localStorage.getItem(
          `${STORAGE_KEYS.PROJECTS_PREFIX}${activeAddress}`
        )
        if (stored) {
          setProjects(JSON.parse(stored))
        } else {
          setProjects([])
        }
      } else {
        // On-chain mode: fetch user's Project NFTs with timeout
        const onChainProjects = await Promise.race([
          getUserProjects(client, activeAddress),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Projects fetch timeout')),
              TIME.LONG_FETCH_TIMEOUT
            )
          ),
        ])
        setProjects(onChainProjects)
      }
    } catch (error) {
      logError('WalletContext', error, { address: activeAddress })
    } finally {
      setLoading(false)
    }
  }

  const addProject = projectData => {
    const newProject = {
      id: `mock_${Date.now()}`,
      owner: activeAddress,
      ...projectData,
      endorsements: 0,
      createdAt: Date.now(),
      txDigest: `mock_tx_${Math.random().toString(36).substr(2, 9)}`,
    }

    const updated = [...projects, newProject]
    setProjects(updated)
    localStorage.setItem(
      `${STORAGE_KEYS.PROJECTS_PREFIX}${activeAddress}`,
      JSON.stringify(updated)
    )

    return newProject
  }

  const endorseProject = projectId => {
    // Find and update the project across all users
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEYS.PROJECTS_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          const updated = data.map(p =>
            p.id === projectId ? { ...p, endorsements: p.endorsements + 1 } : p
          )

          if (JSON.stringify(data) !== JSON.stringify(updated)) {
            localStorage.setItem(key, JSON.stringify(updated))

            if (key === `${STORAGE_KEYS.PROJECTS_PREFIX}${activeAddress}`) {
              setProjects(updated)
            }
            break
          }
        } catch (error) {
          logError('WalletContext', error, {
            action: 'endorseProject',
            projectId,
          })
        }
      }
    }
  }

  const value = {
    account,
    address: activeAddress,
    balance,
    projects,
    loading,
    isConnected: !!activeAddress,
    userProfile,
    showUsernameSetup,
    isNewUser: !userProfile && !!activeAddress,
    refreshData: fetchWalletData,
    handleUsernameSetup,
    handleCancelSetup,
    addProject,
    endorseProject,
  }

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
