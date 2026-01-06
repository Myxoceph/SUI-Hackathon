import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Trophy,
  Briefcase,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAllUsers } from '@/lib/userProfile'
import { getExplorerUrl } from '@/config/contracts'

function Community() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        user =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const loadUsers = () => {
    const allUsers = getAllUsers()
    // Sort by reputation/projects count
    const sorted = allUsers.sort(
      (a, b) => (b.projectsCount || 0) - (a.projectsCount || 0)
    )
    setUsers(sorted)
    setFilteredUsers(sorted)
  }

  const handleViewProfile = address => {
    navigate(`/passport?address=${address}`)
  }

  const handleSendMessage = address => {
    navigate(`/messages?to=${address}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('community.title')}
        </h1>
        <p className="text-muted-foreground">
          Discover developers, freelancers, and builders in our ecosystem
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('explore.search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.reduce((sum, u) => sum + (u.projectsCount || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.projectsCount > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm
                ? 'No users found matching your search'
                : 'No users yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <Card
              key={user.address}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">
                      {user.username}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">
                      {user.address.slice(0, 8)}...{user.address.slice(-6)}
                    </p>
                  </div>
                  <a
                    href={getExplorerUrl(user.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {user.projectsCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {user.endorsements || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Endorsements
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {user.skills.slice(0, 3).map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {user.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewProfile(user.address)}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSendMessage(user.address)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Community
