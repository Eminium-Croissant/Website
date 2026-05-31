import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import Inventory from '../components/Inventory'
import TradePanel from '../components/TradePanel'
import Certification from '../components/common/Certification'
import CachedImage from '../components/utils/CachedImage'
import { getServerSideTranslations as serverSideTranslations, Trans, useTranslation } from '../components/utils/CloudflareI18n'
import useAuth from '../hooks/useAuth'
import useIsMobile from '../hooks/useIsMobile'
import useUserCache from '../hooks/useUserCache'

interface UserFromQuery {
  id: string
  username: string
}

interface ApiErrorResponse {
  message?: string
}

interface TradeStartResponse {
  id: string
}

function getApiBaseUrl(): string {
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL
  }

  return process.env.NODE_ENV !== 'production' ? 'http://localhost:3456' : 'https://croissant-api.eminium.ovh/api'
}

export async function getServerSideProps({ locale, query }) {
  const translations = await serverSideTranslations(locale)
  let profileFromQuery = null
  const userId = query?.user || null
  let ogMeta = null
  if (userId) {
    try {
      const apiBaseUrl = getApiBaseUrl()
      const res = await fetch(`${apiBaseUrl}/users/${userId}`)
      if (res.ok) {
        const user: UserFromQuery = await res.json()
        ogMeta = {
          title: user.username,
          description: `Check out ${user.username}'s profile on Croissant!`,
          bannerUrl: `${apiBaseUrl.replace(/\/api$/, '')}/avatar/${user.id}`,

          query: { user: user.id },
          card: false
        }
        profileFromQuery = user
      }
    } catch {}
  }

  return {
    props: {
      ...translations,
      ogMeta,
      profileFromQuery
    }
  }
}
const endpoint = '/api'

function ProfileShopModal({ open, onClose, user, onBuySuccess }) {
  if (!open) return null
  return (
    <div className="shop-prompt-overlay">
      <div className="shop-prompt" style={{ minWidth: 400, maxWidth: 600 }}>
        <button style={{ float: 'right' }} onClick={onClose}>
          ✕
        </button>
        <ProfileShop user={user} onBuySuccess={onBuySuccess} />
      </div>
    </div>
  )
}

