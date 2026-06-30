package com.fintrack.wallet.dto;

import java.math.BigDecimal;
import java.util.List;

public record WalletSummaryResponse(
        BigDecimal balance,
        List<TransactionResponse> recentTransactions
) {
}
