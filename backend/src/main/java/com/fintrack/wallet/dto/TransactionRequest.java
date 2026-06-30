package com.fintrack.wallet.dto;

import com.fintrack.wallet.domain.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TransactionRequest(
        @NotNull TransactionType type,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        String category,
        String note
) {
}
