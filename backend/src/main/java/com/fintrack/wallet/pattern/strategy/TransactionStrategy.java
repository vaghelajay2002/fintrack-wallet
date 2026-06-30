package com.fintrack.wallet.pattern.strategy;

import com.fintrack.wallet.domain.TransactionType;
import com.fintrack.wallet.domain.Wallet;
import java.math.BigDecimal;

public interface TransactionStrategy {
    TransactionType supports();
    void apply(Wallet wallet, BigDecimal amount);
}