function GiveCreditsModal({ open, onClose, onSubmit, maxAmount, username }) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState(1)
  useEffect(() => {
    if (open) setAmount(1)
  }, [open])
  if (!open) return null
  return (
    <div className="shop-prompt-overlay">
      <div className="shop-prompt" style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
        <div className="shop-prompt-message">
          <Trans i18nKey="profile.giveCreditsTo" values={{ username }} components={{ b: <b /> }} />
        </div>
        <div className="shop-prompt-amount" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            min={1}
            max={maxAmount || undefined}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Math.min(Number(e.target.value), maxAmount || Number.MAX_SAFE_INTEGER)))}
            className="shop-prompt-amount-input"
          />
          {maxAmount ? <span className="shop-prompt-amount-max">{t('profile.max', { max: maxAmount })}</span> : null}
        </div>
        <div style={{ display: 'inline-flex', gap: 8 }}>
          <button className="glass-button-green" onClick={() => onSubmit(amount)}>
            {t('profile.giveCredits')}
          </button>
          <button className="glass-button-red" onClick={onClose}>
            {t('profile.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export interface ShopItem {
  itemId: string
  name: string
  description: string
  price: number
  stock?: number
  iconHash: string
}

interface CreatedGame {
  gameId: string
  name: string
  description?: string
  price?: number
  owner_id?: string
  showInStore?: number
  iconHash?: string
  splashHash?: string | null
  bannerHash?: string | null
  genre?: string
  release_date?: string
  developer?: string
  publisher?: string
  platforms?: string
  rating?: number
  website?: string
  trailer_link?: string
  multiplayer?: number
  download_link?: string
}

interface User {
  studios: any[]
  verified: boolean
  id: string
  username: string
  created_at?: string | Date
  status?: number
  disabled?: boolean
  admin?: boolean
  isStudio?: boolean
  inventory?: ({
    itemId: string
    name: string
    description: string
    price: number
    iconHash: string
    rarity:
      | 'very-common'
      | 'common'
      | 'uncommon'
      | 'rare'
      | 'very-rare'
      | 'epic'
      | 'ultra-epic'
      | 'legendary'
      | 'ancient'
      | 'mythic'
      | 'godlike'
      | 'radiant'
    custom_url_link?: string
  } & { amount: number })[]
  ownedItems?: ShopItem[]
  badges: ('staff' | 'moderator' | 'community_manager' | 'early_user' | 'bug_hunter' | 'contributor' | 'partner')[]
  createdGames?: CreatedGame[]
}

type ApiStatusLevel = 0 | 1 | 2 | 3 | 4 | 5

type StatusInfo = {
  level: ApiStatusLevel
  labelFr: string
  descriptionFr: string
  color: string
  glow: string
}

type AdminStatusUser = {
  id: string
  username: string
  status?: number
  disabled?: boolean
}

const STATUS_LEVELS: StatusInfo[] = [
  { level: 0, labelFr: 'Normal', descriptionFr: 'Acces complet API', color: '#68d391', glow: 'rgba(104, 211, 145, 0.26)' },
  { level: 1, labelFr: 'Limite', descriptionFr: 'Limite de requetes reduite', color: '#f6ad55', glow: 'rgba(246, 173, 85, 0.22)' },
  { level: 2, labelFr: 'Restreint', descriptionFr: 'Certaines routes sensibles desactivees', color: '#f687b3', glow: 'rgba(246, 135, 179, 0.2)' },
  {
    level: 3,
    labelFr: 'Lecture seule',
    descriptionFr: 'Seules les requetes GET sont autorisees',
    color: '#63b3ed',
    glow: 'rgba(99, 179, 237, 0.22)'
  },
  { level: 4, labelFr: 'Suspendu', descriptionFr: 'Toutes les requetes retournent 403', color: '#fc8181', glow: 'rgba(252, 129, 129, 0.22)' },
  { level: 5, labelFr: 'Banni', descriptionFr: 'Cle API revoquee, acces impossible', color: '#f56565', glow: 'rgba(245, 101, 101, 0.3)' }
]

type ProfileProps = {
  userId: string
}

const inventoryGridStyle = (columns: number): React.CSSProperties => ({
  gridTemplateColumns: `repeat(${columns}, 1fr)`
})
const inventoryItemStyle: React.CSSProperties = {
  cursor: 'pointer'
}
const tooltipStyle = (x: number, y: number): React.CSSProperties => ({
  left: x,
  top: y,
  position: 'fixed',
  zIndex: 1000
})

function getEffectiveStatus(subject: { status?: number; disabled?: boolean } | null | undefined): ApiStatusLevel {
  if (subject?.disabled) return 5
  const raw = Number(subject?.status ?? 0)
  if (Number.isNaN(raw) || raw < 0) return 0
  if (raw > 5) return 5
  return raw as ApiStatusLevel
}

function getStatusInfo(level: ApiStatusLevel): StatusInfo {
  const info = STATUS_LEVELS.find((item) => item.level === level)
  return info || STATUS_LEVELS[0]
}

function formatCreatedAt(createdAt: string | Date | undefined, locale: string): string | null {
  if (!createdAt) return null

  const date = createdAt instanceof Date ? createdAt : new Date(createdAt)
  if (Number.isNaN(date.getTime())) return null

  const label = locale.startsWith('fr') ? 'Créé le' : 'Created on'
  const formattedDate = new Intl.DateTimeFormat(locale || 'en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)

  return `${label} ${formattedDate}`
}

function ProfileShop({ user, onBuySuccess }: { user: User; onBuySuccess: () => void }) {
  const { t } = useTranslation()
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    item: ShopItem
  } | null>(null)
  const [prompt, setPrompt] = useState<{
    message: string
    resolve: (value: { confirmed: boolean; amount?: number }) => void
    maxAmount?: number
    amount?: number
    item?: ShopItem
  } | null>(null)
  const [promptOwnerUser, setPromptOwnerUser] = useState<any | null>(null)
  const [alert, setAlert] = useState<{ message: string } | null>(null)
  const [shopModalOpen, setShopModalOpen] = useState(false)

  useEffect(() => {
    setItems(user.ownedItems || [])
    setLoading(false)
  }, [user.ownedItems])

  const handleMouseEnter = (e: React.MouseEvent, item: ShopItem) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()

    const tooltipWidth = 320
    const tooltipHeight = 120
    const padding = 8
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    let x = rect.right + padding
    let y = rect.top

    if (x + tooltipWidth > windowWidth) {
      x = rect.left - tooltipWidth - padding
      if (x < 0) x = windowWidth - tooltipWidth - padding
    }

    if (y + tooltipHeight > windowHeight) {
      y = windowHeight - tooltipHeight - padding
      if (y < 0) y = padding
    }
    setTooltip({ x, y, item })
  }
  const handleMouseLeave = () => setTooltip(null)

  const { getUser: getUserFromCache } = useUserCache()
  const customPrompt = async (message: string, maxAmount?: number, item?: ShopItem) => {
    let ownerUser: any = null
    if (item && (item as any).owner) {
      try {
        ownerUser = await getUserFromCache((item as any).owner)
      } catch {}
    }
    setPrompt({ message, resolve: () => {}, maxAmount, amount: 1, item })
    setPromptOwnerUser(ownerUser)
    return new Promise<{ confirmed: boolean; amount?: number }>((resolve) => {
      setPrompt({ message, resolve, maxAmount, amount: 1, item })
      setPromptOwnerUser(ownerUser)
    })
  }

  const handlePromptResult = (confirmed: boolean) => {
    if (prompt) {
      const { amount } = prompt
      prompt.resolve({ confirmed, amount })
      setPrompt(null)
      setPromptOwnerUser(null)
    }
  }

  const handlePromptAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(Number(e.target.value), prompt?.maxAmount || Number.MAX_SAFE_INTEGER))
    setPrompt((prev) => (prev ? { ...prev, amount: value } : null))
  }

  const handleBuy = async (item: ShopItem) => {
    const maxAmount = item.stock ?? undefined
    const result = await customPrompt(
      `Buy how many "${item.name}"?\nPrice: ${item.price} each${maxAmount ? `\nStock: ${maxAmount}` : ''}`,
      maxAmount,
      item
    )
    if (result.confirmed && result.amount && result.amount > 0) {
      fetch(endpoint + '/items/buy/' + item.itemId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: result.amount })
      })
        .then(async (res) => {
          const data: ApiErrorResponse = await res.json()
          if (!res.ok) throw new Error(data.message || 'Failed to buy item')
          return data
        })
        .then(() => {
          fetch(endpoint + '/items', {
            headers: {
              'Content-Type': 'application/json'
            }
          })
            .then((res) => res.json())
            .then((data: ShopItem[]) => setItems(data.filter((item: any) => item.owner === user.id)))
            .finally(() => setLoading(false))
          onBuySuccess()
        })
        .catch((err) => {
          setAlert({ message: err.message })
        })
    }
  }

  const columns = 4
  const minRows = 8
  const totalItems = items.length
  const rows = Math.max(minRows, Math.ceil(totalItems / columns))
  const totalCells = rows * columns
  const emptyCells = totalCells - totalItems

  if (loading) return <p>{t('profile.loading')}</p>
  if (error) return <p style={{ color: 'red' }}>{t('profile.error')}</p>
  if (items.length === 0) return <p>{t('profile.noItems')}</p>

  return (
    <div className="profile-shop-section">
      <h2 className="profile-shop-title">{t('profile.shop')}</h2>
      <div className="inventory-grid" style={inventoryGridStyle(columns)}>
        {items.map((item) => (
          <div
            key={item.itemId}
            className="inventory-item"
            tabIndex={0}
            draggable={false}
            onMouseEnter={(e) => handleMouseEnter(e, item)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleBuy(item)}
            style={inventoryItemStyle}
          >
            <ShopItemImage item={item} />
          </div>
        ))}
        {Array.from({ length: emptyCells }).map((_, idx) => (
          <div key={`empty-${idx}`} className="inventory-item-empty" draggable={false} />
        ))}
      </div>
      {tooltip && (
        <div className="shop-tooltip" style={tooltipStyle(tooltip.x, tooltip.y)}>
          <div className="shop-tooltip-name">{tooltip.item.name}</div>
          <div className="shop-tooltip-desc">{tooltip.item.description}</div>
          <div className="shop-tooltip-price" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {t('profile.price')} {tooltip.item.price}
            <CachedImage src="/assets/credit.avif" className="shop-credit-icon" />
            {tooltip.item.stock !== undefined && (
              <span className="shop-tooltip-stock">{t('profile.shopTooltipStock', { stock: tooltip.item.stock })}</span>
            )}
          </div>
        </div>
      )}
      {prompt && (
        <div className="shop-prompt-overlay">
          <div
            className="shop-prompt shop-prompt-buy"
            style={{
              minWidth: 340,
              maxWidth: 420,
              background: '#23272a',
              borderRadius: 12,
              boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              color: '#fff'
            }}
          >
            {prompt.item && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <CachedImage
                  src={`/items-icons/${prompt.item.iconHash || prompt.item.itemId}`}
                  alt={prompt.item.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: '#181a1a'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 17 }}>{prompt.item.name}</div>
                  <div style={{ color: '#aaa', fontSize: 13 }}>{prompt.item.description}</div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      marginTop: 2
                    }}
                  >
                    {t('profile.price')} {prompt.item.price}
                    <CachedImage src="/assets/credit.avif" style={{ width: 16, height: 16 }} />
                    {prompt.item.stock !== undefined && (
                      <span style={{ color: '#888', fontSize: 12 }}>
                        {t('profile.stockLabel')}: {prompt.item.stock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div style={{ fontSize: 15 }}>{prompt.message}</div>
            {prompt.maxAmount !== 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min={1}
                  max={prompt.maxAmount || undefined}
                  value={prompt.amount}
                  onChange={handlePromptAmountChange}
                  style={{
                    width: 54,
                    padding: '3px 7px',
                    borderRadius: 4,
                    border: '1px solid #36393f',
                    background: '#181a1a',
                    color: '#fff'
                  }}
                />
                {prompt.maxAmount && <span style={{ color: '#888', fontSize: 12 }}>/ {prompt.maxAmount}</span>}
                {prompt.item && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 500
                    }}
                  >
                    {t('profile.totalLabel')} {(prompt.amount || 1) * (prompt.item.price || 0)}
                    <CachedImage src="/assets/credit.avif" style={{ width: 15, height: 15 }} />
                  </span>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button className="glass-button-green" onClick={() => handlePromptResult(true)}>
                {t('profile.buy')}
              </button>
              <button className="glass-button-red" onClick={() => handlePromptResult(false)}>
                {t('profile.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      {alert && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
            <div className="shop-alert-message">{alert.message}</div>
            <button className="glass-button" onClick={() => setAlert(null)}>
              {t('profile.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const ShopItemImage = React.memo(function ShopItemImage({ item }: { item: ShopItem }) {
  const iconUrl = '/items-icons/' + (item?.iconHash || item.itemId)
  return (
    <div
      style={{
        position: 'relative',
        width: '48px',
        height: '48px',
        background: '#181a1a',
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CachedImage
        src={iconUrl}
        alt="default"
        className="inventory-item-img inventory-item-img-blur"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '6px',
          background: '#181a1a',
          display: 'block'
        }}
        draggable={false}
      />
    </div>
  )
})

function useProfileLogic(userId: string) {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [giveCreditsOpen, setGiveCreditsOpen] = useState(false)
  const [giveCreditsLoading, setGiveCreditsLoading] = useState(false)
  const [giveCreditsError, setGiveCreditsError] = useState<string | null>(null)
  const [giveCreditsSuccess, setGiveCreditsSuccess] = useState<string | null>(null)

  const [showTradeModal, setShowTradeModal] = useState(false)
  const [currentTradeId, setCurrentTradeId] = useState<string | null>(null)
  const [inventoryReloadFlag, setInventoryReloadFlag] = useState(0)
  const [isProfileReloading, setIsProfileReloading] = useState(false)
  const [shopModalOpen, setShopModalOpen] = useState(false)
  const [createdGamesModalOpen, setCreatedGamesModalOpen] = useState(false)
  const [studiosModalOpen, setStudiosModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusActionLoadingId, setStatusActionLoadingId] = useState<string | null>(null)
  const [adminStatusUsers, setAdminStatusUsers] = useState<AdminStatusUser[]>([])
  const [statusSearchInput, setStatusSearchInput] = useState('')

  const reloadInventory = () => setInventoryReloadFlag((f) => f + 1)

  const searchParams = useSearchParams()
  const search = searchParams.get('user')

  const { user, token } = useAuth()
  const router = useRouter()
  const { getUser: getUserFromCache } = useUserCache()

  const reloadProfile = useCallback(
    (reloadCache: boolean = false) => {
      setLoading(true)
      setIsProfileReloading(true)
      const selectedUserId = search || '@me'
      if (selectedUserId === '@me' || selectedUserId === user?.id) {
        setProfile(user)
        setLoading(false)
        return
      }
      getUserFromCache(selectedUserId, !reloadCache, user?.admin)
        .then(setProfile)
        .catch((e) => {
          setError(e.message)
          if ((search || '@me') == '@me' && !token) {
            router.push('/login')
            return
          }
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [token, user?.admin, search, router]
  )

  useEffect(() => {
    if (isProfileReloading) return
    const handler = setTimeout(() => {
      reloadProfile()
      setIsProfileReloading(false)
    }, 250)
    return () => clearTimeout(handler)
  }, [search, isProfileReloading, reloadProfile, user])

  const resolveApiMessage = async (res: Response, fallbackMessage: string) => {
    try {
      const data: ApiErrorResponse = await res.json()
      return data.message || fallbackMessage
    } catch {
      return fallbackMessage
    }
  }

  const loadAdminStatusUsers = async (query: string = '') => {
    if (!user?.admin) return
    setStatusLoading(true)
    setStatusError(null)
    try {
      const normalizedQuery = query.trim()
      let list: AdminStatusUser[] = []

      const listEndpoints = ['/api/users/admin/statuses', '/api/users/admin/users-status', '/api/users/admin/list', '/api/users/admin/all']
      for (const statusEndpoint of listEndpoints) {
        const suffix = normalizedQuery ? '?q=' + encodeURIComponent(normalizedQuery) : ''
        const res = await fetch(statusEndpoint + suffix)
        if (!res.ok) continue
        const data = await res.json()
        if (Array.isArray(data)) {
          list = data
          break
        }
      }

      if (!list.length) {
        const q = normalizedQuery || 'a'
        const searchRes = await fetch('/api/users/search?q=' + encodeURIComponent(q))
        if (!searchRes.ok) throw new Error(await resolveApiMessage(searchRes, 'Impossible de charger les comptes'))
        const candidates: AdminStatusUser[] = await searchRes.json()

        const detailed = await Promise.all(
          candidates.slice(0, 50).map(async (candidate) => {
            try {
              const targetId = (candidate as any).id || (candidate as any).user_id
              const detailsRes = await fetch('/api/users/admin/' + targetId)
              if (!detailsRes.ok) return null
              const details: any = await detailsRes.json()
              return {
                id: details.id || details.user_id,
                username: details.username,
                status: details.status,
                disabled: details.disabled
              } as AdminStatusUser
            } catch {
              return null
            }
          })
        )

        list = detailed.filter(Boolean) as AdminStatusUser[]
      }

      const normalized = list
        .map((entry) => ({
          id: (entry as any).id || (entry as any).user_id,
          username: (entry as any).username || 'Unknown',
          status: Number((entry as any).status ?? 0),
          disabled: Boolean((entry as any).disabled)
        }))
        .filter((entry) => !!entry.id)
        .sort((a, b) => a.username.localeCompare(b.username))

      setAdminStatusUsers(normalized)
    } catch (e: any) {
      setStatusError(e?.message || 'Impossible de charger les statuts')
    } finally {
      setStatusLoading(false)
    }
  }

  const updateUserStatus = async (targetUser: AdminStatusUser, statusLevel: number) => {
    if (!user?.admin) return
    const effectiveStatus = targetUser.disabled ? 5 : Math.max(0, Math.min(5, Number(statusLevel)))
    setStatusActionLoadingId(targetUser.id)
    setStatusError(null)

    try {
      const payload = {
        status: effectiveStatus,
        apiStatus: effectiveStatus,
        userId: targetUser.id,
        targetUserId: targetUser.id
      }
      const attempts: Array<{ url: string; method: 'POST' | 'PUT' | 'PATCH'; body: any }> = [
        { url: '/api/users/admin/' + targetUser.id, method: 'PATCH', body: { status: effectiveStatus } },
        { url: '/api/users/admin/' + targetUser.id, method: 'PUT', body: { status: effectiveStatus } },
        { url: '/api/users/admin/' + targetUser.id, method: 'PATCH', body: { apiStatus: effectiveStatus } },
        { url: '/api/users/admin/' + targetUser.id, method: 'PUT', body: { apiStatus: effectiveStatus } },
        { url: '/api/users/admin/status/' + targetUser.id, method: 'POST', body: { status: effectiveStatus } },
        { url: '/api/users/admin/status/' + targetUser.id, method: 'PUT', body: { status: effectiveStatus } },
        { url: '/api/users/admin/status', method: 'POST', body: payload }
      ]

      let updated = false
      let lastErrorMessage = 'Impossible de mettre a jour ce status'

      for (const attempt of attempts) {
        const res = await fetch(attempt.url, {
          method: attempt.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attempt.body)
        })

        if (res.ok) {
          updated = true
          break
        }

        const apiMessage = await resolveApiMessage(res, `${attempt.method} ${attempt.url} -> ${res.status}`)
        lastErrorMessage = apiMessage
      }

      if (!updated) throw new Error(lastErrorMessage)

      setAdminStatusUsers((prev) => prev.map((entry) => (entry.id === targetUser.id ? { ...entry, status: effectiveStatus } : entry)))
      setProfile((prev) => (prev && prev.id === targetUser.id ? { ...prev, status: effectiveStatus } : prev))
      reloadProfile(true)
    } catch (e: any) {
      setStatusError(e?.message || 'Impossible de mettre a jour ce status')
    } finally {
      setStatusActionLoadingId(null)
    }
  }

  const handleStatusModalOpen = async () => {
    const isMe = !search || search === user?.id
    // Only allow opening for admins or when viewing your own profile
    if (!user?.admin && !isMe) return

    setStatusModalOpen(true)
    setStatusError(null)
    if (user?.admin) {
      await loadAdminStatusUsers('')
    }
  }

  const handleDisableAccount = async () => {
    if (!user?.admin || !token || !profile) return
    try {
      const res = await fetch(`/api/users/admin/disable/${profile.id}`, {
        method: 'POST'
      })
      const data: ApiErrorResponse = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to disable account')
      setProfile((prev) => (prev ? { ...prev, disabled: true, status: 5 } : prev))
      if (profile?.id) {
        updateUserStatus({ id: profile.id, username: profile.username || 'Unknown', disabled: true, status: 5 }, 5).catch(() => null)
      }
      reloadProfile(true)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleReenableAccount = async () => {
    if (!user?.admin || !token || !profile) return
    try {
      const res = await fetch(`/api/users/admin/enable/${profile.id}`, {
        method: 'POST'
      })
      const data: ApiErrorResponse = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to re-enable account')
      setProfile((prev) => (prev ? { ...prev, disabled: false } : prev))
      reloadProfile(true)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const response = await fetch('/upload/avatar', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
    }
  }

  const handleStartTrade = async () => {
    const res = await fetch(`/api/trades/start-or-latest/${profile.id}`, {
      method: 'POST'
    })
    const data: TradeStartResponse = await res.json()
    setCurrentTradeId(data.id)
  }

  const handleGiveCredits = async (amount: number) => {
    setGiveCreditsLoading(true)
    setGiveCreditsError(null)
    setGiveCreditsSuccess(null)
    try {
      const res = await fetch('/api/users/transfer-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId: profile.id, amount })
      })
      const data: ApiErrorResponse = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to transfer credits')
      setGiveCreditsSuccess('Credits sent!')
      setInventoryReloadFlag((f) => f + 1)
    } catch (e) {
      setGiveCreditsError(e.message)
    } finally {
      setGiveCreditsLoading(false)
    }
  }

  return {
    showTradeModal,
    setShowTradeModal,
    search,
    profile,
    loading,
    error,
    giveCreditsOpen,
    giveCreditsLoading,
    giveCreditsError,
    giveCreditsSuccess,
    currentTradeId,
    inventoryReloadFlag,
    isProfileReloading,
    setGiveCreditsOpen,
    setCurrentTradeId,
    reloadInventory,
    handleDisableAccount,
    handleReenableAccount,
    handleProfilePictureChange,
    handleStartTrade,
    handleGiveCredits,
    setLoading,
    reloadProfile,
    setProfile,
    setError,
    setGiveCreditsSuccess,
    setGiveCreditsError,
    setGiveCreditsLoading,
    setIsProfileReloading,
    setInventoryReloadFlag,
    shopModalOpen,
    setShopModalOpen,
    createdGamesModalOpen,
    setCreatedGamesModalOpen,
    studiosModalOpen,
    setStudiosModalOpen,
    statusModalOpen,
    setStatusModalOpen,
    statusLoading,
    statusError,
    statusActionLoadingId,
    adminStatusUsers,
    statusSearchInput,
    setStatusSearchInput,
    handleStatusModalOpen,
    loadAdminStatusUsers,
    updateUserStatus
  }
}

function ProfileDesktop(props: ReturnType<typeof useProfileLogic>) {
  const {
    profile,
    loading,
    error,
    giveCreditsOpen,
    giveCreditsLoading,
    giveCreditsError,
    giveCreditsSuccess,
    currentTradeId,
    inventoryReloadFlag,
    isProfileReloading,
    setGiveCreditsOpen,
    setCurrentTradeId,
    reloadInventory,
    handleDisableAccount,
    handleReenableAccount,
    handleProfilePictureChange,
    handleStartTrade,
    handleGiveCredits,
    search,
    setIsProfileReloading,
    reloadProfile,
    setGiveCreditsError,
    setGiveCreditsSuccess,
    setInventoryReloadFlag,
    setShowTradeModal
  } = props

  const { user, token } = useAuth()
  const { t, locale } = useTranslation()

  useEffect(() => {
    if (isProfileReloading) return
    const handler = setTimeout(() => {
      reloadProfile()
      setIsProfileReloading(false)
    }, 250)
    return () => clearTimeout(handler)
  }, [search, isProfileReloading, reloadProfile, user])

  if (loading)
    return (
      <div className="container">
        <p>{t('profile.loading')}</p>
      </div>
    )
  if (error)
    return (
      <div className="container">
        <p style={{ color: 'red' }}>{t('profile.error')}</p>
      </div>
    )
  if (!profile)
    return (
      <div className="container">
        <p>{t('profile.notFound')}</p>
      </div>
    )

  const isMe = !search || search === user?.id
  const hasShopItems = profile.ownedItems && profile.ownedItems.length > 0

  return (
    <div className="profile-root">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        <div className="profile-picture-container">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '64px'
            }}
          >
            <label htmlFor="profile-picture-input" style={{ cursor: isMe ? 'pointer' : 'default', margin: 0 }}>
              <CachedImage src={'/avatar/' + (search || user?.id)} alt={profile.username} className="profile-avatar" />
              {isMe && (
                <input id="profile-picture-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePictureChange} />
              )}
            </label>
            <div className="profile-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="profile-name" style={{ display: 'flex', alignItems: 'center' }}>
                  {profile.username}{' '}
                  <Certification
                    user={profile}
                    style={{
                      marginLeft: 4,
                      width: 32,
                      height: 32,
                      position: 'relative',
                      top: 0,
                      verticalAlign: 'middle'
                    }}
                  />
                  {profile.disabled ? <span style={{ color: 'red', marginLeft: 8 }}>{t('profile.disabledLabel')}</span> : null}
                </div>
                <BadgesBox badges={profile.badges || []} studio={profile.isStudio} />
                <ProfileCreatedAt createdAt={profile.created_at} locale={locale} />
              </div>
            </div>
          </div>
        </div>
        {user && (
          <>
            {!isMe ? (
              <div style={{ display: 'inline-flex', gap: 8, marginTop: 8 }}>
                {user.admin && profile.disabled ? (
                  <button className="glass-button" style={{ background: '#4c7aafff' }} onClick={handleReenableAccount}>
                    {t('profile.reenable')}
                  </button>
                ) : null}
                {user.admin && !profile.disabled ? (
                  <button className="glass-button" style={{ background: '#f44336' }} onClick={handleDisableAccount}>
                    {t('profile.disable')}
                  </button>
                ) : null}
                {isMe || user.admin ? (
                  <button
                    className="glass-button"
                    style={{
                      minWidth: 110,
                      background: 'linear-gradient(135deg, rgba(255,214,102,0.22), rgba(59,130,246,0.2))',
                      border: '1px solid rgba(255,255,255,0.18)'
                    }}
                    onClick={props.handleStatusModalOpen}
                  >
                    API Status
                  </button>
                ) : null}
                {!profile.disabled ? (
                  <>
                    <button
                      className="glass-button"
                      onClick={() => {
                        setGiveCreditsOpen(true)
                        setGiveCreditsError(null)
                        setGiveCreditsSuccess(null)
                      }}
                    >
                      {t('profile.giveCredits')}
                    </button>
                    <button className="glass-button" onClick={handleStartTrade}>
                      {t('profile.trade')}
                    </button>
                    {hasShopItems ? (
                      <button className="glass-button" onClick={() => props.setShopModalOpen(true)} style={{ minWidth: 90 }}>
                        {t('profile.shop')}
                      </button>
                    ) : null}
                    {profile.createdGames && profile.createdGames.length > 0 ? (
                      <button className="glass-button" onClick={() => props.setCreatedGamesModalOpen(true)} style={{ minWidth: 90 }}>
                        {t('profile.createdGamesTitle') || 'Games '}
                      </button>
                    ) : null}
                    {profile.studios && profile.studios.length > 0 ? (
                      <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setStudiosModalOpen(true)}>
                        {t('profile.studios') || 'Studios'}
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 8
                }}
              >
                <Link href="/my-market-listings">
                  <button className="glass-button">{t('profile.myMarketListings')}</button>
                </Link>
                <button
                  className="glass-button"
                  style={{
                    minWidth: 110,
                    background: 'linear-gradient(135deg, rgba(255,214,102,0.22), rgba(59,130,246,0.2))',
                    border: '1px solid rgba(255,255,255,0.18)'
                  }}
                  onClick={props.handleStatusModalOpen}
                >
                  API Status
                </button>

                {hasShopItems ? (
                  <button className="glass-button" onClick={() => props.setShopModalOpen(true)} style={{ minWidth: 90 }}>
                    {t('profile.shop')}
                  </button>
                ) : null}
                {profile.createdGames && profile.createdGames.length > 0 ? (
                  <button className="glass-button" onClick={() => props.setCreatedGamesModalOpen(true)} style={{ minWidth: 90 }}>
                    {t('profile.createdGamesTitle') || 'Games '}
                  </button>
                ) : null}
                {profile.studios && profile.studios.length > 0 ? (
                  <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setStudiosModalOpen(true)}>
                    {t('profile.studios') || 'Studios'}
                  </button>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 0 }}>
        <div style={{ flex: '0 0 100%' }}>
          <div className="profile-shop-section">
            <h2 className="profile-inventory-title">{t('profile.inventoryTitle')}</h2>
            <Inventory
              profile={{
                ...profile,
                inventory: profile.inventory
                  ? profile.inventory.map((item) => ({
                      ...item,
                      item_id: item.itemId,
                      icon_hash: item.iconHash,
                      rarity: item.rarity,
                      metadataString: ''
                    }))
                  : []
              }}
              isMe={isMe}
              reloadFlag={inventoryReloadFlag}
            />
          </div>
        </div>
      </div>
      {user && user.id !== profile.id && currentTradeId && (
        <TradePanel
          tradeId={currentTradeId}
          userId={user.id}
          token={token}
          inventory={user.inventory}
          reloadInventory={reloadInventory}
          onClose={() => {
            setCurrentTradeId(null)
            setShowTradeModal(false)
          }}
          profile={profile}
          apiBase="/api"
        />
      )}
      <GiveCreditsModal
        open={giveCreditsOpen}
        onClose={() => setGiveCreditsOpen(false)}
        onSubmit={(amount) => {
          setGiveCreditsOpen(false)
          handleGiveCredits(amount)
        }}
        maxAmount={user?.balance}
        username={profile.username || profile.username}
      />
      {giveCreditsLoading && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
            <div>{t('profile.sendingCredits')}</div>
          </div>
        </div>
      )}
      {giveCreditsError && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: 'red' }}>{giveCreditsError}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsError(null)}>
              OK
            </button>
          </div>
        </div>
      )}
      {giveCreditsSuccess && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
            <div>{t('profile.creditsSent')}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsSuccess(null)}>
              {t('profile.ok')}
            </button>
          </div>
        </div>
      )}
      <ProfileShopModal
        open={props.shopModalOpen}
        onClose={() => props.setShopModalOpen(false)}
        user={profile}
        onBuySuccess={() => setInventoryReloadFlag((f) => f + 1)}
      />
      <CreatedGamesModal
        open={props.createdGamesModalOpen}
        onClose={() => props.setCreatedGamesModalOpen(false)}
        games={profile.createdGames || []}
      />
      <UserStudiosModal open={props.studiosModalOpen} onClose={() => props.setStudiosModalOpen(false)} studios={profile.studios || []} />
      <ProfileStatusModal
        open={props.statusModalOpen}
        onClose={() => props.setStatusModalOpen(false)}
        profile={profile}
        isAdmin={Boolean(user?.admin)}
        statusLoading={props.statusLoading}
        statusError={props.statusError}
        statusActionLoadingId={props.statusActionLoadingId}
        adminStatusUsers={props.adminStatusUsers}
        statusSearchInput={props.statusSearchInput}
        setStatusSearchInput={props.setStatusSearchInput}
        onSearch={props.loadAdminStatusUsers}
        onUpdateStatus={props.updateUserStatus}
      />
    </div>
  )
}

function ProfileMobile(props: ReturnType<typeof useProfileLogic>) {
  const {
    profile,
    loading,
    error,
    giveCreditsOpen,
    giveCreditsLoading,
    giveCreditsError,
    giveCreditsSuccess,
    currentTradeId,
    inventoryReloadFlag,
    isProfileReloading,
    setGiveCreditsOpen,
    setCurrentTradeId,
    reloadInventory,
    handleDisableAccount,
    handleReenableAccount,
    handleProfilePictureChange,
    handleStartTrade,
    handleGiveCredits,
    search,
    setIsProfileReloading,
    reloadProfile,
    setGiveCreditsError,
    setShowTradeModal,
    setInventoryReloadFlag,
    setGiveCreditsSuccess
  } = props

  const { user, token } = useAuth()
  const { t, locale } = useTranslation()

  useEffect(() => {
    if (isProfileReloading) return
    const handler = setTimeout(() => {
      reloadProfile()
      setIsProfileReloading(false)
    }, 250)
    return () => clearTimeout(handler)
  }, [search, isProfileReloading, reloadProfile, user])

  if (loading)
    return (
      <div className="container">
        <p>{t('profile.loading')}</p>
      </div>
    )
  if (error)
    return (
      <div className="container">
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    )
  if (!profile)
    return (
      <div className="container">
        <p>{t('profile.notFound')}</p>
      </div>
    )

  const isMe = !search || search === user?.id
  const hasShopItems = profile.ownedItems && profile.ownedItems.length > 0

  return (
    <div className="profile-root">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <div className="profile-picture-container">
          <label
            htmlFor="profile-picture-input"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: isMe ? 'pointer' : 'default'
            }}
          >
            <CachedImage src={'/avatar/' + (search || user?.id)} alt={profile.username} className="profile-avatar" />
          </label>
          {isMe && (
            <input id="profile-picture-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePictureChange} />
          )}
        </div>
        <div
          className="profile-header"
          style={{
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div className="profile-name" style={{ fontSize: '1.2em', fontWeight: 600 }}>
            {profile.username}{' '}
            <Certification
              user={profile}
              style={{
                marginLeft: 4,
                width: 24,
                height: 24,
                position: 'relative',
                top: -2,
                verticalAlign: 'middle'
              }}
            />
            {profile.disabled ? <span style={{ color: 'red' }}>{t('profile.disabledLabel')}</span> : null}
          </div>
          <BadgesBox badges={profile.badges || []} studio={profile.isStudio} />
          <ProfileCreatedAt createdAt={profile.created_at} locale={locale} />
          <div
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginTop: 8,
              marginBottom: 8
            }}
          >
            {user && !isMe ? (
              <>
                {user.admin && profile.disabled ? (
                  <button className="glass-button" style={{ background: '#4c7aafff', minWidth: 90 }} onClick={handleReenableAccount}>
                    {t('profile.reenable')}
                  </button>
                ) : null}
                {user.admin && !profile.disabled ? (
                  <button className="glass-button" style={{ background: '#f44336', minWidth: 90 }} onClick={handleDisableAccount}>
                    {t('profile.disable')}
                  </button>
                ) : null}
                {isMe || user.admin ? (
                  <button
                    className="glass-button"
                    style={{
                      minWidth: 100,
                      background: 'linear-gradient(135deg, rgba(255,214,102,0.22), rgba(59,130,246,0.2))',
                      border: '1px solid rgba(255,255,255,0.18)'
                    }}
                    onClick={props.handleStatusModalOpen}
                  >
                    API Status
                  </button>
                ) : null}
                {!profile.disabled ? (
                  <>
                    <button
                      className="glass-button"
                      style={{ minWidth: 90 }}
                      onClick={() => {
                        setGiveCreditsOpen(true)
                        setGiveCreditsError(null)
                        setGiveCreditsSuccess(null)
                      }}
                    >
                      {t('profile.giveCredits')}
                    </button>
                    <button className="glass-button" style={{ minWidth: 90 }} onClick={handleStartTrade}>
                      {t('profile.trade')}
                    </button>
                    {hasShopItems ? (
                      <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setShopModalOpen(true)}>
                        {t('profile.shop')}
                      </button>
                    ) : null}
                    {profile.createdGames && profile.createdGames.length > 0 ? (
                      <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setCreatedGamesModalOpen(true)}>
                        {t('profile.createdGamesTitle') || 'Games '}
                      </button>
                    ) : null}
                    {profile.studios && profile.studios.length > 0 ? (
                      <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setStudiosModalOpen(true)}>
                        {t('profile.studios') || 'Studios'}
                      </button>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
            {user && isMe ? (
              <>
                <Link href="/my-market-listings">
                  <button className="glass-button" style={{ minWidth: 90 }}>
                    {t('profile.myListings')}
                  </button>
                </Link>
                <button
                  className="glass-button"
                  style={{
                    minWidth: 100,
                    background: 'linear-gradient(135deg, rgba(255,214,102,0.22), rgba(59,130,246,0.2))',
                    border: '1px solid rgba(255,255,255,0.18)'
                  }}
                  onClick={props.handleStatusModalOpen}
                >
                  API Status
                </button>
                {hasShopItems ? (
                  <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setShopModalOpen(true)}>
                    {t('profile.shop')}
                  </button>
                ) : null}
                {profile.createdGames && profile.createdGames.length > 0 ? (
                  <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setCreatedGamesModalOpen(true)}>
                    {t('profile.createdGamesTitle') || 'Games '}
                  </button>
                ) : null}
                {profile.studios && profile.studios.length > 0 ? (
                  <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setStudiosModalOpen(true)}>
                    {t('profile.studios') || 'Studios'}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '0 8px'
          }}
        >
          <div className="profile-shop-section">
            <h2 className="profile-inventory-title">{t('profile.inventoryTitle')}</h2>
            <Inventory
              profile={{
                ...profile,
                inventory: profile.inventory
                  ? profile.inventory.map((item) => ({
                      ...item,
                      item_id: item.itemId,
                      icon_hash: item.iconHash,
                      rarity: item.rarity,
                      metadataString: ''
                    }))
                  : []
              }}
              isMe={isMe}
              reloadFlag={inventoryReloadFlag}
            />
          </div>
        </div>
      </div>
      {user && user.id !== profile.id && currentTradeId && (
        <div className="trade-panel-centered">
          <TradePanel
            tradeId={currentTradeId}
            userId={user.id}
            token={token}
            inventory={user.inventory}
            reloadInventory={reloadInventory}
            onClose={() => {
              setCurrentTradeId(null)
              setShowTradeModal(false)
            }}
            profile={profile}
            apiBase="/api"
          />
        </div>
      )}
      <GiveCreditsModal
        open={giveCreditsOpen}
        onClose={() => setGiveCreditsOpen(false)}
        onSubmit={(amount) => {
          setGiveCreditsOpen(false)
          handleGiveCredits(amount)
        }}
        maxAmount={user?.balance}
        username={profile.username || profile.username}
      />
      {giveCreditsLoading && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
            <div>{t('profile.sendingCredits')}</div>
          </div>
        </div>
      )}
      {giveCreditsError && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: 'red' }}>{giveCreditsError}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsError(null)}>
              OK
            </button>
          </div>
        </div>
      )}
      {giveCreditsSuccess && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
            <div>{t('profile.creditsSent')}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsSuccess(null)}>
              {t('profile.ok')}
            </button>
          </div>
        </div>
      )}

      <ProfileShopModal
        open={props.shopModalOpen}
        onClose={() => props.setShopModalOpen(false)}
        user={profile}
        onBuySuccess={() => setInventoryReloadFlag((f) => f + 1)}
      />
      <CreatedGamesModal
        open={props.createdGamesModalOpen}
        onClose={() => props.setCreatedGamesModalOpen(false)}
        games={profile.createdGames || []}
      />
      <UserStudiosModal open={props.studiosModalOpen} onClose={() => props.setStudiosModalOpen(false)} studios={profile.studios || []} />
      <ProfileStatusModal
        open={props.statusModalOpen}
        onClose={() => props.setStatusModalOpen(false)}
        profile={profile}
        isAdmin={Boolean(user?.admin)}
        statusLoading={props.statusLoading}
        statusError={props.statusError}
        statusActionLoadingId={props.statusActionLoadingId}
        adminStatusUsers={props.adminStatusUsers}
        statusSearchInput={props.statusSearchInput}
        setStatusSearchInput={props.setStatusSearchInput}
        onSearch={props.loadAdminStatusUsers}
        onUpdateStatus={props.updateUserStatus}
      />
    </div>
  )
}

