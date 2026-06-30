package com.fintrack.wallet.dto;

import com.fintrack.wallet.domain.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
        Long id,
        TransactionType type,
        BigDecimal amount,
        String category,
        String note,
        Instant createdAt
) {
}
