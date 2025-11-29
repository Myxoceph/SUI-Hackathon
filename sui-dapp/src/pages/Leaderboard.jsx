import { useState, useEffect } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { CONTRACTS } from "@/config/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Loader2, TrendingUp, Users } from "lucide-react";
import { formatAddress } from "@/lib/formatters";
import { useWallet } from "@/contexts/WalletContext";

const Leaderboard = () => {
  const client = useSuiClient();
  const { address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch all ProjectCreated events
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${CONTRACTS.PACKAGE_ID}::contribution::ProjectCreated`,
        },
        limit: 1000,
        order: 'descending',
      });

      // Group by owner
      const userStats = {};
      
      for (const event of events.data) {
        const owner = event.parsedJson.owner;
        const projectId = event.parsedJson.project_id || event.parsedJson.contribution_id;
        
        if (!userStats[owner]) {
          userStats[owner] = {
            address: owner,
            projectCount: 0,
            endorsementsReceived: 0,
            endorsementsGiven: 0,
            projectIds: [],
            totalScore: 0,
          };
        }
        
        userStats[owner].projectCount++;
        userStats[owner].projectIds.push(projectId);
      }

      // Fetch endorsements for each user
      const registry = await client.getObject({
        id: CONTRACTS.PROJECT_REGISTRY,
        options: { showContent: true },
      });

      const endorsersTableId = registry.data?.content?.fields?.endorsers?.fields?.id?.id;
      
      if (endorsersTableId) {
        // For each user, count endorsements received
        for (const [owner, stats] of Object.entries(userStats)) {
          for (const projectId of stats.projectIds) {
            try {
              const endorsersForProject = await client.getDynamicFieldObject({
                parentId: endorsersTableId,
                name: {
                  type: "0x2::object::ID",
                  value: projectId,
                },
              });

              const innerTableId = endorsersForProject.data?.content?.fields?.value?.fields?.id?.id;
              if (innerTableId) {
                const endorsersList = await client.getDynamicFields({
                  parentId: innerTableId,
                });
                stats.endorsementsReceived += endorsersList.data.length;
              }
            } catch (e) {
              // No endorsements for this project
            }
          }
        }
      }

      // Fetch endorsements given (EndorsementReceipt NFTs)
      for (const [owner, stats] of Object.entries(userStats)) {
        try {
          const receipts = await client.getOwnedObjects({
            owner: owner,
            filter: {
              StructType: `${CONTRACTS.PACKAGE_ID}::contribution::EndorsementReceipt`,
            },
            options: {
              showContent: true,
            },
          });
          stats.endorsementsGiven = receipts.data.length;
        } catch (e) {
          // No receipts
        }
      }

      // Calculate total score for each user
      for (const stats of Object.values(userStats)) {
        stats.totalScore = 
          (stats.endorsementsReceived * 100) +
          (stats.projectCount * 50) +
          (stats.endorsementsGiven * 25);
      }

      // Convert to array and sort by score
      const leaderboardArray = Object.values(userStats)
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

      setLeaderboard(leaderboardArray);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return <span className="font-mono text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { label: "CHAMPION", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" };
    if (rank === 2) return { label: "ELITE", color: "bg-gray-400/10 text-gray-400 border-gray-400/20" };
    if (rank === 3) return { label: "MASTER", color: "bg-orange-600/10 text-orange-600 border-orange-600/20" };
    if (rank <= 10) return { label: "EXPERT", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    if (rank <= 50) return { label: "ADVANCED", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" };
    return { label: "BUILDER", color: "bg-primary/10 text-primary border-primary/20" };
  };

  const currentUserRank = leaderboard.findIndex(u => u.address === address) + 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-sans">Leaderboard</h1>
            <p className="text-muted-foreground mt-2">
              Top builders ranked by contribution score
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchLeaderboard}
            disabled={loading}
          >
            <TrendingUp className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
          </Button>
        </div>

        {/* Current User Stats */}
        {currentUserRank > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    {getRankIcon(currentUserRank)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className="text-2xl font-bold">#{currentUserRank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Score</p>
                  <p className="text-2xl font-bold">{leaderboard[currentUserRank - 1]?.totalScore.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="top-builders" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="top-builders"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            TOP BUILDERS
          </TabsTrigger>
          <TabsTrigger 
            value="top-endorsed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            MOST ENDORSED
          </TabsTrigger>
          <TabsTrigger 
            value="top-supporters"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            TOP SUPPORTERS
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="top-builders" className="pt-6 space-y-3">
              {leaderboard.map((user) => {
                const badge = getRankBadge(user.rank);
                const isCurrentUser = user.address === address;
                
                return (
                  <Card 
                    key={user.address} 
                    className={`border-border transition-all hover:border-primary/50 ${
                      isCurrentUser ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(user.rank)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-mono font-semibold">{formatAddress(user.address)}</p>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="rounded-none text-xs">YOU</Badge>
                            )}
                            <Badge className={`rounded-none text-xs ${badge.color}`}>
                              {badge.label}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{user.projectCount} Projects</span>
                            <span>•</span>
                            <span>{user.endorsementsReceived} Endorsements</span>
                            <span>•</span>
                            <span>{user.endorsementsGiven} Given</span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="text-2xl font-bold">{user.totalScore.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No builders yet. Be the first!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="top-endorsed" className="pt-6 space-y-3">
              {[...leaderboard]
                .sort((a, b) => b.endorsementsReceived - a.endorsementsReceived)
                .map((user, index) => {
                  const isCurrentUser = user.address === address;
                  
                  return (
                    <Card 
                      key={user.address}
                      className={`border-border transition-all hover:border-primary/50 ${
                        isCurrentUser ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12">
                            <span className="font-mono text-lg font-bold text-muted-foreground">#{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-mono font-semibold mb-1">{formatAddress(user.address)}</p>
                            <p className="text-sm text-muted-foreground">{user.projectCount} Projects</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Endorsements</p>
                            <p className="text-2xl font-bold">{user.endorsementsReceived}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>

            <TabsContent value="top-supporters" className="pt-6 space-y-3">
              {[...leaderboard]
                .sort((a, b) => b.endorsementsGiven - a.endorsementsGiven)
                .map((user, index) => {
                  const isCurrentUser = user.address === address;
                  
                  return (
                    <Card 
                      key={user.address}
                      className={`border-border transition-all hover:border-primary/50 ${
                        isCurrentUser ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12">
                            <span className="font-mono text-lg font-bold text-muted-foreground">#{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-mono font-semibold mb-1">{formatAddress(user.address)}</p>
                            <p className="text-sm text-muted-foreground">Community Supporter</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Given</p>
                            <p className="text-2xl font-bold">{user.endorsementsGiven}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Leaderboard;