function CreatedGamesModal({ open, onClose, games }) {
  const { t } = useTranslation()

  const router = useRouter()
  if (!open) return null
  return (
    <div
      className="shop-prompt-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="shop-prompt glass-container trade-panel trade-panel-centered" style={{ minWidth: 400, maxWidth: 600 }}>
        {games.length === 0 ? (
          <div>{t('profile.noCreatedGames') || 'Aucun jeu créé'}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {games.map((game) => (
              <div
                key={game.gameId}
                style={{
                  border: '1px solid #36393f',
                  borderRadius: 8,
                  padding: 12,
                  background: '#23272a'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CachedImage src={`/games-icons/${game.iconHash ? game.iconHash : 'default'}`} style={{ width: 48, height: 48, borderRadius: 8 }} />
                  <div
                    onClick={() => {
                      router.push(`/game?gameId=${game.gameId}`)
                      onClose()
                    }}
                    style={{ cursor: 'pointer', flex: 1 }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 17 }}>{game.name}</div>
                    <div style={{ color: '#aaa', fontSize: 13 }}>{game.description?.slice(0, 120) || ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UserStudiosModal({ open, onClose, studios }) {
  const { t } = useTranslation()
  const router = useRouter()
  if (!open) return null
  return (
    <div
      className="shop-prompt-overlay"
      onClick={(e) => {
        if (e.target !== e.currentTarget) return
        onClose()
      }}
    >
      <div className="shop-prompt glass-container trade-panel trade-panel-centered" style={{ minWidth: 400, maxWidth: 600 }}>
        {studios.length === 0 ? (
          <div>{t('profile.noStudios') || 'Aucun studio'}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {studios.map((studio) => (
              <div
                key={studio.id}
                style={{
                  border: '1px solid #36393f',
                  borderRadius: 8,
                  padding: 12,
                  background: '#23272a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
                onClick={() => {
                  router.push(`/profile?user=${studio.id}`)
                  onClose()
                }}
              >
                <CachedImage
                  src={`/avatar/${studio.id}`}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: '#181a1a'
                  }}
                  alt={studio.name}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 17,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    {studio.name}
                    {studio.verified ? (
                      <Certification
                        user={{ ...studio, isStudio: true }}
                        style={{
                          marginLeft: 4,
                          width: 24,
                          height: 24,
                          position: 'relative',
                          top: 0,
                          verticalAlign: 'middle',
                          filter: 'drop-shadow(0 0 2px #ffd700)'
                        }}
                        color="#ffd700"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileStatusModal({
  open,
  onClose,
  profile,
  isAdmin,
  statusLoading,
  statusError,
  statusActionLoadingId,
  adminStatusUsers,
  statusSearchInput,
  setStatusSearchInput,
  onSearch,
  onUpdateStatus
}: {
  open: boolean
  onClose: () => void
  profile: User
  isAdmin: boolean
  statusLoading: boolean
  statusError: string | null
  statusActionLoadingId: string | null
  adminStatusUsers: AdminStatusUser[]
  statusSearchInput: string
  setStatusSearchInput: (value: string) => void
  onSearch: (query: string) => Promise<void>
  onUpdateStatus: (targetUser: AdminStatusUser, statusLevel: number) => Promise<void>
}) {
  if (!open) return null

  const currentStatus = getEffectiveStatus(profile)
  const currentInfo = getStatusInfo(currentStatus)

  return (
    <div className="shop-prompt-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="shop-prompt"
        style={{
          width: 'min(96vw, 900px)',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.2)',
          background:
            'radial-gradient(1200px 500px at 0% 0%, rgba(255,214,102,0.16), rgba(12,16,22,0.92)), linear-gradient(145deg, rgba(11,15,21,0.96), rgba(30,41,59,0.92))',
          boxShadow: '0 30px 80px rgba(0,0,0,0.42)',
          padding: 20,
          color: '#f5f7ff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: 0.3 }}>API Status Control</div>
            <div style={{ color: '#aeb7c7', fontSize: 13 }}>Consultation privee. Gestion reservee aux administrateurs.</div>
          </div>
          <button className="glass-button-red" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 14,
            padding: 14,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'linear-gradient(135deg, rgba(11,18,32,0.7), rgba(25,36,54,0.55))',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9 }}>Compte affiche:</span>
            <span style={{ fontWeight: 700 }}>{profile.username}</span>
            <span
              style={{
                border: '1px solid rgba(255,255,255,0.25)',
                background: currentInfo.glow,
                color: currentInfo.color,
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700
              }}
            >
              N{currentStatus} - {currentInfo.labelFr}
            </span>
          </div>
          <div style={{ color: '#d7deea', fontSize: 14 }}>{currentInfo.descriptionFr}</div>

          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <label style={{ color: '#aeb7c7', fontSize: 13 }}>Modifier ce compte:</label>
              <select
                value={String(currentStatus)}
                disabled={profile.disabled || statusActionLoadingId === profile.id}
                onChange={(e) =>
                  onUpdateStatus(
                    { id: profile.id, username: profile.username, status: profile.status, disabled: profile.disabled },
                    Number(e.target.value)
                  )
                }
                style={{
                  minWidth: 160,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(13,18,25,0.8)',
                  color: '#f4f7ff',
                  padding: '8px 10px'
                }}
              >
                {STATUS_LEVELS.map((level) => (
                  <option key={level.level} value={level.level}>
                    {level.level} - {level.labelFr}
                  </option>
                ))}
              </select>
              {profile.disabled ? <span style={{ color: '#ffb8b8', fontSize: 12 }}>Disabled actif: niveau 5 force</span> : null}
            </div>
          ) : (
            <div style={{ color: '#9bb5ff', fontSize: 13 }}>Mode lecture seule: vous ne pouvez pas modifier votre niveau.</div>
          )}
        </div>

        {isAdmin ? (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Gestion globale des comptes</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  value={statusSearchInput}
                  onChange={(e) => setStatusSearchInput(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  style={{
                    minWidth: 220,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(10,14,22,0.8)',
                    color: '#fff'
                  }}
                />
                <button className="glass-button" onClick={() => onSearch(statusSearchInput)}>
                  Rechercher
                </button>
                <button className="glass-button" onClick={() => onSearch('')}>
                  Voir tous
                </button>
              </div>
            </div>

            {statusError ? <div style={{ color: '#ff8d8d', marginTop: 10 }}>{statusError}</div> : null}
            {statusLoading ? <div style={{ color: '#c7d3eb', marginTop: 10 }}>Chargement des statuts...</div> : null}

            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {adminStatusUsers.map((entry) => {
                const effectiveStatus = getEffectiveStatus(entry)
                const info = getStatusInfo(effectiveStatus)
                const isBusy = statusActionLoadingId === entry.id

                return (
                  <div
                    key={entry.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(130px, 1fr) minmax(210px, 1fr) auto',
                      gap: 10,
                      alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      padding: '10px 12px',
                      background: 'rgba(15,21,31,0.72)'
                    }}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ fontWeight: 600 }}>{entry.username}</div>
                      <div style={{ color: '#94a1bb', fontSize: 12 }}>{entry.id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ color: info.color, fontWeight: 700, fontSize: 13 }}>
                        N{effectiveStatus} - {info.labelFr}
                      </span>
                      <span style={{ color: '#a7b5ca', fontSize: 12 }}>{info.descriptionFr}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        disabled={entry.disabled || isBusy}
                        value={String(effectiveStatus)}
                        onChange={(e) => onUpdateStatus(entry, Number(e.target.value))}
                        style={{
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: 'rgba(9,13,20,0.85)',
                          color: '#fff',
                          padding: '6px 8px',
                          minWidth: 130
                        }}
                      >
                        {STATUS_LEVELS.map((level) => (
                          <option key={level.level} value={level.level}>
                            {level.level} - {level.labelFr}
                          </option>
                        ))}
                      </select>
                      {entry.disabled ? <span style={{ color: '#ffb3b3', fontSize: 11 }}>Disabled</span> : null}
                    </div>
                  </div>
                )
              })}

              {!statusLoading && adminStatusUsers.length === 0 ? (
                <div style={{ color: '#b9c4db' }}>Aucun compte charge. Utilisez la recherche ou le bouton Voir tous.</div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const BADGE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  staff: { label: 'Staff', icon: 'fa-screwdriver-wrench', color: '#7289DA' },
  moderator: {
    label: 'Moderator',
    icon: 'fa-shield-halved',
    color: '#f2ad58ff'
  },
  community_manager: {
    label: 'Community Manager',
    icon: 'fa-users',
    color: '#23a548ff'
  },
  early_user: { label: 'Early User', icon: 'fa-bolt', color: '#ff3535ff' },
  bug_hunter: { label: 'Bug Hunter', icon: 'fa-bug', color: '#fff200ff' },
  contributor: {
    label: 'Contributor',
    icon: 'fa-code-branch',
    color: '#7200b8ff'
  },
  partner: { label: 'Partner', icon: 'fa-handshake', color: '#677BC4' },
  support: { label: 'Support', icon: 'fa-headset', color: '#e51ed8ff' }
}

import {
  faBolt,
  faBug,
  faCodeBranch,
  faHandshake,
  faHeadset,
  faScrewdriverWrench,
  faShieldHalved,
  faUsers,
  faUserShield
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const BADGE_ICONS = {
  'fa-user-shield': faUserShield,
  'fa-shield-halved': faShieldHalved,
  'fa-screwdriver-wrench': faScrewdriverWrench,
  'fa-users': faUsers,
  'fa-bolt': faBolt,
  'fa-bug': faBug,
  'fa-code-branch': faCodeBranch,
  'fa-handshake': faHandshake,
  'fa-headset': faHeadset
}

function BadgesBox({ badges, studio }: { badges: string[]; studio?: boolean }) {
  const filteredBadges = badges.filter((badge) => {
    if (badge === 'early_user' && studio) return false
    return true
  })
  if (!filteredBadges || filteredBadges.length === 0) return null
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        border: '1px solid #36393f',
        background: 'rgba(54,57,63,0.85)',
        borderRadius: 8,
        padding: '6px 12px',
        marginTop: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.12)'
      }}
    >
      {filteredBadges.map((badge) => {
        const info = BADGE_INFO[badge]
        if (!info) return null
        const icon = BADGE_ICONS[info.icon]
        return (
          <Link
            key={badge}
            href={`/badges#${badge}`}
            title={info.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 6,
              padding: '2px 10px 2px 10px',
              fontWeight: 500,
              fontSize: 15,
              transition: 'transform 0.1s',
              textDecoration: 'none',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <FontAwesomeIcon
              icon={icon}
              style={{
                fontSize: 20,
                filter: 'drop-shadow(0 0px 0px rgba(0, 0, 0, 0))'
              }}
              color={info.color}
              fixedWidth
            />
          </Link>
        )
      })}
    </div>
  )
}

function ProfileCreatedAt({ createdAt, locale }: { createdAt?: string | Date; locale: string }) {
  const createdAtText = formatCreatedAt(createdAt, locale)
  if (!createdAtText) return null

  return (
    <div
      style={{
        marginTop: 8,
        color: '#aeb6bf',
        fontSize: 13,
        lineHeight: 1.4
      }}
    >
      {createdAtText}
    </div>
  )
}

export default function Profile({ userId }: ProfileProps) {
  const isMobile = useIsMobile()
  const logic = useProfileLogic(userId)
  return isMobile ? <ProfileMobile {...logic} /> : <ProfileDesktop {...logic} />
}

