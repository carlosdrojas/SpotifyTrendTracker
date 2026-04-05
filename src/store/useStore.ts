import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SpotifyAccount, AccountData, TimeRange } from '../types/spotify'

interface StoreState {
  accounts: SpotifyAccount[]
  accountData: Record<string, AccountData>
  activeTimeRange: TimeRange
  selectedAccountIds: string[] // which accounts to include in aggregate

  addAccount: (account: SpotifyAccount) => void
  removeAccount: (id: string) => void
  updateToken: (id: string, accessToken: string, expiresIn: number) => void
  setAccountData: (accountId: string, data: AccountData) => void
  setActiveTimeRange: (range: TimeRange) => void
  toggleAccountSelection: (id: string) => void
  selectAllAccounts: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      accounts: [],
      accountData: {},
      activeTimeRange: 'medium_term',
      selectedAccountIds: [],

      addAccount: (account) =>
        set((state) => {
          // Replace if same Spotify user ID
          const filtered = state.accounts.filter((a) => a.id !== account.id)
          const updated = [...filtered, account]
          return {
            accounts: updated,
            selectedAccountIds: updated.map((a) => a.id),
          }
        }),

      removeAccount: (id) =>
        set((state) => {
          const accounts = state.accounts.filter((a) => a.id !== id)
          const accountData = { ...state.accountData }
          delete accountData[id]
          return {
            accounts,
            accountData,
            selectedAccountIds: state.selectedAccountIds.filter((sid) => sid !== id),
          }
        }),

      updateToken: (id, accessToken, expiresIn) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id
              ? { ...a, accessToken, expiresAt: Date.now() + expiresIn * 1000 }
              : a
          ),
        })),

      setAccountData: (accountId, data) =>
        set((state) => ({
          accountData: { ...state.accountData, [accountId]: data },
        })),

      setActiveTimeRange: (range) => set({ activeTimeRange: range }),

      toggleAccountSelection: (id) =>
        set((state) => ({
          selectedAccountIds: state.selectedAccountIds.includes(id)
            ? state.selectedAccountIds.filter((sid) => sid !== id)
            : [...state.selectedAccountIds, id],
        })),

      selectAllAccounts: () =>
        set((state) => ({
          selectedAccountIds: state.accounts.map((a) => a.id),
        })),
    }),
    {
      name: 'spotifai-store',
      // Don't persist access tokens in localStorage in plaintext beyond this
      // In production you'd use a more secure storage strategy
      partialize: (state) => ({
        accounts: state.accounts,
        accountData: state.accountData,
        activeTimeRange: state.activeTimeRange,
        selectedAccountIds: state.selectedAccountIds,
      }),
    }
  )
)
