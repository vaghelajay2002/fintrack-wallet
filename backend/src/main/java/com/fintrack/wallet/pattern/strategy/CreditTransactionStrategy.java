package com.fintrack.wallet.pattern.strategy;

import com.fintrack.wallet.domain.TransactionType;
import com.fintrack.wallet.domain.Wallet;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class CreditTransactionStrategy implements TransactionStrategy {
    @Override
    public TransactionType supports() {
        return TransactionType.CREDIT;
    }

    @Override
    public void apply(Wallet wallet, BigDecimal amount) {
        wallet.setBalance(wallet.getBalance().add(amount));
    }
}
