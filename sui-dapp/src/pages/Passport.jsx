import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
  ExternalLink,
  Loader2,
  RefreshCw,
  ThumbsUp,
  Trophy,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ProjectCard from '@/components/ProjectCard'
import { useWallet } from '@/contexts/WalletContext'
import { formatAddress, formatBalance } from '@/lib/formatters'
import { useEffect, useState } from 'react'
import { useSuiClient } from '@mysten/dapp-kit'
import { CONTRACTS } from '@/config/contracts'

const Passport = () => {
  const { t } = useTranslation()
  const {
    isConnected,
    address,
    balance,
    projects,
    loading,
    userProfile,
    refreshData,
  } = useWallet()
  const client = useSuiClient()
  const [endorsementsReceived, setEndorsementsReceived] = useState([])
  const [loadingEndorsements, setLoadingEndorsements] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [endorsementsGiven, setEndorsementsGiven] = useState([])

  // Fetch endorsements given by this user (EndorsementReceipt NFTs they own)
  const fetchEndorsementsGiven = async () => {
    if (!address || !isConnected) return

    try {
      // Query EndorsementReceipt objects owned by this user
      const receipts = await client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${CONTRACTS.PACKAGE_ID}::contribution::EndorsementReceipt`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      })

      const givenEndorsements = receipts.data
        .filter(obj => obj.data?.content)
        .map(obj => {
          const fields = obj.data.content.fields
          return {
            id: obj.data.objectId,
            projectId: fields.project_id,
            endorser: fields.endorser,
            projectOwner: fields.project_owner,
            timestamp: parseInt(fields.timestamp),
          }
        })

      setEndorsementsGiven(givenEndorsements)
    } catch (error) {
      console.error('Error fetching endorsements given:', error)
      setEndorsementsGiven([])
    }
  }

  // Fetch endorsements received by this user's projects
  const fetchEndorsements = async () => {
    if (!address || !isConnected || projects.length === 0) return

    setLoadingEndorsements(true)
    try {
      const registry = await client.getObject({
        id: CONTRACTS.PROJECT_REGISTRY,
        options: { showContent: true },
      })

      const endorsersTableId =
        registry.data?.content?.fields?.endorsers?.fields?.id?.id
      if (!endorsersTableId) {
        setEndorsementsReceived([])
        setLoadingEndorsements(false)
        return
      }

      const allEndorsements = []

      // For each project owned by this user, fetch the endorsers
      for (const project of projects) {
        try {
          // Get endorsers table for this project
          const endorsersForProject = await client.getDynamicFieldObject({
            parentId: endorsersTableId,
            name: {
              type: '0x2::object::ID',
              value: project.id,
            },
          })

          const innerTableId =
            endorsersForProject.data?.content?.fields?.value?.fields?.id?.id
          if (!innerTableId) {
            continue // No endorsers for this project yet
          }

          // Get all endorsers from the inner table
          const endorsersList = await client.getDynamicFields({
            parentId: innerTableId,
          })

          // Add each endorser to the list
          for (const endorserField of endorsersList.data) {
            allEndorsements.push({
              id: `${project.id}-${endorserField.name.value}`,
              projectId: project.id,
              projectTitle: project.title,
              projectType: project.type,
              endorser: endorserField.name.value,
              timestamp: Date.now(), // We don't store timestamps in the table
            })
          }
        } catch {
          // No endorsers yet for this project - expected
          console.warn(`No endorsers found for project ${project.id}`)
        }
      }

      setEndorsementsReceived(allEndorsements)
    } catch (error) {
      console.error('Error fetching endorsements:', error)
      setEndorsementsReceived([])
    } finally {
      setLoadingEndorsements(false)
    }
  }

  // Auto-refresh on mount and periodically
  useEffect(() => {
    if (isConnected) {
      refreshData()
      fetchEndorsements()
      fetchEndorsementsGiven()

      // Longer interval - only refresh when needed
      const interval = setInterval(() => {
        refreshData()
        fetchEndorsements()
        fetchEndorsementsGiven()
      }, 60000) // 1 minute - not aggressive

      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address])

  // Fetch endorsements when projects change
  useEffect(() => {
    if (projects.length > 0) {
      fetchEndorsements()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  // Calculate total score
  const calculateTotalScore = () => {
    // Base score from endorsements received
    const endorsementScore = endorsementsReceived.length * 100

    // Project creation score
    const projectScore = projects.length * 50

    // Endorsements given score (community contribution)
    const supportScore = endorsementsGiven.length * 25

    return endorsementScore + projectScore + supportScore
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center border border-border">
          <span className="text-3xl">🔒</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-sans">
            {t('wallet.connect')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('passport.connectMessage')}
          </p>
        </div>
      </div>
    )
  }

  const totalScore = calculateTotalScore()

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-border pb-8">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-muted border border-border flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">0x</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-sans">
                {userProfile?.username || 'builder.sui'}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span>{formatAddress(address)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() =>
                  window.open(
                    `https://suiscan.xyz/testnet/account/${address}`,
                    '_blank'
                  )
                }
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-none">
                {formatBalance(balance)} SUI
              </Badge>
              <Badge variant="secondary" className="rounded-none">
                {t('passport.contributor')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-mono">
              {t('passport.totalScore')}
            </div>
            <div className="text-2xl font-bold">
              {totalScore.toLocaleString()}
            </div>
          </div>
          <div className="w-[1px] bg-border h-12" />
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-mono">
              {t('passport.projects')}
            </div>
            <div className="text-2xl font-bold">{projects.length}</div>
          </div>
          <div className="w-[1px] bg-border h-12" />
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-mono">
              {t('passport.endorsements')}
            </div>
            <div className="text-2xl font-bold">
              {endorsementsReceived.length}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger
            value="projects"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            {t('passport.projects')}
          </TabsTrigger>
          <TabsTrigger
            value="endorsements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            {t('passport.endorsements')}
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            {t('passport.achievements')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="pt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t('passport.noProjects')}
            </div>
          )}
        </TabsContent>

        <TabsContent value="endorsements" className="pt-6 space-y-4">
          {loadingEndorsements ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : endorsementsReceived.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('passport.endorsementsReceived', {
                    count: endorsementsReceived.length,
                  })}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {endorsementsReceived.map(endorsement => (
                  <Card
                    key={endorsement.id}
                    className="border-border bg-card/50"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ThumbsUp className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {endorsement.projectTitle}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Endorsed by{' '}
                                {formatAddress(endorsement.endorser)}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="rounded-none text-xs"
                            >
                              {endorsement.projectType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() =>
                                window.open(
                                  `https://suiscan.xyz/testnet/object/${endorsement.projectId}`,
                                  '_blank'
                                )
                              }
                            >
                              {t('common.viewProject')}{' '}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <ThumbsUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {t('passport.noEndorsements')}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t('passport.noEndorsementsDesc')}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="pt-6">
          {(() => {
            // Calculate achievement progress
            const achievements = [
              // BUILDER TIER
              {
                id: 'first_project',
                category: 'builder',
                tier: 'bronze',
                icon: '🎯',
                name: 'First Steps',
                description: 'Create your first project',
                progress: projects.length >= 1 ? 1 : 0,
                target: 1,
                xp: 10,
                rarity: 'common',
                unlocked: projects.length >= 1,
              },
              {
                id: 'project_creator',
                category: 'builder',
                tier: 'bronze',
                icon: '🛠️',
                name: 'Project Creator',
                description: 'Create 3 projects',
                progress: Math.min(projects.length, 3),
                target: 3,
                xp: 25,
                rarity: 'common',
                unlocked: projects.length >= 3,
              },
              {
                id: 'serial_builder',
                category: 'builder',
                tier: 'silver',
                icon: '🔧',
                name: 'Serial Builder',
                description: 'Create 5 projects',
                progress: Math.min(projects.length, 5),
                target: 5,
                xp: 50,
                rarity: 'rare',
                unlocked: projects.length >= 5,
              },
              {
                id: 'project_master',
                category: 'builder',
                tier: 'gold',
                icon: '⚡',
                name: 'Project Master',
                description: 'Create 10 projects',
                progress: Math.min(projects.length, 10),
                target: 10,
                xp: 100,
                rarity: 'epic',
                unlocked: projects.length >= 10,
              },

              // INFLUENCER TIER
              {
                id: 'first_endorsement',
                category: 'influencer',
                tier: 'bronze',
                icon: '👍',
                name: 'Noticed',
                description: 'Receive your first endorsement',
                progress: endorsementsReceived.length >= 1 ? 1 : 0,
                target: 1,
                xp: 15,
                rarity: 'common',
                unlocked: endorsementsReceived.length >= 1,
              },
              {
                id: 'rising_star',
                category: 'influencer',
                tier: 'silver',
                icon: '⭐',
                name: 'Rising Star',
                description: 'Receive 5 endorsements',
                progress: Math.min(endorsementsReceived.length, 5),
                target: 5,
                xp: 40,
                rarity: 'rare',
                unlocked: endorsementsReceived.length >= 5,
              },
              {
                id: 'community_favorite',
                category: 'influencer',
                tier: 'gold',
                icon: '🌟',
                name: 'Community Favorite',
                description: 'Receive 10 endorsements',
                progress: Math.min(endorsementsReceived.length, 10),
                target: 10,
                xp: 75,
                rarity: 'epic',
                unlocked: endorsementsReceived.length >= 10,
              },
              {
                id: 'legendary_contributor',
                category: 'influencer',
                tier: 'diamond',
                icon: '💎',
                name: 'Legendary',
                description: 'Receive 25 endorsements',
                progress: Math.min(endorsementsReceived.length, 25),
                target: 25,
                xp: 200,
                rarity: 'legendary',
                unlocked: endorsementsReceived.length >= 25,
              },

              // SUPPORTER TIER
              {
                id: 'first_support',
                category: 'supporter',
                tier: 'bronze',
                icon: '🤝',
                name: 'Supporter',
                description: 'Give your first endorsement',
                progress: endorsementsGiven.length >= 1 ? 1 : 0,
                target: 1,
                xp: 10,
                rarity: 'common',
                unlocked: endorsementsGiven.length >= 1,
              },
              {
                id: 'active_supporter',
                category: 'supporter',
                tier: 'silver',
                icon: '💪',
                name: 'Active Supporter',
                description: 'Give 5 endorsements',
                progress: Math.min(endorsementsGiven.length, 5),
                target: 5,
                xp: 30,
                rarity: 'rare',
                unlocked: endorsementsGiven.length >= 5,
              },
              {
                id: 'generous_supporter',
                category: 'supporter',
                tier: 'gold',
                icon: '💝',
                name: 'Generous',
                description: 'Give 10 endorsements',
                progress: Math.min(endorsementsGiven.length, 10),
                target: 10,
                xp: 75,
                rarity: 'epic',
                unlocked: endorsementsGiven.length >= 10,
              },

              // COMMUNITY TIER
              {
                id: 'veteran',
                category: 'community',
                tier: 'diamond',
                icon: '🏅',
                name: 'Veteran',
                description: 'Active for 30 days',
                progress: 0,
                target: 30,
                xp: 150,
                rarity: 'legendary',
                unlocked: false,
              },
            ]

            const unlockedCount = achievements.filter(a => a.unlocked).length
            const totalXP = achievements
              .filter(a => a.unlocked)
              .reduce((sum, a) => sum + a.xp, 0)
            const progressPercentage = Math.round(
              (unlockedCount / achievements.length) * 100
            )

            // Find rarest unlocked achievement
            const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 }
            const unlockedAchievements = achievements.filter(a => a.unlocked)
            const rarestAchievement =
              unlockedAchievements.length > 0
                ? unlockedAchievements.reduce((rarest, current) => {
                    if (!rarest) return current
                    return rarityOrder[current.rarity] >
                      rarityOrder[rarest.rarity]
                      ? current
                      : rarest
                  }, unlockedAchievements[0])
                : null

            const rarityColors = {
              common: 'text-gray-500',
              rare: 'text-blue-500',
              epic: 'text-purple-500',
              legendary: 'text-orange-500',
            }

            const categories = [
              { id: 'all', name: 'All', icon: Trophy },
              { id: 'builder', name: 'Builder', icon: '🛠️' },
              { id: 'influencer', name: 'Influencer', icon: '⭐' },
              { id: 'supporter', name: 'Supporter', icon: '🤝' },
              { id: 'community', name: 'Community', icon: '🌐' },
            ]

            const filteredAchievements =
              selectedCategory === 'all'
                ? achievements
                : achievements.filter(a => a.category === selectedCategory)

            return (
              <div className="space-y-6">
                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-border bg-gradient-to-br from-primary/10 to-background">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Unlocked
                          </p>
                          <p className="text-3xl font-bold">
                            {unlockedCount}/{achievements.length}
                          </p>
                        </div>
                        <Trophy className="h-10 w-10 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-gradient-to-br from-yellow-500/10 to-background">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total XP
                          </p>
                          <p className="text-3xl font-bold">{totalXP}</p>
                        </div>
                        <span className="text-4xl">⚡</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-gradient-to-br from-blue-500/10 to-background">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Progress
                          </p>
                          <p className="text-3xl font-bold">
                            {progressPercentage}%
                          </p>
                        </div>
                        <div className="relative h-12 w-12">
                          <svg className="transform -rotate-90 h-12 w-12">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-muted"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-primary"
                              strokeDasharray={`${progressPercentage * 1.25} 125`}
                            />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-gradient-to-br from-purple-500/10 to-background">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Rarest
                          </p>
                          {rarestAchievement ? (
                            <>
                              <p
                                className={`text-sm font-bold ${rarityColors[rarestAchievement.rarity]}`}
                              >
                                {rarestAchievement.rarity.toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {rarestAchievement.name}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-bold text-muted-foreground">
                              None Yet
                            </p>
                          )}
                        </div>
                        <span className="text-4xl">
                          {rarestAchievement ? rarestAchievement.icon : '🔒'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  {categories.map(cat => (
                    <Button
                      key={cat.id}
                      variant={
                        selectedCategory === cat.id ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="gap-2"
                    >
                      {typeof cat.icon === 'string' ? (
                        <span>{cat.icon}</span>
                      ) : (
                        <cat.icon className="h-4 w-4" />
                      )}
                      {cat.name}
                    </Button>
                  ))}
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAchievements.map(achievement => (
                    <Card
                      key={achievement.id}
                      className={`border-border transition-all hover:scale-105 ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-primary/5 to-background shadow-lg'
                          : 'bg-card/30 opacity-60'
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Icon & Status */}
                          <div className="flex items-start justify-between">
                            <div
                              className={`text-5xl transition-all ${achievement.unlocked ? 'grayscale-0 scale-110' : 'grayscale'}`}
                            >
                              {achievement.icon}
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              <Badge
                                variant="secondary"
                                className="rounded-none text-xs"
                              >
                                {achievement.tier.toUpperCase()}
                              </Badge>
                              <span
                                className={`text-xs font-bold ${rarityColors[achievement.rarity]}`}
                              >
                                {achievement.rarity.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                              {achievement.name}
                              {achievement.unlocked && (
                                <span className="text-green-500">✓</span>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span className="font-mono">
                                {achievement.progress}/{achievement.target}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  achievement.unlocked
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : 'bg-gradient-to-r from-primary/50 to-primary'
                                }`}
                                style={{
                                  width: `${(achievement.progress / achievement.target) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* XP Reward */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">
                              Reward
                            </span>
                            <span className="text-sm font-bold text-yellow-500">
                              +{achievement.xp} XP
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Passport
