# FinTrack Wallet LLD

## Goal

FinTrack Wallet is a demo financial wallet and expense tracker. It supports user registration, login, wallet balance, credit transactions, debit transactions, and recent transaction history.

## Main Components

| Layer | Responsibility |
| --- | --- |
| Controller | Accept HTTP requests and return API responses |
| Service | Orchestrate business workflows |
| Repository | Persist and query database records |
| Domain | Model users, wallets, and transactions |
| Strategy | Apply transaction-type-specific balance rules |
| Factory | Create transaction objects with consistent defaults |

## Entities

### User

- `id`
- `fullName`
- `email`
- `passwordHash`
- `wallet`

### Wallet

- `id`
- `user`
- `balance`

### Transaction

- `id`
- `wallet`
- `type`
- `amount`
- `category`
- `note`
- `createdAt`

## Design Patterns Used

### Strategy Pattern

`TransactionStrategy` defines how a wallet balance changes.

- `CreditTransactionStrategy` increases balance.
- `DebitTransactionStrategy` checks balance and decreases balance.
- `TransactionStrategyRegistry` selects the correct strategy by `TransactionType`.

This keeps debit and credit rules separate and makes it easy to add new transaction types later.

### Factory Pattern

`TransactionFactory` creates transaction objects in one place. It sets wallet, type, amount, category, note, and creation time consistently.

## API Design

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register user and create wallet |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/wallet` | Get balance and recent transactions |
| POST | `/api/wallet/transactions` | Create credit or debit transaction |
| PUT | `/api/wallet/transactions/{transactionId}` | Edit type, amount, category, or note |

## Example Flow

1. User registers.
2. Backend creates `User` and empty `Wallet`.
3. User creates a `CREDIT` transaction.
4. `WalletService` asks `TransactionStrategyRegistry` for the credit strategy.
5. Strategy updates wallet balance.
6. `TransactionFactory` creates transaction record.
7. Wallet and transaction are saved.

## Future Improvements

- Add transfer between users.
- Add monthly analytics.
- Add CSV/PDF export.
- Add admin dashboard.
- Add unit tests for transaction strategies.
