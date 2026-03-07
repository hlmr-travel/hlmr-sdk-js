import type { HttpClient } from '../utils/http';
import type {
  Wallet,
  Transaction,
  WalletsList,
  WalletsListParams,
  TransactionsList,
  TransactionsListParams,
  BalanceHistoryList,
  BalanceHistoryParams,
} from '../types/ledger';

export class LedgerModule {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getWallets(params?: WalletsListParams): Promise<WalletsList> {
    const query = buildQueryString(params);
    const path = query ? `ledger/wallets?${query}` : 'ledger/wallets';
    const response = await this.http.get<WalletsList>(path);
    return response.data;
  }

  async getWallet(walletId: string): Promise<Wallet> {
    const response = await this.http.get<{ wallet: Wallet }>(`ledger/wallets/${walletId}`);
    return response.data.wallet;
  }

  async getBalanceHistory(walletId: string, params?: BalanceHistoryParams): Promise<BalanceHistoryList> {
    const query = buildQueryString(params);
    const path = query
      ? `ledger/wallets/${walletId}/balance-history?${query}`
      : `ledger/wallets/${walletId}/balance-history`;
    const response = await this.http.get<BalanceHistoryList>(path);
    return response.data;
  }

  async getTransactions(params?: TransactionsListParams): Promise<TransactionsList> {
    const query = buildQueryString(params);
    const path = query ? `ledger/transactions?${query}` : 'ledger/transactions';
    const response = await this.http.get<TransactionsList>(path);
    return response.data;
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await this.http.get<{ transaction: Transaction }>(
      `ledger/transactions/${transactionId}`,
    );
    return response.data.transaction;
  }

}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}
